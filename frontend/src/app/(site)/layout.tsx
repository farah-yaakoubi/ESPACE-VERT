"use client";
import { usePathname } from "next/navigation";
import { Navbar }          from "@/components/layout/Navbar";
import { Footer }          from "@/components/layout/Footer";
import { VisiteurTracker } from "@/components/VisiteurTracker";
import SocialSidebar       from "@/components/layout/SocialSidebar";
import ScrollControls      from "@/components/layout/ScrollControls";
import ChatWidget from "@/components/chatbot/ChatWidget";

const hasRouteHero = (pathname: string) => {
  if (pathname === "/") return true;
  if (pathname === "/marques" || pathname === "/activites") return true;
  if (pathname === "/contact" || pathname === "/rendez-vous") return true;
  if (/^\/marques\/[^/]+$/.test(pathname)) return true;
  if (/^\/activites\/[^/]+$/.test(pathname)) return true;
  return false;
};

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "";
  const hasHero = hasRouteHero(pathname);
  return (
    <>
      <SocialSidebar />
      <ScrollControls />
      <Navbar />
      <VisiteurTracker />
      <ChatWidget/>
      <main
        className="flex-1"
        style={{ overflowX: "hidden", paddingTop: hasHero ? 0 : 80 }}
      >
        {children}
      </main>
      <Footer />
    </>
  );
}
