// pages/api/create-checkout-session.js
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

// ----- Env checks (fail fast with clear errors) -----
const {
  STRIPE_SECRET_KEY,
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  NEXT_PUBLIC_SITE_URL, // e.g. https://reputation-bank-app-v2.vercel.app
} = process.env;

// ✅ Using your known Price ID
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
    // user_id is optional in Buy-First flow; we’ll link via webhook later

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: NEXT_PUBLIC_STRIPE_PRICE_ID, quantity: 1 }],
      // ✅ NOTE THE .html HERE
      success_url: `${NEXT_PUBLIC_SITE_URL}/post-purchase.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${NEXT_PUBLIC_SITE_URL}/pricing?canceled=1`,
      allow_promotion_codes: true,
    });

    return res.status(200).json({ url: session.url });
  } catch (e) {
    console.error('create-checkout-session error:', e);
    return res.status(500).json({ error: e.message });
  }
}
