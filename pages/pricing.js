// pages/pricing.js
import { useState } from 'react';
import Head from 'next/head';

const DISPLAY_PRICE = '$49.99';

export default function Pricing() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  const startCheckout = async () => {
    setStatus('');
    setLoading(true);
    try {
      const res = await fetch('/api/create-checkout-session', { method: 'POST' });
      const data = await res.json();
      if (data?.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      } else {
        setStatus(data?.error || 'Could not start checkout.');
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      setStatus('Error starting checkout.');
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>The Reputation Bank – Subscribe Now</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div style={styles.page}>
        <div style={styles.card}>
          <h1 style={styles.h1}>Get One Year of Access</h1>

          <p style={styles.copy}>
            Unlock the complete interactive edition of <em>The Reputation Bank</em>.
          </p>

          <div style={styles.price}>{DISPLAY_PRICE} / year</div>

          <p style={styles.subcopy}>
            Billed annually. Cancel anytime from your Stripe customer portal.
          </p>

          <button
            style={{ ...styles.btn, ...(loading ? styles.btnDisabled : null) }}
            onClick={startCheckout}
            disabled={loading}
          >
            {loading ? 'Starting checkout…' : 'Subscribe'}
          </button>

          <div style={styles.status}>{status}</div>

          <div style={styles.footerLinks}>
            <a href="/login.html" style={styles.link}>Already purchased? Sign in</a>
          </div>
        </div>
      </div>
    </>
  );
}

const styles = {
  page: {
    fontFamily:
      'Avenir, "Nunito Sans", system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
    display: 'grid',
    placeItems: 'center',
    background: '#f8fafc',
    minHeight: '100vh',
    margin: 0,
    color: '#111',
    padding: '24px',
  },
  card: {
    background: '#fff',
    borderRadius: '12px',
    boxShadow: '0 6px 18px rgba(0,0,0,0.10)',
    padding: '26px 24px 22px',
    textAlign: 'center',
    maxWidth: '460px',
    width: '100%',
    border: '1px solid #e5e7eb',
  },
  h1: { color: '#084a58', margin: '0 0 10px', fontSize: '1.6rem' },
  copy: { margin: '0 0 10px', color: '#111', lineHeight: 1.5 },
  price: { fontSize: '2.1rem', color: '#084a58', margin: '6px 0 8px', fontWeight: 800 },
  subcopy: { margin: '0 0 18px', color: '#475569', fontSize: '.95rem' },
  btn: {
    background: '#084a58',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    padding: '12px 20px',
    fontSize: '1rem',
    fontWeight: 800,
    cursor: 'pointer',
    boxShadow: '2px 2px 5px rgba(0,0,0,.2)',
    width: '100%',
  },
  btnDisabled: { opacity: 0.6, cursor: 'not-allowed' },
  status: {
    marginTop: '10px',
    color: '#b91c1c',
    fontWeight: 700,
    minHeight: '1.2em',
  },
  footerLinks: { marginTop: '14px' },
  link: { color: '#2ea1a8', textDecoration: 'none', fontWeight: 700 },
};
