import type { Metadata } from 'next';
import { constructMetadata } from '@/config/site';

export const metadata: Metadata = constructMetadata({
  title: "Live Football Scores & Real-Time Match Analytics",
  description: "Follow live football scores, in-play match statuses, and pre-match model forecasts across Premier League, Champions League, La Liga, and European football.",
  path: "/live",
  noIndex: false,
});

export default function LiveLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
