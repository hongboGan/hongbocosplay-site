import { Link } from 'react-router-dom';
import { CATEGORIES, CONTACT, byCategory, countIn, products } from '../data/products.js';
import { usePageMeta } from '../lib/seo.js';
import ProductCard from '../components/ProductCard.jsx';

const FEATURED = ['masks', 'wigs', 'armor', 'costumes']
  .flatMap((slug) => byCategory(slug).slice(0, 2))
  .concat(products.filter((p) => !['masks', 'wigs', 'armor', 'costumes'].includes(p.category)).slice(0, 2))
  .slice(0, 8);

export default function Home() {
  usePageMeta({
    title: 'Custom Cosplay Merchandise Manufacturer',
    description:
      'Wholesale and OEM cosplay merchandise — masks, headwear, wigs, armour-style outerwear and costumes, manufactured to your specification.',
    path: '/',
  });

  return (
    <>
      <section className="hero">
        <div className="shell hero__inner">
          <div className="hero__grid">
            <div>
              <p className="eyebrow">Made to order · Wholesale &amp; OEM</p>
              <h1>Cosplay merchandise, built to your specification.</h1>
              <p className="lede">
                Masks, headwear, wigs and armour-style outerwear for party-goods importers, cosplay retailers and
                event producers. Low minimums on stock lines, full OEM on your own artwork and sizing.
              </p>
              <div className="hero__actions">
                <Link className="btn btn--primary" to="/shop">
                  Browse the catalogue
                </Link>
                <Link className="btn btn--ghost" to="/inquiry">
                  Request a quote
                </Link>
              </div>
            </div>

            <div className="hero__stage">
              <figure className="stage__shot stage__shot--tall">
                <img
                  src="/products/hannya-mask-full-face-japanese.jpg"
                  alt="Full-face Japanese hannya mask in red and bone-white lacquer"
                  width="900"
                  height="900"
                  decoding="async"
                />
              </figure>
              <figure className="stage__shot">
                <img
                  src="/products/medieval-knight-armor-costume-chainmail.jpg"
                  alt="Medieval knight chainmail and armour costume"
                  width="900"
                  height="900"
                  decoding="async"
                />
              </figure>
              <figure className="stage__shot">
                <img
                  src="/products/korean-hanbok-traditional-dangui-pleated.jpg"
                  alt="Pleated traditional Korean hanbok in vivid colour"
                  width="900"
                  height="900"
                  decoding="async"
                />
              </figure>
              <div className="stage__card">
                <strong>Your design, our floor</strong>
                <span>
                  MOQ from 2 pcs on stock lines · OEM on artwork, sizing and branding · sample approved before bulk
                </span>
              </div>
            </div>
          </div>

          <div className="stats">
            <div>
              <strong>{products.length}+</strong>
              <span>Stock references</span>
            </div>
            <div>
              <strong>{CATEGORIES.length}</strong>
              <span>Product lines</span>
            </div>
            <div>
              <strong>OEM</strong>
              <span>Your artwork &amp; sizing</span>
            </div>
          </div>
        </div>
      </section>

      <section className="section section--raised">
        <div className="shell">
          <p className="eyebrow">Who we are</p>
          <h2>Four lines, one manufacturing floor.</h2>
          <p className="lede mt-1">
            Hongbo Cosplay makes character merchandise and costumes for wholesale and OEM buyers — party-goods
            importers, cosplay retailers, event and stage producers, and online sellers who need their own label on
            the goods. The references below are stock starting points; most of what leaves our floor is made to a
            buyer&apos;s own artwork, colourway and size chart.
          </p>
          <div className="tiles">
            {CATEGORIES.map((c) => {
              const first = byCategory(c.slug)[0];
              return (
                <Link key={c.slug} className="tile" to={`/shop/${c.slug}`}>
                  {first && (
                    <span className="tile__bloom">
                      <img src={first.image} alt="" aria-hidden="true" loading="lazy" decoding="async" />
                    </span>
                  )}
                  <span className="tile__body">
                    <strong>{c.name}</strong>
                    <em>{countIn(c.slug)} products</em>
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <p className="eyebrow">Selected references</p>
          <h2>Recent additions to the catalogue.</h2>
          <div className="grid">
            {FEATURED.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
          <div className="mt-3">
            <Link className="btn btn--ghost" to="/shop">
              See all {products.length} products
            </Link>
          </div>
        </div>
      </section>

      <section className="section section--raised">
        <div className="shell">
          <p className="eyebrow">Custom / OEM</p>
          <h2>Your design, our production line.</h2>
          <div className="features">
            <div className="feature">
              <span className="feature__n">01</span>
              <h3>Your artwork</h3>
              <p>Send reference images, tech packs or physical samples. We match colour, material and finish.</p>
            </div>
            <div className="feature">
              <span className="feature__n">02</span>
              <h3>Your sizing</h3>
              <p>Grading built from your size chart, not a generic block. Kids and plus runs available.</p>
            </div>
            <div className="feature">
              <span className="feature__n">03</span>
              <h3>Your branding</h3>
              <p>Woven labels, printed tags and retail packaging applied at the factory.</p>
            </div>
            <div className="feature">
              <span className="feature__n">04</span>
              <h3>Your schedule</h3>
              <p>Sample first, then bulk. Tell us your in-store date and we plan the run backwards from it.</p>
            </div>
          </div>
          <div className="mt-3">
            <Link className="btn btn--primary" to="/custom">
              How custom orders work
            </Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <div className="band">
            <div>
              <h2>Send us the item and the quantity.</h2>
              <p className="mt-1">
                Quotes within one working day, by email or WhatsApp — whichever you prefer.
              </p>
            </div>
            <div className="hero__actions" style={{ marginTop: 0 }}>
              <Link className="btn btn--primary" to="/inquiry">
                Start an inquiry
              </Link>
              <a className="btn btn--ghost" href={CONTACT.whatsappUrl}>
                WhatsApp us
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
