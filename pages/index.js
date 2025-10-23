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

    async function check() {
      // small hydration delay so Supabase can restore session
      await new Promise(r => setTimeout(r, 300));

      const { data: { session } } = await supabase.auth.getSession();
      if (!mounted) return;

      if (session?.user) {
        setReady(true);
      } else {
        // no session → go to login (single redirect)
        window.location.replace('/login.html');
      }
    }

    check();

    // Also react to late session restores or sign-outs
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, session) => {
      if (!mounted) return;
      if (session?.user) {
        setReady(true);
      } else {
        window.location.replace('/login.html');
      }
    });

    return () => {
      mounted = false;
      sub?.subscription?.unsubscribe?.();
    };
  }, []);

  // Don’t render until we know auth state
  if (!ready) return null;

  return (
    <main style={{ padding: '1rem' }}>
      <Flipbook />
    </main>
  );
}
