import type { Metadata } from 'next';
import { constructMetadata } from '@/config/site';

export const metadata: Metadata = constructMetadata({
  title: "Legal & Prediction Disclaimer",
  description: "Legal disclaimer, entertainment notice, and responsible prediction terms for FootballPredict.",
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
