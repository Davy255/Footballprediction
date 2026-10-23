'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { siteConfig } from '@/config/site';

export default function ContactClient() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState('Data Discrepancy');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [copied, setCopied] = useState(false);

  const fullSubject = `[FootballPredict ${category}] ${subject || 'Inquiry from ' + (name || 'User')}`;
  const fullBody = `Name: ${name || 'N/A'}\nEmail: ${email || 'N/A'}\nCategory: ${category}\n\nMessage:\n${message}`;

  const mailtoUrl = `mailto:${siteConfig.contactEmail}?subject=${encodeURIComponent(fullSubject)}&body=${encodeURIComponent(fullBody)}`;
  const whatsappUrl = `https://wa.me/254742669974?text=${encodeURIComponent(`*${fullSubject}*\n\n${fullBody}`)}`;

  const handleCopy = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(`${fullSubject}\n\n${fullBody}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
      
      {/* Left Column: Direct Contact Info & Publisher Details */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* Publisher Card */}
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            padding: '1.75rem',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: 0, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>🏢</span> Publisher Information
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.90rem', lineHeight: 1.6, margin: '0 0 1.25rem 0' }}>
            FootballPredict is an independent digital football analytics and predictive forecasting platform published and maintained by <strong>Vertex Digital Services</strong>.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Email */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0 }}>
                ✉️
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Direct Email
                </div>
                <a
                  href={`mailto:${siteConfig.contactEmail}`}
                  style={{
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    color: '#60a5fa',
                    textDecoration: 'none',
                    display: 'inline-block',
                    marginTop: '0.2rem',
                    wordBreak: 'break-all',
                  }}
                >
                  {siteConfig.contactEmail}
                </a>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                  Best for data corrections, partnerships, and technical inquiries
                </div>
              </div>
            </div>

            {/* WhatsApp & Phone */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0 }}>
                💬
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Telephone &amp; WhatsApp
                </div>
                <a
                  href={siteConfig.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    color: '#4ade80',
                    textDecoration: 'none',
                    display: 'inline-block',
                    marginTop: '0.2rem',
                  }}
                >
                  {siteConfig.contactPhone}
                </a>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                  Quick mobile messaging via WhatsApp Messenger
                </div>
              </div>
            </div>

            {/* Response Time */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(168,85,247,0.12)', border: '1px solid rgba(168,85,247,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0 }}>
                ⏱️
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Response Expectations
                </div>
                <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '0.2rem' }}>
                  Usually within 24–48 business hours
                </div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                  Monday through Friday (EAT / UTC+3)
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* What to Contact Us For */}
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            padding: '1.75rem',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: 0, marginBottom: '0.75rem' }}>
            What You Can Report to Us
          </h2>
          <ul style={{ paddingLeft: '1.25rem', color: 'var(--text-secondary)', fontSize: '0.86rem', lineHeight: 1.6, margin: 0 }}>
            <li style={{ marginBottom: '0.4rem' }}>
              <strong>Incorrect Match or Team Data:</strong> If you spot an inaccurate kickoff time, team name misspelling, or wrong historical scoreline.
            </li>
            <li style={{ marginBottom: '0.4rem' }}>
              <strong>Technical Problems:</strong> Browser rendering bugs, broken navigation links, or issues accessing match centers.
            </li>
            <li style={{ marginBottom: '0.4rem' }}>
              <strong>Editorial Corrections:</strong> Feedback or mathematical corrections on our analytical articles and methodology guides.
            </li>
            <li>
              <strong>General Feedback:</strong> Feature suggestions and feedback to help improve the platform.
            </li>
          </ul>
        </div>
      </div>

      {/* Right Column: Interactive Message Composer */}
      <div
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '16px',
          padding: '1.75rem',
          boxShadow: 'var(--shadow-card)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 0.35rem 0' }}>
            Send a Message or Report
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.86rem', margin: 0, lineHeight: 1.5 }}>
            Fill in your details below and choose how you would like to send your inquiry.
          </p>
        </div>

        {/* Category Field */}
        <div>
          <label style={{ display: 'block', fontSize: '0.80rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
            Inquiry Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={{
              width: '100%',
              padding: '0.65rem 0.85rem',
              borderRadius: '10px',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-elevated)',
              color: 'var(--text-primary)',
              fontSize: '0.88rem',
              fontWeight: 600,
            }}
          >
            <option value="Data Discrepancy">Incorrect Match, Team, or Result Data</option>
            <option value="Technical Bug">Technical Problem or Rendering Bug</option>
            <option value="Editorial Correction">Editorial Feedback on Research Articles</option>
            <option value="General Inquiry">General Question or Feature Suggestion</option>
          </select>
        </div>

        {/* Sender Name */}
        <div>
          <label style={{ display: 'block', fontSize: '0.80rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
            Your Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Alex Morgan"
            style={{
              width: '100%',
              padding: '0.65rem 0.85rem',
              borderRadius: '10px',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-elevated)',
              color: 'var(--text-primary)',
              fontSize: '0.88rem',
            }}
          />
        </div>

        {/* Sender Email */}
        <div>
          <label style={{ display: 'block', fontSize: '0.80rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
            Your Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="e.g. alex@example.com"
            style={{
              width: '100%',
              padding: '0.65rem 0.85rem',
              borderRadius: '10px',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-elevated)',
              color: 'var(--text-primary)',
              fontSize: '0.88rem',
            }}
          />
        </div>

        {/* Subject */}
        <div>
          <label style={{ display: 'block', fontSize: '0.80rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
            Subject / Fixture Reference
          </label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="e.g. Premier League: Arsenal vs Chelsea match time"
            style={{
              width: '100%',
              padding: '0.65rem 0.85rem',
              borderRadius: '10px',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-elevated)',
              color: 'var(--text-primary)',
              fontSize: '0.88rem',
            }}
          />
        </div>

        {/* Message */}
        <div>
          <label style={{ display: 'block', fontSize: '0.80rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
            Message Details
          </label>
          <textarea
            rows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Please provide details, links, or specific match fixtures so we can investigate and correct information promptly..."
            style={{
              width: '100%',
              padding: '0.65rem 0.85rem',
              borderRadius: '10px',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-elevated)',
              color: 'var(--text-primary)',
              fontSize: '0.88rem',
              fontFamily: 'inherit',
              lineHeight: 1.5,
              resize: 'vertical',
            }}
          />
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginTop: '0.5rem' }}>
          <a
            href={mailtoUrl}
            className="btn btn-primary"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '0.7rem 1.25rem',
              borderRadius: '10px',
              fontWeight: 800,
              fontSize: '0.90rem',
              textDecoration: 'none',
              textAlign: 'center',
            }}
          >
            <span>✉️</span>
            <span>Send Message via Email Client</span>
          </a>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '0.7rem 1.25rem',
              borderRadius: '10px',
              fontWeight: 800,
              fontSize: '0.90rem',
              textDecoration: 'none',
              background: 'rgba(34,197,94,0.15)',
              border: '1px solid rgba(34,197,94,0.3)',
              color: '#4ade80',
              textAlign: 'center',
            }}
          >
            <span>💬</span>
            <span>Send Message via WhatsApp</span>
          </a>

          <button
            type="button"
            onClick={handleCopy}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '0.6rem 1.25rem',
              borderRadius: '10px',
              fontWeight: 700,
              fontSize: '0.82rem',
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
            }}
          >
            <span>📋</span>
            <span>{copied ? '✓ Message Copied to Clipboard!' : 'Copy Formatted Text to Clipboard'}</span>
          </button>
        </div>

        <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', margin: 0, textAlign: 'center', lineHeight: 1.5 }}>
          Your privacy is protected. Contact messages are handled in accordance with our{' '}
          <Link href="/privacy" style={{ color: '#60a5fa', textDecoration: 'underline' }}>Privacy Policy</Link>.
        </p>
      </div>

    </div>
  );
}
