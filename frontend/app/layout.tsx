import "./globals.css";

export const metadata = {
  title: "Espace Vert",
  description: "Site officiel Espace Vert — Solutions agricoles en Tunisie",
};

// ✅ Layout racine : PAS de <html>/<body> ici car [locale]/layout.tsx les gère
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
