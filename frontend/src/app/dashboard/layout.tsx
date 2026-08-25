import type { Metadata } from 'next';
import { constructMetadata } from '@/config/site';

export const metadata: Metadata = constructMetadata({
  title: "My Dashboard & Personal Match Hub",
  description: "Manage your followed teams, competitions, bookmarked predictions, and notification settings on FootballPredict.",
  path: "/dashboard",
  noIndex: true, // Private user account hub
});

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
