import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { IrrigationEtudeInstallationPageContent } from "../IrrigationEtudeInstallationSection";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 300;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  if (slug !== "irrigation") {
    return { title: "Page introuvable" };
  }

  return {
    title: "Bureau d'etude et installation",
    description: "Solutions d'irrigation sur mesure, etude, conception, installation et accompagnement technique.",
  };
}

export default async function EtudeInstallationPage({ params }: PageProps) {
  const { slug } = await params;

  if (slug !== "irrigation") {
    notFound();
  }

  return <IrrigationEtudeInstallationPageContent />;
}
