"use client";

import { toast } from "react-hot-toast";
import { useState } from "react";
import Link from "next/link";
import axios from "axios";
import { useRouter } from "next/navigation";
import useAuthStore from "../../store/useAuthStore"; // Import bí kíp Zustand vô đây

export default function LoginPage() {
  const [username, setUsername] = useState(""); 
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Lôi cái tuyệt chiêu "login" từ trong kho ra xài
  const login = useAuthStore((state) => state.login);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Gọi API đăng nhập (Lưu ý: Nếu chưa push code BE lên Vercel thì sửa link lại nha)
      const response = await axios.post("https://doan-ecommerce-backend.vercel.app/api/v1/auth/login", {
        username: username,
        password: password
      });

      // Nếu Backend trả về token thành công
      if (response.data) {
        
        // GỌI HÀM CỦA ZUSTAND Ở ĐÂY 👇 (Thay vì xài localStorage)
        // Mình truyền object user (có username) và truyền cái token vô
        login({ username: username }, response.data);

        toast.success("Đăng nhập thành công! Lụm lúa thôi ní! 🚀");
        router.push("/");
      }
    } catch (err) {
      console.error("Lỗi đăng nhập:", err);
      setError("Sai tài khoản hoặc mật khẩu rồi ní ơi! (Hoặc kiểm tra xem đã bật Backend chưa)");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-3xl shadow-xl border border-gray-100">
        
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Đăng Nhập <span className="text-blue-600">Phát Shop</span>
          </h2>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          
          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm font-bold border border-red-100 text-center">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Tên đăng nhập (Username)</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-blue-500 focus:border-blue-500 font-medium"
                placeholder="Nhập username của bạn..."
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Mật khẩu</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-blue-500 focus:border-blue-500 font-medium"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3.5 px-4 rounded-xl shadow-sm text-lg font-black text-white ${loading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700 hover:-translate-y-0.5 transition-all'}`}
          >
            {loading ? "Đang xử lý..." : "ĐĂNG NHẬP NGAY"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600 font-medium">
          Chưa có tài khoản?{' '}
          <Link href="/register" className="font-bold text-blue-600 hover:underline">
            Đăng ký lẹ lên nào!
          </Link>
        </div>

      </div>
    </div>
  );
}