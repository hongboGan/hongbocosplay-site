import { Link } from 'react-router-dom';
import { CONTACT } from '../data/products.js';
import { formatDate, sortedPosts } from '../content/blog.js';
import { usePageMeta } from '../lib/seo.js';
import { MailIcon, WhatsAppIcon } from '../components/icons.jsx';

export default function Blog() {
  usePageMeta();

  const [lead, ...rest] = sortedPosts;

  return (
    <>
      <section className="section">
        <div className="shell">
          <p className="eyebrow">Sourcing notes</p>
          <h1 style={{ fontSize: 'clamp(1.9rem, 4.2vw, 3rem)' }}>What cosplay buyers keep asking.</h1>
          <p className="lede mt-1" style={{ maxWidth: '62ch' }}>
            The recurring questions from cosplay communities — what a commission should cost, why wigs
            disappoint, how to inspect a prop sample, why reorders drift on size. Answered from the
            manufacturing side, without the sales gloss.
          </p>
        </div>
      </section>

      {lead && (
        <section className="section section--tight">
          <div className="shell">
            <Link className="post-lead" to={`/blog/${lead.slug}`}>
              <div className="post-lead__media">
                <img src={lead.cover} alt="" width="900" height="900" decoding="async" />
              </div>
              <div className="post-lead__body">
                <p className="post-meta">
                  <time dateTime={lead.date}>{formatDate(lead.date)}</time>
                  {lead.tags.slice(0, 2).map((t) => (
                    <span className="tag" key={t}>
                      {t}
                    </span>
                  ))}
                </p>
                <h2>{lead.title}</h2>
                <p className="lede">{lead.excerpt}</p>
                <span className="post-more">Read the note →</span>
              </div>
            </Link>
          </div>
        </section>
      )}

      <section className="section section--raised">
        <div className="shell">
          <div className="post-grid">
            {rest.map((post) => (
              <Link className="post-card" to={`/blog/${post.slug}`} key={post.slug}>
                <div className="post-card__media">
                  <img src={post.cover} alt="" width="900" height="900" loading="lazy" decoding="async" />
                </div>
                <p className="post-meta">
                  <time dateTime={post.date}>{formatDate(post.date)}</time>
                </p>
                <h3>{post.title}</h3>
                <p>{post.excerpt}</p>
                <span className="post-more">Read more →</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="shell band">
          <div>
            <h2>Looking for pricing instead of reading?</h2>
            <p className="lede mt-1">
              Send your target styles and quantities — we come back with unit pricing, lead time and
              sampling options.
            </p>
          </div>
          <div className="band__actions">
            <Link className="btn btn--primary" to="/inquiry">
              Request a quote
            </Link>
            <a className="btn btn--ghost" href={CONTACT.whatsappUrl} target="_blank" rel="noopener noreferrer">
              <WhatsAppIcon /> WhatsApp
            </a>
            <a className="btn btn--ghost" href={`mailto:${CONTACT.email}`}>
              <MailIcon /> Email
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
