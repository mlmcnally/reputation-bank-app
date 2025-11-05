// pages/api/create-checkout-session.js
import Stripe from 'stripe';

// ----- Env checks (fail fast with clear errors) -----
const {
  STRIPE_SECRET_KEY,
  NEXT_PUBLIC_SITE_URL, // e.g. https://reputation-bank-app-v2.vercel.app  (NO trailing slash preferred)
  NEXT_PUBLIC_STRIPE_PRICE_ID, // optional—if set in Vercel, we’ll use it
} = process.env;

// Fallback to your known Price ID if the env var isn't set
const PRICE_ID = NEXT_PUBLIC_STRIPE_PRICE_ID || 'price_1SLskSBAZDzPNmn2T5KB4mv5';

if (!STRIPE_SECRET_KEY) throw new Error('Missing STRIPE_SECRET_KEY');
if (!NEXT_PUBLIC_SITE_URL) throw new Error('Missing NEXT_PUBLIC_SITE_URL');

const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' });

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Ensure no trailing slash to avoid //post-purchase.html
    const baseUrl = NEXT_PUBLIC_SITE_URL.replace(/\/+$/, '');

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: PRICE_ID, quantity: 1 }],
      // 👇 IMPORTANT: use .html routes for static files
      success_url: `${baseUrl}/post-purchase.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/pricing.html?canceled=1`,
      allow_promotion_codes: true,
    });

    return res.status(200).json({ url: session.url });
  } catch (e) {
    console.error('create-checkout-session error:', e);
    return res.status(500).json({ error: e.message });
  }
}
