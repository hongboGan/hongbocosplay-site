import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { CATEGORIES, CONTACT, countIn } from '../data/products.js';
import { MailIcon, WhatsAppIcon } from './icons.jsx';

function Wordmark() {
  return (
    <Link className="wordmark" to="/">
      Hongbo<span> Cosplay</span>
    </Link>
  );
}

export default function Layout() {
  const [shopOpen, setShopOpen] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const shopRef = useRef(null);
  const { pathname } = useLocation();

  useEffect(() => {
    setShopOpen(false);
    setDrawer(false);
  }, [pathname]);

  useEffect(() => {
    function onDown(e) {
      if (shopRef.current && !shopRef.current.contains(e.target)) setShopOpen(false);
    }
    function onKey(e) {
      if (e.key === 'Escape') {
        setShopOpen(false);
        setDrawer(false);
      }
    }
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = drawer ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [drawer]);

  return (
    <>
      <a className="skip" href="#main">
        Skip to content
      </a>

      <header className="header">
        <div className="shell header__inner">
          <Wordmark />

          <nav className="nav" aria-label="Primary">
            <div ref={shopRef} style={{ position: 'relative' }}>
              <button
                type="button"
                className="nav__link"
                aria-expanded={shopOpen}
                aria-haspopup="true"
                onClick={() => setShopOpen((v) => !v)}
              >
                Shop {shopOpen ? '▴' : '▾'}
              </button>
            </div>
            <NavLink className="nav__link" to="/custom">
              Custom / OEM
            </NavLink>
            <NavLink className="nav__link" to="/about">
              About
            </NavLink>
            <NavLink className="nav__link" to="/blog">
              Notes
            </NavLink>
            <NavLink className="nav__link" to="/inquiry">
              Inquiry
            </NavLink>
          </nav>

          <Link className="btn btn--primary header__cta" to="/inquiry">
            Get a quote
          </Link>

          <button
            type="button"
            className="burger"
            aria-label="Open menu"
            aria-expanded={drawer}
            onClick={() => setDrawer(true)}
          >
            <span />
          </button>
        </div>

        {shopOpen && (
          <div className="mega">
            <div className="shell mega__grid">
              {CATEGORIES.map((c) => (
                <Link key={c.slug} className="mega__item" to={`/shop/${c.slug}`}>
                  <strong>{c.name}</strong>
                  <em>{countIn(c.slug)} products</em>
                </Link>
              ))}
              <Link className="mega__item" to="/shop">
                <strong>All products</strong>
                <em>Full catalogue</em>
              </Link>
            </div>
          </div>
        )}
      </header>

      {drawer && (
        <div className="drawer" role="dialog" aria-modal="true" aria-label="Menu">
          <div className="drawer__head">
            <Wordmark />
            <button type="button" className="drawer__close" aria-label="Close menu" onClick={() => setDrawer(false)}>
              ×
            </button>
          </div>
          <ul className="drawer__list">
            {CATEGORIES.map((c) => (
              <li key={c.slug}>
                <Link to={`/shop/${c.slug}`}>{c.name}</Link>
              </li>
            ))}
            <li>
              <Link to="/shop">All products</Link>
            </li>
            <li>
              <Link to="/custom">Custom / OEM</Link>
            </li>
            <li>
              <Link to="/about">About</Link>
            </li>
            <li>
              <Link to="/blog">Sourcing notes</Link>
            </li>
            <li>
              <Link to="/inquiry">Inquiry</Link>
            </li>
          </ul>
          <div className="drawer__meta">
            <p>
              <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
            </p>
            <p>
              <a href={CONTACT.whatsappUrl}>WhatsApp {CONTACT.whatsappDisplay}</a>
            </p>
          </div>
        </div>
      )}

      <main id="main">
        <Outlet />
      </main>

      <footer className="footer">
        <div className="shell footer__grid">
          <div>
            <Wordmark />
            <p className="mt-1" style={{ maxWidth: '30ch', fontSize: '0.92rem' }}>
              Custom cosplay merchandise and costumes, manufactured to order for wholesale and OEM buyers.
            </p>
          </div>
          <div>
            <h4>Shop</h4>
            <ul>
              {CATEGORIES.map((c) => (
                <li key={c.slug}>
                  <Link to={`/shop/${c.slug}`}>{c.name}</Link>
                </li>
              ))}
              <li>
                <Link to="/shop">All products</Link>
              </li>
            </ul>
          </div>
          <div>
            <h4>Company</h4>
            <ul>
              <li>
                <Link to="/custom">Custom / OEM</Link>
              </li>
              <li>
                <Link to="/about">About us</Link>
              </li>
              <li>
                <Link to="/blog">Sourcing notes</Link>
              </li>
              <li>
                <Link to="/inquiry">Request a quote</Link>
              </li>
            </ul>
          </div>
          <div>
            <h4>Contact</h4>
            <ul>
              <li>
                <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
              </li>
              <li>
                <a href={CONTACT.whatsappUrl}>WhatsApp {CONTACT.whatsappDisplay}</a>
              </li>
            </ul>
          </div>
        </div>
        <div className="shell footer__base">
          <span>© {new Date().getFullYear()} Hongbo Cosplay. All rights reserved.</span>
          <span>Wholesale &amp; OEM · Worldwide shipping</span>
        </div>
      </footer>

      <a className="wa" href={CONTACT.whatsappUrl} aria-label={`WhatsApp ${CONTACT.whatsappDisplay}`}>
        <WhatsAppIcon />
        <span>WhatsApp</span>
      </a>
    </>
  );
}
