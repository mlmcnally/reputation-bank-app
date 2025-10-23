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

    // ---- First-load grace window (avoid bounce during silent restore) ----
    const GRACE_MS = 2000;
    const redirectTimer = setTimeout(async () => {
      if (!mounted || redirected) return;
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        redirected = true;
        window.location.replace(LOGIN_URL); // absolute, no hash
      }
    }, GRACE_MS);

    // Immediate check (after a tiny delay so Supabase can hydrate)
    (async () => {
      await new Promise(r => setTimeout(r, 150));
      if (!mounted || redirected) return;
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        clearTimeout(redirectTimer);
        if (mounted) setReady(true);
      }
    })();

    // ---- Auth state listener (handles sign-in / sign-out / token refresh) ----
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted || redirected) return;

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        clearTimeout(redirectTimer);
        setReady(true);
      }

      if (event === 'SIGNED_OUT') {
        redirected = true;
        setReady(false);
        window.location.replace(LOGIN_URL);
      }
    });

    // ---- Keep the session alive while the tab is open ----
    // Refresh token every ~25 minutes (Supabase rotates/refreshes quietly)
    const KEEP_ALIVE_MS = 25 * 60 * 1000;
    const keepAlive = setInterval(() => {
      // Best-effort; errors are fine (network / offline)
      supabase.auth.refreshSession().catch(() => {});
    }, KEEP_ALIVE_MS);

    // Nudge refresh when the tab becomes visible again
    const onVisible = async () => {
      if (document.visibilityState === 'visible') {
        await supabase.auth.refreshSession().catch(() => {});
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user && !redirected) {
          redirected = true;
          window.location.replace(LOGIN_URL);
        }
      }
    };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      mounted = false;
      clearTimeout(redirectTimer);
      clearInterval(keepAlive);
      document.removeEventListener('visibilitychange', onVisible);
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


