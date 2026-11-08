import React, { useState } from 'react';
import { validateContact } from '../contact.mjs';
import { Arrow } from './Brand.jsx';

export default function Contact() {
  const [values, setValues] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [touched, setTouched] = useState({});
  const [success, setSuccess] = useState(false);
  // Validate current values, so an invalid edit cannot clear a real error.
  const validation = validateContact(values);
  const errors = Object.fromEntries(
    Object.entries(validation).filter(([name]) => submitted || touched[name]),
  );
  function submit(event) {
    event.preventDefault();
    const next = validateContact(values);
    setSubmitted(true);
    setSuccess(false);
    const first = Object.keys(next)[0];
    if (first) {
      document.getElementById(first)?.focus();
      return;
    }
    setSuccess(true);
    setSubmitted(false);
    setTouched({});
    setValues({ name: '', email: '', message: '' });
  }
  function update(event) {
    const { name, value } = event.target;
    setValues((previous) => ({ ...previous, [name]: value }));
    setSuccess(false);
  }
  function blur(event) {
    const { name } = event.target;
    setTouched((previous) => ({ ...previous, [name]: true }));
  }
  return (
    <section
      id="iletisim"
      className="contact section wrap"
      aria-labelledby="contact-title"
      tabIndex={-1}
    >
      <div className="contact-copy">
        <p className="eyebrow">03 / BİR MERHABA</p>
        <h2 id="contact-title">
          Sohbete
          <br />
          <em>yerimiz var.</em>
        </h2>
        <p>
          Bir sorunuz, bir fikriniz ya da paylaşmak istediğiniz bir kahve hikâyeniz mi
          var?
        </p>
        <p>Biz buradayız. Söze siz başlayın.</p>
        <div className="contact-mark" aria-hidden="true">
          ✳
        </div>
      </div>
      <form
        onSubmit={submit}
        noValidate
        className="contact-form"
        aria-label="İletişim formu"
        aria-describedby="form-note"
      >
        <p id="form-note" className="form-note">
          Bu bir deneme projesidir. Form yalnızca deneyimi gösterir; mesajınız gönderilmez
          veya saklanmaz. Tüm alanlar zorunludur.
        </p>
        <div className="form-row">
          {[
            ['name', 'Adınız', 'text', 'Adınız Soyadınız', 'name'],
            ['email', 'E-posta adresiniz', 'email', 'ornek@eposta.com', 'email'],
          ].map(([name, label, type, placeholder, autocomplete]) => (
            <div className="field" key={name}>
              <label htmlFor={name}>
                {label} <span aria-hidden="true">*</span>
              </label>
              <input
                id={name}
                name={name}
                type={type}
                autoComplete={autocomplete}
                placeholder={placeholder}
                value={values[name]}
                onChange={update}
                onBlur={blur}
                required
                maxLength={name === 'name' ? 100 : 254}
                aria-invalid={!!errors[name]}
                aria-describedby={errors[name] ? `${name}-error` : undefined}
              />
              {errors[name] && (
                <p className="field-error" id={`${name}-error`}>
                  {errors[name]}
                </p>
              )}
            </div>
          ))}
        </div>
        <div className="field">
          <label htmlFor="message">
            Mesajınız <span aria-hidden="true">*</span>
          </label>
          <textarea
            id="message"
            name="message"
            placeholder="Hikâyenizi duymak isteriz…"
            rows="4"
            value={values.message}
            onChange={update}
            onBlur={blur}
            required
            maxLength="3000"
            aria-invalid={!!errors.message}
            aria-describedby={errors.message ? 'message-error' : undefined}
          />
          {errors.message && (
            <p className="field-error" id="message-error">
              {errors.message}
            </p>
          )}
        </div>
        <div className="form-actions">
          <span>Küçük bir merhaba, güzel bir başlangıç.</span>
          <button className="button primary" type="submit">
            Mesajı Gönder <Arrow diagonal />
          </button>
        </div>
        <div className="status" role="status" aria-live="polite" aria-atomic="true">
          {success && (
            <p>
              <span aria-hidden="true">✓</span> Teşekkürler! Form başarıyla tamamlandı. Bu
              demo sürümde mesajınız gönderilmez veya saklanmaz.
            </p>
          )}
        </div>
      </form>
    </section>
  );
}
