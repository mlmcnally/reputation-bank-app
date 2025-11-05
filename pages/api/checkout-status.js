// pages/api/checkout-status.js
import Stripe from 'stripe';

const { STRIPE_SECRET_KEY } = process.env;
if (!STRIPE_SECRET_KEY) throw new Error('Missing STRIPE_SECRET_KEY');

const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' });

export default async function handler(req, res) {
  try {
    const { session_id } = req.query;
    if (!session_id) {
      return res.status(400).json({ ok: false, error: 'Missing session_id' });
    }

    const session = await stripe.checkout.sessions.retrieve(session_id);

    // Possible values (not exhaustive):
    // status: 'open' | 'complete' | 'expired'
    // payment_status: 'paid' | 'unpaid' | 'no_payment_required'
    // We’ll treat COMPLETE as success; otherwise show pending/back-to-pricing
    const payload = {
      ok: session?.status === 'complete',
      state: session?.status || 'unknown',
      payment_status: session?.payment_status || 'unknown',
      session_id,
    };

    return res.status(200).json(payload);
  } catch (e) {
    console.error('checkout-status error:', e);
    return res.status(500).json({ ok: false, error: e.message });
  }
}
