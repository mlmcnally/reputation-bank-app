// pages/pricing.js
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Pricing() {
  const [priceData, setPriceData] = useState(null);
  const [loadingPrice, setLoadingPrice] = useState(true);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/get-price');
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to load price');
        setPriceData(data);
      } catch (e) {
        setErr(e.message);
      } finally {
        setLoadingPrice(false);
      }
    })();
  }, []);

  const formattedPrice = priceData
    ? (priceData.unit_amount / 100).toLocaleString(undefined, {
        style: 'currency',
        currency: (priceData.currency || 'USD').toUpperCase(),
      })
    : '$—';

  async function handleSubscribe() {
    try {
      setErr('');
      setBusy(true);

      // Require login (we need user_id for the checkout session)
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      if (!userId) {
        window.location.href = '/login.html';
        return;
      }

      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to start checkout');

      // Go to Stripe Checkout
      window.location.href = data.url;
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ maxWidth: 900, margin: '2rem auto', padding: '1rem' }}>
      <h1 style={{ color: '#084a58', textAlign: 'center', marginBottom: '1.5rem' }}>
        Choose your plan
      </h1>

      <div
        style={{
          background: '#fff',
          borderRadius: 12,
          boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
          padding: '2rem',
        }}
      >
        <h2 style={{ marginTop: 0 }}>Annual Access</h2>
        <p>One year of access to The Reputation Bank app.</p>

        <p style={{ fontSize: '2rem', margin: '1rem 0' }}>
          {loadingPrice ? 'Loading…' : `${formattedPrice} / ${priceData?.interval || 'year'}`}
        </p>

        <button
          onClick={handleSubscribe}
          disabled={busy || loadingPrice}
          style={{
            backgroundColor: '#084a58',
            color: '#fff',
            border: 'none',
            padding: '0.75rem 1.25rem',
            borderRadius: 6,
            cursor: busy ? 'not-allowed' : 'pointer',
            boxShadow: '2px 2px 5px rgba(0,0,0,0.2)'
          }}
        >
          {busy ? 'Starting checkout…' : 'Subscribe'}
        </button>

        {err && (
          <p style={{ color: 'red', marginTop: '1rem' }}>
            {err}
          </p>
        )}
      </div>
    </div>
  );
}
