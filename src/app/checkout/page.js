"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import useCartStore from "../../store/useCartStore";
import useAuthStore from "../../store/useAuthStore";

export default function CheckoutPage() {
  const { cart, clearCart } = useCartStore();
  const { user, token } = useAuthStore();
  const router = useRouter();

  const [isClient, setIsClient] = useState(false);
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const formatPrice = (price) => price?.toLocaleString("vi-VN") + " VNĐ";

  const handleCheckout = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Gói ghém dữ liệu KHỚP 100% VỚI SCHEMAS/ORDERS.JS
      const orderData = {
        // Tạm thời hardcode ID nếu user từ Zustand chưa có _id (để test ko bị lỗi 400)
        user: user?.id || user?._id || "69a5462f086d74c9e772b804", 
        
        items: cart.map(item => ({ 
          product: item._id, 
          quantity: item.quantity, 
          price: item.price 
        })),
        
        totalAmount: calculateTotal(),
        paymentMethod: 'COD',
        paymentStatus: 'Pending',
        orderStatus: 'Processing'
      };

      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      // 3. Bắn lệnh chốt đơn
      await axios.post("https://doan-ecommerce-backend.vercel.app/api/v1/orders", orderData, config);

      alert("🎉 Đặt hàng thành công chấn động! Cảm ơn ní đã ủng hộ nha!");
      
      clearCart(); 
      router.push("/"); 
    } catch (err) {
      console.error("Lỗi đặt hàng:", err);
      alert("Trời ơi lỗi rồi: " + (err.response?.data?.message || "BE vẫn chưa chịu nhận!"));
    } finally {
      setLoading(false);
    }
  };

  // Tránh lỗi Hydration
  if (!isClient) return null;

  // BẪY 1: Chặn đầu mấy đứa chưa đăng nhập
  if (!user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6">
        <div className="text-6xl mb-6">🛑</div>
        <h2 className="text-3xl font-extrabold text-gray-900 mb-4">Khoan đã ní ơi!</h2>
        <p className="text-gray-600 font-medium mb-8 text-lg">Ông phải đăng nhập thì mới biết giao hàng đi đâu chứ!</p>
        <Link href="/login" className="bg-blue-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg hover:shadow-xl hover:-translate-y-1">
          Đăng nhập ngay và luôn
        </Link>
      </div>
    );
  }

  // BẪY 2: Chặn mấy đứa rảnh vô trang checkout mà giỏ hàng trống trơn
  if (cart.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6">
        <div className="text-6xl mb-6">🛒</div>
        <h2 className="text-3xl font-extrabold text-gray-900 mb-4">Giỏ hàng trống trơn!</h2>
        <p className="text-gray-600 font-medium mb-8 text-lg">Chưa mua món nào mà chốt đơn cái gì? 😂</p>
        <Link href="/" className="bg-blue-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg hover:shadow-xl hover:-translate-y-1">
          Quay lại mua sắm lẹ
        </Link>
      </div>
    );
  }

  // GIAO DIỆN CHÍNH
  return (
    <div className="max-w-6xl mx-auto p-6 md:p-10">
      <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-8 tracking-tight">
        📦 Thanh Toán & Giao Hàng
      </h1>

      <div className="flex flex-col lg:flex-row gap-10">
        
        {/* Cột trái: Form điền thông tin */}
        <div className="lg:w-2/3 bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Thông tin nhận hàng</h2>
          
          <form id="checkout-form" onSubmit={handleCheckout} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Họ Tên Người Nhận</label>
              <input
                type="text"
                disabled
                value={user.username || "Tên bị lỗi hiển thị"}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-500 font-medium cursor-not-allowed"
              />
              <p className="text-xs text-gray-400 mt-1">*Lấy từ thông tin tài khoản đăng nhập</p>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Số Điện Thoại</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Ví dụ: 0909 123 456"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-blue-500 focus:border-blue-500 font-medium shadow-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Địa Chỉ Giao Hàng Chi Tiết</label>
              <textarea
                required
                rows="3"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố..."
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-blue-500 focus:border-blue-500 font-medium shadow-sm"
              />
            </div>
          </form>
        </div>

        {/* Cột phải: Hóa đơn tóm tắt */}
        <div className="lg:w-1/3">
          <div className="bg-gray-50 p-6 rounded-3xl border border-gray-200 sticky top-24">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Tóm tắt đơn hàng</h2>
            
            <div className="max-h-60 overflow-y-auto pr-2 mb-4 space-y-3">
              {cart.map((item) => (
                <div key={item._id} className="flex justify-between items-center text-sm font-medium text-gray-600">
                  <span className="truncate pr-4 flex-1">{item.title} <span className="text-blue-600 font-bold">x{item.quantity}</span></span>
                  <span className="font-bold text-gray-800 whitespace-nowrap">{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-300 pt-4 mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-500 font-bold text-sm">Phí vận chuyển:</span>
                <span className="text-gray-800 font-bold text-sm">Miễn phí (Freeship)</span>
              </div>
              <div className="flex justify-between items-center mt-4">
                <span className="text-gray-800 font-black text-lg uppercase">Tổng tiền:</span>
                <span className="text-red-600 font-black text-2xl">{formatPrice(calculateTotal())}</span>
              </div>
            </div>

            <button
              type="submit"
              form="checkout-form"
              disabled={loading}
              className={`w-full py-4 px-4 rounded-xl shadow-md text-lg font-black text-white flex justify-center items-center gap-2 ${loading ? 'bg-green-400' : 'bg-green-600 hover:bg-green-700 hover:-translate-y-0.5 transition-all'}`}
            >
              {loading ? "Đang xử lý..." : "CHỐT ĐƠN & GIAO HÀNG"}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}