"use client";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/app/_firebase/FirebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/app/_firebase/FirebaseConfig";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({ children }) {
  const [user, setUser] = useState(null);
  const [userName, setUserName] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navRef = useRef(null);
  //const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        // 取得 Firestore 中的姓名
        const userDoc = await getDoc(doc(db, "users", user.uid));
        setUserName(userDoc.exists() ? userDoc.data().name || user.email : user.email);
      } else {
        setUserName("");
      }
    });
    
    // 點擊外部時關閉移動端選單
    const handleClickOutside = (event) => {
      if (navRef.current && !navRef.current.contains(event.target) && !event.target.closest('.hamburger')) {
        setMobileMenuOpen(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    
    return () => {
      unsubscribe();
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    window.alert("已成功登出！");
    window.location.href = "/agile2025/login";
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <html lang="zh-TW">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>輔大資管碩士新生資訊系統</title>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"
        />
        <style jsx global>{`
          :root {
            --primary-color: #1a365d;
            --primary-light: #284975;
            --secondary-color: #3182ce;
            --accent-color: #4299e1;
            --danger-color: #e53e3e;
            --danger-hover: #c53030;
            --text-light: #ffffff;
            --text-dark: #2d3748;
            --bg-light: #f7fafc;
            --bg-gray: #dddddd;
            --border-color: #e2e8f0;
            --transition: all 0.3s ease;
            --shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            --radius: 0px;
          }
          
          body {
            margin: 0;
            padding: 0;
            font-family: var(--font-geist-sans), sans-serif;
            color: var(--text-dark);
            background-color: var(--bg-light);
            line-height: 1.5;
          }
          
          .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 1rem;
          }
          
          .button {
            display: inline-block;
            padding: 0.5rem 1rem;
            border: none;
            border-radius: var(--radius);
            font-weight: 600;
            text-decoration: none;
            cursor: pointer;
            transition: var(--transition);
          }
          
          .button-primary {
            background-color: var(--secondary-color);
            color: var(--text-light);
          }
          
          .button-primary:hover {
            background-color: var(--accent-color);
          }
          
          .button-danger {
            background-color: var(--danger-color);
            color: var(--text-light);
          }
          
          .button-danger:hover {
            background-color: var(--danger-hover);
          }
          
          .header {
            background-color: var(--primary-light);
            color: var(--text-light);
            padding: 0.8rem 0; /* 增加header高度 */
          }

          .header-content {
            display: flex;
            flex-direction: column; /* 垂直排列 */
            align-items: flex-start;
            max-width: 1200px;
            margin: 0 auto;
            border-radius: 18px;
            background: var(--primary-light);
            box-shadow: 0 2px 8px rgba(0,0,0,0.06);
            padding: 1.2rem 2rem 1rem 2rem; /* 下方padding加大，避免重疊 */
            position: relative;
            min-height: 110px; /* 增加最小高度 */
          }

          .header-row {
            width: 100%;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          
          .logo-container {
            background-color: var(--bg-gray);
            padding: 0.8rem 1.2rem;
          }
          
          .logo {
          font-size: 2rem;
          font-weight: 700;
          margin: 0;
          color: #fff; /* 改成白色 */
          }
          
          .nav {
            display: flex;
            gap: 0.7rem;
          }
          
          .nav-link {
            background-color: var(--bg-gray);
            color: var(--text-dark);
            text-decoration: none;
            font-weight: 500;
            padding: 0.5rem 1rem;
            transition: var(--transition);
          }
          
          .nav-link:hover, .nav-link.active {
            background-color: #c0c0c0;
          }
          
          .main-content {
            padding: 2rem 1rem;
            min-height: 60vh;
          }
          
          .page-title {
            color: var (--text-dark);
            margin-bottom: 2rem;
            font-size: 1.8rem;
          }
          
          .footer {
            background-color: var(--primary-light);
            color: #fff !important; /* 這裡改為黑色 */
            padding: 2rem 1rem;
          }
          
          .footer-content {
            display: flex;
            flex-wrap: wrap;
            gap: 2rem;
            justify-content: space-between;
          }
          
          .footer-section {
            flex: 1;
            min-width: 200px;
            padding: 0 1rem;
          }
          
          .footer-section:not(:last-child) {
            border-right: 1px solid #222 !important; /* 讓分隔線也變深色 */
          }
          
          .footer-heading {
            font-size: 1.2rem;
            margin-bottom: 1rem;
            color: #fff !important; /* 標題也黑色 */
          }
          
          .footer-info {
            margin-bottom: 0.5rem;
            font-size: 0.95rem;
            color: #fff !important; /* 內容黑色 */
          }
          
          .hamburger {
            display: none;
            flex-direction: column;
            justify-content: space-between;
            width: 30px;
            height: 21px;
            cursor: pointer;
          }
          
          .hamburger-line {
            height: 3px;
            width: 100%;
            background-color: var(--text-dark);
            border-radius: 3px;
          }
          
          .sidebar-form {
            background-color: white;
            padding: 1.5rem;
            border-radius: 4px;
            box-shadow: var(--shadow);
            margin-bottom: 2rem;
          }
          
          .form-title {
            margin-top: 0;
            margin-bottom: 1rem;
            font-size: 1.3rem;
          }
          
          .form-group {
            margin-bottom: 1rem;
          }
          
          .form-label {
            display: block;
            margin-bottom: 0.5rem;
            font-weight: 500;
          }
          
          .form-select {
            width: 100%;
            padding: 0.5rem;
            border: 1px solid var(--border-color);
            border-radius: 4px;
          }
          
          .login-area {
            margin-top: 1.2rem;
            align-self: flex-end;
            display: flex;
            align-items: center;
            gap: 10px;
            z-index: 2;
            position: static;
          }
          
          @media (max-width: 768px) {
            .header-content {
              flex-direction: column;
              align-items: center;
            }
            
            .logo-container {
              margin-bottom: 1rem;
            }
            
            .hamburger {
              display: flex;
              position: absolute;
              top: 3.5rem;
              right: 1.5rem;
            }
            
            .hamburger-line {
              background-color: var(--text-light);
            }
            
            .nav {
              display: ${mobileMenuOpen ? 'flex' : 'none'};
              flex-direction: column;
              width: 100%;
              gap: 0.5rem;
              margin-top: 1rem;
            }
            
            .nav-link {
              text-align: center;
            }
            
            .footer-content {
              flex-direction: column;
            }
            
            .footer-section {
              padding: 1rem 0;
            }
            
            .footer-section:not(:last-child) {
              border-right: none;
              border-bottom: 1px solid var(--text-light);
            }
          }
        `}</style>
      </head>

      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <header className="header">
          <div className="header-content">
            <div className="header-row">
              <div>
                <h1 className="logo">輔大資管碩士新生資訊系統</h1>
              </div>
              <div className="hamburger" onClick={toggleMobileMenu}>
                <span className="hamburger-line"></span>
                <span className="hamburger-line"></span>
                <span className="hamburger-line"></span>
              </div>
              <nav className="nav" ref={navRef}>
                <Link href="/agile2025/rules2" className="nav-link">
                  修業規則
                </Link>
                <Link href="/agile2025/teacher" className="nav-link">
                  師資介紹
                </Link>
                <Link href="/agile2025/" className="nav-link">
                  課程資訊
                </Link>
                <Link href="/agile2025/intro" className="nav-link">
                  系所介紹
                </Link>
              </nav>
            </div>
            {/* 登入/登出按鈕移到 header-content 下方，避免重疊 */}
            <div className="login-area">
              {user ? (
                <>
                  <span style={{ color: "white", fontWeight: 500 }}>{userName}</span>
                  <button
                    onClick={handleLogout}
                    className="button button-danger"
                  >
                    登出
                  </button>
                </>
              ) : (
                <a
                  href="/agile2025/login"
                  className="button button-primary"
                >
                  登入
                </a>
              )}
            </div>
          </div>
        </header>

        <main className="main-content container">
          {children}
        </main>

        <footer className="footer">
          <div className="container footer-content">
            <div className="footer-section">
              <h3 className="footer-heading">📍 系辦公室資訊</h3>
              <p className="footer-info">地址：242 新北市新莊區中正路 510 號，利瑪竇大樓 LM306</p>
              <p className="footer-info">傳真：(02) 2905-2182</p>
              <a 
                href="https://www.instagram.com/fjcuim/" 
                target="_blank" 
                rel="noopener noreferrer" 
                style={{ textDecoration: "none", color: "#fff", display: "inline-flex", alignItems: "center", gap: "8px", marginTop: "6px" }}
              >
                <i className="fab fa-instagram" style={{ fontSize: "18px" }}></i>
                <span>追蹤我們的 IG</span>
              </a>
            </div>
            <div className="footer-section">
              <h3 className="footer-heading">👩‍💼 碩士班系秘書</h3>
              <p className="footer-info">姓名：羅淑貞</p>
              <p className="footer-info">電話：(02) 2905-2940</p>
              <p className="footer-info">信箱：013763@mail.fju.edu.tw</p>
              <p className="footer-info">辦公室：利瑪竇大樓 LM306</p>
            </div>

            <div className="footer-section">
              <h3 className="footer-heading">🤵🏻‍♀️ 碩士在職專班秘書</h3>
              <p className="footer-info">姓名：徐智慧</p>
              <p className="footer-info">電話：(02) 2905-2626</p>
              <p className="footer-info">信箱：055969@mail.fju.edu.tw</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}