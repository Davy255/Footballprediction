'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { fetchUserDashboard, updateNotificationPreferences } from '@/lib/api';
import { Match, League, Prediction } from '@/lib/types';
import { getMatchPredictionUrl, getTeamUrl, getLeagueUrl } from '@/lib/slugs';
import Breadcrumbs from '@/components/Breadcrumbs';

interface DashboardData {
  user: any;
  followed_teams: Array<{ id: number; name: string; short_name: string; crest: string; elo_rating: number; next_match?: Match | null }>;
  followed_leagues: League[];
  saved_matches: Match[];
  recent_predictions: Prediction[];
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading, logout, toggleFavoriteTeam, toggleFollowedLeague, toggleSavedPrediction } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'teams' | 'saved' | 'leagues' | 'settings'>('teams');
  const [notifs, setNotifs] = useState({
    match_reminders: true,
    prediction_alerts: true,
    live_alerts: true,
    final_results: true,
    favorite_team_alerts: true,
  });
  const [savingNotifs, setSavingNotifs] = useState(false);
  const [savedNotifMsg, setSavedNotifMsg] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/dashboard');
      return;
    }

    if (user) {
      fetchUserDashboard()
        .then((res) => {
          setData(res);
        })
        .catch((err) => console.error('Failed to load dashboard:', err))
        .finally(() => setLoading(false));
    }
  }, [user, authLoading, router]);

  const handleSaveNotifs = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingNotifs(true);
    try {
      await updateNotificationPreferences(notifs);
      setSavedNotifMsg(true);
      setTimeout(() => setSavedNotifMsg(false), 3000);
    } catch (err) {
      console.error('Failed to save notification preferences', err);
    } finally {
      setSavingNotifs(false);
    }
  };

  if (authLoading || (loading && user)) {
    return (
      <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>⏳</div>
        <p style={{ fontWeight: 700 }}>Loading your personalized match hub...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="container" style={{ padding: '1.5rem 1rem 3.5rem 1rem', minHeight: '80vh' }}>
      
      {/* Breadcrumb Navigation */}
      <Breadcrumbs
        items={[
          { name: 'Home', url: '/' },
          { name: 'Personal Dashboard' },
        ]}
      />

      {/* User Hero Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(30,58,138,0.35) 0%, rgba(17,24,39,0.95) 100%)',
        border: '1px solid rgba(59,130,246,0.25)',
        borderRadius: '16px',
        padding: '1.75rem 1.5rem',
        marginBottom: '2rem',
        boxShadow: '0 16px 36px rgba(0,0,0,0.4)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1.25rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.8rem',
            fontWeight: 900,
            color: '#ffffff',
            boxShadow: '0 4px 14px rgba(59,130,246,0.4)',
          }}>
            {user.username.charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h1 style={{ fontSize: 'clamp(1.3rem, 4vw, 1.75rem)', fontWeight: 900, color: '#f8fafc', margin: 0 }}>
                Welcome back, {user.username}! 👋
              </h1>
              {user.is_admin && (
                <span style={{ background: 'rgba(234,179,8,0.2)', color: '#fde047', border: '1px solid rgba(234,179,8,0.3)', padding: '0.1rem 0.45rem', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 800 }}>
                  Admin
                </span>
              )}
            </div>
            <p style={{ margin: '0.2rem 0 0 0', color: '#94a3b8', fontSize: '0.82rem' }}>
              {user.email} • Member since {new Date(user.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* User Quick Stats */}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '0.6rem 1rem', textAlign: 'center' }}>
            <div style={{ fontSize: '0.74rem', color: '#94a3b8', fontWeight: 700 }}>Total Points</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#4ade80' }}>{user.total_points || 0}</div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '0.6rem 1rem', textAlign: 'center' }}>
            <div style={{ fontSize: '0.74rem', color: '#94a3b8', fontWeight: 700 }}>Accuracy</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#38bdf8' }}>{user.accuracy ? `${user.accuracy}%` : '0%'}</div>
          </div>
          <button
            onClick={logout}
            className="btn btn-secondary btn-sm"
            style={{ alignSelf: 'center', padding: '0.5rem 0.9rem', borderRadius: '8px', fontSize: '0.80rem', fontWeight: 700 }}
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: '0.6rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.8rem', marginBottom: '1.75rem', overflowX: 'auto' }}>
        {[
          { key: 'teams', label: `❤️ My Teams (${data?.followed_teams?.length || 0})` },
          { key: 'saved', label: `🔖 Bookmarked Predictions (${data?.saved_matches?.length || 0})` },
          { key: 'leagues', label: `⭐ Followed Leagues (${data?.followed_leagues?.length || 0})` },
          { key: 'settings', label: '🔔 Notification Preferences' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            style={{
              background: activeTab === tab.key ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.03)',
              border: activeTab === tab.key ? '1px solid rgba(59,130,246,0.4)' : '1px solid rgba(255,255,255,0.06)',
              color: activeTab === tab.key ? '#93c5fd' : '#cbd5e1',
              padding: '0.55rem 1rem',
              borderRadius: '10px',
              fontSize: '0.84rem',
              fontWeight: 800,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: Followed Teams */}
      {activeTab === 'teams' && (
        <div>
          {(!data?.followed_teams || data.followed_teams.length === 0) ? (
            <div className="glass-panel" style={{ padding: '3.5rem 1.5rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>⚽</div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
                You haven&apos;t followed any teams yet
              </h3>
              <p style={{ fontSize: '0.86rem', maxWidth: '480px', margin: '0 auto 1.5rem auto' }}>
                Follow your favorite clubs (Arsenal, Real Madrid, Bayern Munich, etc.) to receive tailored fixture schedules and match predictions directly on your dashboard.
              </p>
              <Link href="/football-predictions-today" className="btn btn-primary" style={{ padding: '0.55rem 1.3rem', borderRadius: '10px', fontWeight: 700 }}>
                Explore Today&apos;s Predictions
              </Link>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
              {data.followed_teams.map((t) => (
                <div
                  key={t.id}
                  style={{
                    background: '#111827',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '14px',
                    padding: '1.25rem',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      {t.crest && (
                        <Image src={t.crest} alt={t.name} width={36} height={36} style={{ objectFit: 'contain' }} />
                      )}
                      <div>
                        <Link href={getTeamUrl(t.name)} style={{ color: '#f8fafc', fontWeight: 800, fontSize: '0.95rem', textDecoration: 'none' }}>
                          {t.name}
                        </Link>
                        <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
                          Elo Rating: {Math.round(t.elo_rating || 1500)} pts
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={async () => {
                        await toggleFavoriteTeam(t.id);
                        setData((prev) => prev ? ({
                          ...prev,
                          followed_teams: prev.followed_teams.filter((item) => item.id !== t.id),
                        }) : null);
                      }}
                      style={{
                        background: 'rgba(239,68,68,0.1)',
                        border: '1px solid rgba(239,68,68,0.25)',
                        color: '#f87171',
                        padding: '0.3rem 0.6rem',
                        borderRadius: '6px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      ❤️ Following
                    </button>
                  </div>

                  {/* Next Upcoming Match Banner */}
                  {t.next_match ? (
                    <div style={{
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid rgba(255,255,255,0.06)',
                      borderRadius: '10px',
                      padding: '0.85rem',
                    }}>
                      <div style={{ fontSize: '0.72rem', color: '#93c5fd', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.3rem' }}>
                        Next Scheduled Match
                      </div>
                      <Link
                        href={getMatchPredictionUrl(t.next_match)}
                        style={{ color: '#f8fafc', fontWeight: 700, fontSize: '0.86rem', textDecoration: 'none', display: 'block', marginBottom: '0.25rem' }}
                      >
                        {t.next_match.home_team?.short_name || t.next_match.home_team?.name} vs {t.next_match.away_team?.short_name || t.next_match.away_team?.name} →
                      </Link>
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                        {t.next_match.utc_date ? new Date(t.next_match.utc_date).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Upcoming'} • {t.next_match.league?.name}
                      </div>
                    </div>
                  ) : (
                    <div style={{ fontSize: '0.76rem', color: '#94a3b8', fontStyle: 'italic' }}>
                      No upcoming matches scheduled in active rounds.
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Bookmarked Predictions */}
      {activeTab === 'saved' && (
        <div>
          {(!data?.saved_matches || data.saved_matches.length === 0) ? (
            <div className="glass-panel" style={{ padding: '3.5rem 1.5rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🔖</div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
                No Bookmarked Predictions
              </h3>
              <p style={{ fontSize: '0.86rem', maxWidth: '480px', margin: '0 auto 1.5rem auto' }}>
                Bookmark interesting upcoming fixtures to easily monitor win probabilities, projected scores, and live status in one place.
              </p>
              <Link href="/football-predictions-today" className="btn btn-primary" style={{ padding: '0.55rem 1.3rem', borderRadius: '10px', fontWeight: 700 }}>
                Browse Today&apos;s Matches
              </Link>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
              {data.saved_matches.map((m) => {
                const hn = m.home_team?.short_name || m.home_team?.name || 'Home';
                const an = m.away_team?.short_name || m.away_team?.name || 'Away';
                const matchUrl = getMatchPredictionUrl(m);

                return (
                  <div
                    key={m.id}
                    style={{
                      background: '#111827',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '14px',
                      padding: '1.25rem',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <span style={{ fontSize: '0.74rem', color: '#93c5fd', fontWeight: 800 }}>
                        {m.league?.name || 'Football'}
                      </span>
                      <button
                        onClick={async () => {
                          await toggleSavedPrediction(m.id);
                          setData((prev) => prev ? ({
                            ...prev,
                            saved_matches: prev.saved_matches.filter((item) => item.id !== m.id),
                          }) : null);
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#f87171',
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        ✕ Remove
                      </button>
                    </div>

                    <Link href={matchUrl} style={{ textDecoration: 'none', display: 'block', marginBottom: '0.85rem' }}>
                      <div style={{ fontSize: '1.05rem', fontWeight: 900, color: '#f8fafc', marginBottom: '0.2rem' }}>
                        {hn} vs {an}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
                        {m.utc_date ? new Date(m.utc_date).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Upcoming'}
                      </div>
                    </Link>

                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <Link
                        href={matchUrl}
                        style={{
                          background: 'rgba(59,130,246,0.15)',
                          border: '1px solid rgba(59,130,246,0.3)',
                          color: '#93c5fd',
                          padding: '0.4rem 0.8rem',
                          borderRadius: '8px',
                          fontSize: '0.78rem',
                          fontWeight: 800,
                          textDecoration: 'none',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                        }}
                      >
                        🎯 Prediction Center →
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Followed Competitions */}
      {activeTab === 'leagues' && (
        <div>
          {(!data?.followed_leagues || data.followed_leagues.length === 0) ? (
            <div className="glass-panel" style={{ padding: '3.5rem 1.5rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🏆</div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
                No Followed Competitions
              </h3>
              <p style={{ fontSize: '0.86rem', maxWidth: '480px', margin: '0 auto 1.5rem auto' }}>
                Follow the Premier League, Champions League, La Liga, Serie A, or Bundesliga to get quick access to tournament standings and fixtures.
              </p>
              <Link href="/leagues" className="btn btn-primary" style={{ padding: '0.55rem 1.3rem', borderRadius: '10px', fontWeight: 700 }}>
                Explore All Competitions
              </Link>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
              {data.followed_leagues.map((lg) => (
                <div
                  key={lg.id}
                  style={{
                    background: '#111827',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '14px',
                    padding: '1.25rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '1rem', fontWeight: 900, color: '#f8fafc', marginBottom: '0.2rem' }}>
                      {lg.flag || '🏆'} {lg.name}
                    </div>
                    <Link
                      href={getLeagueUrl(lg.name, lg.code)}
                      style={{ color: '#93c5fd', fontSize: '0.78rem', fontWeight: 700, textDecoration: 'none' }}
                    >
                      View Table &amp; Predictions →
                    </Link>
                  </div>

                  <button
                    onClick={async () => {
                      await toggleFollowedLeague(lg.id);
                      setData((prev) => prev ? ({
                        ...prev,
                        followed_leagues: prev.followed_leagues.filter((item) => item.id !== lg.id),
                      }) : null);
                    }}
                    style={{
                      background: 'rgba(234,179,8,0.1)',
                      border: '1px solid rgba(234,179,8,0.25)',
                      color: '#fde047',
                      padding: '0.3rem 0.6rem',
                      borderRadius: '6px',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    ⭐ Following
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: Notification Preferences */}
      {activeTab === 'settings' && (
        <div style={{
          background: '#111827',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '16px',
          padding: '1.75rem',
          maxWidth: '640px',
        }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#f8fafc', margin: '0 0 0.35rem 0' }}>
            🔔 Notification &amp; Match Alert Preferences
          </h2>
          <p style={{ fontSize: '0.82rem', color: '#94a3b8', margin: '0 0 1.5rem 0' }}>
            Choose the match alerts you would like to receive. Preferences apply across email and browser channels.
          </p>

          <form onSubmit={handleSaveNotifs} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[
              { key: 'match_reminders', label: 'Match Reminders', desc: 'Alerts 30 minutes before kick-off for followed team matches.' },
              { key: 'prediction_alerts', label: 'New Prediction Alerts', desc: 'Notifications when statistical models finalize match forecasts.' },
              { key: 'live_alerts', label: 'In-Play & Goal Alerts', desc: 'Real-time updates when live goals or red cards occur in followed fixtures.' },
              { key: 'final_results', label: 'Final Result & Accuracy Digest', desc: 'Summary of settled predictions and model results post-match.' },
              { key: 'favorite_team_alerts', label: 'Favorite Team News & Fixtures', desc: 'Upcoming round schedule announcements for your followed clubs.' },
            ].map((item) => (
              <label
                key={item.key}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.75rem',
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '10px',
                  padding: '0.85rem',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="checkbox"
                  checked={(notifs as any)[item.key]}
                  onChange={(e) => setNotifs({ ...notifs, [item.key]: e.target.checked })}
                  style={{ marginTop: '0.2rem', accentColor: '#3b82f6', width: '16px', height: '16px' }}
                />
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.86rem', color: '#f8fafc' }}>{item.label}</div>
                  <div style={{ fontSize: '0.74rem', color: '#94a3b8', marginTop: '0.15rem' }}>{item.desc}</div>
                </div>
              </label>
            ))}

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
              <button
                type="submit"
                disabled={savingNotifs}
                className="btn btn-primary"
                style={{ padding: '0.6rem 1.4rem', borderRadius: '10px', fontWeight: 800 }}
              >
                {savingNotifs ? 'Saving...' : 'Save Preferences'}
              </button>
              {savedNotifMsg && (
                <span style={{ fontSize: '0.82rem', color: '#4ade80', fontWeight: 700 }}>
                  ✓ Preferences saved successfully!
                </span>
              )}
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
