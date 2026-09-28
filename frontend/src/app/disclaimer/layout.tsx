import type { Metadata } from 'next';
import { constructMetadata } from '@/config/site';

export const metadata: Metadata = constructMetadata({
  title: "Football Prediction & Data Disclaimer",
  description: "Mathematical modeling, prediction estimates, and statistical information disclaimer for FootballPredict.",
  path: "/disclaimer",
  noIndex: false,
});

export default function DisclaimerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
