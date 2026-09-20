import { Link, useParams } from 'react-router-dom';
import { getCategory, byCategory } from '../data/products.js';
import { usePageMeta } from '../lib/seo.js';
import ProductCard from '../components/ProductCard.jsx';
import NotFound from './NotFound.jsx';

export default function CategoryPage() {
  const { category } = useParams();
  const cat = getCategory(category);

  usePageMeta({
    title: cat ? cat.name : 'Not found',
    description: cat ? `${cat.blurb} Wholesale and OEM orders welcome.` : '',
    path: `/shop/${category}`,
  });

  if (!cat) return <NotFound />;

  const items = byCategory(cat.slug);

  return (
    <section className="section">
      <div className="shell">
        <p className="eyebrow">
          <Link to="/shop">Catalogue</Link> / {cat.name}
        </p>
        <h1 style={{ fontSize: 'clamp(2rem, 4.4vw, 3.2rem)' }}>{cat.name}</h1>
        <p className="lede mt-1">{cat.blurb}</p>

        {items.length === 0 ? (
          <p className="empty">No products in this category yet.</p>
        ) : (
          <div className="grid">
            {items.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}

        <div className="mt-3">
          <Link className="btn btn--ghost" to="/shop">
            Back to all products
          </Link>
        </div>
      </div>
    </section>
  );
}
