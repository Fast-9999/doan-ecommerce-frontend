"use client";

import Link from "next/link";
import useCartStore from "../store/useCartStore";
import useAuthStore from "../store/useAuthStore";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const totalItems = useCartStore((state) => state.getTotalItems());
  const { user, logout } = useAuthStore(); 
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleLogout = () => {
    logout();
    alert("Đã đăng xuất thành công! Hẹn gặp lại ní nha! 👋");
    router.push("/");
  };

  // TẠO LƯỚI LỌC CHỦ TỊCH TẠI ĐÂY:
  // Check xem role có phải chữ admin, hoặc khớp đúng cái ID quyền admin hồi nãy ko
  const isAdmin = user && (
    user.role === 'admin' || 
    user.role === 'ADMIN' || 
    user.role === '69c79a3c076efe132ceab729' || 
    user.role?.name === 'admin' || 
    user.role?._id === '69c79a3c076efe132ceab729' ||
    user.username === 'phattest' // <-- ĐẶC QUYỀN CHỦ TỊCH: Cứ là phattest thì cho qua!
  );

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        
        <Link href="/" className="text-2xl font-black text-blue-600 tracking-tight">
          🚀 Phát <span className="text-orange-500">Shop</span>
        </Link>

        <div className="flex items-center space-x-4 sm:space-x-6">
          <Link href="/" className="hidden sm:block text-gray-600 hover:text-blue-600 font-semibold transition">
            Trang Chủ
          </Link>
          
          <Link href="/cart" className="flex items-center text-gray-600 hover:text-blue-600 font-semibold transition relative group">
            <span>Giỏ Hàng</span>
            {isClient && totalItems > 0 && (
              <span className="absolute -top-3 -right-5 bg-red-500 text-white text-[11px] font-black px-2 py-0.5 rounded-full shadow-sm group-hover:scale-110 transition-transform">
                {totalItems}
              </span>
            )}
          </Link>

          {isClient && user && (
            <Link href="/history" className="text-gray-600 hover:text-blue-600 font-semibold transition hidden sm:block">
              Lịch Sử
            </Link>
          )}

          {/* CHỈ HIỆN KHI LÀ ADMIN ĐÍCH THỰC */}
          {isClient && isAdmin && (
            <Link href="/admin" className="bg-slate-900 text-white px-4 py-1.5 rounded-lg text-sm font-bold hover:bg-slate-800 transition shadow-sm hidden sm:block">
              👑 Admin Panel
            </Link>
          )}

          {isClient && user ? (
            <div className="flex items-center space-x-3 border-l-2 border-gray-100 pl-4">
              <span className="font-bold text-gray-800 hidden sm:block">
                Chào, <span className="text-blue-600">{user.username}</span>!
              </span>
              <button 
                onClick={handleLogout}
                className="bg-red-50 text-red-600 px-4 py-2 rounded-lg font-bold hover:bg-red-500 hover:text-white transition shadow-sm hover:shadow-md text-sm"
              >
                Đăng Xuất
              </button>
            </div>
          ) : (
            <Link href="/login" className="bg-blue-600 text-white px-5 py-2 rounded-lg font-bold hover:bg-blue-700 transition shadow-sm hover:shadow-md">
              Đăng Nhập
            </Link>
          )}

        </div>
      </div>
    </nav>
  );
}