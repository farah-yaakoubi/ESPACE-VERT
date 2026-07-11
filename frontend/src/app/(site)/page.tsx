// app/page.tsx — Homepage
import HomeNavButtons     from "@/components/sections/HomeNavButtons";
import NewsCarousel       from "@/components/sections/NewsCarousel";
import GroupeEtPartenaires from "@/components/sections/GroupeEtPartenaires";
import { Hero }           from "@/components/sections/Hero";

export const revalidate = 60;

export default function HomePage() {
  return (
    <>
      <Hero />
      <HomeNavButtons />
      <NewsCarousel />
      <GroupeEtPartenaires />
    </>
  );
}
