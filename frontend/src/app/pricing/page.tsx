'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Breadcrumbs from '@/components/Breadcrumbs';
import { useAuth } from '@/context/AuthContext';
import { fetchPlans, PlanApiResponse } from '@/lib/api';
import { PLANS_LIST, formatKES } from '@/lib/plans';

// ─── Plan Card ─────────────────────────────────────────────────────────────
function PlanCard({ plan, isCurrent }: { plan: PlanApiResponse; isCurrent: boolean }) {
  const isPopular = plan.is_popular;
  const isFree = plan.price_kes === 0;

  return (
    <div
      style={{
        background: isPopular
          ? 'linear-gradient(135deg, rgba(30,58,138,0.50) 0%, rgba(17,24,39,0.98) 100%)'
          : 'var(--bg-card)',
        border: isPopular ? '2px solid #3b82f6' : '1px solid var(--border-color)',
        borderRadius: '18px',
        padding: '1.75rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        boxShadow: isPopular ? '0 16px 40px rgba(59,130,246,0.22)' : 'none',
        transition: 'transform 0.15s',
      }}
    >
      {/* Badge */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.85rem' }}>
        <div>
          <div style={{
            fontSize: '0.78rem',
            fontWeight: 900,
            color: isPopular ? '#60a5fa' : 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            marginBottom: '0.25rem',
          }}>
            {plan.name}
          </div>
          {plan.savings_label && (
            <div style={{ fontSize: '0.72rem', color: '#4ade80', fontWeight: 700 }}>
              {plan.savings_label}
            </div>
          )}
        </div>
        <span style={{
          background: isFree ? 'var(--bg-elevated)' : isPopular ? '#3b82f6' : 'rgba(34,197,94,0.2)',
          color: isFree ? 'var(--text-muted)' : isPopular ? '#ffffff' : '#4ade80',
          border: isFree ? '1px solid var(--border-color)' : isPopular ? 'none' : '1px solid rgba(34,197,94,0.35)',
          padding: '0.2rem 0.65rem',
          borderRadius: '20px',
          fontSize: '0.7rem',
          fontWeight: 900,
          whiteSpace: 'nowrap',
        }}>
          {plan.badge}
        </span>
      </div>

      {/* Price */}
      <div style={{ marginBottom: '0.5rem' }}>
        <span style={{ fontSize: '2.2rem', fontWeight: 900, color: 'var(--text-primary)' }}>
          {isFree ? 'Free' : formatKES(plan.price_kes)}
        </span>
        {!isFree && plan.duration_days && (
          <span style={{ fontSize: '0.85rem', color: isPopular ? '#93c5fd' : 'var(--text-muted)', fontWeight: 400 }}>
            {plan.duration_days === 30 ? ' / month' : plan.duration_days === 90 ? ' / 3 months' : ' / year'}
          </span>
        )}
        {isFree && (
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 400 }}> forever</span>
        )}
      </div>

      {/* Description */}
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.84rem', lineHeight: 1.55, margin: '0 0 1.25rem 0' }}>
        {plan.description}
      </p>

      {/* Feature list */}
      <ul style={{
        listStyle: 'none',
        padding: 0,
        margin: '0 0 1.5rem 0',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.6rem',
        fontSize: '0.84rem',
        color: isPopular ? 'var(--text-primary)' : 'var(--text-secondary)',
        flex: 1,
      }}>
        {plan.features.map((f, i) => (
          <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
            <span style={{ color: isFree ? '#4ade80' : '#38bdf8', fontWeight: 900, lineHeight: 1.4, flexShrink: 0 }}>✓</span>
            {f}
          </li>
        ))}
      </ul>

      {/* CTA Button */}
      {isFree ? (
        <button
          disabled
          style={{
            width: '100%',
            padding: '0.75rem',
            borderRadius: '10px',
            border: '1px solid var(--border-color)',
            background: 'var(--bg-elevated)',
            color: 'var(--text-muted)',
            fontWeight: 800,
            fontSize: '0.87rem',
            cursor: 'default',
          }}
        >
          {isCurrent ? '✓ Your Current Plan' : 'Included by Default'}
        </button>
      ) : (
        <div>
          {/* Phase 1: Payment coming soon */}
          <div style={{
            width: '100%',
            padding: '0.8rem',
            borderRadius: '10px',
            background: 'rgba(59,130,246,0.12)',
            border: '1px solid rgba(59,130,246,0.35)',
            color: '#93c5fd',
            fontWeight: 800,
            fontSize: '0.87rem',
            textAlign: 'center',
            cursor: 'not-allowed',
          }}>
            🔒 Flutterwave Payment — Coming Soon
          </div>
          <p style={{
            fontSize: '0.72rem',
            color: 'var(--text-muted)',
            textAlign: 'center',
            marginTop: '0.5rem',
            marginBottom: 0,
            lineHeight: 1.4,
          }}>
            M-Pesa & card payments via Flutterwave launching soon. Join the waitlist below.
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────
export default function PricingPage() {
  const { user } = useAuth();
  const [plans, setPlans] = useState<PlanApiResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlans()
      .then((res) => setPlans(res.plans))
      .catch(() => {
        // Fallback to local config if API is unavailable
        setPlans(PLANS_LIST as unknown as PlanApiResponse[]);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container" style={{ padding: '1.5rem 1rem 5rem 1rem', minHeight: '80vh' }}>

      <Breadcrumbs
        items={[
          { name: 'Home', url: '/' },
          { name: 'VIP Pro Pricing Plans' },
        ]}
      />

      {/* Hero Header */}
      <div style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto 2.5rem auto' }}>
        <span style={{
          background: 'rgba(59,130,246,0.15)',
          color: '#93c5fd',
          border: '1px solid rgba(59,130,246,0.3)',
          padding: '0.25rem 0.85rem',
          borderRadius: '20px',
          fontSize: '0.78rem',
          fontWeight: 800,
          textTransform: 'uppercase' as const,
          letterSpacing: '0.05em',
          display: 'inline-block',
          marginBottom: '0.85rem',
        }}>
          💎 TRANSPARENT PRICING · KES
        </span>
        <h1 style={{
          fontSize: 'clamp(1.7rem, 5vw, 2.6rem)',
          fontWeight: 900,
          color: 'var(--text-primary)',
          margin: '0 0 0.6rem 0',
          lineHeight: 1.2,
        }}>
          Upgrade to VIP Pro Analytics
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.97rem', lineHeight: 1.6, margin: 0 }}>
          Access full Poisson score probability heatmaps, Expected Value (EV %) models,
          and an ad-free premium experience. Pay in KES via M-Pesa or card — coming soon.
        </p>

        {/* Coming Soon Notice */}
        <div style={{
          marginTop: '1.25rem',
          padding: '0.75rem 1.25rem',
          background: 'rgba(234,179,8,0.12)',
          border: '1px solid rgba(234,179,8,0.3)',
          borderRadius: '10px',
          fontSize: '0.84rem',
          color: '#fbbf24',
          fontWeight: 700,
          display: 'inline-block',
        }}>
          🚧 Flutterwave payment integration launching soon — plans & prices are final
        </div>
      </div>

      {/* Plan Cards Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '3rem 0' }}>
          Loading plans…
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))',
          gap: '1.5rem',
          maxWidth: '1100px',
          margin: '0 auto 3rem auto',
        }}>
          {plans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              isCurrent={!user && plan.price_kes === 0}
            />
          ))}
        </div>
      )}

      {/* FAQ / Trust Section */}
      <div style={{
        maxWidth: '820px',
        margin: '0 auto 2.5rem auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1rem',
      }}>
        {[
          { icon: '🔒', title: 'Secure Payments', desc: 'All payments processed by Flutterwave — PCI DSS compliant. We never store card details.' },
          { icon: '📱', title: 'M-Pesa & Cards', desc: 'Pay via M-Pesa, Visa, or Mastercard. KES pricing — no conversion fees.' },
          { icon: '⚽', title: 'Model Independence', desc: 'Our AI predictions are never altered for commercial reasons. Pure Elo + Poisson.' },
          { icon: '🔄', title: 'Cancel Anytime', desc: 'No lock-in contracts. Cancel your subscription at any time.' },
        ].map(({ icon, title, desc }) => (
          <div key={title} style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            padding: '1rem',
            fontSize: '0.84rem',
          }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.4rem' }}>{icon}</div>
            <div style={{ fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.3rem' }}>{title}</div>
            <div style={{ color: 'var(--text-muted)', lineHeight: 1.5 }}>{desc}</div>
          </div>
        ))}
      </div>

      {/* Waitlist CTA */}
      <div style={{
        maxWidth: '540px',
        margin: '0 auto 2.5rem auto',
        textAlign: 'center',
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: '16px',
        padding: '1.5rem',
      }}>
        <div style={{ fontSize: '1.5rem', marginBottom: '0.4rem' }}>🔔</div>
        <h3 style={{ margin: '0 0 0.4rem 0', fontSize: '1.1rem', fontWeight: 900, color: 'var(--text-primary)' }}>
          Get Notified When Payments Go Live
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.86rem', lineHeight: 1.5, margin: '0 0 1rem 0' }}>
          Already have an account? You&apos;ll be notified automatically. No account yet?
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          {!user && (
            <Link
              href="/register"
              className="btn btn-primary"
              style={{ padding: '0.65rem 1.25rem', fontSize: '0.88rem', fontWeight: 800 }}
            >
              Create Free Account →
            </Link>
          )}
          <Link
            href="/"
            style={{
              padding: '0.65rem 1.25rem',
              fontSize: '0.88rem',
              fontWeight: 800,
              color: 'var(--text-secondary)',
              textDecoration: 'none',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              background: 'var(--bg-elevated)',
            }}
          >
            Browse Free Predictions
          </Link>
        </div>
      </div>

      {/* Model Independence Disclaimer */}
      <div style={{
        maxWidth: '820px',
        margin: '0 auto',
        padding: '1rem 1.25rem',
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border-color)',
        borderRadius: '12px',
        fontSize: '0.77rem',
        color: 'var(--text-muted)',
        lineHeight: 1.5,
        textAlign: 'center',
      }}>
        🛡️ <strong>Model Independence Guarantee:</strong> FootballPredict&apos;s statistical prediction
        engine operates completely independently from subscription tiers, advertising, and sportsbook
        partnerships. Model probabilities are calculated purely on objective mathematical algorithms
        (Elo + Poisson distributions) and are never altered for commercial reasons.
      </div>

    </div>
  );
}
