import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import RainWindowInteraction from "@/components/RainWindowInteraction";

export const metadata: Metadata = {
  title: "HYEOKJUN | BLOG",
  description: "순혁준의 시각적 기록과 미니멀 포트폴리오입니다.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body>
        {/* Interactive Backgrounds & Rain Interaction */}
        <RainWindowInteraction />

        <Navbar />
        <main style={{ minHeight: '100vh', position: 'relative', zIndex: 10 }}>
          {children}
        </main>
        <footer className="container" style={{ padding: '4rem 0', textAlign: 'center', opacity: 0.6, fontSize: '0.7rem', letterSpacing: '1px', position: 'relative', zIndex: 10 }}>
          <p>© {new Date().getFullYear()} SUNHYEOKJUN. ALL RIGHTS RESERVED.</p>
        </footer>
      </body>
    </html>
  );
}
