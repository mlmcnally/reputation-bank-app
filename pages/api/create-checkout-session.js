// pages/api/create-checkout-session.js
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabaseAdmin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const PRICE_ID = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID; // set in Vercel

export default async function handler(req, res) {
  try {
    const { data: { user } } = await supabaseAdmin.auth.getUser(req.headers.authorization?.replace('Bearer ', '') || '');
    // We won’t have a bearer token here (Next API route), so instead:
    // Get the logged in user via a client call first? Simpler: fetch user from cookie isn’t trivial.
    // Alternative: lookup current session on client and POST user_id in body.

    // Easiest: accept `user_id` from client:
    // (Update subscribe.js: POST with user_id)
    if (req.method !== 'POST') return res.status(405).end();

    const { user_id } = req.body;
    if (!user_id) return res.status(401).json({ error: 'Missing user_id' });

    // Ensure we have a Stripe customer (optional enhancement)
    const { data: profile } = await supabaseAdmin
      .from('profiles').select('stripe_customer_id')
      .eq('user_id', user_id).single();

    let customerId = profile?.stripe_customer_id || null;

    if (!customerId) {
      const customer = await stripe.customers.create({ metadata: { user_id } });
      customerId = customer.id;
      await supabaseAdmin.from('profiles').update({ stripe_customer_id: customerId }).eq('user_id', user_id);
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      line_items: [{ price: PRICE_ID, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/post-purchase?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/subscribe`,
      metadata: { user_id }
    });

    return res.status(200).json({ url: session.url });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e.message });
  }
}
  }
}

