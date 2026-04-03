"use client";

import Link from "next/link";
import useCartStore from "../store/useCartStore";
import useAuthStore from "../store/useAuthStore";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "react-hot-toast";

export default function Navbar() {
  const totalItems = useCartStore((state) => state.getTotalItems());
  const { clearCart } = useCartStore();
  const { user, logout } = useAuthStore();

  const router = useRouter();
  const pathname = usePathname();

  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleLogout = () => {
    logout();
    clearCart();
    toast.success("Đã đăng xuất thành công! Hẹn gặp lại Chủ Tịch nha! 👋", {
      duration: 3000,
      style: { borderRadius: '12px', background: '#0f172a', color: '#fff', fontWeight: 'bold' }
    });
    router.push("/");
  };

  const isActive = (path) => pathname === path;

  // TẠO LƯỚI LỌC CHỦ TỊCH TẠI ĐÂY:
  const isAdmin = user && (
    user.role === 'admin' ||
    user.role === 'ADMIN' ||
    user.role === '69c79a3c076efe132ceab729' ||
    user.role?.name === 'admin' ||
    user.role?._id === '69c79a3c076efe132ceab729' ||
    user.username === 'phattest'
  );

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-xl border-b border-slate-200 shadow-[0_4px_30px_rgb(0,0,0,0.03)] transition-all duration-300 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex justify-between items-center">

        {/* 🚀 LÔ GÔ TRÁI */}
        <Link href="/" className="flex items-center gap-1.5 text-2xl font-black tracking-tight hover:opacity-80 transition-opacity drop-shadow-sm group">
          <span className="bg-slate-900 text-white px-2.5 py-1 rounded-lg group-hover:bg-blue-600 transition-colors">2FAST</span>
          <span className="text-slate-900 group-hover:text-blue-600 transition-colors">.SHOP</span>
        </Link>

        {/* 🚀 MENU GIỮA (Chỉ hiện trên PC) */}
        <div className="hidden md:flex items-center gap-8 text-xs font-black uppercase tracking-widest h-full">
          {[
            { path: "/", label: "Trang Chủ" },
            { path: "/products", label: "Sản Phẩm" },
            { path: "/about", label: "Về Chúng Tôi" },
          ].map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={`relative h-full flex items-center transition-colors duration-300 ${isActive(item.path) ? "text-blue-600" : "text-slate-500 hover:text-slate-900 group"}`}
            >
              {item.label}
              {/* Hiệu ứng gạch dưới mượt mà */}
              <span className={`absolute bottom-0 left-0 w-full h-[3px] rounded-t-md transition-all duration-300 ${isActive(item.path) ? "bg-blue-600 opacity-100" : "bg-slate-900 opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0"}`}></span>
            </Link>
          ))}

          {/* NÚT ADMIN ĐẶC QUYỀN */}
          {isClient && isAdmin && (
            <Link href="/admin" className="relative inline-flex items-center justify-center px-4 py-2 font-black text-white transition-all duration-200 bg-gradient-to-r from-orange-500 to-rose-500 border border-transparent rounded-xl hover:shadow-[0_0_20px_rgba(249,115,22,0.4)] hover:-translate-y-0.5 uppercase tracking-widest text-[10px]">
              👑 KHU VỰC SẾP
            </Link>
          )}
        </div>

        {/* 🚀 KHU VỰC BÊN PHẢI (Giỏ hàng & User) */}
        <div className="flex items-center gap-5">

          {/* Lịch sử mua hàng */}
          {isClient && user && (
            <Link href="/history" className="text-[11px] font-black text-slate-400 hover:text-blue-600 transition-colors hidden lg:flex items-center gap-1.5 uppercase tracking-widest">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Lịch Sử
            </Link>
          )}

          {/* ICON GIỎ HÀNG VIP */}
          <Link href="/cart" className="relative p-2 text-slate-600 hover:text-blue-600 transition-colors group bg-slate-50 hover:bg-blue-50 rounded-full border border-slate-100 mr-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 group-hover:scale-110 transition-transform">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>

            {isClient && totalItems > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full shadow-sm ring-2 ring-white">
                {totalItems}
              </span>
            )}
          </Link>

          {/* Vạch chia */}
          <div className="w-px h-8 bg-slate-200 hidden sm:block"></div>

          {/* KHUNG USER & NÚT ĐĂNG NHẬP/ĐĂNG XUẤT */}
          <div className="hidden sm:flex items-center">
            {isClient && user ? (
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-full pl-3 pr-1 py-1 shadow-sm transition-all hover:border-slate-200">
                <Link href="/profile" className="flex items-center gap-2 cursor-pointer group">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-black uppercase">
                    {(user.username || user.name || "K")[0]}
                  </div>
                  <span className="font-bold text-xs text-slate-700 group-hover:text-blue-600 transition-colors pr-2">
                    {user.username || user.name || "Khách"}
                  </span>
                </Link>

                <button
                  onClick={handleLogout}
                  title="Đăng xuất"
                  className="w-7 h-7 flex items-center justify-center bg-white border border-slate-200 text-slate-400 rounded-full hover:bg-rose-500 hover:text-white hover:border-rose-500 transition-all"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5 ml-0.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" /></svg>
                </button>
              </div>
            ) : (
              <Link href="/login" className="bg-slate-900 text-white px-6 py-2.5 rounded-xl text-[11px] font-black hover:bg-blue-600 hover:-translate-y-0.5 transition-all shadow-lg hover:shadow-blue-500/30 uppercase tracking-widest flex items-center gap-2">
                ĐĂNG NHẬP
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
              </Link>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
}