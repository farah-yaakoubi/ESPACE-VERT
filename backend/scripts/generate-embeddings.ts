import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { getEmbedding } from "../src/lib/embedding";

const prisma = new PrismaClient();
const db = prisma as any;

function isNetworkError(err: unknown): boolean {
  const message = err instanceof Error ? err.message : String(err);
  return /network error|fetch failed|ENOTFOUND|ECONNREFUSED|ECONNRESET|ETIMEDOUT/i.test(message);
}

async function main() {
  if (!process.env.HF_TOKEN) {
    throw new Error(
      "HF_TOKEN is missing. Ajoute un token Hugging Face dans backend/.env puis relance: npx tsx scripts/generate-embeddings.ts",
    );
  }

  const produits = await prisma.produit.findMany({
    where: { actif: true },
    select: {
      id_produit: true,
      nom: true,
      description: true,
      usage: true,
      fiche_technique: true,
      descriptif_var: true,
      type_semence: true,
      categorie: { select: { nom: true, marque: { select: { nom: true } } } },
    },
  });

  console.log(`Generation des embeddings pour ${produits.length} produits...`);

  let successCount = 0;
  let errorCount = 0;

  for (const produit of produits) {
    const chunk = [
      produit.nom,
      produit.categorie?.marque?.nom,
      produit.categorie?.nom,
      produit.usage,
      produit.description,
      produit.descriptif_var,
      produit.type_semence,
      produit.fiche_technique,
    ]
      .filter(Boolean)
      .join(" ")
      .trim();

    if (!chunk) continue;

    try {
      const vector = await getEmbedding(chunk);

      await db.produitEmbedding.upsert({
        where: { id_produit: produit.id_produit },
        create: {
          id_produit: produit.id_produit,
          chunk,
          embedding: vector,
        },
        update: {
          chunk,
          embedding: vector,
        },
      });

      console.log(`  OK ${produit.nom}`);
      successCount++;
      await new Promise((resolve) => setTimeout(resolve, 200));
    } catch (err) {
      if (isNetworkError(err)) {
        throw new Error(
          "Impossible de joindre Hugging Face (DNS/reseau). Verifie la connexion internet, le DNS, le proxy/VPN, puis relance le script.",
        );
      }

      errorCount++;
      console.error(`  ERROR ${produit.nom}:`, err);
    }
  }

  if (errorCount > 0) {
    throw new Error(`Generation terminee avec ${errorCount} erreurs et ${successCount} succes.`);
  }

  console.log(`Embeddings generes avec succes (${successCount}/${produits.length}).`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
