/**
 * FootballPredict Privacy-Conscious Analytics Engine
 *
 * Dispatches standard web analytics events (Google Analytics 4 / Google Tag Manager / Custom)
 * for conversion funnels and search discovery tracking without exposing sensitive user information.
 */

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID || '';

/**
 * Dispatches custom analytics event
 */
export function trackEvent(eventName: string, params: Record<string, any> = {}) {
  if (typeof window === 'undefined') return;

  // Never track passwords, tokens, or emails
  const cleanParams: Record<string, any> = {};
  for (const [k, v] of Object.entries(params)) {
    if (!['password', 'token', 'access_token', 'authorization', 'email'].includes(k.toLowerCase())) {
      cleanParams[k] = v;
    }
  }

  // Google Analytics 4 Dispatch
  if (typeof window.gtag === 'function') {
    window.gtag('event', eventName, cleanParams);
  }

  // Debugging log in development
  if (process.env.NODE_ENV === 'development') {
    // console.log(`[Analytics Event] ${eventName}:`, cleanParams);
  }
}

export function trackPageView(url: string) {
  trackEvent('page_view', {
    page_location: url,
    page_path: url,
  });
}

export function trackPredictionView(matchId: number | string, homeTeam: string, awayTeam: string, league: string) {
  trackEvent('view_prediction', {
    match_id: matchId,
    home_team: homeTeam,
    away_team: awayTeam,
    league: league,
  });
}

export function trackArticleView(slug: string, category: string) {
  trackEvent('view_article', {
    article_slug: slug,
    article_category: category,
  });
}

export function trackSearch(query: string, resultsCount: number) {
  trackEvent('search', {
    search_term: query,
    results_count: resultsCount,
  });
}

export function trackFavoriteAction(type: 'team' | 'league' | 'prediction', id: number, action: 'add' | 'remove') {
  trackEvent('personalization_toggle', {
    item_type: type,
    item_id: id,
    action: action,
  });
}

export function trackAuthAction(action: 'login' | 'register' | 'logout') {
  trackEvent('auth_action', {
    method: action,
  });
}
