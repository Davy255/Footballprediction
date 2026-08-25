import type { Metadata } from 'next';
import { constructMetadata } from '@/config/site';

export const metadata: Metadata = constructMetadata({
  title: "Community Tipster Leaderboard & Rankings",
  description: "Track top football tipsters, prediction accuracy rankings, monthly leaderboards, and community prediction stats on FootballPredict.",
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
