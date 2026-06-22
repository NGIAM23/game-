import type { Metadata } from "next";
import { Lilita_One, Fredoka, DM_Mono } from "next/font/google";
import "./globals.css";

const lilita = Lilita_One({ subsets: ["latin"], weight: "400", variable: "--font-lilita" });
const fredoka = Fredoka({ subsets: ["latin"], variable: "--font-fredoka" });
const dmMono = DM_Mono({ subsets: ["latin"], weight: "400", variable: "--font-dm-mono" });

export const metadata: Metadata = {
  title: "luavio — Devenir meilleur, pour de vrai.",
  description: "Le seul jeu où tu gagnes des niveaux dans la vraie vie, avec preuve.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className={`${lilita.variable} ${fredoka.variable} ${dmMono.variable} font-body`}>{children}</body>
    </html>
  );
}
