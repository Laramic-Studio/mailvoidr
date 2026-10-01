import { MarketingLayout } from "@/components/layouts/MarketingLayout";
import { HomeHero } from "@/components/marketing/HomeHero";
import { HomeTrustStack } from "@/components/marketing/HomeTrustStack";
import { HomeQuote } from "@/components/marketing/HomeQuote";
import { HomeSend } from "@/components/marketing/HomeSend";
import { HomePlatform } from "@/components/marketing/HomePlatform";
import { HomeMetrics } from "@/components/marketing/HomeMetrics";
import { HomeReviews } from "@/components/marketing/HomeReviews";
import { HomeCta } from "@/components/marketing/HomeCta";

export default function Home() {
  return (
    <MarketingLayout>
      <HomeHero />
      <HomeTrustStack />
      <HomeQuote />
      <HomeSend />
      <HomePlatform />
      <HomeMetrics />
      <HomeReviews />
      <HomeCta />
    </MarketingLayout>
  );
}
