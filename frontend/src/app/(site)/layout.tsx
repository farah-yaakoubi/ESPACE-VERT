import { Navbar }          from "@/components/layout/Navbar";
import { Footer }          from "@/components/layout/Footer";
import { VisiteurTracker } from "@/components/VisiteurTracker";
import SocialSidebar       from "@/components/layout/SocialSidebar";
import ScrollControls      from "@/components/layout/ScrollControls";
import ChatWidget from "@/components/chatbot/ChatWidget";


export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SocialSidebar />
      <ScrollControls />
      <ChatWidget />
      <Navbar />
      <VisiteurTracker />
      <main className="flex-1 pt-[96px]">{children}</main>
      <Footer />
    </>
  );
}