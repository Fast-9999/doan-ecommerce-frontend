"use client";

import { toast } from "react-hot-toast";
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

      if (response.data) {
        toast.success("Đăng ký thành công mỹ mãn! Chuẩn bị chốt đơn thôi Chủ Tịch! 🎉", {
          style: { borderRadius: '12px', background: '#059669', color: '#fff', fontWeight: 'bold' }
        });

        router.push("/login");
      }
    } catch (err) {
      console.error("Lỗi đăng ký:", err);
      setError(err.response?.data?.message || "Đăng ký thất bại. Có thể Username hoặc Email này đã có người xài rồi!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 font-sans relative overflow-hidden">

      {/* 🚀 Background Động Mắt */}
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-indigo-500/20 rounded-full blur-[120px] pointer-events-none mix-blend-multiply"></div>
      <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-emerald-500/20 rounded-full blur-[120px] pointer-events-none mix-blend-multiply"></div>

      <div className="w-full max-w-5xl bg-white rounded-[2rem] shadow-[0_20px_60px_rgb(0,0,0,0.05)] border border-slate-100 flex flex-col md:flex-row-reverse overflow-hidden relative z-10">

        {/* 🚀 Cột Phải: Hình Ảnh Động Viên Khởi Nghiệp */}
        <div className="hidden md:flex md:w-1/2 bg-slate-900 relative p-12 flex-col justify-between overflow-hidden">
          {/* Gradients Chìm */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/30 to-emerald-600/30 z-0"></div>

          <div className="relative z-10 text-right">
            <Link href="/" className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors font-bold text-sm tracking-widest uppercase mb-12">
              Về Trang Chủ
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
            </Link>

            <h1 className="text-4xl lg:text-5xl font-black text-white leading-tight mb-6">
              Bắt Đầu Hành Trình.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-l from-indigo-400 to-emerald-400">Đại Gia Mua Sắm.</span>
            </h1>
            <p className="text-slate-300 font-medium text-lg leading-relaxed ml-auto max-w-md">
              Tạo tài khoản ngay hôm nay để nhận vô vàn mã giảm giá bí mật và trải nghiệm dịch vụ khách hàng chuẩn 5 sao.
            </p>
          </div>

          {/* Vòng tròn trang trí */}
          <div className="relative z-10 mt-auto flex flex-col items-end">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-3xl w-max">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center text-white text-2xl shadow-lg">🎁</div>
                <div className="text-left">
                  <div className="text-white font-black text-sm uppercase tracking-widest">Đặc Quyền Hội Viên</div>
                  <div className="text-emerald-300 font-medium text-xs">Voucher ngập tràn mỗi tuần</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 🚀 Cột Trái: Form Đăng Ký Kính Mờ */}
        <div className="w-full md:w-1/2 p-8 md:p-14 lg:p-16 flex flex-col justify-center bg-white relative">

          <div className="text-center md:text-left mb-10">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Tạo Tài Khoản 🚀</h2>
            <p className="text-slate-500 font-medium">Chỉ tốn 1 phút để gia nhập hệ sinh thái 2FAST.</p>
          </div>

          <form className="space-y-5" onSubmit={handleRegister}>

            {error && (
              <div className="bg-rose-50 text-rose-600 px-5 py-4 rounded-2xl text-sm font-bold border border-rose-100 flex items-start gap-3 animate-[pulse_0.5s_ease-in-out]">
                <span className="text-xl shrink-0 mt-0.5">⚠️</span>
                <p>{error}</p>
              </div>
            )}

            <div className="space-y-4">

              {/* Username */}
              <div className="relative group">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">ID Chủ Tịch (Username)</label>
                <div className="absolute inset-y-0 left-0 top-[22px] pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3.5 bg-slate-50/50 border border-slate-200 rounded-2xl text-slate-800 font-bold focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none placeholder:text-slate-300 placeholder:font-medium"
                  placeholder="Ví dụ: phattest"
                />
              </div>

              {/* Email */}
              <div className="relative group">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Thư Điện Tử (Email)</label>
                <div className="absolute inset-y-0 left-0 top-[22px] pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3.5 bg-slate-50/50 border border-slate-200 rounded-2xl text-slate-800 font-bold focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none placeholder:text-slate-300 placeholder:font-medium"
                  placeholder="vidu@hutech.edu.vn"
                />
              </div>

              {/* Row chia đôi Mật khẩu */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="relative group">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Mật Khẩu</label>
                  <div className="absolute inset-y-0 left-0 top-[22px] pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg>
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-11 pr-4 py-3.5 bg-slate-50/50 border border-slate-200 rounded-2xl text-slate-800 font-bold focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none placeholder:text-slate-300 placeholder:font-medium tracking-widest"
                    placeholder="••••••••"
                  />
                </div>

                <div className="relative group">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Xác Nhận Lại</label>
                  <div className="absolute inset-y-0 left-0 top-[22px] pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="block w-full pl-11 pr-4 py-3.5 bg-slate-50/50 border border-slate-200 rounded-2xl text-slate-800 font-bold focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none placeholder:text-slate-300 placeholder:font-medium tracking-widest"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-4 px-6 bg-slate-900 text-white rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-emerald-600 focus:ring-4 focus:ring-emerald-500/30 transition-all duration-300 shadow-xl hover:shadow-emerald-500/30 hover:-translate-y-1 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Đang Khởi Tạo...</span>
                </>
              ) : (
                <>
                  MỞ TÀI KHOẢN NGAY
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-slate-100 text-center">
            <p className="text-sm font-medium text-slate-500">
              Đã là người chơi hệ VIP?{' '}
              <Link href="/login" className="font-black text-slate-900 hover:text-indigo-600 transition-colors border-b-2 border-slate-900 hover:border-indigo-600 pb-0.5">
                Quay lại đăng nhập
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}