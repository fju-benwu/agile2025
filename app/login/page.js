"use client"
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import app from "@/app/_firebase/Config";

export default function LoginPage() {

  const auth = getAuth(app);
  const login = async (email, password) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // 登入成功，可導向其他頁面
      alert("登入成功");
    } catch (err) {
      alert("登入失敗: " + err.message);
      // setError(err.message);
    } finally {
      // setLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-md p-6 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4 text-center">會員登入</h2>
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          login(
            e.target.username.value,
            e.target.password.value
          );
          // alert(e.target.username.value);
        }}
      >
        <div>
          <label className="block mb-1">帳號</label>
          <input
            name="username"
            type="text"
            className="w-full border px-3 py-2 rounded"
            placeholder="Username"
            required
          />
        </div>
        <div>
          <label className="block mb-1">密碼</label>
          <input
            name="password"
            type="password"
            className="w-full border px-3 py-2 rounded"
            placeholder="Password"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-800 text-white py-2 rounded hover:bg-blue-600"
        >
          登入
        </button>
      </form>
      <p className="text-center mt-4">
        沒有帳號？<a href="#" className="text-blue-800 underline">前往註冊</a>
      </p>
    </div>
  );
}
