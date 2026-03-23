import "./globals.css";

export const metadata = {
  title: "Espace Vert",
  description: "Site officiel Espace Vert — Solutions agricoles en Tunisie",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
