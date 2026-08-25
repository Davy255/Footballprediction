import type { Metadata } from 'next';
import { constructMetadata } from '@/config/site';

export const metadata: Metadata = constructMetadata({
  title: "Privacy Policy",
  description: "FootballPredict Privacy Policy explaining how user data, account details, and cookies are managed.",
  path: "/privacy",
  noIndex: false,
});

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
