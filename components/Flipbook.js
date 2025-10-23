// components/Flipbook.js
import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://nidxvthbowdgdfuopmzk.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pZHh2dGhib3dkZ2RmdW9wbXprIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQxNTYwMjgsImV4cCI6MjA1OTczMjAyOH0.EaRbqF0WYFzYfjL5A6ykQKzHCZzCNPWJINIVwosqYk4'
);

export default function Flipbook() {
  const router = useRouter();
  const totalPages = 109;

  // 🔒 Auth state
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(true);

  // ✅ Interactive HTML pages
  const interactivePages = useMemo(
    () =>
      new Set([
        3,
        16, 17, 18, 19, 20, 21,
        26, 27, 28, 29, 30, 31,
        34,
        36, 37, 38, 39, 40, 41,
        48,
        53, 54,
        65, 66, 67, 68, 69, 70,
        72,
        74,
        82, 83, 84,
        87, 88, 89,
        91,
        94, 95, 96,
        99, 100, 101,
        104
      ]),
    []
  );

  // 🔒 Auth check on mount
  useEffect(() => {
    let mounted = true;
    async function guard() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!mounted) return;
      if (!session?.user) {
        router.replace('/login.html');
        return;
      }
      setAuthed(true);
      setChecking(false);
    }
    guard();

    // Listen for sign-out
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) router.replace('/login.html');
    });

    return () => {
      mounted = false;
      sub?.subscription?.unsubscribe?.();
    };
  }, [router]);

  if (checking || !authed) return null;

  // ===== Flipbook logic =====
  const getInitialPage = () => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash;
      const match = hash.match(/#page\/(\d+)/);
      if (match) {
        const pageNum = parseInt(match[1], 10);
        if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) return pageNum;
      }
    }
    return 1;
  };

  const [page, setPage] = useState(getInitialPage);

  useEffect(() => {
    if (interactivePages.has(page)) {
      router.push(`/page-${page}.html`);
    }
    if (typeof window !== 'undefined' && !interactivePages.has(page)) {
      const desired = `#page/${page}`;
      if (window.location.hash !== desired) {
        window.location.hash = desired;
      }
    }
  }, [page, router, interactivePages]);

  if (interactivePages.has(page)) return null;

  const goNext = () => setPage((p) => Math.min(p + 1, totalPages));
  const goBack = () => setPage((p) => Math.max(p - 1, 1));
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.replace('/login.html');
  };

  const imageUrl = `/page-${page}.jpg`;

  // Shared button style
  const baseBtn = {
    padding: '0.6rem 1.2rem',
    backgroundColor: '#084a58',
    color: 'white',
    fontSize: '1rem',
    fontFamily: 'Avenir, "Nunito Sans", sans-serif',
    border: 'none',
    borderRadius: '4px',
    textDecoration: 'none',
    boxShadow: '2px 2px 5px rgba(0,0,0,0.2)',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  return (
    <div
      style={{
        textAlign: 'center',
        padding: '1rem',
        fontFamily: 'Avenir, "Nunito Sans", sans-serif',
        color: '#000',
      }}
    >
      <img
        src={imageUrl}
        alt={`Page ${page}`}
        style={{
          maxHeight: '88vh',
          width: 'auto',
          height: 'auto',
          maxWidth: '100%',
          objectFit: 'contain',
          borderRadius: '12px',
          border: '1px solid #ccc',
        }}
      />

      <div
        style={{
          marginTop: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.75rem',
        }}
      >
        <div>
          <button
            onClick={goBack}
            disabled={page === 1}
            style={{
              ...baseBtn,
              marginRight: '0.5rem',
              opacity: page === 1 ? 0.6 : 1,
            }}
          >
            ⬅ Back
          </button>

          <span style={{ margin: '0 1rem' }}>
            Page {page} of {totalPages}
          </span>

          <button
            onClick={goNext}
            disabled={page === totalPages}
            style={{
              ...baseBtn,
              marginLeft: '0.5rem',
              opacity: page === totalPages ? 0.6 : 1,
            }}
          >
            Next ➡
          </button>
        </div>

        <a
          href="/page-3.html"
          role="button"
          tabIndex={0}
          style={{
            ...baseBtn,
            marginTop: '1rem',
          }}
        >
          Go to the Table of Contents
        </a>

        <button
          onClick={handleSignOut}
          style={{
            ...baseBtn,
            backgroundColor: '#2ea1a8',
            marginTop: '0.5rem',
          }}
        >
          🔒 Sign Out
        </button>
      </div>
    </div>
  );
}

