// pages/api/provision-user.js
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const {
  STRIPE_SECRET_KEY,
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
} = process.env;

if (!STRIPE_SECRET_KEY) throw new Error('Missing STRIPE_SECRET_KEY');
if (!SUPABASE_URL) throw new Error('Missing SUPABASE_URL');
if (!SUPABASE_SERVICE_ROLE_KEY) throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY');

const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' });
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { session_id, email, password } = req.body || {};

    if (!session_id) return res.status(400).json({ error: 'Missing session_id' });
    if (!email) return res.status(400).json({ error: 'Missing email' });
    if (!password || String(password).length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    // 1) Verify Stripe Checkout Session
    const session = await stripe.checkout.sessions.retrieve(session_id);

    // For Checkout Sessions, "status" should be "complete" after successful payment
    if (session.status !== 'complete') {
      return res.status(400).json({ error: `Checkout not complete (status: ${session.status})` });
    }

    // Pull email from checkout (prefer customer_details.email)
    const stripeEmail =
      session.customer_details?.email ||
      session.customer_email ||
      null;

    if (!stripeEmail) {
      return res.status(400).json({ error: 'Could not determine email from Stripe session' });
    }

    const normalizedStripeEmail = String(stripeEmail).trim().toLowerCase();
    const normalizedEmail = String(email).trim().toLowerCase();

    // Ensure user isn't trying to provision a different email than the one used at checkout
    if (normalizedEmail !== normalizedStripeEmail) {
      return res.status(400).json({
        error: 'Email mismatch. Please use the same email you used at checkout.',
      });
    }

    // 2) Create the Supabase user (email_confirm true so no confirmation email is required)
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: normalizedEmail,
      password: String(password),
      email_confirm: true,
    });

    if (error) {
      // If user already exists, tell them to sign in or reset password (no guessing/updating silently)
      const msg = error.message || 'Supabase error';
      if (msg.toLowerCase().includes('already') || msg.toLowerCase().includes('registered')) {
        return res.status(409).json({
          error:
            'An account with this email already exists. Please sign in, or use “Forgot your password?” on the login page.',
        });
      }
      return res.status(500).json({ error: msg });
    }

    return res.status(200).json({ ok: true, user_id: data?.user?.id || null });
  } catch (e) {
    console.error('provision-user error:', e);
    return res.status(500).json({ error: e.message || 'Server error' });
  }
}
