"use client";
import React, { useState } from "react";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "@/app/_firebase/FirebaseConfig";
import { doc, setDoc } from "firebase/firestore";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [showRegister, setShowRegister] = useState(false);

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setMessage("✅ 登入成功！");
      window.alert("✅ 登入成功！");
      window.location.href = "/intro"; // 使用瀏覽器重新導向
    } catch (error) {
      setMessage(`❌ 登入失敗：${error.message}`);
      window.alert(`❌ 登入失敗：${error.message}`);
    }
  };

  const handleRegister = async (regEmail, regPassword, role = "student", name = "") => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, regEmail, regPassword);
      const user = userCredential.user;
      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        name: name,
        role: role,
        createdAt: new Date()
      });
      setMessage("✅ 註冊成功，將自動導向主頁。");
      window.alert("✅ 註冊成功，將自動導向主頁。");
      setShowRegister(false);
      window.location.href = "/rules2"; // 使用瀏覽器重新導向
    } catch (error) {
      setMessage(`❌ 註冊失敗：${error.message}`);
      window.alert(`❌ 註冊失敗：${error.message}`);
    }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <h2 style={styles.title}>使用者登入</h2>
        <input
          type="email"
          placeholder="請輸入 Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={styles.input}
        />
        <input
          type="password"
          placeholder="請輸入密碼"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
        />
        <button onClick={handleLogin} style={styles.button}>
          登入
        </button>
        <button onClick={() => setShowRegister(true)} style={{ ...styles.button, marginTop: 10, backgroundColor: "#636e72" }}>
          註冊新帳號
        </button>
        {showRegister && <RegisterDialog onRegister={handleRegister} onClose={() => setShowRegister(false)} />}
        {message && <div style={styles.message}>{message}</div>}
      </div>
    </div>
  );
}

function RegisterDialog({ onRegister, onClose }) {
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regName, setRegName] = useState("");
  const [role, setRole] = useState("student");

  return (
    <div style={dialogStyles.overlay}>
      <div style={dialogStyles.dialog}>
        <h3>註冊新帳號</h3>
        <input
          type="text"
          placeholder="輸入姓名"
          value={regName}
          onChange={(e) => setRegName(e.target.value)}
          style={styles.input}
        />
        <input
          type="email"
          placeholder="輸入 Email"
          value={regEmail}
          onChange={(e) => setRegEmail(e.target.value)}
          style={styles.input}
        />
        <input
          type="password"
          placeholder="輸入密碼"
          value={regPassword}
          onChange={(e) => setRegPassword(e.target.value)}
          style={styles.input}
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          style={styles.input}
        >
          <option value="student">學生</option>
          <option value="teacher">教師</option>
          <option value="admin">管理員</option>
        </select>
        <button onClick={() => onRegister(regEmail, regPassword, role, regName)} style={styles.button}>
          註冊
        </button>
        <button onClick={onClose} style={{ ...styles.button, backgroundColor: "#b2bec3", marginTop: 10 }}>
          取消
        </button>
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f5f6fa",
    padding: "20px"
  },
  card: {
    width: "100%",
    maxWidth: "400px",
    padding: "30px",
    borderRadius: "12px",
    backgroundColor: "#ffffff",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)"
  },
  title: {
    textAlign: "center",
    marginBottom: "20px",
    color: "#2d3436"
  },
  input: {
    width: "100%",
    padding: "12px",
    marginBottom: "15px",
    borderRadius: "8px",
    border: "1px solid #dcdde1",
    fontSize: "16px"
  },
  button: {
    width: "100%",
    padding: "12px",
    backgroundColor: "#0984e3",
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    cursor: "pointer",
    transition: "background-color 0.3s"
  },
  message: {
    marginTop: "15px",
    padding: "10px",
    backgroundColor: "#dfe6e9",
    borderRadius: "8px",
    color: "#2d3436",
    textAlign: "center",
    fontSize: "14px"
  }
};

const dialogStyles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999
  },
  dialog: {
    backgroundColor: "#fff",
    padding: "30px",
    borderRadius: "12px",
    width: "100%",
    maxWidth: "400px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)"
  }
};
