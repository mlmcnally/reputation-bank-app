// pages/api/create-checkout-session.js
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

// ----- Env checks (fail fast with clear errors) -----
const {
  STRIPE_SECRET_KEY,
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  NEXT_PUBLIC_SITE_URL, // e.g. https://yourapp.vercel.app
} = process.env;

// ✅ Hardcode the Stripe Price ID (yours)
const NEXT_PUBLIC_STRIPE_PRICE_ID = 'price_1SLskSBAZDzPNmn2T5KB4mv5';

if (!STRIPE_SECRET_KEY) throw new Error('Missing STRIPE_SECRET_KEY');
if (!SUPABASE_URL) throw new Error('Missing SUPABASE_URL');
if (!SUPABASE_SERVICE_ROLE_KEY) throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY');
if (!NEXT_PUBLIC_SITE_URL) throw new Error('Missing NEXT_PUBLIC_SITE_URL');

const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' });
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { user_id } = req.body || {};
    if (!user_id) return res.status(400).json({ error: 'Missing user_id' });

    // Get or create Stripe customer
    const { data: profile, error: profileErr } = await supabaseAdmin
      .from('profiles')
      .select('stripe_customer_id')
      .eq('user_id', user_id)
      .single();

    if (profileErr && profileErr.code !== 'PGRST116') {
      console.error('Supabase select error:', profileErr);
      return res.status(500).json({ error: 'Failed to read profile' });
    }

    let customerId = profile?.stripe_customer_id || null;

    if (!customerId) {
      const customer = await stripe.customers.create({ metadata: { user_id } });
      customerId = customer.id;

      const { error: upErr } = await supabaseAdmin
        .from('profiles')
        .upsert({ user_id, stripe_customer_id: customerId }, { onConflict: 'user_id' });

      if (upErr) {
        console.error('Supabase upsert error:', upErr);
        return res.status(500).json({ error: 'Failed to store Stripe customer on profile' });
      }
    }

    // ✅ Create Checkout session (note the fixed URLs)
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      line_items: [{ price: NEXT_PUBLIC_STRIPE_PRICE_ID, quantity: 1 }],
      // Query string first, then fragment
      success_url: `${NEXT_PUBLIC_SITE_URL}/login.html?purchase=success&session_id={CHECKOUT_SESSION_ID}#page/1`,
      cancel_url: `${NEXT_PUBLIC_SITE_URL}/pricing?canceled=1`,
      allow_promotion_codes: true,
      metadata: { user_id },
    });

    return res.status(200).json({ url: session.url });
  } catch (e) {
    console.error('create-checkout-session error:', e);
    return res.status(500).json({ error: e.message });
  }
}
