// pages/api/stripe-webhook.js
import Stripe from 'stripe';
import { buffer } from 'micro';
import { createClient } from '@supabase/supabase-js';

export const config = { api: { bodyParser: false } }; // we must read raw body for signature verification

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' });
const supabaseAdmin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// Utility: upsert profile by stripe_customer_id or email
async function upsertProfile({ user_id, email, stripe_customer_id, plan, status, current_period_end }) {
  const payload = {
    user_id: user_id || null,
    email,
    stripe_customer_id,
    plan,
    status,
    current_period_end,
  };
  // onConflict: prefer stripe_customer_id uniqueness; adjust if your schema differs
  const { error } = await supabaseAdmin
    .from('profiles')
    .upsert(payload, { onConflict: 'stripe_customer_id' });
  if (error) console.error('profiles upsert error:', error);
}

export default async function handler(req, res) {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    const buf = await buffer(req);
    event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed.', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    // We only need to handle completed Checkout for subscription start
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;

      const email =
        session.customer_details?.email ||
        session.customer_email ||
        null;

      const customerId = session.customer || null;
      const subscriptionId = session.subscription || null;

      // Fetch subscription to get period end, status, etc.
      let currentPeriodEndISO = null;
      let subStatus = 'active';

      if (subscriptionId) {
        const sub = await stripe.subscriptions.retrieve(subscriptionId);
        currentPeriodEndISO = new Date(sub.current_period_end * 1000).toISOString();
        subStatus = sub.status; // 'active', 'trialing', etc.
      }

      // 1) Create or ensure a Supabase user exists for this email
      //    Use the built-in Supabase invite (sends an email to set password).
      let userId = null;

      // Try to create; if user exists already, Supabase will return an error we can ignore.
      const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
        email,
        email_confirm: true, // mark confirmed, since Stripe verified email ownership during checkout
        user_metadata: { stripe_customer_id: customerId },
      });

      if (createErr) {
        // If already exists, we’ll try to invite but it's ok to proceed
        console.warn('createUser warning (likely already exists):', createErr.message);
      } else {
        userId = created?.user?.id || null;
      }

      // Send an invite (if SMTP configured in Supabase, this sends the email).
      // If user already exists, this may return an error we can ignore.
      const { error: inviteErr } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
        data: { source: 'stripe' },
      });
      if (inviteErr) {
        console.warn('inviteUserByEmail warning:', inviteErr.message);
      }

      // 2) Upsert profile
      await upsertProfile({
        user_id: userId,
        email,
        stripe_customer_id: customerId,
        plan: 'annual',
        status: subStatus,
        current_period_end: currentPeriodEndISO,
      });
    }

    // (Optional) Handle renewals / cancellations to keep profile in sync
    if (event.type === 'invoice.payment_succeeded') {
      const inv = event.data.object;
      if (inv.billing_reason === 'subscription_cycle') {
        const sub = await stripe.subscriptions.retrieve(inv.subscription);
        await upsertProfile({
          user_id: null,
          email: null,
          stripe_customer_id: sub.customer,
          plan: 'annual',
          status: sub.status,
          current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
        });
      }
    }

    if (event.type === 'customer.subscription.deleted') {
      const sub = event.data.object;
      await upsertProfile({
        user_id: null,
        email: null,
        stripe_customer_id: sub.customer,
        plan: 'annual',
        status: 'canceled',
        current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
      });
    }

    return res.status(200).json({ received: true });
  } catch (err) {
    console.error('Webhook handler error:', err);
    return res.status(500).json({ error: 'Webhook handler failed' });
  }
}

