// pages/api/stripe-webhook.js
import Stripe from 'stripe';
import { buffer } from 'micro';
import { createClient } from '@supabase/supabase-js';

export const config = {
  api: {
    bodyParser: false, // ❗ required so Stripe can verify the raw body
  },
};

// ---- Env vars ----
const {
  STRIPE_SECRET_KEY,
  STRIPE_WEBHOOK_SECRET,
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  NEXT_PUBLIC_SITE_URL,
} = process.env;

if (!STRIPE_SECRET_KEY) throw new Error('Missing STRIPE_SECRET_KEY');
if (!STRIPE_WEBHOOK_SECRET) throw new Error('Missing STRIPE_WEBHOOK_SECRET');
if (!SUPABASE_URL) throw new Error('Missing SUPABASE_URL');
if (!SUPABASE_SERVICE_ROLE_KEY) throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY');
if (!NEXT_PUBLIC_SITE_URL) throw new Error('Missing NEXT_PUBLIC_SITE_URL');

const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' });
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  let event;

  try {
    const buf = await buffer(req);
    const sig = req.headers['stripe-signature'];

    event = stripe.webhooks.constructEvent(
      buf.toString(),
      sig,
      STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('❌ Stripe webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // We only care about completed checkouts for subscriptions
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    try {
      const email =
        session.customer_details?.email ||
        session.customer_email ||
        null;

      if (!email) {
        console.warn('checkout.session.completed had no email, skipping invite');
      } else {
        // 1) Check if a Supabase user already exists for this email
        const { data: existing, error: getErr } =
          await supabaseAdmin.auth.admin.getUserByEmail(email);

        if (getErr && !/User not found/i.test(getErr.message || '')) {
          console.error('Error checking for existing user in Supabase:', getErr);
        }

        if (existing?.user) {
          console.log('User already exists in Supabase for', email);
        } else {
          // 2) Invite the user – this sends the "Invite user" email
          const { data: invited, error: inviteErr } =
            await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
              // When user clicks the email link, land on create-account.html
              redirectTo: `${NEXT_PUBLIC_SITE_URL}/create-account.html`,
            });

          if (inviteErr) {
            console.error('Error inviting user in Supabase:', inviteErr);
          } else {
            console.log('✅ Invited user after checkout:', invited?.user?.id, email);
          }
        }
      }
    } catch (err) {
      console.error('Error handling checkout.session.completed:', err);
    }
  } else {
    console.log(`ℹ️ Ignoring event type ${event.type}`);
  }

  return res.json({ received: true });
}
