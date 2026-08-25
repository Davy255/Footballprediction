import type { Metadata } from 'next';
import { constructMetadata } from '@/config/site';

export const metadata: Metadata = constructMetadata({
  title: "Prediction Accuracy & Model Performance",
  description: "Audited model prediction accuracy statistics, 1X2 win rates, exact scoreline metrics, and verified match-by-match ledger on FootballPredict.",
  path: "/accuracy",
  noIndex: false,
});

export default function AccuracyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
