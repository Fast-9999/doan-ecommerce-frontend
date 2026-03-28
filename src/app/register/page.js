"use client";

import { useState } from "react";
import Link from "next/link";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    // Bẫy lỗi: Bắt người dùng nhập pass 2 lần cho chắc ăn
    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp nha ní! Nhập lại coi chừng lộn.");
      return;
    }

    setLoading(true);

    try {
      // Gọi API Đăng ký của BE
      const response = await axios.post("https://doan-ecommerce-backend.vercel.app/api/v1/auth/register", {
        username: username,
        email: email,
        password: password
      });

      // Nếu BE trả về thành công (trong file auth.js của ông nó trả về message "dang ki thanh cong")
      if (response.data) {
        alert("Đăng ký thành công mỹ mãn! Giờ qua trang Đăng Nhập nha! 🎉");
        
        // Đá khách hàng văng qua trang Login để họ tự đăng nhập lại
        router.push("/login");
      }
    } catch (err) {
      console.error("Lỗi đăng ký:", err);
      // Có thể do trùng email, trùng username hoặc lỗi BE
      setError(err.response?.data?.message || "Đăng ký thất bại. Có thể Username hoặc Email này đã có người xài rồi!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-3xl shadow-xl border border-gray-100">
        
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Tạo Tài Khoản <span className="text-blue-600">Mới</span>
          </h2>
          <p className="mt-2 text-sm text-gray-500 font-medium">
            Đăng ký 1 nốt nhạc, mua sắm thả ga!
          </p>
        </div>

        <form className="mt-8 space-y-5" onSubmit={handleRegister}>
          
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
                placeholder="Ví dụ: phatdeptrai"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Địa chỉ Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-blue-500 focus:border-blue-500 font-medium"
                placeholder="vidu@hutech.edu.vn"
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
                placeholder="Tạo mật khẩu siêu mạnh..."
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Xác nhận lại Mật khẩu</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-blue-500 focus:border-blue-500 font-medium"
                placeholder="Nhập lại y chang ở trên..."
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3.5 px-4 rounded-xl shadow-sm text-lg font-black text-white ${loading ? 'bg-green-400' : 'bg-green-500 hover:bg-green-600 hover:-translate-y-0.5 transition-all'}`}
          >
            {loading ? "Đang tạo tài khoản..." : "ĐĂNG KÝ NGAY"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600 font-medium">
          Đã có tài khoản rồi?{' '}
          <Link href="/login" className="font-bold text-blue-600 hover:underline">
            Quay lại Đăng nhập thôi!
          </Link>
        </div>

      </div>
    </div>
  );
}