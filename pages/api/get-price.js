// pages/api/get-price.js
import Stripe from 'stripe';

const { STRIPE_SECRET_KEY } = process.env;

// Use the same price you charge for the subscription
const PRICE_ID = 'price_1SLskSBAZDzPNmn2T5KB4mv5';

export default async function handler(req, res) {
  try {
    if (!STRIPE_SECRET_KEY) {
      return res.status(500).json({ error: 'Missing STRIPE_SECRET_KEY' });
    }
    const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' });
    const price = await stripe.prices.retrieve(PRICE_ID);

    // Return a minimal object for the UI
    res.status(200).json({
      unit_amount: price.unit_amount,     // e.g. 9900
      currency: price.currency,           // e.g. 'usd'
      interval: price.recurring?.interval // e.g. 'year'
    });
  } catch (e) {
    console.error('get-price error:', e);
    res.status(500).json({ error: 'Failed to fetch price' });
  }
}
