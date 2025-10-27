// pages/subscribe.js
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export default function Subscribe() {
  const [loading, setLoading] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        window.location.replace('/login.html');
      } else {
        setSessionReady(true);
      }
    })();
  }, []);

  async function beginCheckout() {
    setLoading(true);
    const resp = await fetch('/api/create-checkout-session', { method: 'POST' });
    const json = await resp.json();
    setLoading(false);
    if (json.url) window.location.href = json.url;
    else alert(json.error || 'Unable to start checkout');
  }

  if (!sessionReady) return null;

  return (
    <main style={{maxWidth: 600, margin: '2rem auto', fontFamily: 'Avenir, "Nunito Sans", sans-serif'}}>
      <h2>The Reputation Bank — 1-Year License</h2>
      <p>Purchase a one-year license to unlock the app.</p>
      <button onClick={beginCheckout} disabled={loading} style={{padding:'10px 16px', background:'#084a58', color:'#fff', border:'none', borderRadius:4}}>
        {loading ? 'Starting checkout…' : 'Buy Now'}
      </button>
    </main>
  );
}
