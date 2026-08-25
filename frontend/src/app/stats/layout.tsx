import type { Metadata } from 'next';
import { constructMetadata } from '@/config/site';

export const metadata: Metadata = constructMetadata({
  title: "Prediction Performance & Model Accuracy Dashboard",
  description: "Transparent, real-time prediction performance tracking and model accuracy statistics across 1X2 markets, exact scorelines, and competition tiers.",
  path: "/stats",
  noIndex: false,
});

export default function StatsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
