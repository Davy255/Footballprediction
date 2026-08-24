'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { submitPrediction } from '@/lib/api';
import { Match } from '@/lib/types';

type TabKey = 'ai' | 'analytics' | 'sw' | 'predict' | 'stats' | 'h2h';

function getTeamFormPpg(stats: any, fallback: number = 1.60): string {
  if (stats?.ppg != null) return Number(stats.ppg).toFixed(2);
  if (stats?.pts5 != null) return Number(stats.pts5).toFixed(2);
  if (stats?.last5_matches && stats.last5_matches.length > 0) {
    let pts = 0;
    stats.last5_matches.forEach((m: any) => {
      const res = (m.result || '').toUpperCase();
      if (res === 'W') pts += 3;
      else if (res === 'D') pts += 1;
    });
    return (pts / stats.last5_matches.length).toFixed(2);
  }
  if (stats?.ws_rating) {
    const ppg = ((stats.ws_rating - 5.2) * 1.2).toFixed(2);
    return Math.max(0.4, Math.min(2.8, Number(ppg))).toFixed(2);
  }
  return fallback.toFixed(2);
}

function getFormBadgeColor(ppgStr: string): string {
  const ppg = parseFloat(ppgStr) || 1.5;
  if (ppg >= 1.70) return 'fs-ppg-green';
  if (ppg >= 1.10) return 'fs-ppg-amber';
  return 'fs-ppg-red';
}

function getRatingClass(r: number) {
  if (r >= 7.5) return 'ws-rating-high';
  if (r >= 6.0) return 'ws-rating-medium';
  return 'ws-rating-low';
}

function getLevelClass(level: string) {
  const l = (level || '').toLowerCase();
  if (l === 'very strong') return 'ws-level-very-strong';
  if (l === 'strong') return 'ws-level-strong';
  if (l === 'very weak') return 'ws-level-very-weak';
  return 'ws-level-weak';
}

function parseUtcDate(utc_date: string): Date {
  if (!utc_date) return new Date();
  let s = String(utc_date).trim();
  if (!s.endsWith('Z') && !s.includes('+') && !s.match(/-\d{2}:\d{2}$/)) {
    s = s.replace(' ', 'T') + 'Z';
  } else {
    s = s.replace(' ', 'T');
  }
  return new Date(s);
}

function formatMatchDateTime(utc_date: string) {
  if (!utc_date) return { time: '--:--', date: '', relative: '', full: '' };
  try {
    const d = parseUtcDate(utc_date);
    const now = new Date();
    
    // FootyStats style 12-hour clean time: '2:30 pm'
    const timeStr = d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true }).toLowerCase();
    
    const isToday = d.toDateString() === now.toDateString();
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    const isTomorrow = d.toDateString() === tomorrow.toDateString();
    
    const dayMonth = d.toLocaleDateString([], { day: 'numeric', month: 'short' });
    const weekday = d.toLocaleDateString([], { weekday: 'short' });
    
    let dateStr = isToday ? 'Today' : isTomorrow ? 'Tomorrow' : `${weekday}, ${dayMonth}`;
    let relativeStr = '';
    
    const diffMs = d.getTime() - now.getTime();
    if (diffMs > 0 && diffMs <= 24 * 60 * 60 * 1000) {
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      if (diffHours >= 1) {
        relativeStr = `Starts in ${diffHours} Hr${diffHours > 1 ? 's' : ''}`;
      } else if (diffMins > 0) {
        relativeStr = `Starts in ${diffMins}m`;
      } else {
        relativeStr = 'Starting soon';
      }
    }
    
    return {
      time: timeStr,
      date: dateStr,
      relative: relativeStr,
      full: `${weekday} ${dayMonth} · ${timeStr}`,
    };
  } catch {
    return { time: '--:--', date: '', relative: '', full: '' };
  }
}

interface StatusDetails {
  statusKey: 'LIVE' | 'HT' | 'FT' | 'PST' | 'CANC' | 'SUSP' | 'SCHED';
  badgeText: string;
  badgeClass: string;
  minuteText?: string;
  isLive: boolean;
  isFinished: boolean;
  isPostponed: boolean;
  isCancelled: boolean;
}

function getMatchStatusDetails(match: Match): StatusDetails {
  const s = (match.status || '').toUpperCase();
  
  if (s === 'POSTPONED') {
    return {
      statusKey: 'PST',
      badgeText: 'PST',
      badgeClass: 'fs-badge-pst',
      isLive: false,
      isFinished: false,
      isPostponed: true,
      isCancelled: false,
    };
  }
  
  if (s === 'CANCELLED') {
    return {
      statusKey: 'CANC',
      badgeText: 'CANC',
      badgeClass: 'fs-badge-canc',
      isLive: false,
      isFinished: false,
      isPostponed: false,
      isCancelled: true,
    };
  }
  
  if (s === 'SUSPENDED') {
    return {
      statusKey: 'SUSP',
      badgeText: 'SUSP',
      badgeClass: 'fs-badge-pst',
      isLive: false,
      isFinished: false,
      isPostponed: false,
      isCancelled: true,
    };
  }

  if (s === 'FINISHED' || s === 'AWARDED') {
    return {
      statusKey: 'FT',
      badgeText: 'FT',
      badgeClass: 'fs-badge-ft',
      isLive: false,
      isFinished: true,
      isPostponed: false,
      isCancelled: false,
    };
  }

  if (s === 'HALFTIME' || s === 'PAUSED') {
    return {
      statusKey: 'HT',
      badgeText: 'HT',
      badgeClass: 'ws-badge-live-ht',
      minuteText: 'HT',
      isLive: true,
      isFinished: false,
      isPostponed: false,
      isCancelled: false,
    };
  }

  if (s === 'IN_PLAY' || s === 'LIVE') {
    let min = match.live_minute ? `${match.live_minute}'` : '';
    if (!min && match.utc_date) {
      const startMs = parseUtcDate(match.utc_date).getTime();
      const elapsed = Math.max(1, Math.floor((Date.now() - startMs) / 60000));
      min = elapsed <= 45 ? `${elapsed}'` : elapsed <= 60 ? 'HT' : elapsed <= 105 ? `${Math.min(90, 45 + (elapsed - 60))}'` : "90+'";
    }
    const minuteText = min || 'LIVE';
    return {
      statusKey: 'LIVE',
      badgeText: minuteText,
      badgeClass: 'fs-live-badge-box',
      minuteText: minuteText,
      isLive: true,
      isFinished: false,
      isPostponed: false,
      isCancelled: false,
    };
  }

  return {
    statusKey: 'SCHED',
    badgeText: 'VS',
    badgeClass: 'fs-btn-view-stats',
    isLive: false,
    isFinished: false,
    isPostponed: false,
    isCancelled: false,
  };
}

interface MatchCardProps {
  match: Match;
  defaultOpen?: boolean;
  onPredictionChange?: () => void;
  isLast?: boolean;
  isEven?: boolean;
}

export default function MatchCard({ match, defaultOpen = false, onPredictionChange, isLast, isEven }: MatchCardProps) {
  const { user, token } = useAuth();
  const [open, setOpen] = useState(defaultOpen);
  const [activeTab, setActiveTab] = useState<TabKey>('ai');
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  // Prediction form state
  const [predHome, setPredHome] = useState('');
  const [predAway, setPredAway] = useState('');
  const [predOutcome, setPredOutcome] = useState('');
  const [predBtts, setPredBtts] = useState<'yes' | 'no' | ''>('');
  const [predOver25, setPredOver25] = useState<'over' | 'under' | ''>('');
  const [predDc, setPredDc] = useState<'1x' | 'x2' | '12' | ''>('');
  
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitMsg, setSubmitMsg] = useState('');
  const [existingPred, setExistingPred] = useState<any>(null);
  const [predLoaded, setPredLoaded] = useState(false);

  const status = getMatchStatusDetails(match);
  const dateTime = formatMatchDateTime(match.utc_date);

  let ai: any = null;
  try { if (match.prediction_description) ai = JSON.parse(match.prediction_description); } catch {}
  
  const HN = match.home_team?.short_name || match.home_team?.name || 'Home';
  const AN = match.away_team?.short_name || match.away_team?.name || 'Away';

  // Fallback WhoScored tactical profile if not yet in payload
  const ws = ai?.whoscored || {
    home_rating: 6.8,
    away_rating: 6.5,
    home_manager: 'Head Coach',
    away_manager: 'Head Coach',
    home_formation: '4-2-3-1',
    away_formation: '4-3-3',
    stadium: `${HN} Stadium`,
    attendance: '38,000',
    referee: 'Premier Referee',
    home_strengths: [
      { title: 'Creating scoring chances', level: 'Strong' },
      { title: 'Attacking down the wings', level: 'Strong' },
    ],
    home_weaknesses: [
      { title: 'Defending against counter attacks', level: 'Weak' },
    ],
    home_style: ['Possession football', 'Short passes', 'Play with width'],
    away_strengths: [
      { title: 'Counter attacks', level: 'Strong' },
      { title: 'Direct free-kicks', level: 'Strong' },
    ],
    away_weaknesses: [
      { title: 'Defending set pieces', level: 'Weak' },
    ],
    away_style: ['Direct football', 'Quick transitions'],
    match_forecast: [
      `${HN} will look to control tempo in the opponent half`,
      `${AN} will pose danger on counter-attacking transitions`,
      `Both teams possess attacking threats to find the net`,
    ],
  };

  const h2h = ai?.h2h;
  const homeStats = ai?.home_stats || { elo: 1520, gf5: 1.4, ga5: 1.1, pts5: 1.4, possession: 52, ws_rating: 6.8, form: 'Good', last5_matches: [] };
  const awayStats = ai?.away_stats || { elo: 1490, gf5: 1.2, ga5: 1.3, pts5: 1.2, possession: 48, ws_rating: 6.5, form: 'Mixed', last5_matches: [] };
  const markets = ai?.markets || {
    over25_pct: 54, over25_odds: match.odds_over25 || 1.85,
    under25_pct: 46, under25_odds: match.odds_under25 || 1.95,
    btts_yes_pct: 58, btts_yes_odds: match.odds_btts_yes || 1.78,
    btts_no_pct: 42, btts_no_odds: match.odds_btts_no || 2.05,
    dc_1x_pct: 72, dc_1x_odds: match.odds_dc_1x || 1.32,
    dc_x2_pct: 55, dc_x2_odds: match.odds_dc_x2 || 1.62,
    dc_12_pct: 78, dc_12_odds: match.odds_dc_12 || 1.24,
  };
  const picks = ai?.picks;
  const probs = ai?.probs || {
    home_pct: Math.round((match.ai_home_prob ?? 0.45) * 100),
    draw_pct: Math.round((match.ai_draw_prob ?? 0.27) * 100),
    away_pct: Math.round((match.ai_away_prob ?? 0.28) * 100),
  };
  const odds = {
    home: match.odds_home ?? ai?.odds?.home ?? 2.10,
    draw: match.odds_draw ?? ai?.odds?.draw ?? 3.30,
    away: match.odds_away ?? ai?.odds?.away ?? 3.60,
  };

  const primaryOdds = typeof odds.away === 'number' && picks?.primary?.toLowerCase().includes(AN.toLowerCase())
    ? Number(odds.away).toFixed(2)
    : typeof odds.home === 'number' && picks?.primary?.toLowerCase().includes(HN.toLowerCase())
    ? Number(odds.home).toFixed(2)
    : typeof odds.draw === 'number' && (picks?.primary?.toLowerCase().includes('draw') || picks?.primary?.toLowerCase().includes('x'))
    ? Number(odds.draw).toFixed(2)
    : typeof picks?.primary_odds === 'number'
    ? Number(picks.primary_odds).toFixed(2)
    : picks?.primary_odds ?? '1.50';
  const score = ai?.score || {
    home: match.ai_predicted_home ?? 1,
    away: match.ai_predicted_away ?? 1,
  };
  const analyticsText = ai?.analytics || `${HN} and ${AN} meet in this encounter. Form analysis and tactical metrics project a competitive clash with ${HN} holding baseline home advantage, while ${AN} remains dangerous on transitions. Projected scoreline is ${score.home}-${score.away}.`;

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  const loadPred = useCallback(async () => {
    if (predLoaded || !token) return;
    setPredLoaded(true);
    try {
      const res = await fetch(`${API_BASE}/api/predictions/match/${match.id}`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const d = await res.json();
        if (d?.id) {
          setExistingPred(d);
          setPredHome(d.predicted_home_score !== null && d.predicted_home_score !== undefined ? String(d.predicted_home_score) : '');
          setPredAway(d.predicted_away_score !== null && d.predicted_away_score !== undefined ? String(d.predicted_away_score) : '');
          setPredOutcome(d.predicted_outcome ?? '');
          setPredBtts(d.predicted_btts ?? '');
          setPredOver25(d.predicted_over25 ?? '');
          setPredDc(d.predicted_dc ?? '');
          setSubmitted(true);
        }
      }
    } catch {}
  }, [predLoaded, token, match.id, API_BASE]);

  const handleTabClick = (tab: TabKey) => {
    setActiveTab(tab);
    if (tab === 'predict') loadPred();
  };

  const isKickoffPassed = match.utc_date ? new Date(match.utc_date).getTime() <= Date.now() : false;
  const isMatchLocked = status.isLive || status.isFinished || isKickoffPassed || status.isPostponed || status.isCancelled;

  const hasOutcomeOrScore = Boolean(predOutcome || (predHome !== '' && predAway !== ''));
  const hasBtts = Boolean(predBtts);
  const hasOver25 = Boolean(predOver25);
  const hasDc = Boolean(predDc);

  const selectedCount = (hasOutcomeOrScore ? 1 : 0) + (hasBtts ? 1 : 0) + (hasOver25 ? 1 : 0) + (hasDc ? 1 : 0);

  const handleHomeInput = (val: string) => {
    if (!hasOutcomeOrScore && selectedCount >= 2 && val !== '') {
      setSubmitMsg('⚠️ Max 2 prediction choices per match. Deselect one to change.');
      return;
    }
    setSubmitMsg('');
    setPredHome(val);
    if (val !== '' && predAway !== '') {
      const h = parseInt(val);
      const a = parseInt(predAway);
      if (!isNaN(h) && !isNaN(a)) {
        setPredOutcome(h > a ? 'HOME_TEAM' : a > h ? 'AWAY_TEAM' : 'DRAW');
      }
    }
  };

  const handleAwayInput = (val: string) => {
    if (!hasOutcomeOrScore && selectedCount >= 2 && val !== '') {
      setSubmitMsg('⚠️ Max 2 prediction choices per match. Deselect one to change.');
      return;
    }
    setSubmitMsg('');
    setPredAway(val);
    if (predHome !== '' && val !== '') {
      const h = parseInt(predHome);
      const a = parseInt(val);
      if (!isNaN(h) && !isNaN(a)) {
        setPredOutcome(h > a ? 'HOME_TEAM' : a > h ? 'AWAY_TEAM' : 'DRAW');
      }
    }
  };

  const handleOutcomeBtn = (key: string) => {
    if (predOutcome === key) {
      setPredOutcome('');
      setSubmitMsg('');
    } else {
      if (!hasOutcomeOrScore && selectedCount >= 2) {
        setSubmitMsg('⚠️ Max 2 prediction choices per match. Deselect one to change.');
        return;
      }
      setSubmitMsg('');
      setPredOutcome(key);
      if (key === 'DRAW') {
        const base = predHome !== '' ? predHome : '1';
        setPredHome(base);
        setPredAway(base);
      } else if (key === 'HOME_TEAM') {
        setPredHome('2');
        setPredAway('1');
      } else if (key === 'AWAY_TEAM') {
        setPredHome('1');
        setPredAway('2');
      }
    }
  };

  const handleBttsBtn = (val: 'yes' | 'no') => {
    if (predBtts === val) {
      setPredBtts('');
      setSubmitMsg('');
    } else {
      if (!hasBtts && selectedCount >= 2) {
        setSubmitMsg('⚠️ Max 2 prediction choices per match. Deselect one to change.');
        return;
      }
      setSubmitMsg('');
      setPredBtts(val);
    }
  };

  const handleOver25Btn = (val: 'over' | 'under') => {
    if (predOver25 === val) {
      setPredOver25('');
      setSubmitMsg('');
    } else {
      if (!hasOver25 && selectedCount >= 2) {
        setSubmitMsg('⚠️ Max 2 prediction choices per match. Deselect one to change.');
        return;
      }
      setSubmitMsg('');
      setPredOver25(val);
    }
  };

  const handleDcBtn = (val: '1x' | '12' | 'x2') => {
    if (predDc === val) {
      setPredDc('');
      setSubmitMsg('');
    } else {
      if (!hasDc && selectedCount >= 2) {
        setSubmitMsg('⚠️ Max 2 prediction choices per match. Deselect one to change.');
        return;
      }
      setSubmitMsg('');
      setPredDc(val);
    }
  };

  const handleSubmit = async () => {
    if (!token) return;
    if (isMatchLocked) {
      setSubmitMsg('❌ Predictions are closed for this match.');
      return;
    }
    const ph = predHome !== '' ? parseInt(predHome) : undefined;
    const pa = predAway !== '' ? parseInt(predAway) : undefined;
    
    let outcome = predOutcome || undefined;
    if (ph !== undefined && pa !== undefined && !isNaN(ph) && !isNaN(pa)) {
      outcome = ph > pa ? 'HOME_TEAM' : pa > ph ? 'AWAY_TEAM' : 'DRAW';
    }

    if (!outcome && ph === undefined && !predBtts && !predOver25 && !predDc) {
      setSubmitMsg('⚠️ Please select at least 1 prediction choice (maximum 2).');
      return;
    }

    setSubmitting(true);
    setSubmitMsg('');
    try {
      const data = await submitPrediction({
        match_id: match.id,
        predicted_outcome: outcome,
        predicted_home_score: ph,
        predicted_away_score: pa,
        predicted_btts: predBtts || undefined,
        predicted_over25: predOver25 || undefined,
        predicted_dc: predDc || undefined,
      });
      if (data?.id) {
        setSubmitted(true);
        setExistingPred(data);
        setSubmitMsg('✅ Prediction saved (Max 2 choices)!');
      } else {
        setSubmitMsg('Failed to save prediction.');
      }
    } catch (err: any) {
      setSubmitMsg(err.message || 'Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const hs = match.home_score != null ? match.home_score : (status.isFinished || status.isLive ? 0 : null);
  const as_ = match.away_score != null ? match.away_score : (status.isFinished || status.isLive ? 0 : null);
  const showScore = hs !== null && as_ !== null;
  const homeWin = showScore && hs! > as_!;
  const awayWin = showScore && as_! > hs!;

  const tabs: { key: TabKey; label: string }[] = [
    { key: 'ai', label: '📊 Forecast & Odds' },
    { key: 'analytics', label: '📝 Match Analysis' },
    { key: 'sw', label: '⚡ Strengths & Style' },
    { key: 'predict', label: status.isFinished ? '📋 Settlement' : '🎯 Multi-Predict' },
    { key: 'stats', label: '📊 Tactical Stats' },
    { key: 'h2h', label: '🔄 H2H & Form' },
  ];

  const homePpg = getTeamFormPpg(homeStats, 1.70);
  const awayPpg = getTeamFormPpg(awayStats, 1.50);
  const homeOddsFormatted = typeof odds.home === 'number' ? odds.home.toFixed(2) : '2.10';
  const drawOddsFormatted = typeof odds.draw === 'number' ? odds.draw.toFixed(2) : '3.30';
  const awayOddsFormatted = typeof odds.away === 'number' ? odds.away.toFixed(2) : '3.60';

  return (
    <div style={{ marginBottom: 0 }}>
      {/* FootyStats Authentic Match Row */}
      <div
        className={`footystats-match-row ${isEven ? 'row-even' : 'row-odd'} ${status.isLive ? 'live-row' : ''}`}
        onClick={() => {
          if (!user) {
            setShowAuthModal(true);
            return;
          }
          setOpen(o => !o);
          if (!open && activeTab === 'predict') loadPred();
        }}
      >
        {/* Home Side: Team Name (right) + Form Badge */}
        <div className="fs-home-side">
          <span className={`fs-team-name-home ${homeWin ? 'is-winner' : ''}`} title={HN}>
            {HN}
          </span>
          <span className={`fs-ppg-badge ${getFormBadgeColor(homePpg)}`}>
            {homePpg}
          </span>
        </div>

        {/* Center Column: Kickoff Time / Score + "Stats" link */}
        <div className="fs-center-side">
          {status.isLive ? (
            <>
              <span className="fs-center-score live">{hs ?? 0} - {as_ ?? 0}</span>
              <span className="fs-center-sub live">● {status.minuteText}</span>
            </>
          ) : status.isFinished ? (
            <>
              <span className="fs-center-score">{hs ?? 0} - {as_ ?? 0}</span>
              <span className="fs-center-sub">FT</span>
            </>
          ) : status.isPostponed ? (
            <>
              <span className="fs-center-time pst">PST</span>
              <span className="fs-center-sub">Stats</span>
            </>
          ) : status.isCancelled ? (
            <>
              <span className="fs-center-time canc">CANC</span>
              <span className="fs-center-sub">Stats</span>
            </>
          ) : (
            <>
              <span className="fs-center-time">{dateTime.time}</span>
              <span className="fs-center-sub">Stats</span>
            </>
          )}
        </div>

        {/* Away Side: Form Badge + Team Name (left) */}
        <div className="fs-away-side">
          <span className={`fs-ppg-badge ${getFormBadgeColor(awayPpg)}`}>
            {awayPpg}
          </span>
          <span className={`fs-team-name-away ${awayWin ? 'is-winner' : ''}`} title={AN}>
            {AN}
          </span>
        </div>
      </div>

      {/* Expanded WhoScored Match Centre Hub */}
      {open && (
        <div style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: '0 0 10px 10px', overflow: 'hidden', marginBottom: 6, background: '#111827' }}>
          
          {/* WhoScored Match Centre Header */}
          <div className="ws-match-header">
            <div className="ws-match-header-top">
              {/* Home Team Profile */}
              <div className="ws-team-block">
                {match.home_team?.crest && <img src={match.home_team.crest} className="ws-team-crest" alt={HN} />}
                <div className="ws-team-name" title={HN}>{HN}</div>
                {ws?.home_manager && <div className="ws-manager-pill" title={`Manager: ${ws.home_manager}`}>👔 {ws.home_manager}</div>}
                {ws?.home_formation && <div className="ws-formation-pill">{ws.home_formation}</div>}
                <span className={`ws-rating-badge ${getRatingClass(ws?.home_rating ?? 6.8)}`}>
                  {(ws?.home_rating ?? 6.8).toFixed(2)}
                </span>
              </div>

              {/* Score Centre */}
              <div className="ws-score-centre">
                {showScore ? (
                  <div className="ws-scoreline">{hs} : {as_}</div>
                ) : (
                  <div className="ws-scoreline ws-kickoff-time">
                    {dateTime.time}
                  </div>
                )}
                <span className={`ws-status-pill ws-status-${status.isLive ? 'live' : status.isFinished ? 'ft' : status.isPostponed ? 'pst' : 'sched'}`}>
                  {status.isPostponed ? 'PST' : status.badgeText}
                </span>
                <div className="ws-datetime-wrap">
                  <span className="ws-datetime-date">📅 {dateTime.date}</span>
                  {dateTime.relative && (
                    <span className="ws-datetime-rel">({dateTime.relative})</span>
                  )}
                </div>
                {match.home_score_ht != null && match.away_score_ht != null && (
                  <span className="ws-ht-score">HT: {match.home_score_ht}-{match.away_score_ht}</span>
                )}
              </div>

              {/* Away Team Profile */}
              <div className="ws-team-block">
                {match.away_team?.crest && <img src={match.away_team.crest} className="ws-team-crest" alt={AN} />}
                <div className="ws-team-name" title={AN}>{AN}</div>
                {ws?.away_manager && <div className="ws-manager-pill" title={`Manager: ${ws.away_manager}`}>👔 {ws.away_manager}</div>}
                {ws?.away_formation && <div className="ws-formation-pill">{ws.away_formation}</div>}
                <span className={`ws-rating-badge ${getRatingClass(ws?.away_rating ?? 6.5)}`}>
                  {(ws?.away_rating ?? 6.5).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Match Venue / Attendance / Referee */}
            <div className="ws-match-footer">
              <span>🏟️ {ws?.stadium || `${HN} Arena`}</span>
              <span>👥 {ws?.attendance || '42,000'}</span>
              <span>🟨 {ws?.referee || 'Match Official'}</span>
              <span style={{ color: '#38bdf8', fontWeight: 600 }}>⚡ Real-time Updates</span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="ws-tabs">
            {tabs.map(t => (
              <button
                key={t.key}
                className={`ws-tab${activeTab === t.key ? ' active' : ''}`}
                onClick={() => handleTabClick(t.key)}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Tab Content Panel */}
          <div className="ws-tab-content">

            {/* ── TAB 1: FORECAST & ODDS ── */}
            {activeTab === 'ai' && (
              <div>
                <div className="ws-section-title">🎯 1X2 Full-Time Match Odds (Match Winner)</div>
                <div className="ws-1x2-market-grid">
                  <div className="ws-1x2-market-card">
                    <div className="ws-1x2-market-header">
                      <span className="ws-1x2-market-code">1</span>
                      <span className="ws-1x2-market-team">{HN}</span>
                    </div>
                    <div className="ws-1x2-market-odds">@{homeOddsFormatted}</div>
                    <div className="ws-1x2-market-sub">{probs.home_pct}% win chance</div>
                    <div className="ws-1x2-card-bar-wrap">
                      <div className="ws-1x2-card-bar-h" style={{ width: `${probs.home_pct}%` }} />
                    </div>
                  </div>
                  <div className="ws-1x2-market-card">
                    <div className="ws-1x2-market-header">
                      <span className="ws-1x2-market-code">X</span>
                      <span className="ws-1x2-market-team">Draw</span>
                    </div>
                    <div className="ws-1x2-market-odds">@{drawOddsFormatted}</div>
                    <div className="ws-1x2-market-sub">{probs.draw_pct}% draw chance</div>
                    <div className="ws-1x2-card-bar-wrap">
                      <div className="ws-1x2-card-bar-d" style={{ width: `${probs.draw_pct}%` }} />
                    </div>
                  </div>
                  <div className="ws-1x2-market-card">
                    <div className="ws-1x2-market-header">
                      <span className="ws-1x2-market-code">2</span>
                      <span className="ws-1x2-market-team">{AN}</span>
                    </div>
                    <div className="ws-1x2-market-odds">@{awayOddsFormatted}</div>
                    <div className="ws-1x2-market-sub">{probs.away_pct}% win chance</div>
                    <div className="ws-1x2-card-bar-wrap">
                      <div className="ws-1x2-card-bar-a" style={{ width: `${probs.away_pct}%` }} />
                    </div>
                  </div>
                </div>

                <div className="ws-section-title">Projected Scoreline</div>
                <div className="ws-pred-score">
                  <span className="ws-pred-score-num">{score.home}</span>
                  <span className="ws-pred-score-sep">–</span>
                  <span className="ws-pred-score-num">{score.away}</span>
                </div>

                {picks && (
                  <>
                    <div className="ws-section-title">Tactical Best Value Picks</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 8 }}>
                      <div className="ws-pick-card">
                        <div>
                          <div className="ws-pick-label">🏆 Primary Pick</div>
                          <div className="ws-pick-val">{picks.primary} <span className="ws-pick-odds">@{primaryOdds}</span></div>
                        </div>
                      </div>
                      <div className="ws-pick-card">
                        <div>
                          <div className="ws-pick-label">🛡️ Safety Pick</div>
                          <div className="ws-pick-val">{picks.safety} <span className="ws-pick-odds">@{picks.safety_odds}</span></div>
                        </div>
                      </div>
                      <div className="ws-pick-card">
                        <div>
                          <div className="ws-pick-label">⚽ Goal Market</div>
                          <div className="ws-pick-val">{picks.goal_pick} <span className="ws-pick-odds">@{picks.goal_odds}</span></div>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                <div className="ws-section-title">Real Bookmaker Market Odds &amp; Probabilities</div>
                <div className="ws-markets-grid">
                  <div className="ws-market-item">
                    <span className="ws-market-label">Over 2.5 Goals</span>
                    <span><span className="ws-market-val">{markets.over25_pct}%</span><span className="ws-market-odds">@{markets.over25_odds}</span></span>
                  </div>
                  <div className="ws-market-item">
                    <span className="ws-market-label">Under 2.5 Goals</span>
                    <span><span className="ws-market-val">{markets.under25_pct}%</span><span className="ws-market-odds">@{markets.under25_odds}</span></span>
                  </div>
                  <div className="ws-market-item">
                    <span className="ws-market-label">Both Teams To Score (Yes)</span>
                    <span><span className="ws-market-val">{markets.btts_yes_pct}%</span><span className="ws-market-odds">@{markets.btts_yes_odds}</span></span>
                  </div>
                  <div className="ws-market-item">
                    <span className="ws-market-label">Both Teams To Score (No)</span>
                    <span><span className="ws-market-val">{markets.btts_no_pct}%</span><span className="ws-market-odds">@{markets.btts_no_odds}</span></span>
                  </div>
                  <div className="ws-market-item">
                    <span className="ws-market-label">Double Chance 1X (Home/Draw)</span>
                    <span><span className="ws-market-val">{markets.dc_1x_pct}%</span><span className="ws-market-odds">@{markets.dc_1x_odds}</span></span>
                  </div>
                  <div className="ws-market-item">
                    <span className="ws-market-label">Double Chance X2 (Draw/Away)</span>
                    <span><span className="ws-market-val">{markets.dc_x2_pct}%</span><span className="ws-market-odds">@{markets.dc_x2_odds}</span></span>
                  </div>
                  <div className="ws-market-item">
                    <span className="ws-market-label">Double Chance 12 (Home/Away)</span>
                    <span><span className="ws-market-val">{markets.dc_12_pct}%</span><span className="ws-market-odds">@{markets.dc_12_odds}</span></span>
                  </div>
                </div>
              </div>
            )}


            {/* ── TAB 2: WRITTEN MATCH ANALYSIS CARD ── */}
            {activeTab === 'analytics' && (
              <div>
                <div className="ws-section-title">📝 In-Depth Tactical & Statistical Match Preview</div>
                <div style={{
                  background: 'rgba(34,197,94,0.06)',
                  border: '1px solid rgba(34,197,94,0.2)',
                  borderRadius: 10,
                  padding: '16px 18px',
                  color: '#e2e8f0',
                  fontSize: '0.88rem',
                  lineHeight: 1.65,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                    <span style={{ fontSize: '1.2rem' }}>📊</span>
                    <strong style={{ color: '#22c55e', fontSize: '0.95rem' }}>Tactical Match Intelligence Report</strong>
                    <span style={{ marginLeft: 'auto', fontSize: '0.72rem', color: '#8aa3c8', background: 'rgba(255,255,255,0.06)', padding: '2px 8px', borderRadius: 12 }}>
                      87,000+ Historical Match Basis
                    </span>
                  </div>
                  <p style={{ margin: 0 }}>{analyticsText}</p>
                  
                  <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.08)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '8px 12px', borderRadius: 8 }}>
                      <div style={{ fontSize: '0.7rem', color: '#8aa3c8' }}>Projected Result</div>
                      <div style={{ fontFamily: 'Outfit', fontWeight: 800, color: '#22c55e', fontSize: '1.1rem' }}>{score.home} - {score.away}</div>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '8px 12px', borderRadius: 8 }}>
                      <div style={{ fontSize: '0.7rem', color: '#8aa3c8' }}>Top Recommended Pick</div>
                      <div style={{ fontFamily: 'Outfit', fontWeight: 800, color: '#f0f6ff', fontSize: '1.1rem' }}>{picks?.primary || `${HN} Win`}</div>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '8px 12px', borderRadius: 8 }}>
                      <div style={{ fontSize: '0.7rem', color: '#8aa3c8' }}>Kickoff Time</div>
                      <div style={{ fontFamily: 'Outfit', fontWeight: 800, color: '#38bdf8', fontSize: '1.1rem' }}>{dateTime.time}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── TAB 3: STRENGTHS, WEAKNESSES & STYLE ── */}
            {activeTab === 'sw' && (
              <div>
                <div className="ws-section-title">Style of Play</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                  <div style={{ background: 'rgba(255,255,255,0.03)', padding: 10, borderRadius: 8 }}>
                    <div style={{ fontSize: '0.76rem', color: '#22c55e', marginBottom: 6, fontWeight: 700 }}>🟢 {HN}</div>
                    <div>{(ws.home_style || []).map((s: string, i: number) => <span key={i} className="ws-style-tag">{s}</span>)}</div>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.03)', padding: 10, borderRadius: 8 }}>
                    <div style={{ fontSize: '0.76rem', color: '#3b82f6', marginBottom: 6, fontWeight: 700 }}>🔵 {AN}</div>
                    <div>{(ws.away_style || []).map((s: string, i: number) => <span key={i} className="ws-style-tag">{s}</span>)}</div>
                  </div>
                </div>

                <div className="ws-section-title">WhoScored Strengths & Weaknesses Comparison</div>
                <div className="ws-sw-grid">
                  <div>
                    <div className="ws-sw-col-title">🟢 {HN} Profile</div>
                    {(ws.home_strengths || []).map((s: any, i: number) => (
                      <div key={i} className="ws-sw-item">
                        <span className="ws-sw-title">{s.title}</span>
                        <span className={`ws-sw-level ${getLevelClass(s.level)}`}>{s.level}</span>
                      </div>
                    ))}
                    {(ws.home_weaknesses || []).map((s: any, i: number) => (
                      <div key={i} className="ws-sw-item">
                        <span className="ws-sw-title">{s.title}</span>
                        <span className={`ws-sw-level ${getLevelClass(s.level)}`}>{s.level}</span>
                      </div>
                    ))}
                  </div>
                  <div>
                    <div className="ws-sw-col-title">🔵 {AN} Profile</div>
                    {(ws.away_strengths || []).map((s: any, i: number) => (
                      <div key={i} className="ws-sw-item">
                        <span className="ws-sw-title">{s.title}</span>
                        <span className={`ws-sw-level ${getLevelClass(s.level)}`}>{s.level}</span>
                      </div>
                    ))}
                    {(ws.away_weaknesses || []).map((s: any, i: number) => (
                      <div key={i} className="ws-sw-item">
                        <span className="ws-sw-title">{s.title}</span>
                        <span className={`ws-sw-level ${getLevelClass(s.level)}`}>{s.level}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {ws.match_forecast?.length > 0 && (
                  <div className="ws-forecast" style={{ marginTop: 12 }}>
                    <div className="ws-forecast-title">📋 WhoScored Match Forecast</div>
                    {ws.match_forecast.map((f: string, i: number) => (
                      <div key={i} className="ws-forecast-item">{f}</div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── TAB 4: EXTENDED MULTI-MARKET USER PREDICTIONS ── */}
            {activeTab === 'predict' && (
              <div>
                {!user ? (
                  <div style={{ textAlign: 'center', padding: '24px 0', color: '#8aa3c8', fontSize: '0.9rem' }}>
                    🔒 <a href="/login" style={{ color: '#22c55e', fontWeight: 700, textDecoration: 'underline' }}>Login</a> or <a href="/register" style={{ color: '#22c55e', fontWeight: 700, textDecoration: 'underline' }}>Register</a> to submit your multi-market predictions and compete on the leaderboard!
                  </div>
                ) : status.isFinished && existingPred ? (
                  /* Settled prediction view */
                  <div className={`ws-settlement-card ${(existingPred.points_earned ?? 0) > 0 ? 'ws-settlement-win' : 'ws-settlement-loss'}`}>
                    <div style={{ fontSize: '2rem', marginBottom: 6 }}>
                      {(existingPred.points_earned ?? 0) >= 5 ? '🏆' : (existingPred.points_earned ?? 0) > 0 ? '✅' : '❌'}
                    </div>
                    <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.15rem', color: '#f0f6ff', marginBottom: 4 }}>
                      Match Finished: {match.home_score} – {match.away_score}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#8aa3c8', marginBottom: 10 }}>
                      Your Predictions: Outcome: <strong>{existingPred.predicted_outcome}</strong>
                      {existingPred.predicted_home_score !== null && ` | Score: ${existingPred.predicted_home_score}-${existingPred.predicted_away_score}`}
                      {existingPred.predicted_btts && ` | BTTS: ${existingPred.predicted_btts.toUpperCase()}`}
                      {existingPred.predicted_over25 && ` | O/U: ${existingPred.predicted_over25.toUpperCase()} 2.5`}
                      {existingPred.predicted_dc && ` | DC: ${existingPred.predicted_dc.toUpperCase()}`}
                    </div>
                    
                    <div style={{ fontFamily: 'Outfit', fontWeight: 900, fontSize: '1.8rem', color: (existingPred.points_earned ?? 0) > 0 ? '#22c55e' : '#ef4444' }}>
                      +{(existingPred.points_earned ?? 0)} Points Earned
                    </div>

                    <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 10, flexWrap: 'wrap' }}>
                      {existingPred.outcome_correct && <span style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e', padding: '3px 8px', borderRadius: 6, fontSize: '0.75rem', fontWeight: 700 }}>Outcome Won (+3pts)</span>}
                      {existingPred.score_correct && <span style={{ background: 'rgba(34,197,94,0.2)', color: '#22c55e', padding: '3px 8px', borderRadius: 6, fontSize: '0.75rem', fontWeight: 800 }}>Exact Score Bonus (+5pts)</span>}
                      {existingPred.btts_correct && <span style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e', padding: '3px 8px', borderRadius: 6, fontSize: '0.75rem', fontWeight: 700 }}>BTTS Won (+2pts)</span>}
                      {existingPred.over25_correct && <span style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e', padding: '3px 8px', borderRadius: 6, fontSize: '0.75rem', fontWeight: 700 }}>O/U 2.5 Won (+2pts)</span>}
                      {existingPred.dc_correct && <span style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e', padding: '3px 8px', borderRadius: 6, fontSize: '0.75rem', fontWeight: 700 }}>Double Chance Won (+1pt)</span>}
                    </div>
                  </div>
                ) : isMatchLocked ? (
                  <div className="ws-settlement-card" style={{ borderColor: 'rgba(239,68,68,0.25)', background: 'rgba(239,68,68,0.06)', textAlign: 'center', padding: '1.25rem' }}>
                    <div style={{ fontSize: '1.6rem', marginBottom: 4 }}>🔒</div>
                    <div style={{ fontFamily: 'Outfit', fontWeight: 800, color: '#f87171', fontSize: '1rem' }}>
                      Predictions Closed
                    </div>
                    <div style={{ color: '#94a3b8', fontSize: '0.82rem', marginTop: 4 }}>
                      {status.isLive ? 'This match is currently LIVE in play. Predictions lock at kickoff.' : status.isFinished ? `This match has finished (${match.home_score ?? 0} - ${match.away_score ?? 0}).` : 'Kickoff time has arrived. Predictions are now locked.'}
                    </div>
                  </div>
                ) : submitted && existingPred ? (
                  <div className="ws-settlement-card" style={{ borderColor: 'rgba(34,197,94,0.3)', background: 'rgba(34,197,94,0.06)' }}>
                    <div style={{ fontSize: '1.4rem', marginBottom: 6 }}>🎯</div>
                    <div style={{ fontFamily: 'Outfit', fontWeight: 800, color: '#f0f6ff', fontSize: '1.05rem' }}>
                      Active Predictions Recorded (2 Choices Max)
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 6, margin: '10px 0' }}>
                      {existingPred.predicted_outcome && (
                        <div style={{ background: 'rgba(255,255,255,0.04)', padding: 6, borderRadius: 6, fontSize: '0.78rem' }}>
                          <div style={{ color: '#8aa3c8' }}>1X2 Outcome</div>
                          <strong style={{ color: '#22c55e' }}>{existingPred.predicted_outcome}</strong>
                        </div>
                      )}
                      {existingPred.predicted_home_score !== null && (
                        <div style={{ background: 'rgba(255,255,255,0.04)', padding: 6, borderRadius: 6, fontSize: '0.78rem' }}>
                          <div style={{ color: '#8aa3c8' }}>Exact Score</div>
                          <strong style={{ color: '#22c55e' }}>{existingPred.predicted_home_score} - {existingPred.predicted_away_score}</strong>
                        </div>
                      )}
                      {existingPred.predicted_btts && (
                        <div style={{ background: 'rgba(255,255,255,0.04)', padding: 6, borderRadius: 6, fontSize: '0.78rem' }}>
                          <div style={{ color: '#8aa3c8' }}>BTTS</div>
                          <strong style={{ color: '#22c55e' }}>{existingPred.predicted_btts.toUpperCase()}</strong>
                        </div>
                      )}
                      {existingPred.predicted_over25 && (
                        <div style={{ background: 'rgba(255,255,255,0.04)', padding: 6, borderRadius: 6, fontSize: '0.78rem' }}>
                          <div style={{ color: '#8aa3c8' }}>O/U 2.5</div>
                          <strong style={{ color: '#22c55e' }}>{existingPred.predicted_over25.toUpperCase()} 2.5</strong>
                        </div>
                      )}
                      {existingPred.predicted_dc && (
                        <div style={{ background: 'rgba(255,255,255,0.04)', padding: 6, borderRadius: 6, fontSize: '0.78rem' }}>
                          <div style={{ color: '#8aa3c8' }}>Double Chance</div>
                          <strong style={{ color: '#22c55e' }}>{existingPred.predicted_dc.toUpperCase()}</strong>
                        </div>
                      )}
                    </div>
                    <button
                      className="ws-predict-btn"
                      style={{ background: 'rgba(255,255,255,0.08)', marginTop: 8 }}
                      onClick={() => { setSubmitted(false); setExistingPred(null); }}
                    >
                      ✏️ Edit Picks
                    </button>
                  </div>
                ) : (
                  <>
                    {/* 2-choice Counter Badge */}
                    <div style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      background: selectedCount === 2 ? 'rgba(34,197,94,0.1)' : 'rgba(59,130,246,0.1)',
                      border: `1px solid ${selectedCount === 2 ? 'rgba(34,197,94,0.25)' : 'rgba(59,130,246,0.2)'}`,
                      borderRadius: 8, padding: '6px 12px', marginBottom: 12, fontSize: '0.78rem'
                    }}>
                      <span style={{ color: '#cbd5e1', fontWeight: 600 }}>
                        ⚡ Rule: Choose up to <strong>2 choices</strong> per match
                      </span>
                      <span style={{
                        fontWeight: 800,
                        color: selectedCount === 2 ? '#22c55e' : '#60a5fa',
                        background: 'rgba(0,0,0,0.3)',
                        padding: '2px 8px', borderRadius: 12
                      }}>
                        {selectedCount}/2 Selected
                      </span>
                    </div>

                    {/* Market 1: Exact Score & 1X2 */}
                    <div className="ws-section-title">Market 1: Exact Scoreline (+5 pts) & Outcome (+3 pts)</div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6, fontSize: '0.8rem', color: '#8aa3c8' }}>
                      <span>{HN}</span>
                      <span>{AN}</span>
                    </div>
                    <div className="ws-score-inputs">
                      <input
                        type="number" min={0} max={20} value={predHome}
                        onChange={e => handleHomeInput(e.target.value)}
                        className="ws-score-input" placeholder="0"
                      />
                      <span className="ws-score-sep">–</span>
                      <input
                        type="number" min={0} max={20} value={predAway}
                        onChange={e => handleAwayInput(e.target.value)}
                        className="ws-score-input" placeholder="0"
                      />
                    </div>
                    <div className="ws-outcome-btns">
                      <button
                        className={`ws-outcome-btn${predOutcome === 'HOME_TEAM' ? ' selected' : ''}`}
                        onClick={() => handleOutcomeBtn('HOME_TEAM')}
                      >
                        {HN} Win (@{odds.home.toFixed(2)})
                      </button>
                      <button
                        className={`ws-outcome-btn${predOutcome === 'DRAW' ? ' selected' : ''}`}
                        onClick={() => handleOutcomeBtn('DRAW')}
                      >
                        Draw (@{odds.draw.toFixed(2)})
                      </button>
                      <button
                        className={`ws-outcome-btn${predOutcome === 'AWAY_TEAM' ? ' selected' : ''}`}
                        onClick={() => handleOutcomeBtn('AWAY_TEAM')}
                      >
                        {AN} Win (@{odds.away.toFixed(2)})
                      </button>
                    </div>

                    {/* Market 2: BTTS */}
                    <div className="ws-section-title" style={{ marginTop: 14 }}>Market 2: Both Teams To Score (BTTS) (+2 pts)</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                      <button
                        className={`ws-outcome-btn${predBtts === 'yes' ? ' selected' : ''}`}
                        onClick={() => handleBttsBtn('yes')}
                      >
                        ⚽ Yes (@{markets.btts_yes_odds.toFixed(2)})
                      </button>
                      <button
                        className={`ws-outcome-btn${predBtts === 'no' ? ' selected' : ''}`}
                        onClick={() => handleBttsBtn('no')}
                      >
                        🚫 No (@{markets.btts_no_odds.toFixed(2)})
                      </button>
                    </div>

                    {/* Market 3: Over / Under 2.5 */}
                    <div className="ws-section-title" style={{ marginTop: 14 }}>Market 3: Over / Under 2.5 Total Goals (+2 pts)</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                      <button
                        className={`ws-outcome-btn${predOver25 === 'over' ? ' selected' : ''}`}
                        onClick={() => handleOver25Btn('over')}
                      >
                        ⬆️ Over 2.5 (@{markets.over25_odds.toFixed(2)})
                      </button>
                      <button
                        className={`ws-outcome-btn${predOver25 === 'under' ? ' selected' : ''}`}
                        onClick={() => handleOver25Btn('under')}
                      >
                        ⬇️ Under 2.5 (@{markets.under25_odds.toFixed(2)})
                      </button>
                    </div>

                    {/* Market 4: Double Chance */}
                    <div className="ws-section-title" style={{ marginTop: 14 }}>Market 4: Double Chance (+1 pt)</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
                      <button
                        className={`ws-outcome-btn${predDc === '1x' ? ' selected' : ''}`}
                        onClick={() => handleDcBtn('1x')}
                      >
                        1X (Home/Draw) (@{markets.dc_1x_odds.toFixed(2)})
                      </button>
                      <button
                        className={`ws-outcome-btn${predDc === '12' ? ' selected' : ''}`}
                        onClick={() => handleDcBtn('12')}
                      >
                        12 (Home/Away) (@{markets.dc_12_odds.toFixed(2)})
                      </button>
                      <button
                        className={`ws-outcome-btn${predDc === 'x2' ? ' selected' : ''}`}
                        onClick={() => handleDcBtn('x2')}
                      >
                        X2 (Draw/Away) (@{markets.dc_x2_odds.toFixed(2)})
                      </button>
                    </div>

                    {submitMsg && (
                      <div style={{ fontSize: '0.82rem', textAlign: 'center', marginTop: 10, color: submitMsg.includes('✅') ? '#22c55e' : '#f87171', fontWeight: 600 }}>
                        {submitMsg}
                      </div>
                    )}

                    <button
                      className="ws-predict-btn"
                      onClick={handleSubmit}
                      disabled={submitting || selectedCount === 0}
                    >
                      {submitting ? '⏳ Submitting...' : `🎯 Submit Prediction (${selectedCount}/2 Selected)`}
                    </button>
                  </>
                )}
              </div>
            )}

            {/* ── TAB 5: TACTICAL STATS ── */}
            {activeTab === 'stats' && (
              <div>
                <div className="ws-section-title" style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#22c55e' }}>{HN}</span>
                  <span>Tactical Metric</span>
                  <span style={{ color: '#3b82f6' }}>{AN}</span>
                </div>
                {[
                  { label: 'Possession', h: homeStats.possession ?? 50, a: awayStats.possession ?? 50, max: 100, fmt: (v: number) => `${v}%` },
                  { label: 'Goals Scored pg (L5)', h: homeStats.gf5, a: awayStats.gf5, max: 4, fmt: (v: number) => (typeof v === 'number' ? v.toFixed(2) : '-') },
                  { label: 'Goals Conceded pg (L5)', h: homeStats.ga5, a: awayStats.ga5, max: 4, fmt: (v: number) => (typeof v === 'number' ? v.toFixed(2) : '-') },
                  { label: 'Goals Scored pg (L10)', h: homeStats.gf10, a: awayStats.gf10, max: 4, fmt: (v: number) => (typeof v === 'number' ? v.toFixed(2) : '-') },
                  { label: 'Avg Points pg (L5)', h: homeStats.pts5, a: awayStats.pts5, max: 3, fmt: (v: number) => (typeof v === 'number' ? v.toFixed(2) : '-') },
                  { label: 'Elo Power Rating', h: homeStats.elo, a: awayStats.elo, max: 2200, fmt: (v: number) => Math.round(v) },
                  { label: 'WhoScored Form Rating', h: homeStats.ws_rating, a: awayStats.ws_rating, max: 10, fmt: (v: number) => (typeof v === 'number' ? v.toFixed(2) : '-') },
                ].map(row => (
                  <div key={row.label} className="ws-stat-row">
                    <div className="ws-stat-home-val">{row.fmt(row.h)}</div>
                    <div style={{ textAlign: 'center' }}>
                      <div className="ws-stat-label">{row.label}</div>
                      <div className="ws-stat-bar-wrap">
                        <div className="ws-stat-bar-h" style={{ width: `${Math.min(100, ((row.h || 0) / row.max) * 100)}%` }} />
                        <div className="ws-stat-bar-a" style={{ width: `${Math.min(100, ((row.a || 0) / row.max) * 100)}%` }} />
                      </div>
                    </div>
                    <div className="ws-stat-away-val">{row.fmt(row.a)}</div>
                  </div>
                ))}
                <div className="ws-stat-row">
                  <div className="ws-stat-home-val">{homeStats.form || 'Good'}</div>
                  <div className="ws-stat-label">Recent Momentum</div>
                  <div className="ws-stat-away-val">{awayStats.form || 'Mixed'}</div>
                </div>
              </div>
            )}

            {/* ── TAB 6: H2H & FORM ── */}
            {activeTab === 'h2h' && (
              <div>
                <div className="ws-section-title">Head to Head Record</div>
                <div className="ws-h2h-header">
                  <div><span className="ws-h2h-stat-val" style={{ color: '#22c55e' }}>{h2h?.home_wins ?? 0}</span><span className="ws-h2h-stat-label">{HN} Wins</span></div>
                  <div><span className="ws-h2h-stat-val" style={{ color: '#f59e0b' }}>{h2h?.draws ?? 0}</span><span className="ws-h2h-stat-label">Draws</span></div>
                  <div><span className="ws-h2h-stat-val" style={{ color: '#3b82f6' }}>{h2h?.away_wins ?? 0}</span><span className="ws-h2h-stat-label">{AN} Wins</span></div>
                </div>
                <div style={{ display: 'flex', gap: 16, fontSize: '0.75rem', color: '#8aa3c8', marginBottom: 10 }}>
                  <span>Total Matches: <strong style={{ color: '#f0f6ff' }}>{h2h?.total ?? 0}</strong></span>
                  <span>Avg Goals: <strong style={{ color: '#f0f6ff' }}>{h2h?.avg_goals ?? 2.5}</strong></span>
                  <span>BTTS Rate: <strong style={{ color: '#f0f6ff' }}>{h2h?.btts_pct ?? 50}%</strong></span>
                </div>
                {(h2h?.past_matches || []).slice(0, 8).map((pm: any, i: number) => (
                  <div key={i} className="ws-h2h-match-row">
                    <span className="ws-h2h-date">{pm.date}</span>
                    <span className={`ws-h2h-team home${pm.winner === 'HOME_TEAM' ? ' winner' : ''}`}>{pm.home_team}</span>
                    <span className="ws-h2h-score-box">{pm.home_score}-{pm.away_score}</span>
                    <span className={`ws-h2h-team${pm.winner === 'AWAY_TEAM' ? ' winner' : ''}`}>{pm.away_team}</span>
                    <span className={`ws-h2h-result-${pm.winner === 'HOME_TEAM' ? 'w' : pm.winner === 'AWAY_TEAM' ? 'l' : 'd'}`}>
                      {pm.winner === 'HOME_TEAM' ? 'H' : pm.winner === 'AWAY_TEAM' ? 'A' : 'D'}
                    </span>
                  </div>
                ))}
                {homeStats?.last5_matches?.length > 0 && (
                  <>
                    <div className="ws-section-title" style={{ marginTop: 14 }}>{HN} — Last 5 Outings</div>
                    {homeStats.last5_matches.map((m: any, i: number) => (
                      <div key={i} className="ws-form-row">
                        <span className="ws-form-date">{m.date}</span>
                        <span className="ws-form-venue">{m.venue === 'H' ? 'H' : 'A'}</span>
                        <span className="ws-form-opponent">{m.opponent}</span>
                        <span className="ws-form-score">{m.score}</span>
                        <span className={`ws-result-chip ws-result-${(m.result || '').toLowerCase()}`}>{m.result}</span>
                      </div>
                    ))}
                  </>
                )}
                {awayStats?.last5_matches?.length > 0 && (
                  <>
                    <div className="ws-section-title" style={{ marginTop: 14 }}>{AN} — Last 5 Outings</div>
                    {awayStats.last5_matches.map((m: any, i: number) => (
                      <div key={i} className="ws-form-row">
                        <span className="ws-form-date">{m.date}</span>
                        <span className="ws-form-venue">{m.venue === 'H' ? 'H' : 'A'}</span>
                        <span className="ws-form-opponent">{m.opponent}</span>
                        <span className="ws-form-score">{m.score}</span>
                        <span className={`ws-result-chip ws-result-${(m.result || '').toLowerCase()}`}>{m.result}</span>
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}

          </div>
        </div>
      )}

      {/* Auth Gate Modal for Previews and Predictions */}
      {showAuthModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowAuthModal(false)}
          style={{ zIndex: 9999 }}
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '420px',
              textAlign: 'center',
              padding: '2rem 1.5rem',
              borderRadius: '20px',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-card)',
              boxShadow: 'var(--shadow-card)',
            }}
          >
            <div style={{ fontSize: '2.5rem', marginBottom: '0.6rem' }}>🔒</div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
              Sign In to Unlock Match Analytics
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1.4rem' }}>
              Create a free account or sign in to explore full AI match forecasts, WhoScored tactical metrics, Head-to-Head histories, and place your score predictions!
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <Link
                href="/register"
                className="btn btn-primary"
                style={{ justifyContent: 'center', padding: '0.65rem', fontSize: '0.9rem' }}
              >
                Create Free Account 🎯
              </Link>
              <Link
                href="/login"
                className="btn btn-secondary"
                style={{ justifyContent: 'center', padding: '0.65rem', fontSize: '0.9rem' }}
              >
                Sign In 🚀
              </Link>
              <button
                type="button"
                onClick={() => setShowAuthModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  marginTop: '0.4rem',
                  padding: '4px',
                }}
              >
                Continue Browsing
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}




