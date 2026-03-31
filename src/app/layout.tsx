import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "순혁준의 블로그 | 봄을 닮은 개인 공간",
  description: "벚꽃의 색감에서 영감을 받은 순혁준의 감성적이고 미니멀한 블로그입니다.",
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
        <Navbar />
        <main className="container" style={{ paddingTop: '2rem', flex: 1 }}>
          {children}
        </main>
        <footer className="container" style={{ padding: '4rem 0', textAlign: 'center', opacity: 0.6, fontSize: '0.9rem' }}>
          <p>© {new Date().getFullYear()} 순혁준. 봄의 기운으로 제작됨 🌸</p>
        </footer>
      </body>
    </html>
  );
}
