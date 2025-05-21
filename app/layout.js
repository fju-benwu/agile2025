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
        {/* 登入按鈕 */}
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          backgroundColor: '#284975',
          padding: '0.5rem 1rem'
        }}>
          <Link href="/login" style={{
            textDecoration: 'none',
            color: 'white',
            fontSize: '1rem'
          }}>
            登入
          </Link>
        </div>

        {/* 頁首標題與導覽列 */}
        <header style={{ backgroundColor: '#284975', padding: '1rem', color: 'white' }}>
          <h1>輔大資管碩士新生資訊系統</h1>
          <nav style={{
            display: 'flex',
            gap: '20px',
            marginTop: '1rem',
            justifyContent: 'flex-end'
          }}>
            <Link href="/rules2" style={{ textDecoration: 'none', color: 'white' }}>修業規則</Link>
            <Link href="/teacher" style={{ textDecoration: 'none', color: 'white' }}>師資介紹</Link>
            <Link href="/" style={{ textDecoration: 'none', color: 'white' }}>課程資訊</Link>
            <Link href="/intro" style={{ textDecoration: 'none', color: 'white' }}>系所介紹</Link>
          </nav>
        </header>

        {/* 主內容區塊 */}
        <main style={{ padding: '20px' }}>{children}</main>

        {/* 頁尾 footer */}
        <footer style={{
          display: "flex",
          justifyContent: "space-between",
          backgroundColor: "#004080",
          color: "white",
          padding: "2rem",
          textAlign: "left",
          gap: "2rem",
          alignItems: "center",
        }}>
          <div style={{
            flex: 1,
            minWidth: "200px",
            borderRight: "1px solid white",
            padding: "0 1rem"
          }}>
            <h3>📍 系辦公室資訊</h3>
            <p>地址：242 新北市新莊區中正路 510 號，利瑪竇大樓 LM306</p>
            <p>傳真：(02) 2905-2182</p>
          </div>

          <div style={{
            flex: 1,
            minWidth: "200px",
            borderRight: "1px solid white",
            padding: "0 1rem"
          }}>
            <h3>👩‍💼 碩士班系秘書</h3>
            <p>姓名：羅淑貞</p>
            <p>電話：(02) 2905-2940</p>
            <p>信箱：013763@mail.fju.edu.tw</p>
            <p>辦公室：利瑪竇大樓 LM306</p>
          </div>

          <div style={{
            flex: 1,
            minWidth: "200px",
            padding: "0 1rem"
          }}>
            <h3>🤵🏻‍♀️ 碩士在職專班秘書</h3>
            <p>姓名：徐智慧</p>
            <p>電話：(02) 2905-2626</p>
            <p>信箱：055969@mail.fju.edu.tw</p>
          </div>

          {/* IG 圖片與文字置中對齊區塊 */}
          <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            minWidth: "140px",
            padding: "0 1rem",
          }}>
            <a
              href="https://www.instagram.com/fjcuim/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              style={{
                display: "block",
                lineHeight: 0,
              }}
            >
              <img
                src="/Users/jenny/Desktop/敏捷式/agile2025/public/icon/Instagram_logo_2016.svg.png"
                alt="Instagram"
                style={{
                  width: "120px",
                  height: "120px",
                  objectFit: "contain",
                  display: "block",
                  marginBottom: "0.2rem",
                }}
              />
            </a>
            <p style={{
              margin: 0,
              fontSize: "1rem",
              color: "white",
              textAlign: "center"
            }}>聯絡我們</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
