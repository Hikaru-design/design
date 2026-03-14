import type { Metadata } from "next";
import { Geist_Mono, Noto_Sans_JP } from "next/font/google";
import "./globals.css";

const notoSansJP = Noto_Sans_JP({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  preload: false,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "家計簿",
  description: "シンプルな家計簿アプリ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <head>
        <style dangerouslySetInnerHTML={{ __html: `
          html, body, * {
            font-family: -apple-system, BlinkMacSystemFont,
              "Hiragino Kaku Gothic ProN", "Hiragino Sans",
              "Yu Gothic Medium", "Yu Gothic",
              "Noto Sans JP", sans-serif !important;
          }
        `}} />
      </head>
      <body
        className={`${notoSansJP.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
