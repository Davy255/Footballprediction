import type { Metadata } from 'next';
import { constructMetadata } from '@/config/site';

export const metadata: Metadata = constructMetadata({
  title: "My Predictions & Personal Track Record",
  description: "Manage your submitted match predictions, view settled results, earned points, and personal football forecasting history.",
  path: "/predictions",
  noIndex: true,
});

export default function PredictionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
