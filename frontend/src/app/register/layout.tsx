import type { Metadata } from 'next';
import { constructMetadata } from '@/config/site';

export const metadata: Metadata = constructMetadata({
  title: "Create an Account",
  description: "Join FootballPredict to compete on leaderboards and track your match predictions.",
  path: "/register",
  noIndex: true,
});

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
