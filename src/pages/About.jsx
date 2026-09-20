import { Link } from 'react-router-dom';
import { CATEGORIES, CONTACT, countIn } from '../data/products.js';
import { usePageMeta } from '../lib/seo.js';

export default function About() {
  usePageMeta({
    title: 'About us',
    description:
      'A cosplay merchandise and costume manufacturer supplying wholesale and OEM buyers — masks, headwear, wigs, armour-style outerwear and finished costumes.',
    path: '/about',
  });

  return (
    <>
      <section className="section">
        <div className="shell">
          <p className="eyebrow">About</p>
          <h1 style={{ fontSize: 'clamp(2rem, 4.6vw, 3.4rem)', maxWidth: '22ch' }}>
            A manufacturing floor built for costume and cosplay goods.
          </h1>
          <p className="lede mt-1">
            We make character merchandise and costumes for wholesale and OEM buyers — party-goods importers, cosplay
            retailers, event and stage producers, and online sellers who need their own labels on the goods.
          </p>
        </div>
      </section>

      <section className="section section--raised">
        <div className="shell">
          <p className="eyebrow">What we produce</p>
          <h2>Four lines under one roof.</h2>
          <ul className="spec mt-2" style={{ maxWidth: '62ch' }}>
            {CATEGORIES.map((c) => (
              <li key={c.slug}>
                <span>
                  <Link to={`/shop/${c.slug}`} style={{ color: 'var(--ink)' }}>
                    {c.name}
                  </Link>
                </span>
                <span>{countIn(c.slug)} references</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <div className="features">
            <div className="feature">
              <span className="feature__n">01</span>
              <h3>Development</h3>
              <p>
                Patterns and samples built from your reference. We flag anything that will not hit a price point before
                you commit to it.
              </p>
            </div>
            <div className="feature">
              <span className="feature__n">02</span>
              <h3>Production</h3>
              <p>
                Bulk runs against an approved pre-production sample, so what you sign off is what arrives in the
                carton.
              </p>
            </div>
            <div className="feature">
              <span className="feature__n">03</span>
              <h3>Quality control</h3>
              <p>
                Inline checks during the run and a final inspection before packing. Defects are pulled at the factory,
                not at your warehouse.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section section--raised">
        <div className="shell">
          <div className="band">
            <div>
              <h2>Working with us.</h2>
              <p className="mt-1">
                Quotes within one working day. Sampling before bulk. Terms confirmed in writing before production
                starts.
              </p>
            </div>
            <div className="hero__actions" style={{ marginTop: 0 }}>
              <Link className="btn btn--primary" to="/inquiry">
                Contact us
              </Link>
              <a className="btn btn--ghost" href={`mailto:${CONTACT.email}`}>
                {CONTACT.email}
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
