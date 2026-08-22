export interface User {
  id: number;
  username: string;
  email: string;
  avatar: string;
  is_admin: boolean;
  total_points: number;
  total_predictions: number;
  correct_results: number;
  correct_scores: number;
  accuracy: number;
  created_at: string;
}

export interface League {
  id: number;
  code: string;
  name: string;
  country: string;
  flag: string;
  emblem: string;
  current_season: string;
  is_active: boolean;
}

export interface Team {
  id: number;
  external_id: number;
  name: string;
  short_name: string;
  tla: string;
  crest: string;
  elo_rating: number;
}

export interface Match {
  id: number;
  external_id?: number;
  league: League;
  home_team: Team;
  away_team: Team;
  matchday?: number;
  status: string;
  utc_date: string;
  home_score?: number;
  away_score?: number;
  home_score_ht?: number;
  away_score_ht?: number;
  winner?: string;
  ai_home_prob?: number;
  ai_draw_prob?: number;
  ai_away_prob?: number;
  ai_predicted_home?: number;
  ai_predicted_away?: number;
  ai_confidence?: number;
  prediction_description?: string;
  odds_home?: number;
  odds_draw?: number;
  odds_away?: number;
  odds_over25?: number;
  odds_under25?: number;
  odds_btts_yes?: number;
  odds_btts_no?: number;
  odds_dc_1x?: number;
  odds_dc_x2?: number;
  odds_dc_12?: number;
  live_minute?: number | null;
  season: string;
}

export interface Prediction {
  id: number;
  match_id: number;
  match: Match;
  predicted_outcome: 'HOME_TEAM' | 'DRAW' | 'AWAY_TEAM';
  predicted_home_score?: number;
  predicted_away_score?: number;
  predicted_btts?: 'yes' | 'no';
  predicted_over25?: 'over' | 'under';
  predicted_dc?: '1x' | 'x2' | '12';
  is_scored: boolean;
  outcome_correct?: boolean;
  score_correct?: boolean;
  btts_correct?: boolean;
  over25_correct?: boolean;
  dc_correct?: boolean;
  points_earned: number;
  points_awarded?: number;
  created_at: string;
}

export interface LeaderboardEntry {
  rank: number;
  id: number;
  username: string;
  avatar: string;
  total_points: number;
  total_predictions: number;
  correct_results: number;
  correct_scores: number;
  accuracy: number;
}

export interface StandingTeam {
  id: number;
  name: string;
  crest: string;
}

export interface StandingTableItem {
  position: number;
  team: StandingTeam;
  playedGames: number;
  won: number;
  draw: number;
  lost: number;
  points: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
}

export interface AdminStats {
  total_users: number;
  total_matches: number;
  total_predictions: number;
  scheduled_matches: number;
  finished_matches: number;
  live_matches: number;
  leagues: number;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatResponse {
  reply: string;
  suggestions?: string[];
}
