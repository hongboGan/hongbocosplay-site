import { Link, useParams } from 'react-router-dom';
import { CONTACT } from '../data/products.js';
import { formatDate, getPost, sortedPosts } from '../content/blog.js';
import { Markdown } from '../lib/markdown.jsx';
import { usePageMeta } from '../lib/seo.js';
import { MailIcon, WhatsAppIcon } from '../components/icons.jsx';
import NotFound from './NotFound.jsx';

export default function BlogPost() {
  const { slug } = useParams();
  const post = getPost(slug);

  usePageMeta({
    title: post ? post.title : 'Article not found',
    description: post ? post.excerpt : undefined,
    path: post ? `/blog/${post.slug}` : '/blog',
  });

  if (!post) return <NotFound />;

  const others = sortedPosts.filter((p) => p.slug !== post.slug).slice(0, 2);

  return (
    <article className="section">
      <div className="shell shell--narrow">
        <Link className="back" to="/blog">
          ← All notes
        </Link>

        <p className="post-meta">
          <time dateTime={post.date}>{formatDate(post.date)}</time>
          {post.tags.map((t) => (
            <span className="tag" key={t}>
              {t}
            </span>
          ))}
        </p>

        <h1>{post.title}</h1>
        <p className="lede mt-1">{post.excerpt}</p>

        <div className="post-cover">
          <img src={post.cover} alt="" width="900" height="900" decoding="async" />
        </div>

        <Markdown text={post.body} />

        {post.sources && post.sources.length > 0 && (
          <p className="post-sources">
            Written from recurring community discussion themes — {post.sources.join(' · ')}. Topic cues
            only; every word here is original.
          </p>
        )}

        <div className="post-cta">
          <h2>Need pricing for these styles?</h2>
          <p className="lede mt-1">
            Send quantities, sizes and your destination market — we reply with price, lead time and
            sample options.
          </p>
          <div className="band__actions mt-2">
            <Link className="btn btn--primary" to="/inquiry">
              Request a quote
            </Link>
            <a className="btn btn--ghost" href={CONTACT.whatsappUrl} target="_blank" rel="noopener noreferrer">
              <WhatsAppIcon /> Chat on WhatsApp
            </a>
            <a className="btn btn--ghost" href={`mailto:${CONTACT.email}`}>
              <MailIcon /> Email
            </a>
          </div>
        </div>

        {others.length > 0 && (
          <div className="post-related">
            <p className="eyebrow">Keep reading</p>
            <div className="post-grid post-grid--two">
              {others.map((p) => (
                <Link className="post-card" to={`/blog/${p.slug}`} key={p.slug}>
                  <p className="post-meta">
                    <time dateTime={p.date}>{formatDate(p.date)}</time>
                  </p>
                  <h3>{p.title}</h3>
                  <span className="post-more">Read more →</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
