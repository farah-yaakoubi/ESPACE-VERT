// src/app/api/chat/route.ts
// Proxy vers le backend Express qui gère l'appel Anthropic

import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const res = await fetch(`${BACKEND_URL}/ai/chat`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(body),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.ok ? 200 : res.status });

  } catch (err) {
    console.error("[api/chat proxy] error:", err);
    return NextResponse.json(
      {
        reply:   "Une erreur s'est produite. Veuillez réessayer ou nous contacter directement.",
        actions: [{ label: "Nous contacter", href: "/contact", type: "link" }],
      },
      { status: 500 }
    );
  }
}