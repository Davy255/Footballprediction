import type { Metadata } from 'next';
import { constructMetadata } from '@/config/site';

export const metadata: Metadata = constructMetadata({
  title: "Terms of Service",
  description: "Terms and conditions of use for FootballPredict football statistics and match forecasting platform.",
  path: "/terms",
  noIndex: false,
});

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
