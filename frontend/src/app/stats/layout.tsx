import type { Metadata } from 'next';
import { constructMetadata } from '@/config/site';

export const metadata: Metadata = constructMetadata({
  title: "AI Prediction Model Stats & Accuracy Performance",
  description: "View historical prediction performance, AI model hit rates across 1X2, BTTS, and Over/Under markets, and tactical accuracy metrics.",
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
