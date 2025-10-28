// pages/pricing.js
import { useState } from 'react';

export default function Pricing() {
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');

  async function startCheckout() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: 'annual' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Checkout failed');
      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ fontFamily: 'Avenir, "Nunito Sans", sans-serif', padding: '2rem' }}>
      <h1 style={{ color: '#084a58', textAlign: 'center' }}>Choose your plan</h1>

      <div style={{
        maxWidth: 520, margin: '2rem auto', background: '#fff', borderRadius: 8,
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)', padding: '1.25rem'
      }}>
        <h2 style={{ marginTop: 0 }}>Annual Access</h2>
        <p>One year of access to The Reputation Bank app.</p>
        <p style={{ fontSize: 24, margin: '0.5rem 0' }}><strong>$XX / year</strong></p>

        <button
          onClick={startCheckout}
          disabled={loading}
          style={{
            background: '#084a58', color: '#fff', border: 'none',
            padding: '0.75rem 1.25rem', borderRadius: 6, cursor: 'pointer'
          }}
        >
          {loading ? 'Redirecting…' : 'Subscribe'}
        </button>

        {error && <p style={{ color: 'red', marginTop: 12 }}>{error}</p>}
      </div>
    </main>
  );
}
