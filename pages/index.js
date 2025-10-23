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
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!mounted) return;
      if (!session?.user) {
        // no session → go to login (one redirect, no loop)
        window.location.replace('/login.html');
      } else {
        setReady(true);
      }
    })();
    return () => { mounted = false; };
  }, []);

  if (!ready) return null; // don't render until auth check is done
  return (
    <main style={{ padding: '1rem' }}>
      <Flipbook />
    </main>
  );
}
