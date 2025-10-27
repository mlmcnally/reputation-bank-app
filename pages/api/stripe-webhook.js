import Stripe from 'stripe';

export const config = { api: { bodyParser: false } };

function readRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

import { createClient } from '@supabase/supabase-js';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabaseAdmin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const rawBody = await readRawBody(req);
  const sig = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const user_id = session.metadata?.user_id;
      if (user_id) {
        const oneYear = new Date();
        oneYear.setFullYear(oneYear.getFullYear() + 1);
        await supabaseAdmin
          .from('profiles')
          .update({ status: 'active', access_expires_at: oneYear.toISOString() })
          .eq('user_id', user_id);
      }
    }
  } catch (e) {
    console.error('Webhook handler error:', e);
    return res.status(500).send('Webhook handler failed');
  }

  return res.json({ received: true });
}
