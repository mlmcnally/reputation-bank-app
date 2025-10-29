// pages/post-purchase.js
import { useEffect, useState } from 'react';

export default function PostPurchase() {
  const [sessionId, setSessionId] = useState('');

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get('session_id') || '';
    setSessionId(id);

    // Optional: you could call a (server-side) /api/get-session to verify it
    // then redirect; for now we just send them to login.html.
    const t = setTimeout(() => {
      window.location.href = '/login.html';
    }, 1500);

    return () => clearTimeout(t);
  }, []);

  return (
    <main style={{ maxWidth: 720, margin: '4rem auto', textAlign: 'center' }}>
      <h1 style={{ color: '#084a58' }}>Thanks! 🎉</h1>
      <p>Your payment was successful.</p>
      {sessionId ? (
        <p style={{ fontSize: '0.9rem', color: '#555' }}>Session: {sessionId}</p>
      ) : null}
      <p>Sending you into the app…</p>
      <p>
        If you’re not redirected, <a href="/login.html">click here</a>.
      </p>
    </main>
  );
}
