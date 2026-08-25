import type { Metadata } from 'next';
import { constructMetadata } from '@/config/site';

export const metadata: Metadata = constructMetadata({
  title: "Football Analysis, Tactical Previews & Prediction Methodology Hub",
  description: "Explore in-depth football analysis, match previews, Poisson distribution modeling, Elo rating research, and statistical breakdowns by FootballPredict.",
  path: "/articles",
  keywords: ["football analysis", "match previews", "prediction methodology", "poisson distribution football", "elo rating soccer", "tactical football analysis"],
});

export default function ArticlesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
