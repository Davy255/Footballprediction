import type { Metadata } from 'next';
import { constructMetadata } from '@/config/site';

export const metadata: Metadata = constructMetadata({
  title: "Football Fixtures & Match Predictions",
  description: "Explore today's and upcoming football fixtures with data-driven match predictions, live odds, win probabilities, and tactical previews.",
  path: "/fixtures",
  noIndex: false,
});

export default function FixturesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
