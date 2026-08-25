'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Breadcrumbs from '@/components/Breadcrumbs';
import { useAuth } from '@/context/AuthContext';
import { fetchApi } from '@/lib/api';

export default function PricingPage() {
  const router = useRouter();
  const { user, refreshUser } = useAuth();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [upgrading, setUpgrading] = useState(false);
  const [upgradeSuccess, setUpgradeSuccess] = useState(false);

  const handleUpgrade = async (planId: string) => {
    if (!user) {
      router.push('/login?redirect=/pricing');
      return;
    }

    setUpgrading(true);
    try {
      await fetchApi('/api/monetization/checkout', {
        method: 'POST',
        body: JSON.stringify({ plan_id: planId }),
      });
      await refreshUser();
      setUpgradeSuccess(true);
    } catch (err) {
      console.error('Upgrade failed:', err);
    } finally {
      setUpgrading(false);
    }
  };

  return (
    <div className="container" style={{ padding: '1.5rem 1rem 4rem 1rem', minHeight: '80vh' }}>
      
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { name: 'Home', url: '/' },
          { name: 'VIP Pro Pricing Plans' },
        ]}
      />

      {/* Hero Header */}
      <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 2.5rem auto' }}>
        <span style={{
          background: 'rgba(59,130,246,0.15)',
          color: '#93c5fd',
          border: '1px solid rgba(59,130,246,0.3)',
          padding: '0.25rem 0.85rem',
          borderRadius: '20px',
          fontSize: '0.78rem',
          fontWeight: 800,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}>
          💎 TRANSPARENT PRICING
        </span>
        <h1 style={{ fontSize: 'clamp(1.8rem, 5vw, 2.75rem)', fontWeight: 900, color: '#f8fafc', margin: '0.75rem 0 0.5rem 0', lineHeight: 1.2 }}>
          Upgrade to VIP Pro Match Analytics
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '1rem', lineHeight: 1.6, margin: 0 }}>
          Take your football analysis to the next level. Access full Poisson score probability heatmaps, mathematical Expected Value (EV %) models, and an ad-free experience.
        </p>

        {/* Billing Toggle */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '30px',
          padding: '0.3rem',
          marginTop: '1.75rem',
        }}>
          <button
            onClick={() => setBillingCycle('monthly')}
            style={{
              background: billingCycle === 'monthly' ? '#3b82f6' : 'transparent',
              color: '#ffffff',
              border: 'none',
              borderRadius: '20px',
              padding: '0.45rem 1.25rem',
              fontSize: '0.84rem',
              fontWeight: 800,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            Monthly Billing
          </button>
          <button
            onClick={() => setBillingCycle('yearly')}
            style={{
              background: billingCycle === 'yearly' ? '#3b82f6' : 'transparent',
              color: '#ffffff',
              border: 'none',
              borderRadius: '20px',
              padding: '0.45rem 1.25rem',
              fontSize: '0.84rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              transition: 'all 0.2s',
            }}
          >
            Annual Billing
            <span style={{ background: '#22c55e', color: '#052e16', fontSize: '0.68rem', fontWeight: 900, padding: '0.1rem 0.4rem', borderRadius: '10px' }}>
              SAVE 33%
            </span>
          </button>
        </div>
      </div>

      {upgradeSuccess && (
        <div style={{
          maxWidth: '680px',
          margin: '0 auto 2rem auto',
          background: 'rgba(34,197,94,0.15)',
          border: '1px solid rgba(34,197,94,0.35)',
          borderRadius: '12px',
          padding: '1rem 1.5rem',
          textAlign: 'center',
          color: '#86efac',
          fontWeight: 800,
        }}>
          🎉 Congratulations! Your account has been upgraded to VIP Pro Access!
        </div>
      )}

      {/* Pricing Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '1.75rem',
        maxWidth: '1000px',
        margin: '0 auto 3.5rem auto',
      }}>
        
        {/* Tier 1: Free */}
        <div style={{
          background: '#111827',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '18px',
          padding: '2rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>
                Standard Access
              </span>
              <span style={{ background: 'rgba(255,255,255,0.06)', color: '#cbd5e1', padding: '0.15rem 0.5rem', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 800 }}>
                FREE
              </span>
            </div>
            <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#f8fafc', marginBottom: '0.4rem' }}>
              $0 <span style={{ fontSize: '0.90rem', color: '#94a3b8', fontWeight: 400 }}>/ forever</span>
            </div>
            <p style={{ color: '#94a3b8', fontSize: '0.86rem', lineHeight: 1.5, margin: '0 0 1.5rem 0' }}>
              Essential match forecasts, probability metrics, and community participation for all football fans.
            </p>

            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem 0', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.86rem', color: '#cbd5e1' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ color: '#4ade80', fontWeight: 900 }}>✓</span> Full 1X2 Win Probabilities
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ color: '#4ade80', fontWeight: 900 }}>✓</span> Projected Exact Scorelines
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ color: '#4ade80', fontWeight: 900 }}>✓</span> Live Match Center &amp; Alerts
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ color: '#4ade80', fontWeight: 900 }}>✓</span> Historical Model Accuracy Audit
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ color: '#4ade80', fontWeight: 900 }}>✓</span> Community Leaderboard
              </li>
            </ul>
          </div>

          <button
            disabled={true}
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: '10px',
              border: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(255,255,255,0.03)',
              color: '#94a3b8',
              fontWeight: 800,
              fontSize: '0.88rem',
            }}
          >
            Included by Default
          </button>
        </div>

        {/* Tier 2: VIP Pro */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(30,58,138,0.45) 0%, rgba(17,24,39,0.98) 100%)',
          border: '2px solid #3b82f6',
          borderRadius: '18px',
          padding: '2rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
          boxShadow: '0 20px 40px rgba(59,130,246,0.25)',
        }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 900, color: '#60a5fa', textTransform: 'uppercase' }}>
                VIP Pro Analytics
              </span>
              <span style={{ background: '#3b82f6', color: '#ffffff', padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 900 }}>
                {billingCycle === 'yearly' ? 'BEST VALUE' : 'MOST POPULAR'}
              </span>
            </div>

            <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#f8fafc', marginBottom: '0.4rem' }}>
              {billingCycle === 'yearly' ? '$39.99' : '$4.99'}
              <span style={{ fontSize: '0.90rem', color: '#93c5fd', fontWeight: 400 }}>
                {billingCycle === 'yearly' ? ' / year ($3.33/mo)' : ' / month'}
              </span>
            </div>

            <p style={{ color: '#cbd5e1', fontSize: '0.86rem', lineHeight: 1.5, margin: '0 0 1.5rem 0' }}>
              Designed for football analysts seeking quantitative model edge insights and in-depth matrix heatmaps.
            </p>

            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem 0', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.86rem', color: '#f8fafc' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ color: '#38bdf8', fontWeight: 900 }}>✓</span> Potential Model Edge &amp; Expected Value (EV %)
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ color: '#38bdf8', fontWeight: 900 }}>✓</span> Full 7x7 Poisson Score Probability Heatmap
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ color: '#38bdf8', fontWeight: 900 }}>✓</span> High-Confidence Match Alert Feeds
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ color: '#38bdf8', fontWeight: 900 }}>✓</span> 100% Ad-Free Clean UI
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ color: '#38bdf8', fontWeight: 900 }}>✓</span> Historical Match Data CSV Export
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ color: '#38bdf8', fontWeight: 900 }}>✓</span> VIP Supporter Badge on Leaderboard
              </li>
            </ul>
          </div>

          <button
            onClick={() => handleUpgrade(billingCycle === 'yearly' ? 'pro_yearly' : 'pro_monthly')}
            disabled={upgrading}
            className="btn btn-primary"
            style={{
              width: '100%',
              padding: '0.85rem',
              borderRadius: '10px',
              fontWeight: 900,
              fontSize: '0.92rem',
            }}
          >
            {upgrading ? 'Activating VIP Pro...' : `Upgrade to VIP Pro (${billingCycle === 'yearly' ? '$39.99/yr' : '$4.99/mo'}) →`}
          </button>
        </div>

      </div>

      {/* Responsible Model Independence Disclaimer */}
      <div style={{
        maxWidth: '820px',
        margin: '0 auto',
        padding: '1.25rem',
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '12px',
        fontSize: '0.78rem',
        color: '#94a3b8',
        lineHeight: 1.5,
        textAlign: 'center',
      }}>
        🛡️ <strong>Model Independence Guarantee:</strong> FootballPredict&apos;s statistical prediction engine operates completely independently from subscription tiers, advertising, and sportsbook partnerships. Model probabilities are calculated purely on objective mathematical algorithms (Elo + Poisson distributions) and are never altered for commercial reasons.
      </div>

    </div>
  );
}
