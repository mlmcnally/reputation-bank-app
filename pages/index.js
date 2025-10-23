// pages/index.js
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import Flipbook from '../components/Flipbook';

const supabase = createClient(
  'https://nidxvthbowdgdfuopmzk.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pZHh2dGhib3dkZ2RmdW9wbXprIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQxNTYwMjgsImV4cCI6MjA1OTczMjAyOH0.EaRbqF0WYFzYfjL5A6ykQKzHCZzCNPWJINIVwosqYk4'
);

export default function Home() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    let redirected = false;

    const LOGIN_URL = `${window.location.origin}/login.html`;

    const GRACE_MS = 2000;
    const redirectTimer = setTimeout(async () => {
      if (!mounted || redirected) return;
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        redirected = true;
        window.location.replace(LOGIN_URL); // absolute, no hash
      }
    }, GRACE_MS);

    async function checkNow() {
      await new Promise(r => setTimeout(r, 150));
      const { data: { session } } = await supabase.auth.getSession();
      if (!mounted || redirected) return;

      if (session?.user) {
        clearTimeout(redirectTimer);
        setReady(true);
      }
    }

    checkNow();

    const { data: sub } = supabase.auth.onAuthStateChange((_evt, session) => {
      if (!mounted || redirected) return;
      if (session?.user) {
        clearTimeout(redirectTimer);
        setReady(true);
      } else {
        redirected = true;
        window.location.replace(LOGIN_URL); // absolute, no hash
      }
    });

    return () => {
      mounted = false;
      clearTimeout(redirectTimer);
      sub?.subscription?.unsubscribe?.();
    };
  }, []);

  if (!ready) return null;

  return (
    <main style={{ padding: '1rem' }}>
      <Flipbook />
    </main>
  );
}
