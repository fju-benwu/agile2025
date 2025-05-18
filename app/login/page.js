"use client";

export default function LoginPage() {
  return (
    <div className="container mx-auto max-w-md p-6 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4 text-center">會員登入</h2>
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          alert("尚未串接後端驗證");
        }}
      >
        <div>
          <label className="block mb-1">帳號</label>
          <input
            type="text"
            className="w-full border px-3 py-2 rounded"
            placeholder="Username"
            required
          />
        </div>
        <div>
          <label className="block mb-1">密碼</label>
          <input
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
