"use client";

import Link from "next/link";
import useCartStore from "../store/useCartStore";
import useAuthStore from "../store/useAuthStore";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function Navbar() {
  const totalItems = useCartStore((state) => state.getTotalItems());
  // 🚀 Gọi luôn hàm clearCart từ kho Giỏ Hàng ra để dọn dẹp
  const { clearCart } = useCartStore(); 
  const { user, logout } = useAuthStore(); 
  
  const router = useRouter();
  const pathname = usePathname(); 
  
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleLogout = () => {
    // 1. Đăng xuất tài khoản
    logout();
    
    // 🚀 2. FIX LỖI GIỎ HÀNG DÍNH NGẢI: Quét sạch giỏ hàng khi người dùng log out!
    clearCart();

    // 3. Đá về trang chủ
    alert("Đã đăng xuất thành công! Hẹn gặp lại ní nha! 👋");
    router.push("/");
  };

  // Hàm check xem link nào đang Active để tô màu xanh/đen
  const isActive = (path) => pathname === path ? "text-blue-600 font-black" : "text-slate-600 font-black hover:text-blue-600";

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
    <nav className="bg-white/90 backdrop-blur-md border-b border-slate-100 sticky top-0 z-50 shadow-[0_2px_15px_rgb(0,0,0,0.03)] transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex justify-between items-center">
        
        {/* LÔ GÔ TRÁI (Thiết kế giống mẫu FAST.SHOP) */}
        <Link href="/" className="flex items-center gap-2 text-3xl font-black text-slate-900 tracking-tighter hover:scale-105 transition-transform duration-300 drop-shadow-sm">
          2FAST<span className="text-blue-600">.</span>SHOP 
          <span className="text-2xl ml-1 text-slate-400 opacity-80 mix-blend-multiply">🛒</span> 
        </Link>

        {/* MENU GIỮA (Giữ nguyên style như hình) */}
        <div className="hidden md:flex items-center gap-10 text-[13px] uppercase tracking-widest">
          <Link href="/" className={`transition-colors duration-200 ${isActive("/")}`}>
            Trang Chủ
          </Link>
          <Link href="/products" className={`transition-colors duration-200 ${isActive("/products")}`}>
            Sản Phẩm
          </Link>
          <Link href="/about" className={`transition-colors duration-200 ${isActive("/about")}`}>
            Về Chúng Tôi
          </Link>
          
          {/* NÚT ADMIN ẨN TRONG MENU */}
          {isClient && isAdmin && (
            <Link href="/admin" className="text-orange-500 font-black hover:text-orange-600 transition-colors duration-200 flex items-center gap-1.5 bg-orange-50 px-3 py-1.5 rounded-lg border border-orange-100">
              Khu Sếp 👑
            </Link>
          )}
        </div>

        {/* KHU VỰC BÊN PHẢI (Giỏ hàng & User) */}
        <div className="flex items-center gap-6">
          
          {/* Lịch sử mua hàng (Giữ lại nếu ông thích) */}
          {isClient && user && (
            <Link href="/history" className="text-sm font-black text-slate-500 hover:text-blue-600 transition hidden lg:block">
              Lịch Sử
            </Link>
          )}

          {/* ICON GIỎ HÀNG (Style hệt như mẫu) */}
          <Link href="/cart" className="relative text-slate-800 hover:text-blue-600 transition-colors group mr-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor" className="w-7 h-7 group-hover:-translate-y-1 transition-transform">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
            
            {isClient && totalItems > 0 && (
              <span className="absolute -top-2.5 -right-2.5 bg-red-500 text-white text-[11px] font-black w-5 h-5 flex items-center justify-center rounded-full shadow-md border-2 border-white animate-bounce">
                {totalItems}
              </span>
            )}
          </Link>

          {/* KHUNG USER & NÚT ĐĂNG NHẬP/ĐĂNG XUẤT */}
          <div className="border-l-2 pl-6 border-slate-100 hidden sm:flex items-center">
            {isClient && user ? (
              <div className="flex items-center space-x-4">
                <Link href="/profile" className="font-bold text-sm text-slate-600 hover:text-blue-600 transition cursor-pointer">
                  Chào, <span className="text-blue-600">{user.username || user.name || "Khách"}</span>!
                </Link>
                <button 
                  onClick={handleLogout}
                  className="bg-slate-50 border border-slate-200 text-slate-600 px-5 py-2.5 rounded-xl font-black hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all shadow-sm text-xs tracking-widest uppercase"
                >
                  Đăng Xuất
                </button>
              </div>
            ) : (
              <Link href="/login" className="bg-slate-900 text-white px-7 py-3 rounded-xl text-xs font-black hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/20 uppercase tracking-widest">
                Đăng nhập
              </Link>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
}