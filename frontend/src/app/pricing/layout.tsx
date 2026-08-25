import type { Metadata } from 'next';
import { constructMetadata } from '@/config/site';

export const metadata: Metadata = constructMetadata({
  title: "VIP Pro Analytics & Pricing Plans",
  description: "Unlock advanced mathematical model edge indicators, 7x7 Poisson heatmaps, high-confidence alerts, and an ad-free experience on FootballPredict.",
  path: "/pricing",
});

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
