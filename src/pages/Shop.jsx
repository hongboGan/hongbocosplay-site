import { useState } from 'react';
import { CATEGORIES, products, countIn } from '../data/products.js';
import { usePageMeta } from '../lib/seo.js';
import ProductCard from '../components/ProductCard.jsx';

export default function Shop() {
  const [filter, setFilter] = useState('all');

  usePageMeta();

  const shown = filter === 'all' ? products : products.filter((p) => p.category === filter);

  return (
    <section className="section">
      <div className="shell">
        <p className="eyebrow">Catalogue</p>
        <h1 style={{ fontSize: 'clamp(2rem, 4.4vw, 3.2rem)' }}>All products</h1>
        <p className="lede mt-1">
          {products.length} references in production. Prices are indicative wholesale ranges in USD; final pricing
          depends on quantity, material and finishing.
        </p>

        <div className="chips" role="group" aria-label="Filter by category">
          <button
            type="button"
            className="chip"
            aria-pressed={filter === 'all'}
            onClick={() => setFilter('all')}
          >
            All ({products.length})
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c.slug}
              type="button"
              className="chip"
              aria-pressed={filter === c.slug}
              onClick={() => setFilter(c.slug)}
            >
              {c.name} ({countIn(c.slug)})
            </button>
          ))}
        </div>

        {shown.length === 0 ? (
          <p className="empty">No products in this category yet.</p>
        ) : (
          <div className="grid">
            {shown.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
