import React, { useState } from "react";

export function ContactSection() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "Media Licensing & Photography",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;

    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
      setFormData({ name: "", email: "", subject: "Media Licensing & Photography", message: "" });
      setTimeout(() => setSubmitted(false), 5000);
    }, 800);
  };

  const FAQS = [
    {
      q: "Can I license 4K footage and high-res photography for media projects?",
      a: "Yes! All media in our cloud archive is available for editorial, cinematic broadcast, and cultural exhibition licenses. Please submit a request specifying your project scope.",
    },
    {
      q: "How are uploaded media files stored and served?",
      a: "Our system is built on a pure cloud-object storage architecture (Supabase, S3, Cloudinary). Files are processed in the cloud, generating adaptive bitrate streams and high-speed WebP thumbnails without burdening local devices.",
    },
    {
      q: "When is the best time to photograph Stari Most and the Old Town?",
      a: "The golden hour (6:30 PM – 8:00 PM in summer) offers magnificent warm reflections over the white Tenelija stone and turquoise Neretva river. Dawn is ideal for quiet, crowd-free street photography.",
    },
    {
      q: "How can I join or submit footage to the Mostar Expedition Team?",
      a: "Accredited filmmakers, photographers, and local historians can request contributor access through the contact form or submit footage via the authorized Admin Media Dashboard.",
    },
  ];

  return (
    <section id="contact" className="contact-section-wrapper" aria-label="Contact and Inquiries">
      <div className="contact-container">
        {/* Header */}
        <div className="contact-header">
          <div className="contact-badge-pill">
            <span>📫 Get In Touch</span>
          </div>
          <h2 className="contact-main-title">Connect with Mostar Heritage</h2>
          <p className="contact-subtitle">
            Have an inquiry regarding 4K media licensing, travel photography collaboration, or cultural
            story submissions? Send our expedition team a message.
          </p>
        </div>

        {/* 2-Column Form & Details */}
        <div className="contact-grid">
          {/* Form */}
          <div className="contact-card form-card">
            <h3 className="form-card-title">Send a Direct Message</h3>
            <p className="form-card-sub">We usually respond within 24 hours.</p>

            {submitted && (
              <div className="contact-success-alert">
                <span>✓</span>
                <span>Thank you! Your message has been sent to the Mostar expedition coordinators.</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="contact-form">
              <div className="form-group-row">
                <div className="form-field">
                  <label htmlFor="contact-name">Your Full Name *</label>
                  <input
                    id="contact-name"
                    type="text"
                    required
                    placeholder="e.g. Elena Vance"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="contact-email">Email Address *</label>
                  <input
                    id="contact-email"
                    type="email"
                    required
                    placeholder="e.g. elena@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-field">
                <label htmlFor="contact-subject">Inquiry Topic</label>
                <select
                  id="contact-subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                >
                  <option value="Media Licensing & Photography">4K Media Licensing &amp; Photography</option>
                  <option value="Expedition Collaboration">Expedition &amp; Film Collaboration</option>
                  <option value="Heritage & Cultural Story">Heritage &amp; Cultural Story Submission</option>
                  <option value="Visitor Guide & Tour Information">Visitor Guide &amp; Tour Inquiries</option>
                  <option value="General Feedback">General Feedback &amp; Suggestions</option>
                </select>
              </div>

              <div className="form-field">
                <label htmlFor="contact-message">Your Message *</label>
                <textarea
                  id="contact-message"
                  required
                  rows={5}
                  placeholder="Tell us about your project, inquiry, or question..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                />
              </div>

              <button type="submit" className="contact-submit-btn" disabled={submitting}>
                {submitting ? (
                  <span>Sending Message...</span>
                ) : (
                  <>
                    <span>SEND MESSAGE</span>
                    <span>✉</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Details & Location Info */}
          <div className="contact-card info-card">
            <h3 className="info-card-title">Expedition Coordinates &amp; Hub</h3>

            <div className="contact-info-list">
              <div className="info-item">
                <span className="info-icon">📍</span>
                <div>
                  <h4>Primary Heritage Location</h4>
                  <p>Stari Most &amp; Kujundžiluk Bazaar, 88000 Mostar, Bosnia &amp; Herzegovina</p>
                  <span className="info-sub">GPS: 43.3373° N, 17.8150° E</span>
                </div>
              </div>

              <div className="info-item">
                <span className="info-icon">✉</span>
                <div>
                  <h4>Official Email</h4>
                  <p>expedition@mostar-heritage.org</p>
                  <span className="info-sub">Media inquiries: media@mostar-heritage.org</span>
                </div>
              </div>

              <div className="info-item">
                <span className="info-icon">☁️</span>
                <div>
                  <h4>Cloud Media Infrastructure</h4>
                  <p>Global Object Storage &amp; Adaptive 4K CDN</p>
                  <span className="info-sub">Zero-local footprint media pipeline</span>
                </div>
              </div>
            </div>

            {/* FAQs Accordion */}
            <div className="contact-faqs-section">
              <h4 className="faqs-heading">Frequently Asked Questions</h4>
              <div className="faq-accordion-list">
                {FAQS.map((faq, idx) => (
                  <div
                    key={idx}
                    className={`faq-item ${openFaq === idx ? "is-open" : ""}`}
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  >
                    <button type="button" className="faq-question">
                      <span>{faq.q}</span>
                      <span className="faq-toggle-arrow">{openFaq === idx ? "−" : "+"}</span>
                    </button>
                    {openFaq === idx && <p className="faq-answer">{faq.a}</p>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
