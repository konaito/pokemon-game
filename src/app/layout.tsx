import type { Metadata } from "next";
import { DotGothic16, Press_Start_2P } from "next/font/google";
import "./globals.css";

const dotGothic = DotGothic16({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-dotgothic",
  display: "swap",
});

const pressStart = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-pressstart",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Monster Chronicle",
  description: "Monster Chronicle - モンスター育成RPG",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={`${dotGothic.variable} ${pressStart.variable} antialiased`}>{children}</body>
    </html>
  );
}
