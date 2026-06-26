"use client";
/**
 * app/admin/chatbot/page.tsx — FAQ & Chatbot
 * Gestion des FAQs utilisées par le chatbot public.
 */
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ChatbotRedirectPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/admin/faq");
  }, [router]);

  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", minHeight: "60vh", gap: 16,
    }}>
      <div style={{ width: 40, height: 40, borderRadius: "50%", border: "4px solid #dcfce7", borderTopColor: "#2e7d4f", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
      <p style={{ fontSize: 14, color: "#6b7280" }}>Redirection vers la FAQ…</p>
    </div>
  );
}