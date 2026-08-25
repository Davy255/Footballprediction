import type { Metadata } from 'next';
import { constructMetadata } from '@/config/site';

export const metadata: Metadata = constructMetadata({
  title: "Live Football Scores & In-Play Analytics",
  description: "Follow live football scores, in-play match tracking, real-time minute progressions, and live tactical statistics.",
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
