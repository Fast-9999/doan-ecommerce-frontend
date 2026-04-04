"use client";

import { toast } from "react-hot-toast";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import useAuthStore from "../../store/useAuthStore";
import axios from "axios";
import Link from "next/link";
import Footer from "../../components/Footer";

export default function ProfilePage() {
  const { user, login } = useAuthStore();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const fileInputRef = useRef(null);

  // 🚀 STATE CHO ĐỔI MẬT KHẨU
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loadingPassword, setLoadingPassword] = useState(false);

  useEffect(() => {
    setIsClient(true);
    if (!user) {
      router.push("/login");
    } else {
      setPreviewImage(user.avatarUrl || "https://i.stack.imgur.com/l60Hf.png");
    }
  }, [user, router]);

  // ==========================================
  // XỬ LÝ UPLOAD AVATAR
  // ==========================================
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn file hình ảnh nha Chủ Tịch!", {
        style: { borderRadius: '10px', background: '#333', color: '#fff' }
      });
      return;
    }

    setPreviewImage(URL.createObjectURL(file));
    await handleUpload(file);
  };

  const handleUpload = async (file) => {
    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post("https://doan-ecommerce-backend.vercel.app/api/v1/upload/single", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data.success) {
        const newAvatarUrl = res.data.url;
        toast.success("🎉 Giao diện mới chuẩn VIP Pro! Lên là lên!", {
          style: { borderRadius: '12px', background: '#059669', color: '#fff', fontWeight: 'bold' }
        });
        login({ ...user, avatarUrl: newAvatarUrl });
      }
    } catch (error) {
      console.error("Lỗi upload:", error);
      toast.error("Huhu upload xịt rồi, mạng lag hay file bự quá ta? 🤔");
      setPreviewImage(user?.avatarUrl || "https://i.stack.imgur.com/l60Hf.png");
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // 🚀 XỬ LÝ ĐỔI MẬT KHẨU (THUẬT TOÁN TÌM TOKEN 3 TẦNG)
  // ==========================================
  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (!oldPassword || !newPassword || !confirmPassword) {
      return toast.error("Sếp điền thiếu thông tin kìa!");
    }

    if (newPassword !== confirmPassword) {
      return toast.error("Mật khẩu mới và xác nhận không khớp nhau nha!");
    }

    if (newPassword.length < 6) {
      return toast.error("Mật khẩu mới quá ngắn, ráng nặn ra thêm vài chữ nha Sếp (tối thiểu 6 ký tự)!");
    }

    try {
      setLoadingPassword(true);

      // 🕵️ THUẬT TOÁN TÌM TOKEN VÔ CỰC
      let currentToken = "";

      // Tầng 1: Tìm trong state user trực tiếp
      if (user) {
        currentToken = user.token || user.accessToken || user.data?.token || user.data?.accessToken || "";
      }

      // Tầng 2: Nếu chưa ra, lục tung LocalStorage
      if (!currentToken && typeof window !== "undefined") {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          try {
            const item = JSON.parse(localStorage.getItem(key));
            if (item?.state?.user?.token) currentToken = item.state.user.token;
            if (item?.state?.token) currentToken = item.state.token;
          } catch (err) { } // Bỏ qua nếu ko phải JSON
        }
      }

      // Tầng 3: Cú chót, lấy thử key "token" thuần túy
      if (!currentToken && typeof window !== "undefined") {
        currentToken = localStorage.getItem("token") || "";
      }

      // Vẫn không có thì giơ tay đầu hàng
      if (!currentToken || currentToken.length < 10) {
        return toast.error("Bảo vệ từ chối: Không tìm thấy vé (Token) của Sếp! Thử đăng nhập lại nha.");
      }

      // ⚠️ GỌI CHUẨN API TỪ ROUTE AUTH.JS CỦA SẾP
      await axios.post("https://doan-ecommerce-backend.vercel.app/api/v1/auth/changepassword", {
        oldpassword: oldPassword,
        newpassword: newPassword
      }, {
        headers: { Authorization: `Bearer ${currentToken}` }
      });

      toast.success("🔒 Đã đổi mật khẩu thành công! Tài khoản an toàn tuyệt đối!", {
        style: { borderRadius: '12px', background: '#4f46e5', color: '#fff', fontWeight: 'bold' }
      });

      // Reset form
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");

    } catch (error) {
      console.error("Lỗi đổi mật khẩu:", error);
      const errorMsg = typeof error.response?.data === 'string' ? error.response.data : "Mật khẩu cũ không chính xác!";
      toast.error(`❌ Cập nhật xịt rồi: ${errorMsg}`);
    } finally {
      setLoadingPassword(false);
    }
  };

  if (!isClient || !user) return null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-blue-200">

      {/* 🚀 HEADER COVER */}
      <div className="bg-slate-900 pt-16 pb-32 relative overflow-hidden">
        <div className="absolute top-[-50%] right-[-10%] w-[500px] h-[500px] rounded-full bg-blue-600/20 blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-[-20%] left-[-10%] w-[300px] h-[300px] rounded-full bg-purple-600/20 blur-[100px] pointer-events-none"></div>

        <div className="max-w-5xl mx-auto px-4 relative z-10 text-center">
          <span className="inline-block py-1 px-3 rounded-full bg-white/10 border border-white/20 text-blue-300 text-[10px] font-black tracking-widest uppercase mb-3 backdrop-blur-md">
            Trạm Điểu Khiển Cá Nhân
          </span>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight uppercase">
            HỒ SƠ <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">CHỦ TỊCH</span>
          </h1>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 w-full grow -mt-20 relative z-20 pb-20">
        <div className="flex flex-col md:flex-row gap-8">

          {/* 🚀 CỘT TRÁI: AVATAR & THẺ TÊN */}
          <div className="md:w-1/3 space-y-6">

            {/* Box Avatar */}
            <div className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden relative group p-8 flex flex-col items-center text-center">
              <div className="relative mb-6">
                <div className="absolute -inset-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full blur-md opacity-40 group-hover:opacity-75 transition-opacity duration-500 animate-spin-slow"></div>
                <div className="relative w-40 h-40 rounded-full border-4 border-white shadow-xl bg-slate-50 overflow-hidden group/avatar">
                  <img
                    src={previewImage}
                    alt="Avatar"
                    className={`w-full h-full object-cover transition-all duration-500 ${loading ? 'opacity-50 grayscale scale-95' : 'group-hover/avatar:scale-110'}`}
                  />

                  {loading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm z-20">
                      <div className="animate-spin rounded-full h-10 w-10 border-b-4 border-white"></div>
                    </div>
                  )}

                  <button
                    onClick={() => fileInputRef.current.click()}
                    disabled={loading}
                    className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/60 backdrop-blur-sm opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-300 z-10 cursor-pointer text-white"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8 mb-1"><path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" /><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" /></svg>
                    <span className="text-[10px] font-black uppercase tracking-widest">Đổi Ảnh</span>
                  </button>

                  <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                </div>
              </div>

              <h3 className="text-2xl font-black text-slate-900 tracking-tight">{user.username || user.name}</h3>
              <p className="text-sm font-medium text-slate-500 mt-1">{user.email}</p>

              <div className="mt-6 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100 text-blue-700 px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest shadow-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                </span>
                {user.role?.name || user.role || 'THÀNH VIÊN VIP'}
              </div>
            </div>

            {/* Nút Kho Hàng */}
            <Link
              href="/profile/reservations"
              className="flex items-center justify-between w-full bg-gradient-to-r from-slate-900 to-slate-800 p-6 rounded-[2rem] shadow-[0_10px_30px_rgba(0,0,0,0.15)] hover:shadow-[0_15px_40px_rgba(37,99,235,0.3)] hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-colors duration-500"></div>
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300 border border-white/10 backdrop-blur-sm shadow-inner">
                  ⏳
                </div>
                <div className="text-left">
                  <h4 className="font-black text-white text-lg tracking-tight mb-0.5">Kho Hàng Giữ</h4>
                  <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest">Kiểm tra ngay</p>
                </div>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-6 h-6 text-slate-400 group-hover:text-white group-hover:translate-x-1 transition-all relative z-10"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
            </Link>

          </div>

          {/* 🚀 CỘT PHẢI: FORM THÔNG TIN & ĐỔI MẬT KHẨU */}
          <div className="md:w-2/3 space-y-8">

            {/* Box Thông tin cơ bản */}
            <div className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-8 md:p-10 flex flex-col">
              <h2 className="text-xl font-black text-slate-900 mb-6 pb-5 border-b border-slate-100 flex items-center gap-3 tracking-tight">
                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center shadow-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
                </div>
                Hồ Sơ Của Tôi
              </h2>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="relative group">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Tên hiển thị</label>
                    <div className="absolute inset-y-0 left-0 top-[26px] pl-5 flex items-center pointer-events-none text-slate-400">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
                    </div>
                    <input
                      type="text" defaultValue={user.username || user.name} readOnly
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-5 py-4 text-slate-800 font-bold focus:outline-none focus:ring-0 cursor-not-allowed opacity-80"
                    />
                  </div>

                  <div className="relative group">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Địa chỉ Email</label>
                    <div className="absolute inset-y-0 left-0 top-[26px] pl-5 flex items-center pointer-events-none text-slate-400">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>
                    </div>
                    <input
                      type="email" defaultValue={user.email} readOnly
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-5 py-4 text-slate-800 font-bold focus:outline-none focus:ring-0 cursor-not-allowed opacity-80"
                    />
                  </div>
                </div>

                <div className="relative group">
                  <div className="flex items-center justify-between mb-2 ml-1">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Số điện thoại</label>
                    <span className="bg-amber-100 text-amber-600 text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-widest">Coming Soon</span>
                  </div>
                  <div className="absolute inset-y-0 left-0 top-[26px] pl-5 flex items-center pointer-events-none text-slate-300">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-2.896-1.596-5.273-3.973-6.869-6.869l1.293-.97c.362-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" /></svg>
                  </div>
                  <input type="text" placeholder="Tính năng đang được phát triển..." disabled className="w-full bg-slate-50/50 border border-slate-200 border-dashed rounded-2xl pl-12 pr-5 py-4 text-slate-400 font-medium cursor-not-allowed" />
                </div>
              </div>
            </div>

            {/* 🚀 BOX ĐỔI MẬT KHẨU TÀI KHOẢN */}
            <div className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-8 md:p-10 flex flex-col">
              <h2 className="text-xl font-black text-slate-900 mb-6 pb-5 border-b border-slate-100 flex items-center gap-3 tracking-tight">
                <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg>
                </div>
                Bảo Mật Tài Khoản
              </h2>

              <form onSubmit={handleChangePassword} className="space-y-6">

                <div className="relative group">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Mật Khẩu Hiện Tại <span className="text-rose-500">*</span></label>
                  <div className="absolute inset-y-0 left-0 top-[26px] pl-5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" /></svg>
                  </div>
                  <input
                    type="password"
                    required
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    placeholder="Nhập mật khẩu đang xài..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-5 py-4 text-slate-800 font-bold focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:font-medium tracking-widest"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="relative group">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Mật Khẩu Mới <span className="text-rose-500">*</span></label>
                    <div className="absolute inset-y-0 left-0 top-[26px] pl-5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 10.5v6m3-3H9m4.06-7.19l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" /></svg>
                    </div>
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Mật khẩu mới siêu mạnh..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-5 py-4 text-slate-800 font-bold focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:font-medium tracking-widest"
                    />
                  </div>

                  <div className="relative group">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Xác Nhận Lại <span className="text-rose-500">*</span></label>
                    <div className="absolute inset-y-0 left-0 top-[26px] pl-5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Gõ lại cho chắc ăn..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-5 py-4 text-slate-800 font-bold focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:font-medium tracking-widest"
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    disabled={loadingPassword}
                    className="bg-slate-900 text-white font-black px-10 py-4 rounded-2xl uppercase tracking-widest text-xs transition-all shadow-lg hover:shadow-indigo-500/30 hover:bg-indigo-600 hover:-translate-y-1 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {loadingPassword ? (
                      <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Đang Đổi...</>
                    ) : (
                      <><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg> Lưu Mật Khẩu</>
                    )}
                  </button>
                </div>
              </form>
            </div>

          </div>

        </div>
      </div>

      <Footer />
    </div>
  );
}