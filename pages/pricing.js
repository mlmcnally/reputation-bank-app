// pages/pricing.js
import { useState } from 'react';
import Head from 'next/head';

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
          <p>Unlock the complete interactive edition of <em>The Reputation Bank</em>.</p>
          <div style={styles.price}>$49 / year</div>

          <button
            style={{ ...styles.btn, ...(loading ? styles.btnDisabled : null) }}
            onClick={startCheckout}
            disabled={loading}
          >
            {loading ? 'Starting checkout…' : 'Buy Now'}
          </button>

          <div style={styles.status}>{status}</div>
        </div>
      </div>
    </>
  );
}

const styles = {
  page: {
    fontFamily: 'Avenir, "Nunito Sans", system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
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
    borderRadius: '10px',
    boxShadow: '0 6px 18px rgba(0,0,0,0.1)',
    padding: '24px',
    textAlign: 'center',
    maxWidth: '420px',
    width: '100%',
  },
  h1: { color: '#084a58', margin: '0 0 8px' },
  price: { fontSize: '2rem', color: '#084a58', margin: '8px 0 20px' },
  btn: {
    background: '#084a58',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    padding: '12px 20px',
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
    boxShadow: '2px 2px 5px rgba(0,0,0,.2)',
    width: '100%',
  },
  btnDisabled: { opacity: 0.6, cursor: 'not-allowed' },
  status: { marginTop: '10px', color: '#b91c1c', fontWeight: 600, minHeight: '1.2em' },
};
