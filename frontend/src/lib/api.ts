import { User, Match, Prediction, League, LeaderboardEntry, AdminStats, ChatMessage, ChatResponse } from './types';

const RAW_API = process.env.NEXT_PUBLIC_API_URL || 'https://football-prediction-api-mmet.onrender.com';
const API_BASE = RAW_API.replace(/\/+$/, '');

function getHeaders(token?: string | null) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const authToken = token || (typeof window !== 'undefined' ? localStorage.getItem('token') : null);
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }
  return headers;
}

// ──────────────────────────────────────────────────────────────
// High-Speed In-Memory Cache & Request Deduplication
// ──────────────────────────────────────────────────────────────
interface CacheEntry {
  timestamp: number;
  ttl: number;
  data: any;
}

const _memoryCache = new Map<string, CacheEntry>();
const _inFlightRequests = new Map<string, Promise<any>>();

function getCached<T>(key: string): T | null {
  const entry = _memoryCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > entry.ttl) {
    _memoryCache.delete(key);
    return null;
  }
  return entry.data as T;
}

function setCache<T>(key: string, data: T, ttlMs = 45000): void {
  _memoryCache.set(key, {
    timestamp: Date.now(),
    ttl: ttlMs,
    data,
  });
}

/**
 * Resilient API fetcher with automatic cold-start tolerance,
 * request deduplication, and normalized errors.
 */
export async function fetchApi<T>(
  endpoint: string,
  options: RequestInit & { cacheTtlMs?: number; nextOptions?: { revalidate?: number; tags?: string[] } } = {},
  retries = 1
): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const isGet = !options.method || options.method.toUpperCase() === 'GET';
  const cacheKey = `${endpoint}_${typeof window !== 'undefined' ? localStorage.getItem('token') || 'anon' : 'server'}`;

  // 1. Check memory cache for GET requests
  if (isGet && options.cacheTtlMs && options.cacheTtlMs > 0) {
    const cached = getCached<T>(cacheKey);
    if (cached !== null) {
      return cached;
    }
  }

  // 2. Request deduplication: if the exact same GET is already in flight, share the promise
  if (isGet && _inFlightRequests.has(cacheKey)) {
    return _inFlightRequests.get(cacheKey)!;
  }

  const doFetch = async (): Promise<T> => {
    let lastError: any = null;
    const { cacheTtlMs, nextOptions, ...fetchOptions } = options as any;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const controller = new AbortController();
        // 25s timeout per attempt: comfortably accommodates Render free tier cold-starts
        const timeoutId = setTimeout(() => controller.abort(), 25000);

        const res = await fetch(url, {
          ...fetchOptions,
          signal: fetchOptions.signal || controller.signal,
          headers: {
            ...getHeaders(),
            ...fetchOptions.headers,
          },
          ...(nextOptions ? { next: nextOptions } : (isGet ? { next: { revalidate: 60 } } : {})),
        });

        clearTimeout(timeoutId);

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({ detail: 'An error occurred' }));
          let message = 'An error occurred';
          if (typeof errorData.detail === 'string') {
            message = errorData.detail;
          } else if (Array.isArray(errorData.detail)) {
            message = errorData.detail.map((e: any) => e.msg || e.message || JSON.stringify(e)).join(', ');
          } else if (errorData.message) {
            message = typeof errorData.message === 'string' ? errorData.message : JSON.stringify(errorData.message);
          } else if (res.status === 401) {
            message = 'Incorrect email/username or password';
          } else if (res.status === 404) {
            message = 'Resource not found';
          } else {
            message = `HTTP Error ${res.status}`;
          }
          throw new Error(message);
        }

        const data = await res.json();

        // Save to memory cache if TTL provided
        if (isGet && cacheTtlMs && cacheTtlMs > 0) {
          setCache(cacheKey, data, cacheTtlMs);
        }

        return data;
      } catch (err: any) {
        lastError = err;
        // Do not retry on client auth errors (401, 403, 400, 422)
        if (
          err.message &&
          (err.message.includes('Incorrect') ||
            err.message.includes('HTTP Error 4') ||
            err.message.includes('taken') ||
            err.message.includes('registered'))
        ) {
          throw err;
        }
        if (attempt < retries) {
          // 1s backoff for backend wakeup
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }
    }

    const friendlyMsg =
      lastError?.name === 'AbortError' || lastError?.message?.includes('fetch')
        ? 'Unable to reach the football server. Please check your connection and try again.'
        : lastError?.message || 'Server is temporarily unavailable. Please try again.';
    throw new Error(friendlyMsg);
  };

  if (isGet) {
    const promise = doFetch().finally(() => {
      _inFlightRequests.delete(cacheKey);
    });
    _inFlightRequests.set(cacheKey, promise);
    return promise;
  }

  return doFetch();
}

// ──────────────────────────────────────────────────────────────
// Auth API
// ──────────────────────────────────────────────────────────────
export async function loginUser(credentials: FormData | Record<string, string> | URLSearchParams) {
  let body: any;
  let headers: Record<string, string> = {};

  if (credentials instanceof FormData) {
    const obj: Record<string, string> = {};
    credentials.forEach((value, key) => {
      obj[key] = value.toString();
    });
    body = JSON.stringify(obj);
    headers['Content-Type'] = 'application/json';
  } else if (credentials instanceof URLSearchParams) {
    body = credentials.toString();
    headers['Content-Type'] = 'application/x-www-form-urlencoded';
  } else if (typeof credentials === 'object') {
    body = JSON.stringify(credentials);
    headers['Content-Type'] = 'application/json';
  }

  // 1 retry with 25s timeout ensures reliable login even during server cold start
  return fetchApi<{ access_token: string; token_type: string; user: User }>('/api/auth/login', {
    method: 'POST',
    body,
    headers,
  }, 1);
}

export async function registerUser(userData: { username: string; email: string; password: string }) {
  return fetchApi<{ access_token: string; token_type: string; user: User }>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  }, 1);
}

export async function loginWithGoogle(payload: { token: string; email?: string; name?: string; picture?: string }) {
  return fetchApi<{ access_token: string; token_type: string; user: User }>('/api/auth/google', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function forgotPassword(email: string) {
  return fetchApi<{ detail: string; reset_token?: string | null }>('/api/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export async function resetPassword(payload: { token: string; new_password: string }) {
  return fetchApi<{ detail: string }>('/api/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function fetchMe() {
  return fetchApi<User>('/api/auth/me');
}

// ──────────────────────────────────────────────────────────────
// Matches API (High-Speed Cached)
// ──────────────────────────────────────────────────────────────

/**
 * Unified high-speed matches feed with responsive memory cache and request deduplication.
 */
export async function fetchMatchesFeed() {
  return fetchApi<{ matches: Match[]; leagues: League[]; total: number }>(
    '/api/matches/feed',
    { cacheTtlMs: 10000, nextOptions: { revalidate: 15 } },
    1
  );
}

export async function fetchMatches(params?: { league_code?: string; status?: string; date?: string; limit?: number }) {
  const query = new URLSearchParams();
  if (params?.league_code) query.append('league_code', params.league_code);
  if (params?.status) query.append('status', params.status);
  if (params?.date) query.append('date', params.date);
  if (params?.limit) query.append('limit', params.limit.toString());
  return fetchApi<Match[]>(`/api/matches/?${query.toString()}`, { cacheTtlMs: 10000 });
}

export async function fetchTodayMatches() {
  return fetchApi<Match[]>('/api/matches/today', { cacheTtlMs: 8000 });
}

export async function fetchLiveMatches() {
  // Live matches should always fetch fresh real-time scores without client memory caching
  return fetchApi<Match[]>('/api/matches/live', {}, 1);
}

export async function fetchUpcomingMatches(days = 7) {
  return fetchApi<Match[]>(`/api/matches/upcoming?days=${days}`, { cacheTtlMs: 15000 });
}

/**
 * Fetch yesterday's completed matches (FINISHED/AWARDED) with 30s cache.
 */
export async function fetchYesterdayMatches() {
  return fetchApi<Match[]>('/api/matches/yesterday', { cacheTtlMs: 30000 }, 1);
}

/**
 * Fetch a single match by ID with 15s memory cache.
 */
export async function fetchMatch(id: number) {
  return fetchApi<Match>(`/api/matches/${id}`, { cacheTtlMs: 15000, nextOptions: { revalidate: 15 } });
}

// ──────────────────────────────────────────────────────────────
// Predictions API
// ──────────────────────────────────────────────────────────────
export async function submitPrediction(data: {
  match_id: number;
  predicted_home_score: number;
  predicted_away_score: number;
}) {
  return fetchApi<Prediction>('/api/predictions/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function fetchMyPredictions(statusFilter?: string) {
  const endpoint = statusFilter ? `/api/predictions/me?status_filter=${statusFilter}` : '/api/predictions/me';
  return fetchApi<Prediction[]>(endpoint);
}

export async function fetchMatchPredictions(matchId: number) {
  return fetchApi<Prediction[]>(`/api/predictions/match/${matchId}`);
}

export async function deletePrediction(id: number) {
  return fetchApi<{ detail: string }>(`/api/predictions/${id}`, {
    method: 'DELETE',
  });
}

export async function fetchMyPredictionForMatch(matchId: number) {
  return fetchApi<Prediction | null>(`/api/predictions/my/${matchId}`).catch(() => null);
}

export async function fetchPredictionStats() {
  return fetchApi<{
    total: number;
    pending: number;
    scored: number;
    accuracy_percentage: number;
    exact_score_accuracy: number;
    current_streak: number;
    best_streak: number;
    distribution: { home_win: number; draw: number; away_win: number };
    recent_trend: Array<{ date: string; accuracy: number; total: number }>;
  }>('/api/predictions/accuracy', { cacheTtlMs: 30000 });
}

// ──────────────────────────────────────────────────────────────
// Leagues API
// ──────────────────────────────────────────────────────────────
export async function fetchLeagues() {
  return fetchApi<League[]>('/api/leagues/', { cacheTtlMs: 300000, nextOptions: { revalidate: 300 } });
}

export async function fetchLeagueStandings(code: string) {
  return fetchApi<any>(`/api/leagues/${code}/standings`, { cacheTtlMs: 300000, nextOptions: { revalidate: 300 } });
}

// ──────────────────────────────────────────────────────────────
// Leaderboard API
// ──────────────────────────────────────────────────────────────
export async function fetchLeaderboard(limit = 50) {
  return fetchApi<LeaderboardEntry[]>(`/api/leaderboard/?limit=${limit}`, { cacheTtlMs: 60000 });
}

export async function fetchMyRank() {
  return fetchApi<{ rank: number | null; total_users: number; total_points: number; accuracy: number }>('/api/leaderboard/me');
}

// ──────────────────────────────────────────────────────────────
// Admin API
// ──────────────────────────────────────────────────────────────
export async function fetchAdminStats() {
  return fetchApi<AdminStats>('/api/admin/stats');
}

export async function triggerManualSync(endpoint: string) {
  return fetchApi<{ status: string; message?: string }>(`/api/admin/sync/${endpoint}`, {
    method: 'POST',
  });
}

export async function triggerAdminSync() {
  return triggerManualSync('all');
}

export async function triggerAdminOddsSync() {
  return triggerManualSync('odds');
}

export async function triggerAdminScoring() {
  return triggerManualSync('score');
}

export async function testSendAdminEmail(recipient: string) {
  return fetchApi<{ status: string; message: string }>('/api/admin/test-email', {
    method: 'POST',
    body: JSON.stringify({ recipient }),
  });
}

export async function triggerAdminDailyReminders() {
  return fetchApi<{ status: string; message: string }>('/api/admin/trigger-daily-reminders', {
    method: 'POST',
  });
}

export async function fetchAdminUsers(page = 1, perPage = 50) {
  return fetchApi<{ users: User[]; total: number; page: number; per_page: number }>(
    `/api/admin/users?page=${page}&per_page=${perPage}`
  );
}

export async function updateAdminUserStatus(userId: number, updates: { is_active?: boolean; is_admin?: boolean; is_vip?: boolean }) {
  return fetchApi<User>(`/api/admin/users/${userId}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });
}

// ──────────────────────────────────────────────────────────────
// Chat API (Coach AI)
// ──────────────────────────────────────────────────────────────
export async function sendChatMessage(messages: ChatMessage[], matchContext?: Match): Promise<ChatResponse> {
  return fetchApi<ChatResponse>('/api/chat/message', {
    method: 'POST',
    body: JSON.stringify({
      messages,
      match_context: matchContext || null,
    }),
  });
}

export async function fetchChatSuggestions(matchContext?: Match): Promise<{ suggestions: string[] }> {
  return fetchApi<{ suggestions: string[] }>('/api/chat/suggestions', {
    method: 'POST',
    body: JSON.stringify({
      match_context: matchContext || null,
    }),
  });
}

// ──────────────────────────────────────────────────────────────
// Personalization API
// ──────────────────────────────────────────────────────────────
export async function fetchUserPersonalization() {
  return fetchApi<{
    favorite_team_ids: number[];
    followed_league_ids: number[];
    saved_match_ids: number[];
  }>('/api/user/personalization', { cacheTtlMs: 30000 });
}

export async function toggleFavoriteTeam(teamId: number) {
  return fetchApi<{ status: string; is_favorite: boolean }>(`/api/user/favorite-teams/${teamId}`, {
    method: 'POST',
  });
}

export async function toggleFollowedLeague(leagueId: number) {
  return fetchApi<{ status: string; is_followed: boolean }>(`/api/user/followed-leagues/${leagueId}`, {
    method: 'POST',
  });
}

export async function toggleSavedPrediction(matchId: number) {
  return fetchApi<{ status: string; is_saved: boolean }>(`/api/user/saved-predictions/${matchId}`, {
    method: 'POST',
  });
}

export async function fetchUserDashboard() {
  return fetchApi<{
    user: any;
    followed_teams: Array<{ id: number; name: string; short_name: string; crest: string; elo_rating: number; next_match?: Match | null }>;
    followed_leagues: League[];
    saved_matches: Match[];
    recent_predictions: Prediction[];
  }>('/api/user/dashboard');
}

export async function fetchNotificationPreferences() {
  return fetchApi<{
    match_reminders: boolean;
    prediction_alerts: boolean;
    live_alerts: boolean;
    final_results: boolean;
    favorite_team_alerts: boolean;
  }>('/api/user/notification-preferences');
}

export async function updateNotificationPreferences(prefs: {
  match_reminders?: boolean;
  prediction_alerts?: boolean;
  live_alerts?: boolean;
  final_results?: boolean;
  favorite_team_alerts?: boolean;
}) {
  return fetchApi('/api/user/notification-preferences', {
    method: 'PUT',
    body: JSON.stringify(prefs),
  });
}

export async function fetchUserNotifications(unreadOnly = false) {
  return fetchApi<Array<{
    id: number;
    notification_type: string;
    title: string;
    message: string;
    link?: string;
    is_read: boolean;
    channel: string;
    created_at: string;
    match?: Match;
  }>>(`/api/user/notifications?unread_only=${unreadOnly}`);
}

export async function markNotificationAsRead(id?: number) {
  return fetchApi<{ status: string }>('/api/user/notifications/read', {
    method: 'POST',
    body: JSON.stringify(id ? { id } : {}),
  });
}

export async function clearUserNotifications() {
  return fetchApi<{ status: string }>('/api/user/notifications/clear', {
    method: 'POST',
  });
}

export async function searchFootballEntities(query: string) {
  if (!query || query.trim().length < 2) {
    return { query, teams: [], leagues: [], matches: [] };
  }
  return fetchApi<{
    query: string;
    teams: Array<{ id: number; name: string; short_name: string; crest: string; elo_rating: number }>;
    leagues: Array<{ id: number; name: string; code: string; country: string; flag: string }>;
    matches: Match[];
  }>(`/api/matches/search?q=${encodeURIComponent(query.trim())}`, { cacheTtlMs: 30000 });
}

// ──────────────────────────────────────────────────────────────
// Phase 1 Monetization — Subscription APIs
// ──────────────────────────────────────────────────────────────

export interface SubscriptionStatus {
  plan: string;
  plan_name: string;
  status: string;
  is_premium: boolean;
  start_date: string | null;
  end_date: string | null;
  source: string;
}

export interface PlanApiResponse {
  id: string;
  name: string;
  badge: string;
  price_kes: number;
  currency: string;
  duration_days: number | null;
  is_premium: boolean;
  is_popular: boolean;
  savings_label: string | null;
  description: string;
  features: string[];
}

export interface PaymentTransaction {
  id: number;
  plan_id: string;
  amount_kes: number;
  currency: string;
  status: string;
  provider: string;
  provider_reference: string | null;
  created_at: string | null;
}

export interface PaymentHistory {
  page: number;
  per_page: number;
  total: number;
  transactions: PaymentTransaction[];
}

export async function fetchSubscription(): Promise<SubscriptionStatus> {
  return fetchApi<SubscriptionStatus>('/api/subscription');
}

export async function fetchPlans(): Promise<{ plans: PlanApiResponse[] }> {
  return fetchApi<{ plans: PlanApiResponse[] }>('/api/plans', { cacheTtlMs: 300000, nextOptions: { revalidate: 300 } }, 1);
}

export async function fetchPaymentHistory(page = 1, perPage = 20): Promise<PaymentHistory> {
  return fetchApi<PaymentHistory>(`/api/payment/history?page=${page}&per_page=${perPage}`);
}
