/**
 * Frontend Plan Configuration — Single Source of Truth
 *
 * This mirrors the backend app/config/plans.py.
 * The frontend uses this for display ONLY — it never sends prices to the server.
 * The server always reads its own plans.py for authoritative pricing.
 *
 * To update pricing: change backend/app/config/plans.py first,
 * then update the prices here to match.
 */

export const PLAN_IDS = {
  FREE:          'FREE',
  PRO_MONTHLY:   'PRO_MONTHLY',
  PRO_QUARTERLY: 'PRO_QUARTERLY',
  PRO_YEARLY:    'PRO_YEARLY',
} as const;

export type PlanId = typeof PLAN_IDS[keyof typeof PLAN_IDS];

export interface PlanConfig {
  id: PlanId;
  name: string;
  badge: string;
  price_kes: number;
  currency: 'KES';
  duration_days: number | null;
  is_premium: boolean;
  is_popular: boolean;
  savings_label: string | null;
  description: string;
  features: string[];
}

export const PLAN_CONFIG: Record<PlanId, PlanConfig> = {
  FREE: {
    id:            'FREE',
    name:          'Standard Access',
    badge:         'FREE',
    price_kes:     0,
    currency:      'KES',
    duration_days: null,
    is_premium:    false,
    is_popular:    false,
    savings_label: null,
    description:   'Essential football match forecasts and basic win probabilities — free forever.',
    features: [
      'Full 1X2 Win Probabilities',
      'Projected Exact Scorelines',
      'Live Match Center & Score Alerts',
      'Historical Model Accuracy Audit',
      'Football Analysis Articles',
      'Community Leaderboard Access',
    ],
  },
  PRO_MONTHLY: {
    id:            'PRO_MONTHLY',
    name:          'VIP Pro Monthly',
    badge:         'MOST POPULAR',
    price_kes:     500,
    currency:      'KES',
    duration_days: 30,
    is_premium:    true,
    is_popular:    true,
    savings_label: null,
    description:   'Advanced statistical edge models and professional match analytics for serious punters.',
    features: [
      'Everything in Free Tier',
      'Model Edge & Expected Value (EV %)',
      'Full 7×7 Poisson Score Probability Heatmap',
      'High-Confidence Match Alert Feeds',
      '100% Ad-Free Experience',
      'Historical Match Data CSV Export',
      'VIP Supporter Badge on Leaderboard',
    ],
  },
  PRO_QUARTERLY: {
    id:            'PRO_QUARTERLY',
    name:          'VIP Pro Quarterly',
    badge:         'SAVE 20%',
    price_kes:     1200,
    currency:      'KES',
    duration_days: 90,
    is_premium:    true,
    is_popular:    false,
    savings_label: 'Save KES 300 vs monthly',
    description:   '3 months of premium analytics at a discounted rate — ideal for the football season.',
    features: [
      'All VIP Pro Monthly Features',
      'Priority Match Alert Notifications',
      'Direct Coach AI Assistant Integration',
      'Quarterly Performance Analytics Report',
      '3 Months of Uninterrupted Access',
    ],
  },
  PRO_YEARLY: {
    id:            'PRO_YEARLY',
    name:          'VIP Pro Annual',
    badge:         'BEST VALUE',
    price_kes:     4000,
    currency:      'KES',
    duration_days: 365,
    is_premium:    true,
    is_popular:    false,
    savings_label: 'Save KES 2,000 vs monthly (33% off)',
    description:   'Maximum value for serious football quantitative analysts — 2 months free included.',
    features: [
      'All VIP Pro Quarterly Features',
      'Annual Performance Analytics Report',
      'Early Access to New Features',
      '2 Months Free vs Monthly Billing',
      'Highest Priority Support',
    ],
  },
};

export const PLANS_LIST: PlanConfig[] = Object.values(PLAN_CONFIG);
export const PREMIUM_PLANS: PlanConfig[] = PLANS_LIST.filter(p => p.is_premium);

/** Format a KES price for display */
export function formatKES(amount: number): string {
  if (amount === 0) return 'Free';
  return `KES ${amount.toLocaleString('en-KE')}`;
}
