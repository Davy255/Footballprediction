import type { Metadata } from 'next';
import { constructMetadata } from '@/config/site';

export const metadata: Metadata = constructMetadata({
  title: "Football Leagues & Table Standings",
  description: "Browse football leagues, standings, team forms, and competition analytics for the Premier League, La Liga, Serie A, Bundesliga, and more.",
  path: "/leagues",
  noIndex: false,
});

export default function LeaguesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
