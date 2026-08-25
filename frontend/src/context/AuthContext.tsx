'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  loading: true,
  personalization: { favoriteTeamIds: [], followedLeagueIds: [], savedMatchIds: [] },
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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [personalization, setPersonalization] = useState<PersonalizationState>({
    favoriteTeamIds: [],
    followedLeagueIds: [],
    savedMatchIds: [],
  });

  const loadPersonalization = useCallback(async () => {
    try {
      const data = await fetchUserPersonalization();
      setPersonalization({
        favoriteTeamIds: data.favorite_team_ids || [],
        followedLeagueIds: data.followed_league_ids || [],
        savedMatchIds: data.saved_match_ids || [],
      });
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      setToken(savedToken);
      fetchMe()
        .then((userData) => {
          setUser(userData);
          loadPersonalization();
        })
        .catch(() => {
          localStorage.removeItem('token');
          setToken(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [loadPersonalization]);

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(newUser);
    loadPersonalization();
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setPersonalization({ favoriteTeamIds: [], followedLeagueIds: [], savedMatchIds: [] });
  };

  const refreshUser = async () => {
    if (token) {
      try {
        const userData = await fetchMe();
        setUser(userData);
        await loadPersonalization();
      } catch (err) {
        console.error('Failed to refresh user', err);
      }
    }
  };

  const toggleFavoriteTeam = async (teamId: number) => {
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
  };

  const toggleFollowedLeague = async (leagueId: number) => {
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
  };

  const toggleSavedPrediction = async (matchId: number) => {
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
  };

  const isFavoriteTeam = (teamId: number) => personalization.favoriteTeamIds.includes(teamId);
  const isFollowedLeague = (leagueId: number) => personalization.followedLeagueIds.includes(leagueId);
  const isSavedPrediction = (matchId: number) => personalization.savedMatchIds.includes(matchId);

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
