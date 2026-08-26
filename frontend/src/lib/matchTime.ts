/**
 * Official Football Match Clock & Live Minute Engine for FootballPredict.
 * 
 * Standard Professional Football Schedule:
 * - 0 to 45 min after kickoff: 1st Half (displays 1' to 45')
 * - 45 to 48 min after kickoff: 1st Half Stoppage Time (displays 45+')
 * - 48 to 63 min after kickoff: Half-Time Interval (displays HT - 15 min break)
 * - 63 to 108 min after kickoff: 2nd Half (starts at 46' and progresses to 90')
 * - 108 to 115 min after kickoff: 2nd Half Stoppage Time (displays 90+')
 * - > 115 min after kickoff: Full-Time / Completed (displays FT)
 */

export function parseUtcDate(utc_date: string | Date): Date {
  if (!utc_date) return new Date();
  if (utc_date instanceof Date) return utc_date;
  let s = String(utc_date).trim();
  if (!s.endsWith('Z') && !s.includes('+') && !s.match(/-\d{2}:\d{2}$/)) {
    s = s.replace(' ', 'T') + 'Z';
  } else {
    s = s.replace(' ', 'T');
  }
  return new Date(s);
}

export interface LiveClockInfo {
  minuteText: string;
  isLive: boolean;
  isHalftime: boolean;
  isFinished: boolean;
  liveMinuteNumber: number | null;
}

export function calculateLiveMatchMinute(utcDate: string | Date | undefined, status?: string): LiveClockInfo {
  const s = (status || '').toUpperCase();

  if (s === 'FINISHED' || s === 'AWARDED') {
    return { minuteText: 'FT', isLive: false, isHalftime: false, isFinished: true, liveMinuteNumber: 90 };
  }

  if (s === 'POSTPONED') {
    return { minuteText: 'PST', isLive: false, isHalftime: false, isFinished: false, liveMinuteNumber: null };
  }

  if (s === 'CANCELLED' || s === 'SUSPENDED') {
    return { minuteText: 'CANC', isLive: false, isHalftime: false, isFinished: false, liveMinuteNumber: null };
  }

  if (s === 'HALFTIME' || s === 'PAUSED') {
    return { minuteText: 'HT', isLive: true, isHalftime: true, isFinished: false, liveMinuteNumber: 45 };
  }

  if (!utcDate) {
    return { minuteText: 'VS', isLive: false, isHalftime: false, isFinished: false, liveMinuteNumber: null };
  }

  const startMs = parseUtcDate(utcDate).getTime();
  const nowMs = Date.now();
  const elapsedTotal = Math.floor((nowMs - startMs) / 60000);

  // If match has not kicked off yet
  if (elapsedTotal < 0) {
    return { minuteText: 'VS', isLive: false, isHalftime: false, isFinished: false, liveMinuteNumber: null };
  }

  // 1st Half: 0 to 45 mins
  if (elapsedTotal <= 45) {
    const min = Math.max(1, elapsedTotal);
    return { minuteText: `${min}'`, isLive: true, isHalftime: false, isFinished: false, liveMinuteNumber: min };
  }

  // 1st Half Stoppage Time: 46 to 48 mins
  if (elapsedTotal <= 48) {
    return { minuteText: "45+'", isLive: true, isHalftime: false, isFinished: false, liveMinuteNumber: 45 };
  }

  // Half-Time Break: 49 to 63 mins (15 minutes interval in locker room)
  if (elapsedTotal <= 63) {
    return { minuteText: 'HT', isLive: true, isHalftime: true, isFinished: false, liveMinuteNumber: 45 };
  }

  // 2nd Half: 64 to 108 mins (accurate 46' to 90' progression)
  if (elapsedTotal <= 108) {
    const secondHalfMin = 45 + (elapsedTotal - 63);
    const min = Math.min(90, Math.max(46, secondHalfMin));
    return { minuteText: `${min}'`, isLive: true, isHalftime: false, isFinished: false, liveMinuteNumber: min };
  }

  // 2nd Half Stoppage Time: 109 to 115 mins
  if (elapsedTotal <= 115) {
    return { minuteText: "90+'", isLive: true, isHalftime: false, isFinished: false, liveMinuteNumber: 90 };
  }

  // Match expired past 115 mins -> Finished (FT)
  return { minuteText: 'FT', isLive: false, isHalftime: false, isFinished: true, liveMinuteNumber: 90 };
}
