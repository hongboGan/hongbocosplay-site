import { Link } from 'react-router-dom';
import { CONTACT } from '../data/products.js';
import { usePageMeta } from '../lib/seo.js';

const STEPS = [
  {
    n: '01',
    t: 'Send the reference',
    d: 'Photos, a tech pack, a competitor sample or a physical item. Anything that shows us colour, material and finish.',
  },
  {
    n: '02',
    t: 'Quote and sample',
    d: 'We come back with unit pricing at your quantity, plus a sampling cost and lead time.',
  },
  {
    n: '03',
    t: 'Approve the sample',
    d: 'You check the pre-production sample. Nothing goes into bulk until you sign it off.',
  },
  {
    n: '04',
    t: 'Bulk production',
    d: 'Production runs against the approved sample, with the schedule planned backwards from your in-store date.',
  },
  {
    n: '05',
    t: 'QC and ship',
    d: 'Inline and final inspection, then dispatch by express, air or sea — your forwarder or ours.',
  },
];

export default function Custom() {
  usePageMeta();

  return (
    <>
      <section className="section">
        <div className="shell">
          <p className="eyebrow">Custom / OEM</p>
          <h1 style={{ fontSize: 'clamp(2rem, 4.6vw, 3.4rem)', maxWidth: '22ch' }}>
            Anything in the catalogue can be made to your specification.
          </h1>
          <p className="lede mt-1">
            The references on this site are starting points. Most of what leaves our floor is made to a buyer&apos;s
            own artwork, colourway and size chart.
          </p>
        </div>
      </section>

      <section className="section section--raised">
        <div className="shell">
          <p className="eyebrow">What can be customised</p>
          <h2>Five things buyers change first.</h2>
          <div className="features">
            <div className="feature">
              <span className="feature__n">Colour</span>
              <p>Pantone-matched fabric and trim, or matched to a physical swatch you send.</p>
            </div>
            <div className="feature">
              <span className="feature__n">Sizing</span>
              <p>Your own graded size chart, including kids runs and extended sizes.</p>
            </div>
            <div className="feature">
              <span className="feature__n">Material</span>
              <p>Substitute the base fabric or latex grade to hit a target price point.</p>
            </div>
            <div className="feature">
              <span className="feature__n">Branding</span>
              <p>Woven labels, printed neck tags and retail packaging applied in-house.</p>
            </div>
            <div className="feature">
              <span className="feature__n">Packaging</span>
              <p>Polybag, hangtag or gift box, labelled per store or per marketplace.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <p className="eyebrow">How it works</p>
          <h2>From reference to shipment.</h2>
          <div className="features">
            {STEPS.map((s) => (
              <div className="feature" key={s.n}>
                <span className="feature__n">{s.n}</span>
                <h3>{s.t}</h3>
                <p>{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--raised">
        <div className="shell">
          <h2>Trade terms</h2>
          <div className="features mt-2">
            <div className="feature">
              <h3>Minimums</h3>
              <p>Stock references carry the MOQ shown on each product. OEM runs are quoted per design.</p>
            </div>
            <div className="feature">
              <h3>Shipping</h3>
              <p>Express, air and sea. We ship on your forwarder or arrange carriage for you.</p>
            </div>
            <div className="feature">
              <h3>Payment</h3>
              <p>Terms confirmed with the quotation and dependent on order value and history.</p>
            </div>
          </div>
          <p className="mt-3" style={{ fontSize: '0.88rem', color: 'var(--ink-faint)' }}>
            Exact lead times, payment terms and minimums are confirmed in writing on each quotation.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <div className="band">
            <div>
              <h2>Send us your reference and your target quantity.</h2>
              <p className="mt-1">We will tell you what it costs and how long it takes.</p>
            </div>
            <div className="hero__actions" style={{ marginTop: 0 }}>
              <Link className="btn btn--primary" to="/inquiry">
                Start a custom inquiry
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
