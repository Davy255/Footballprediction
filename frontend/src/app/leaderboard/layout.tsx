import type { Metadata } from 'next';
import { constructMetadata } from '@/config/site';

export const metadata: Metadata = constructMetadata({
  title: "Community Prediction Leaderboard & Rankings",
  description: "Track top community predictors, model accuracy rankings, monthly leaderboards, and football prediction stats on FootballPredict.",
  path: "/leaderboard",
  noIndex: false,
});

export default function LeaderboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
