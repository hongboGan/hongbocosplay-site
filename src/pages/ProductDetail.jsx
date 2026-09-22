import { Link, useParams } from 'react-router-dom';
import { CONTACT, byCategory, getCategory, getProduct, moqLabel, priceLabel, shortTitle } from '../data/products.js';
import { usePageMeta } from '../lib/seo.js';
import ProductCard from '../components/ProductCard.jsx';
import NotFound from './NotFound.jsx';
import { MailIcon, WhatsAppIcon } from '../components/icons.jsx';

export default function ProductDetail() {
  const { id } = useParams();
  const product = getProduct(id);

  usePageMeta();

  if (!product) return <NotFound />;

  const cat = getCategory(product.category);
  const related = byCategory(product.category)
    .filter((p) => p.id !== product.id)
    .slice(0, 4);

  const waText = encodeURIComponent(
    `Hello, I'd like a quote for: ${product.title} (ref ${product.id}). Quantity: `
  );

  return (
    <>
      <section className="section section--tight">
        <div className="shell">
          <p className="eyebrow">
            <Link to="/shop">Catalogue</Link>
            {cat && (
              <>
                {' / '}
                <Link to={`/shop/${cat.slug}`}>{cat.name}</Link>
              </>
            )}
          </p>

          <div className="detail">
            <div className="detail__media">
              <img
                src={product.image}
                alt={product.title}
                width={product.width || 900}
                height={product.height || 1125}
                decoding="async"
              />
            </div>

            <div>
              <h1 style={{ fontSize: 'clamp(1.6rem, 3.2vw, 2.4rem)' }}>{product.title}</h1>
              <p className="detail__price">{priceLabel(product)}</p>
              <p className="mt-0">{moqLabel(product)}</p>

              <ul className="spec">
                <li>
                  <span>Reference</span>
                  <span>{product.id}</span>
                </li>
                <li>
                  <span>Category</span>
                  <span>{cat ? cat.name : product.category}</span>
                </li>
                <li>
                  <span>Wholesale price</span>
                  <span>{priceLabel(product)}</span>
                </li>
                <li>
                  <span>Minimum order</span>
                  <span>{product.moq || 'On request'}</span>
                </li>
                <li>
                  <span>Customisation</span>
                  <span>Colour, sizing, branding</span>
                </li>
              </ul>

              <div className="hero__actions">
                <Link className="btn btn--primary" to={`/inquiry?product=${encodeURIComponent(product.id)}`}>
                  Request a quote
                </Link>
                <a className="btn btn--ghost" href={`${CONTACT.whatsappUrl}?text=${waText}`}>
                  <WhatsAppIcon />
                  WhatsApp
                </a>
              </div>

              <p className="mt-2" style={{ fontSize: '0.88rem', color: 'var(--ink-faint)' }}>
                Want this in your own colourway or size run? Mention it in the inquiry and we will quote the OEM
                version. <a href={`mailto:${CONTACT.email}`} style={{ color: 'var(--accent)' }}>{CONTACT.email}</a>
              </p>
            </div>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="section section--raised">
          <div className="shell">
            <h2>More in {cat ? cat.name : product.category}</h2>
            <div className="grid">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="section">
        <div className="shell">
          <div className="band">
            <div>
              <h2>Need this priced for a specific quantity?</h2>
              <p className="mt-1">Tell us the item code and the quantity — we will come back with unit pricing.</p>
            </div>
            <div className="hero__actions" style={{ marginTop: 0 }}>
              <Link className="btn btn--primary" to={`/inquiry?product=${encodeURIComponent(product.id)}`}>
                Send an inquiry
              </Link>
              <a className="btn btn--ghost" href={`mailto:${CONTACT.email}`}>
                <MailIcon />
                Email us
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
