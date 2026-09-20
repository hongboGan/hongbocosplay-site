import { Link } from 'react-router-dom';
import { CATEGORIES } from '../data/products.js';
import { usePageMeta } from '../lib/seo.js';

export default function NotFound() {
  usePageMeta({
    title: 'Page not found',
    description: 'The page you requested does not exist.',
    path: '/404',
  });

  return (
    <section className="section">
      <div className="shell">
        <p className="eyebrow">404</p>
        <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)' }}>That page isn&apos;t here.</h1>
        <p className="lede mt-1">It may have been renamed, or the link may be out of date. Try one of these instead.</p>
        <div className="chips">
          <Link className="chip" to="/">
            Home
          </Link>
          <Link className="chip" to="/shop">
            All products
          </Link>
          {CATEGORIES.map((c) => (
            <Link key={c.slug} className="chip" to={`/shop/${c.slug}`}>
              {c.name}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
