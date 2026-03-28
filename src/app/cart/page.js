"use client";

import Link from "next/link";
import useCartStore from "../../store/useCartStore";
import { useEffect, useState } from "react";

export default function CartPage() {
  // Lôi thêm mấy hàm mới làm ra xài
  const { cart, removeFromCart, updateQuantity } = useCartStore();
  
  const [isClient, setIsClient] = useState(false);
  useEffect(() => { setIsClient(true); }, []);

  const formatPrice = (price) => price?.toLocaleString('vi-VN') + " VNĐ";

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  if (!isClient) return null; 

  if (cart.length === 0) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-700 mb-6">Giỏ hàng của bạn đang trống trơn! 😅</h2>
        <Link href="/" className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition shadow-md hover:shadow-lg">
          Quay lại mua sắm ngay
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 md:p-10">
      <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-8 tracking-tight">
        🛒 Giỏ Hàng Của Bạn
      </h1>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8">
        
        <div className="divide-y divide-gray-100">
          {cart.map((item) => (
            <div key={item._id} className="flex flex-col sm:flex-row items-center py-6 gap-6 relative group">
              
              <img
                src={item.images && item.images.length > 0 ? item.images[0] : "https://via.placeholder.com/150"}
                alt={item.title}
                className="w-24 h-24 object-cover rounded-2xl shadow-sm"
              />
              
              <div className="grow text-center sm:text-left">
                <h3 className="text-lg font-bold text-gray-800 mb-1">{item.title}</h3>
                <p className="text-gray-500 font-medium">{formatPrice(item.price)}</p>
              </div>
              
              {/* Nút Cộng/Trừ số lượng */}
              <div className="flex items-center bg-gray-50 rounded-xl border border-gray-200">
                <button 
                  onClick={() => updateQuantity(item._id, -1)}
                  className="px-4 py-2 text-gray-600 font-bold hover:text-blue-600 transition"
                >−</button>
                <span className="font-bold text-gray-800 w-8 text-center">{item.quantity}</span>
                <button 
                  onClick={() => updateQuantity(item._id, 1)}
                  className="px-4 py-2 text-gray-600 font-bold hover:text-blue-600 transition"
                >+</button>
              </div>
              
              <div className="text-xl font-black text-blue-600 w-full sm:w-32 text-center sm:text-right">
                {formatPrice(item.price * item.quantity)}
              </div>

              {/* Nút Xóa (Thùng rác) */}
              <button 
                onClick={() => removeFromCart(item._id)}
                className="absolute top-4 right-0 sm:relative sm:top-0 text-red-400 hover:text-red-600 bg-red-50 hover:bg-red-100 p-2 rounded-lg transition"
                title="Xóa món này"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
              </button>
              
            </div>
          ))}
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200 flex flex-col sm:flex-row justify-end items-center gap-4">
          <span className="text-xl font-bold text-gray-500 uppercase tracking-wider">Tổng cộng:</span>
          <span className="text-4xl font-black text-red-600">{formatPrice(calculateTotal())}</span>
        </div>

        {/* ĐÃ CẬP NHẬT: Biến Nút thành thẻ Link trỏ về trang /checkout */}
        <div className="mt-8 flex justify-end">
          <Link href="/checkout" className="w-full sm:w-auto flex items-center justify-center bg-green-500 hover:bg-green-600 text-white px-10 py-4 rounded-2xl font-black text-lg shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all">
            TIẾN HÀNH THANH TOÁN
          </Link>
        </div>

      </div>
    </div>
  );
}