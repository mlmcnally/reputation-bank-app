// pages/api/create-checkout-session.js
import Stripe from 'stripe';

const {
  STRIPE_SECRET_KEY,
  NEXT_PUBLIC_SITE_URL,
} = process.env;

// Hardcode or env the recurring Price ID:
const PRICE_ID = 'price_1SLskSBAZDzPNmn2T5KB4mv5'; // <-- your recurring price

if (!STRIPE_SECRET_KEY) throw new Error('Missing STRIPE_SECRET_KEY');
if (!NEXT_PUBLIC_SITE_URL) throw new Error('Missing NEXT_PUBLIC_SITE_URL');
if (!PRICE_ID) throw new Error('Missing PRICE_ID');

const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' });

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    // IMPORTANT:
    // - Do NOT pass `customer_creation` (only allowed in payment mode).
    // - Do NOT pass `customer` or `customer_email` — let Checkout collect email and create the Customer.
    // - Ensure PRICE_ID is a *recurring* Price in Stripe.

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: PRICE_ID, quantity: 1 }],
      success_url: `${NEXT_PUBLIC_SITE_URL}/post-purchase?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${NEXT_PUBLIC_SITE_URL}/pricing?canceled=1`,
      allow_promotion_codes: true,
      // Optionally collect billing address during checkout:
      // billing_address_collection: 'auto',
    });

    return res.status(200).json({ url: session.url });
  } catch (e) {
    console.error('create-checkout-session error:', e);
    return res.status(500).json({ error: e.message });
  }
}
