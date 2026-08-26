'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { User } from '@/lib/types';
import {
  fetchMe,
  fetchUserPersonalization,
  toggleFavoriteTeam as apiToggleFavoriteTeam,
  toggleFollowedLeague as apiToggleFollowedLeague,
  toggleSavedPrediction as apiToggleSavedPrediction,
} from '@/lib/api';

interface PersonalizationState {
  favoriteTeamIds: number[];
  followedLeagueIds: number[];
  savedMatchIds: number[];
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  personalization: PersonalizationState;
  login: (token: string, user: User) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
  toggleFavoriteTeam: (teamId: number) => Promise<boolean>;
  toggleFollowedLeague: (leagueId: number) => Promise<boolean>;
  toggleSavedPrediction: (matchId: number) => Promise<boolean>;
  isFavoriteTeam: (teamId: number) => boolean;
  isFollowedLeague: (leagueId: number) => boolean;
  isSavedPrediction: (matchId: number) => boolean;
}

const EMPTY_PERSONALIZATION: PersonalizationState = {
  favoriteTeamIds: [],
  followedLeagueIds: [],
  savedMatchIds: [],
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  loading: true,
  personalization: EMPTY_PERSONALIZATION,
  login: () => {},
  logout: () => {},
  refreshUser: async () => {},
  toggleFavoriteTeam: async () => false,
  toggleFollowedLeague: async () => false,
  toggleSavedPrediction: async () => false,
  isFavoriteTeam: () => false,
  isFollowedLeague: () => false,
  isSavedPrediction: () => false,
});

/**
 * Try to read cached user from localStorage synchronously.
 * This lets us render the UI immediately without waiting for fetchMe().
 */
function readCachedUser(): User | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('cached_user');
    if (raw) return JSON.parse(raw) as User;
  } catch {
    // ignore parse errors
  }
  return null;
}

function writeCachedUser(user: User | null) {
  if (typeof window === 'undefined') return;
  try {
    if (user) localStorage.setItem('cached_user', JSON.stringify(user));
    else localStorage.removeItem('cached_user');
  } catch {}
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // ── Optimistic init: read cached user + token from localStorage SYNCHRONOUSLY
  // so the app renders instantly without waiting for an API call.
  const [token, setToken] = useState<string | null>(
    typeof window !== 'undefined' ? localStorage.getItem('token') : null
  );
  const [user, setUser] = useState<User | null>(
    typeof window !== 'undefined' ? readCachedUser() : null
  );
  // loading=true only while we're still verifying the token in the background.
  // If there's no token at all, we skip verification → loading=false immediately.
  const [loading, setLoading] = useState<boolean>(
    typeof window !== 'undefined' ? !!localStorage.getItem('token') : false
  );
  const [personalization, setPersonalization] = useState<PersonalizationState>(EMPTY_PERSONALIZATION);
  const verifyingRef = useRef(false);

  const loadPersonalization = useCallback(async () => {
    try {
      const data = await fetchUserPersonalization();
      setPersonalization({
        favoriteTeamIds: data.favorite_team_ids || [],
        followedLeagueIds: data.followed_league_ids || [],
        savedMatchIds: data.saved_match_ids || [],
      });
    } catch {
      // ignore — personalization is optional UI enhancement
    }
  }, []);

  useEffect(() => {
    const savedToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!savedToken) {
      setLoading(false);
      return;
    }

    // Prevent double verification (React 18 StrictMode runs effects twice in dev)
    if (verifyingRef.current) return;
    verifyingRef.current = true;

    // Background verification — does NOT block initial render.
    // The cached user is already shown optimistically above.
    fetchMe()
      .then((freshUser) => {
        setUser(freshUser);
        writeCachedUser(freshUser);   // keep cache fresh for next visit
        // Load personalization in parallel, don't await it
        loadPersonalization();
      })
      .catch(() => {
        // Token is invalid or expired — clear everything
        localStorage.removeItem('token');
        writeCachedUser(null);
        setToken(null);
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
        verifyingRef.current = false;
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = useCallback((newToken: string, newUser: User) => {
    localStorage.setItem('token', newToken);
    writeCachedUser(newUser);   // cache immediately for next visit
    setToken(newToken);
    setUser(newUser);
    // Load personalization in background — don't block navigation
    loadPersonalization();
  }, [loadPersonalization]);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    writeCachedUser(null);
    setToken(null);
    setUser(null);
    setPersonalization(EMPTY_PERSONALIZATION);
  }, []);

  const refreshUser = useCallback(async () => {
    if (!token) return;
    try {
      const userData = await fetchMe();
      setUser(userData);
      writeCachedUser(userData);
      await loadPersonalization();
    } catch (err) {
      console.error('Failed to refresh user', err);
    }
  }, [token, loadPersonalization]);

  const toggleFavoriteTeam = useCallback(async (teamId: number) => {
    if (!token) return false;
    try {
      const res = await apiToggleFavoriteTeam(teamId);
      setPersonalization((prev) => ({
        ...prev,
        favoriteTeamIds: res.is_favorite
          ? [...prev.favoriteTeamIds, teamId]
          : prev.favoriteTeamIds.filter((id) => id !== teamId),
      }));
      return res.is_favorite;
    } catch {
      return false;
    }
  }, [token]);

  const toggleFollowedLeague = useCallback(async (leagueId: number) => {
    if (!token) return false;
    try {
      const res = await apiToggleFollowedLeague(leagueId);
      setPersonalization((prev) => ({
        ...prev,
        followedLeagueIds: res.is_followed
          ? [...prev.followedLeagueIds, leagueId]
          : prev.followedLeagueIds.filter((id) => id !== leagueId),
      }));
      return res.is_followed;
    } catch {
      return false;
    }
  }, [token]);

  const toggleSavedPrediction = useCallback(async (matchId: number) => {
    if (!token) return false;
    try {
      const res = await apiToggleSavedPrediction(matchId);
      setPersonalization((prev) => ({
        ...prev,
        savedMatchIds: res.is_saved
          ? [...prev.savedMatchIds, matchId]
          : prev.savedMatchIds.filter((id) => id !== matchId),
      }));
      return res.is_saved;
    } catch {
      return false;
    }
  }, [token]);

  const isFavoriteTeam = useCallback((teamId: number) => personalization.favoriteTeamIds.includes(teamId), [personalization.favoriteTeamIds]);
  const isFollowedLeague = useCallback((leagueId: number) => personalization.followedLeagueIds.includes(leagueId), [personalization.followedLeagueIds]);
  const isSavedPrediction = useCallback((matchId: number) => personalization.savedMatchIds.includes(matchId), [personalization.savedMatchIds]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        personalization,
        login,
        logout,
        refreshUser,
        toggleFavoriteTeam,
        toggleFollowedLeague,
        toggleSavedPrediction,
        isFavoriteTeam,
        isFollowedLeague,
        isSavedPrediction,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
