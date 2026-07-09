import type { Metadata } from "next";
import { Noto_Sans_TC } from "next/font/google";
import "./globals.css";

const notoSansTC = Noto_Sans_TC({
  variable: "--font-noto-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "900"],
});

export const metadata: Metadata = {
  title: "AI 新娘捏臉挑戰 / KI-Brautportrait Challenge",
  description:
    "婚禮迎娶遊戲：新郎憑記憶描述新娘，AI 生成新娘畫像 / Ein Hochzeitsspiel: Der Bräutigam beschreibt die Braut aus dem Gedächtnis, die KI erstellt ein Porträt.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-Hant" className={`${notoSansTC.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">{children}</body>
    </html>
  );
}
