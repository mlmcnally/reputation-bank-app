import { useState } from 'react';

export default function Flipbook() {
  const totalPages = 109;
  const [page, setPage] = useState(1);

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
