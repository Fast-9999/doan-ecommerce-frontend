"use client";

import { toast } from "react-hot-toast";
import { useState } from "react";
import Link from "next/link";
import axios from "axios";
import { useRouter } from "next/navigation";
import useAuthStore from "../../store/useAuthStore";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const login = useAuthStore((state) => state.login);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await axios.post("https://doan-ecommerce-backend.vercel.app/api/v1/auth/login", {
        username: username,
        password: password
      });

      if (response.data) {
        login({ username: username }, response.data);
        toast.success("Đăng nhập thành công! Lụm lúa thôi ní! 🚀", {
          style: { borderRadius: '12px', background: '#0f172a', color: '#fff', fontWeight: 'bold' }
        });
        router.push("/");
      }
    } catch (err) {
      console.error("Lỗi đăng nhập:", err);
      setError("Tài khoản hoặc mật khẩu không chính xác. Thử lại nhé Sếp!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 font-sans relative overflow-hidden">

      {/* 🚀 Background Động Mắt */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-blue-500/20 rounded-full blur-[120px] pointer-events-none mix-blend-multiply"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-purple-500/20 rounded-full blur-[120px] pointer-events-none mix-blend-multiply"></div>

      <div className="w-full max-w-5xl bg-white rounded-[2rem] shadow-[0_20px_60px_rgb(0,0,0,0.05)] border border-slate-100 flex flex-col md:flex-row overflow-hidden relative z-10">

        {/* 🚀 Cột Trái: Hình Ảnh Khích Lệ Chốt Đơn */}
        <div className="hidden md:flex md:w-1/2 bg-slate-900 relative p-12 flex-col justify-between overflow-hidden">
          {/* Gradients Chìm */}
          <div className="absolute inset-0 bg-linear-to-br from-blue-600/30 to-purple-600/30 z-0"></div>

          <div className="relative z-10">
            <Link href="/" className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors font-bold text-sm tracking-widest uppercase mb-12">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
              Về Trang Chủ
            </Link>

            <h1 className="text-4xl lg:text-5xl font-black text-white leading-tight mb-6">
              Săn Siêu Phẩm.<br />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-purple-400">Chốt Đơn Tức Thì.</span>
            </h1>
            <p className="text-slate-300 font-medium text-lg leading-relaxed max-w-md">
              Gia nhập cộng đồng 2FAST.SHOP để trải nghiệm đặc quyền mua sắm VIP Pro dành riêng cho Chủ Tịch.
            </p>
          </div>

          {/* Vòng tròn trang trí */}
          <div className="relative z-10 mt-auto">
            <div className="flex -space-x-4">
              <img className="w-12 h-12 rounded-full border-4 border-slate-900 object-cover" src="https://i.pravatar.cc/150?img=11" alt="user" />
              <img className="w-12 h-12 rounded-full border-4 border-slate-900 object-cover" src="https://i.pravatar.cc/150?img=32" alt="user" />
              <img className="w-12 h-12 rounded-full border-4 border-slate-900 object-cover" src="https://i.pravatar.cc/150?img=45" alt="user" />
              <div className="w-12 h-12 rounded-full border-4 border-slate-900 bg-slate-800 text-white flex items-center justify-center text-xs font-black">+2k</div>
            </div>
            <p className="text-slate-400 font-bold text-xs mt-4 uppercase tracking-widest">Đã tham gia săn sale hôm nay</p>
          </div>
        </div>

        {/* 🚀 Cột Phải: Form Đăng Nhập Kính Mờ */}
        <div className="w-full md:w-1/2 p-8 md:p-14 lg:p-20 flex flex-col justify-center bg-white relative">

          <div className="text-center md:text-left mb-10">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Chào mừng trở lại! 👋</h2>
            <p className="text-slate-500 font-medium">Nhập thông tin để tiếp tục quẹt thẻ Sếp ơi.</p>
          </div>

          <form className="space-y-6" onSubmit={handleLogin}>

            {error && (
              <div className="bg-rose-50 text-rose-600 px-5 py-4 rounded-2xl text-sm font-bold border border-rose-100 flex items-center gap-3 animate-[pulse_0.5s_ease-in-out]">
                <span className="text-xl shrink-0">⚠️</span>
                <p>{error}</p>
              </div>
            )}

            <div className="space-y-5">
              <div className="relative group">
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Tên Đăng Nhập</label>
                <div className="absolute inset-y-0 left-0 top-[26px] pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3.5 bg-slate-50/50 border border-slate-200 rounded-2xl text-slate-800 font-bold focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none placeholder:text-slate-300 placeholder:font-medium"
                  placeholder="Nhập ID Chủ Tịch..."
                />
              </div>

              <div className="relative group">
                <div className="flex items-center justify-between mb-2 ml-1">
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">Mật Khẩu</label>
                  <Link href="/forgot-password" className="text-xs font-bold text-blue-600 hover:text-slate-900 transition-colors">Quên mật khẩu?</Link>
                </div>
                <div className="absolute inset-y-0 left-0 top-[26px] pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg>
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3.5 bg-slate-50/50 border border-slate-200 rounded-2xl text-slate-800 font-bold focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none placeholder:text-slate-300 placeholder:font-medium tracking-widest"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-6 bg-slate-900 text-white rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-blue-600 focus:ring-4 focus:ring-blue-500/30 transition-all duration-300 shadow-xl hover:shadow-blue-500/30 hover:-translate-y-1 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Đang mở cửa...</span>
                </>
              ) : (
                <>
                  Đăng Nhập Ngay
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-slate-100 text-center">
            <p className="text-sm font-medium text-slate-500">
              Người chơi hệ mới?{' '}
              <Link href="/register" className="font-black text-slate-900 hover:text-blue-600 transition-colors border-b-2 border-slate-900 hover:border-blue-600 pb-0.5">
                Mở tài khoản ngay
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}