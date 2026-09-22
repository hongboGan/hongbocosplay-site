import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CONTACT, getProduct, shortTitle } from '../data/products.js';
import { usePageMeta } from '../lib/seo.js';
import { MailIcon, WhatsAppIcon } from '../components/icons.jsx';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default function Inquiry() {
  const [params] = useSearchParams();
  const wanted = params.get('product');
  const preselected = wanted ? getProduct(wanted) : null;

  usePageMeta();

  const [values, setValues] = useState({
    Name: '',
    Company: '',
    Email: '',
    Country: '',
    Product: preselected ? `${shortTitle(preselected, 90)} (ref ${preselected.id})` : '',
    Quantity: '',
    'Target date': '',
    Message: '',
  });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle'); // idle | sending | done | error
  const [notice, setNotice] = useState('');

  function set(key, v) {
    setValues((prev) => ({ ...prev, [key]: v }));
  }

  function validate() {
    const e = {};
    if (!values.Name.trim()) e.Name = 'Please tell us your name.';
    if (!values.Company.trim()) e.Company = 'Please add your company name.';
    if (!values.Email.trim()) e.Email = 'We need an email to reply to.';
    else if (!EMAIL_RE.test(values.Email.trim())) e.Email = 'That email address looks incomplete.';
    if (!values.Product.trim()) e.Product = 'Which product or category are you asking about?';
    if (!values.Message.trim()) e.Message = 'A short note about what you need helps us quote accurately.';
    return e;
  }

  async function onSubmit(ev) {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) {
      setStatus('idle');
      setNotice('');
      document.querySelector('[aria-invalid="true"]')?.focus();
      return;
    }

    setStatus('sending');
    setNotice('');
    try {
      const res = await fetch(`https://formsubmit.co/ajax/${CONTACT.email}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          ...values,
          _subject: `Website inquiry — ${values.Company || values.Name}`,
          _template: 'table',
          _captcha: 'false',
        }),
      });
      const data = await res.json().catch(() => null);
      // FormSubmit answers HTTP 200 even when it rejects the submission, so the
      // body's success flag — not the status code — decides what actually happened.
      // Trusting res.ok here would show "thank you" for an inquiry that never sent.
      if (!res.ok || !data || String(data.success) !== 'true') {
        throw new Error((data && data.message) || `Submission failed (${res.status})`);
      }
      setStatus('done');
    } catch (err) {
      setStatus('error');
      setNotice(String(err.message || err).slice(0, 140));
    }
  }

  if (status === 'done') {
    return (
      <section className="section">
        <div className="shell">
          <p className="eyebrow">Inquiry</p>
          <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)' }}>Thank you — your inquiry is with us.</h1>
          <p className="lede mt-1">
            We reply within one working day. If it is urgent, message us on WhatsApp and we will answer sooner.
          </p>
          <div className="hero__actions">
            <a className="btn btn--primary" href={CONTACT.whatsappUrl}>
              <WhatsAppIcon />
              WhatsApp {CONTACT.whatsappDisplay}
            </a>
            <Link className="btn btn--ghost" to="/shop">
              Back to the catalogue
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const invalid = (k) => (errors[k] ? 'true' : undefined);

  return (
    <section className="section">
      <div className="shell">
        <p className="eyebrow">Inquiry</p>
        <h1 style={{ fontSize: 'clamp(2rem, 4.4vw, 3.2rem)' }}>Request a quote</h1>
        <p className="lede mt-1">
          Tell us the item and the quantity. Quotes come back within one working day, by email or WhatsApp.
        </p>

        <div className="detail mt-3">
          <div className="panel">
            {status === 'error' && (
              <div className="notice notice--err">
                Your inquiry was not sent automatically. Please email{' '}
                <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a> or message us on WhatsApp{' '}
                <a href={CONTACT.whatsappUrl}>{CONTACT.whatsappDisplay}</a> — we will pick it up straight away.
                {notice && <span className="notice__detail">Technical detail: {notice}</span>}
              </div>
            )}

            <form onSubmit={onSubmit} noValidate>
              <div className="form__row">
                <div className="field">
                  <label htmlFor="f-name">
                    Your name <span className="req">*</span>
                  </label>
                  <input
                    id="f-name"
                    value={values.Name}
                    onChange={(e) => set('Name', e.target.value)}
                    aria-invalid={invalid('Name')}
                    autoComplete="name"
                  />
                  {errors.Name && <span className="field__error">{errors.Name}</span>}
                </div>
                <div className="field">
                  <label htmlFor="f-company">
                    Company <span className="req">*</span>
                  </label>
                  <input
                    id="f-company"
                    value={values.Company}
                    onChange={(e) => set('Company', e.target.value)}
                    aria-invalid={invalid('Company')}
                    autoComplete="organization"
                  />
                  {errors.Company && <span className="field__error">{errors.Company}</span>}
                </div>
              </div>

              <div className="form__row">
                <div className="field">
                  <label htmlFor="f-email">
                    Email <span className="req">*</span>
                  </label>
                  <input
                    id="f-email"
                    type="email"
                    value={values.Email}
                    onChange={(e) => set('Email', e.target.value)}
                    aria-invalid={invalid('Email')}
                    autoComplete="email"
                  />
                  {errors.Email && <span className="field__error">{errors.Email}</span>}
                </div>
                <div className="field">
                  <label htmlFor="f-country">Country</label>
                  <input
                    id="f-country"
                    value={values.Country}
                    onChange={(e) => set('Country', e.target.value)}
                    autoComplete="country-name"
                  />
                </div>
              </div>

              <div className="field">
                <label htmlFor="f-product">
                  Product or category <span className="req">*</span>
                </label>
                <input
                  id="f-product"
                  value={values.Product}
                  onChange={(e) => set('Product', e.target.value)}
                  aria-invalid={invalid('Product')}
                  placeholder="e.g. Latex head masks, 500 pcs"
                />
                {errors.Product && <span className="field__error">{errors.Product}</span>}
              </div>

              <div className="form__row">
                <div className="field">
                  <label htmlFor="f-qty">Quantity</label>
                  <input id="f-qty" value={values.Quantity} onChange={(e) => set('Quantity', e.target.value)} />
                </div>
                <div className="field">
                  <label htmlFor="f-date">Target date</label>
                  <input id="f-date" type="date" value={values['Target date']} onChange={(e) => set('Target date', e.target.value)} />
                </div>
              </div>

              <div className="field">
                <label htmlFor="f-message">
                  Message <span className="req">*</span>
                </label>
                <textarea
                  id="f-message"
                  value={values.Message}
                  onChange={(e) => set('Message', e.target.value)}
                  aria-invalid={invalid('Message')}
                  placeholder="Colourway, sizing, branding, packaging — anything that affects the price."
                />
                {errors.Message && <span className="field__error">{errors.Message}</span>}
              </div>

              <button className="btn btn--primary" type="submit" disabled={status === 'sending'}>
                {status === 'sending' ? 'Sending…' : 'Send inquiry'}
              </button>
              <p className="mt-1" style={{ fontSize: '0.82rem', color: 'var(--ink-faint)', marginBottom: 0 }}>
                We only use these details to answer your inquiry.
              </p>
            </form>
          </div>

          <div>
            <h2>Or reach us directly</h2>
            <div className="contact-ways">
              <a className="contact-way" href={`mailto:${CONTACT.email}`}>
                <MailIcon size={20} />
                <span>
                  <strong>{CONTACT.email}</strong>
                  <em>Email — replies within one working day</em>
                </span>
              </a>
              <a className="contact-way" href={CONTACT.whatsappUrl}>
                <WhatsAppIcon size={20} />
                <span>
                  <strong>{CONTACT.whatsappDisplay}</strong>
                  <em>WhatsApp — fastest for quick questions</em>
                </span>
              </a>
            </div>
            <p className="mt-2" style={{ fontSize: '0.92rem' }}>
              Sending a product code helps us quote faster — every product page has one. Or{' '}
              <Link to="/shop" style={{ color: 'var(--accent)' }}>
                browse the catalogue
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
