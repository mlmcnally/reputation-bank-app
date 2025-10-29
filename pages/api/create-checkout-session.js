// pages/api/create-checkout-session.js
import Stripe from 'stripe';

const {
  STRIPE_SECRET_KEY,
  NEXT_PUBLIC_STRIPE_PRICE_ID,
  NEXT_PUBLIC_SITE_URL,
} = process.env;

const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' });

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    // Optional: accept a prefilled email from the client; Stripe will still collect/confirm it
    const { email } = (req.body || {});

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: NEXT_PUBLIC_STRIPE_PRICE_ID, quantity: 1 }],
      // Let Stripe create the Customer and collect email
      customer_creation: 'always',
      customer_email: email || undefined,
      allow_promotion_codes: true,

      // After payment, show a "check your email" message
      success_url: `${NEXT_PUBLIC_SITE_URL}/post-purchase.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${NEXT_PUBLIC_SITE_URL}/pricing?canceled=1`,
    });

    return res.status(200).json({ url: session.url });
  } catch (e) {
    console.error('create-checkout-session error:', e);
    return res.status(500).json({ error: e.message });
  }
}

