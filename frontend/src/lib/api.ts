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

export async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      ...getHeaders(),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: 'An error occurred' }));
    let message = 'An error occurred';
    if (typeof errorData.detail === 'string') {
      message = errorData.detail;
    } else if (Array.isArray(errorData.detail)) {
      message = errorData.detail.map((e: any) => e.msg || e.message || JSON.stringify(e)).join(', ');
    } else if (errorData.message) {
      message = typeof errorData.message === 'string' ? errorData.message : JSON.stringify(errorData.message);
    } else {
      message = `HTTP Error ${res.status}`;
    }
    throw new Error(message);
  }

  return res.json();
}

// Auth API
export async function loginUser(credentials: FormData) {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    body: credentials,
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: 'Login failed' }));
    throw new Error(error.detail || 'Login failed');
  }
  return res.json();
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
  predicted_outcome: string;
  predicted_home_score?: number;
  predicted_away_score?: number;
  predicted_btts?: string;
  predicted_over25?: string;
  predicted_dc?: string;
}) {
  return fetchApi<Prediction>('/api/predictions/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function fetchMyPredictions() {
  return fetchApi<Prediction[]>('/api/predictions/my');
}

export async function fetchMyPredictionForMatch(matchId: number) {
  return fetchApi<Prediction>(`/api/predictions/match/${matchId}`).catch(() => null);
}

export async function deletePrediction(id: number) {
  return fetchApi<{ detail: string }>(`/api/predictions/${id}`, {
    method: 'DELETE',
  });
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
