// app/page.tsx — Homepage
import HomeNavButtons from "@/components/sections/HomeNavButtons";
import NewsCarousel   from "@/components/sections/NewsCarousel";
import { Hero }       from "@/components/sections/Hero";

export const revalidate = 60;

export default function HomePage() {
  return (
    <>
      <Hero />
      <HomeNavButtons />
      <NewsCarousel />
    </>
  );
}
