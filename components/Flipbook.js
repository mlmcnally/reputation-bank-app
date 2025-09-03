import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Flipbook() {
  const totalPages = 109;
  const router = useRouter();

  const interactivePages = new Set([
    3,                          // ✅ NEW: make Table of Contents interactive
    16, 17, 18, 19, 20, 21,     // Exercise 1
    26, 27, 28, 29, 30, 31,     // Exercise 2
    34,                         // Exercise 3
    36, 37, 38, 39, 40, 41,     // Exercise 4
    48,                         // Exercise 5
    53, 54,                     // Exercise 6
    65, 66, 67, 68, 69, 70,     // Exercise 7
    72,                         // Exercise 8
    74,                         // Exercise 9
    82, 83, 84,                 // Exercise 10
    87, 88, 89,                 // Exercise 11
    91,                         // Exercise 12
    94, 95, 96,                 // Exercise 13
    99, 100, 101,               // Exercise 14
    104                         // Exercise 15
  ]);

  // 🆕 Read from URL hash like #page/15
  const getInitialPage = () => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash;
      const match = hash.match(/#page\/(\d+)/);
      if (match) {
        const pageNum = parseInt(match[1]);
        if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
          return pageNum;
        }
      }
    }
    return 1;
  };

  const [page, setPage] = useState(getInitialPage);

  // 🚨 Redirect to interactive page if needed
  useEffect(() => {
    if (interactivePages.has(page)) {
      router.push(`/page-${page}.html`);
    }
  }, [page, router]);

  if (interactivePages.has(page)) {
    return null;
  }

  const goNext = () => setPage((p) => Math.min(p + 1, totalPages));
  const goBack = () => setPage((p) => Math.max(p - 1, 1));

  const imageUrl = `/page-${page}.jpg`;

  return (
    <div style={{ textAlign: 'center', padding: '1rem' }}>
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
      <div style={{ marginTop: '1rem' }}>
        <button onClick={goBack} disabled={page === 1}>
          ⬅ Back
        </button>
        <span style={{ margin: '0 1rem' }}>Page {page} of {totalPages}</span>
        <button onClick={goNext} disabled={page === totalPages}>
          Next ➡
        </button>
      </div>
    </div>
  );
}
