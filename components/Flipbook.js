// components/Flipbook.js
import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import { createClient } from '@supabase/supabase-js';

export default function Flipbook() {
  const router = useRouter();
  const totalPages = 109;

  // ✅ Supabase client (same project as your HTML pages)
  const supabase = createClient(
    'https://nidxvthbowdgdfuopmzk.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pZHh2dGhib3dkZ2RmdW9wbXprIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQxNTYwMjgsImV4cCI6MjA1OTczMjAyOH0.EaRbqF0WYFzYfjL5A6ykQKzHCZzCNPWJINIVwosqYk4' // ← use same anon key as auth.js
  );

  const interactivePages = useMemo(
    () =>
      new Set([3,16,17,18,19,20,21,26,27,28,29,30,31,34,36,37,38,39,40,41,48,53,54,65,66,67,68,69,70,72,74,82,83,84,87,88,89,91,94,95,96,99,100,101,104]),
    []
  );

  const getInitialPage = () => {
    if (typeof window !== 'undefined') {
      const match = window.location.hash.match(/#page\/(\d+)/);
      if (match) {
        const n = parseInt(match[1], 10);
        if (!isNaN(n) && n >= 1 && n <= totalPages) return n;
      }
    }
    return 1;
  };

  const [page, setPage] = useState(getInitialPage);

  // ✅ ENFORCE LOGIN-FIRST (important)
  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data?.user) {
        window.location.href = '/login.html';
      }
    };

    checkUser();
  }, []);

  useEffect(() => {
    if (interactivePages.has(page)) {
      router.push(`/page-${page}.html`);
      return;
    }
    if (typeof window !== 'undefined') {
      const desired = `#page/${page}`;
      if (window.location.hash !== desired) window.location.hash = desired;
    }
  }, [page, router, interactivePages]);

  if (interactivePages.has(page)) return null;

  const goNext = () => setPage(p => Math.min(p + 1, totalPages));
  const goBack = () => setPage(p => Math.max(p - 1, 1));

  const imageUrl = `/page-${page}.jpg`;

  const baseBtn = {
    padding: '0.6rem 1.2rem',
    backgroundColor: '#084a58',
    color: '#fff',
    fontSize: '1rem',
    fontFamily: 'Avenir, "Nunito Sans", sans-serif',
    border: 'none',
    borderRadius: '4px',
    textDecoration: 'none',
    boxShadow: '2px 2px 5px rgba(0,0,0,0.2)',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center'
  };

  // ✅ SIGN OUT FUNCTION
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login.html';
  };

  return (
    <div style={{ textAlign: 'center', padding: '1rem', fontFamily: 'Avenir, "Nunito Sans", sans-serif', color: '#000' }}>

      {/* ✅ SIGN OUT BUTTON */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
        <button
          onClick={handleSignOut}
          style={{
            ...baseBtn,
            backgroundColor: '#d1d3d4',
            color: '#084a58'
          }}
        >
          Sign Out
        </button>
      </div>

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
          border: '1px solid #ccc'
        }}
      />

      <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
        <div>
          <button onClick={goBack} disabled={page === 1} style={{ ...baseBtn, marginRight: '0.5rem', opacity: page === 1 ? 0.6 : 1 }}>
            ⬅ Back
          </button>

          <span style={{ margin: '0 1rem' }}>
            Page {page} of {totalPages}
          </span>

          <button onClick={goNext} disabled={page === totalPages} style={{ ...baseBtn, marginLeft: '0.5rem', opacity: page === totalPages ? 0.6 : 1 }}>
            Next ➡
          </button>
        </div>

        <a href="/page-3.html" role="button" tabIndex={0} style={{ ...baseBtn, marginTop: '1rem' }}>
          Go to the Table of Contents
        </a>
      </div>
    </div>
  );
}
