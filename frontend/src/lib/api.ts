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
    throw new Error(errorData.detail || `HTTP Error ${res.status}`);
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

export async function fetchMe() {
  return fetchApi<User>('/api/auth/me');
}

// Matches API
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

// Chatbot API
export async function sendChatMessage(message: string, history: ChatMessage[] = []): Promise<ChatResponse> {
  return fetchApi<ChatResponse>('/api/chat/', {
    method: 'POST',
    body: JSON.stringify({ message, history }),
  });
}
