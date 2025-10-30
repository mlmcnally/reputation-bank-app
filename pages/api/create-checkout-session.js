// pages/api/create-checkout-session.js
import Stripe from 'stripe';

// ----- REQUIRED ENVS (set these in Vercel) -----
// STRIPE_SECRET_KEY            = sk_live_xxx (your real secret key)
// NEXT_PUBLIC_SITE_URL         = https://YOUR-APP-DOMAIN.vercel.app  (used for return URLs)
const { STRIPE_SECRET_KEY, NEXT_PUBLIC_SITE_URL } = process.env;

// ✅ Hardcode the correct Stripe Price ID you gave me:
const PRICE_ID = 'price_1SLskSBAZDzPNmn2T5KB4mv5';

if (!STRIPE_SECRET_KEY) throw new Error('Missing STRIPE_SECRET_KEY');
if (!NEXT_PUBLIC_SITE_URL) throw new Error('Missing NEXT_PUBLIC_SITE_URL');

const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' });

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    // 🚫 No Supabase user_id here. We’re doing "buy first".
    // Stripe will collect email. We'll provision the account in the webhook using that email.

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: PRICE_ID, quantity: 1 }],

      // Collect an email every time
      customer_creation: 'always',
      billing_address_collection: 'auto',
      allow_promotion_codes: true,

      // Where to send folks after they finish/cancel
      success_url: `${NEXT_PUBLIC_SITE_URL}/post-purchase.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${NEXT_PUBLIC_SITE_URL}/pricing?canceled=1`,
    });

    return res.status(200).json({ url: session.url });
  } catch (e) {
    console.error('create-checkout-session error:', e);
    return res.status(500).json({ error: e.message });
  }
}
