import { useState } from 'react';

export default function Flipbook() {
  const totalPages = 109;
  const [page, setPage] = useState(1);

  const goNext = () => setPage((p) => Math.min(p + 1, totalPages));
  const goBack = () => setPage((p) => Math.max(p - 1, 1));

  const paddedPage = String(page).padStart(1, '0');
  const imageUrl = `/pdf-pages/page-${paddedPage}.jpg`;

  return (
    <div style={{ textAlign: 'center', padding: '1rem' }}>
      <img
        src={imageUrl}
        alt={`Page ${page}`}
        style={{ width: '100%', maxWidth: '800px', borderRadius: '12px' }}
      />
      <div style={{ marginTop: '1rem' }}>
        <button onClick={goBack} disabled={page === 1}>
          ⬅️ Back
        </button>
        <span style={{ margin: '0 1rem' }}>Page {page} of {totalPages}</span>
        <button onClick={goNext} disabled={page === totalPages}>
          Next ➡️
        </button>
      </div>
    </div>
  );
}
