// pages/api/checkout-status.js
import Stripe from 'stripe';

const { STRIPE_SECRET_KEY } = process.env;
if (!STRIPE_SECRET_KEY) throw new Error('Missing STRIPE_SECRET_KEY');

const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' });

export default async function handler(req, res) {
  try {
    const { session_id } = req.query;

    if (!session_id || typeof session_id !== 'string') {
      return res.status(400).json({ ok: false, error: 'Missing session_id' });
    }

    const session = await stripe.checkout.sessions.retrieve(session_id);

    // Stripe "best" email sources for Checkout
    const email =
      session?.customer_details?.email ||
      session?.customer_email ||
      null;

    const status = session?.status || 'unknown'; // 'open' | 'complete' | 'expired' | ...
    const payment_status = session?.payment_status || 'unknown'; // 'paid' | 'unpaid' | 'no_payment_required' | ...

    return res.status(200).json({
      ok: status === 'complete',
      state: status,
      payment_status,
      session_id,
      email, // ✅ THIS is what create-account.html needs
      customer_id: session?.customer || null,
      mode: session?.mode || null, // 'payment' | 'subscription'
    });
  } catch (e) {
    console.error('checkout-status error:', e);
    return res.status(500).json({ ok: false, error: e.message });
  }
}
