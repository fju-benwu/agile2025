import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "輔大資管碩士新生資訊系統",
  description: "整合修業規則、課程資訊與師資介紹",
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-TW">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>輔大資管碩士新生資訊系統</title>
      </head>

      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <header style={{ backgroundColor: '#284975', padding: '1rem', color: 'white' }}> {/* 將 header 文字預設設為白色 */}
          <h1>輔大資管碩士新生資訊系統</h1>
          <p>整合修業規則、課程資訊與師資介紹</p>
          <nav style={{ display: 'flex', gap: '20px', marginTop: '1rem', justifyContent: 'flex-end' }}> {/* 使用 justify-content: flex-end 將內容靠右 */}
            <Link href="/teacher" style={{ textDecoration: 'none', color: 'white' }}>
              師資介紹
            </Link>
            <Link href="/" style={{ textDecoration: 'none', color: 'white' }}>
              課程資訊
            </Link>
            <Link href="/intro" style={{ textDecoration: 'none', color: 'white' }}>
              系所介紹
            </Link>
            {/* 你可以根據需求添加其他的導覽連結 */}
          </nav>
        </header>
        <main style={{ padding: '20px' }}>{children}</main>
        <footer>
          {/* 頁尾內容 */}
        </footer>
      </body>
    </html>
  );
}