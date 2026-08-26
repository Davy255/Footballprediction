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

/**
 * Resilient API fetcher with automatic cold-start retry and normalized errors.
 */
export async function fetchApi<T>(endpoint: string, options: RequestInit = {}, retries = 2): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  let lastError: any = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000); // 20s timeout per attempt

      const res = await fetch(url, {
        ...options,
        signal: options.signal || controller.signal,
        headers: {
          ...getHeaders(),
          ...options.headers,
        },
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

      return await res.json();
    } catch (err: any) {
      lastError = err;
      // Do not retry on client auth errors (401, 403, 400, 422)
      if (err.message && (err.message.includes('Incorrect') || err.message.includes('HTTP Error 4') || err.message.includes('taken') || err.message.includes('registered'))) {
        throw err;
      }
      if (attempt < retries) {
        // Wait 1.5s before retrying (gives backend time to wake up)
        await new Promise((resolve) => setTimeout(resolve, 1500));
      }
    }
  }

  // If all attempts failed
  const friendlyMsg =
    lastError?.name === 'AbortError' || lastError?.message?.includes('fetch')
      ? 'Unable to reach the football server. Please check your connection and try again.'
      : lastError?.message || 'Server is temporarily unavailable. Please try again.';
  throw new Error(friendlyMsg);
}

// Auth API
export async function loginUser(credentials: FormData | Record<string, string> | URLSearchParams, retries = 1) {
  let body: any;
  let headers: Record<string, string> = {};

  if (credentials instanceof FormData) {
    // Convert FormData to JSON for universal mobile compatibility
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

  return fetchApi<{ access_token: string; token_type: string; user: User }>('/api/auth/login', {
    method: 'POST',
    body,
    headers,
  }, retries);
}

export async function registerUser(userData: { username: string; email: string; password: string }) {
  return fetchApi<{ access_token: string; token_type: string; user: User }>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
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

// Matches API
export async function fetchMatchesFeed() {
  return fetchApi<{ matches: Match[]; leagues: League[]; total: number }>('/api/matches/feed');
}

export async function fetchMatches(params?: { league_code?: string; status?: string; date?: string; limit?: number }) {
  const query = new URLSearchParams();
  if (params?.league_code) query.append('league_code', params.league_code);
  if (params?.status) query.append('status', params.status);
  if (params?.date) query.append('date', params.date);
  if (params?.limit) query.append('limit', params.limit.toString());
  return fetchApi<Match[]>(`/api/matches/?${query.toString()}`);
}

export async function fetchTodayMatches() {
  return fetchApi<Match[]>('/api/matches/today');
}

export async function fetchLiveMatches() {
  return fetchApi<Match[]>('/api/matches/live');
}

export async function fetchUpcomingMatches(days = 7) {
  return fetchApi<Match[]>(`/api/matches/upcoming?days=${days}`);
}

export async function fetchMatch(id: number) {
  return fetchApi<Match>(`/api/matches/${id}`);
}

// Predictions API
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
  }>('/api/predictions/accuracy');
}

// Leagues API
export async function fetchLeagues() {
  return fetchApi<League[]>('/api/leagues/');
}

export async function fetchLeagueStandings(code: string) {
  return fetchApi<any>(`/api/leagues/${code}/standings`);
}

// Leaderboard API
export async function fetchLeaderboard(limit = 50) {
  return fetchApi<LeaderboardEntry[]>(`/api/leaderboard/?limit=${limit}`);
}

export async function fetchMyRank() {
  return fetchApi<{ rank: number | null; total_users: number; total_points: number; accuracy: number }>('/api/leaderboard/me');
}

// Admin API
export async function fetchAdminStats() {
  return fetchApi<AdminStats>('/api/admin/stats');
}

export async function triggerAdminSync() {
  return fetchApi<{ detail: string }>('/api/admin/sync', { method: 'POST' });
}

export async function triggerAdminOddsSync() {
  return fetchApi<{ detail: string }>('/api/admin/sync-odds', { method: 'POST' });
}

export async function triggerAdminScoring() {
  return fetchApi<{ detail: string }>('/api/admin/score-predictions', { method: 'POST' });
}

export async function testSendAdminEmail(to_email: string, email_type: string = 'welcome') {
  return fetchApi<{ success: boolean; recipient: string; email_type: string; mode: string; message: string }>('/api/admin/test-email', {
    method: 'POST',
    body: JSON.stringify({ to_email, email_type }),
  });
}

export async function triggerAdminDailyReminders() {
  return fetchApi<{ detail: string }>('/api/admin/trigger-daily-reminders', { method: 'POST' });
}

// Chatbot API
export async function sendChatMessage(message: string, history: ChatMessage[] = []): Promise<ChatResponse> {
  return fetchApi<ChatResponse>('/api/chat/', {
    method: 'POST',
    body: JSON.stringify({ message, history }),
  });
}

// User Personalization & Dashboard APIs
export async function fetchUserPersonalization() {
  return fetchApi<{
    favorite_team_ids: number[];
    followed_league_ids: number[];
    saved_match_ids: number[];
    notification_preferences: {
      match_reminders: boolean;
      prediction_alerts: boolean;
      live_alerts: boolean;
      final_results: boolean;
      favorite_team_alerts: boolean;
    };
  }>('/api/user/personalization');
}

export async function toggleFavoriteTeam(teamId: number) {
  return fetchApi<{ status: string; team_id: number; is_favorite: boolean }>(`/api/user/favorite-team/${teamId}`, {
    method: 'POST',
  });
}

export async function toggleFollowedLeague(leagueId: number) {
  return fetchApi<{ status: string; league_id: number; is_followed: boolean }>(`/api/user/followed-league/${leagueId}`, {
    method: 'POST',
  });
}

export async function toggleSavedPrediction(matchId: number) {
  return fetchApi<{ status: string; match_id: number; is_saved: boolean }>(`/api/user/saved-prediction/${matchId}`, {
    method: 'POST',
  });
}

export async function updateNotificationPreferences(preferences: Record<string, boolean>) {
  return fetchApi<{ status: string; notification_preferences: any }>('/api/user/notifications', {
    method: 'PUT',
    body: JSON.stringify(preferences),
  });
}

export async function fetchUserDashboard() {
  return fetchApi<{
    user: User;
    followed_teams: Array<{ id: number; name: string; short_name: string; crest: string; elo_rating: number; next_match?: Match | null }>;
    followed_leagues: League[];
    saved_matches: Match[];
    recent_predictions: Prediction[];
  }>('/api/user/dashboard');
}

export async function fetchUserNotifications() {
  return fetchApi<{
    unread_count: number;
    notifications: Array<{
      id: number;
      notification_type: string;
      title: string;
      message: string;
      link?: string | null;
      is_read: boolean;
      channel: string;
      created_at: string;
    }>;
  }>('/api/user/notifications/list');
}

export async function markNotificationsAsRead(id?: number) {
  return fetchApi<{ status: string }>('/api/user/notifications/mark-read', {
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
  }>(`/api/matches/search?q=${encodeURIComponent(query.trim())}`);
}

// ══════════════════════════════════════════════
// Phase 1 Monetization — Subscription APIs
// ══════════════════════════════════════════════

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

/**
 * Fetch the current user's subscription status.
 * Returns is_premium=false for unauthenticated users (throws 401 which caller should handle).
 */
export async function fetchSubscription(): Promise<SubscriptionStatus> {
  return fetchApi<SubscriptionStatus>('/api/subscription');
}

/**
 * Fetch all available plans from the server.
 * Plan prices come from server config — never trusted from client.
 */
export async function fetchPlans(): Promise<{ plans: PlanApiResponse[] }> {
  return fetchApi<{ plans: PlanApiResponse[] }>('/api/plans', {}, 1);
}

/**
 * Fetch the current user's payment transaction history (paginated).
 */
export async function fetchPaymentHistory(page = 1, perPage = 20): Promise<PaymentHistory> {
  return fetchApi<PaymentHistory>(`/api/payment/history?page=${page}&per_page=${perPage}`);
}
