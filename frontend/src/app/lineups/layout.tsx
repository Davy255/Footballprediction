import type { Metadata } from 'next';
import { constructMetadata } from '@/config/site';

export const metadata: Metadata = constructMetadata({
  title: "Probable Lineups & Tactical Formations",
  description: "View probable starting lineups, tactical pitch formations, and key player statistics for upcoming football fixtures on FootballPredict.",
  path: "/lineups",
  noIndex: false,
});

export default function LineupsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
