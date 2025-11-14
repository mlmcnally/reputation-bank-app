// pages/api/stripe-lookup.js
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' });

export default async function handler(req, res) {
  try {
    const session_id = req.query.session_id;
    if (!session_id) return res.status(400).json({ error: 'Missing session_id' });

    const session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ['customer', 'subscription']
    });

    // email can be on session.customer_details.email or on the customer object
    const email =
      session?.customer_details?.email ||
      (typeof session.customer === 'object' ? session.customer.email : null);

    return res.status(200).json({
      email,
      customer_id: typeof session.customer === 'string' ? session.customer : session.customer?.id || null
    });
  } catch (e) {
    console.error('stripe-lookup error:', e);
    return res.status(500).json({ error: e.message });
  }
}
