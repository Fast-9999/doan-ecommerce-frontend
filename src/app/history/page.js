"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import axios from "axios";
import useAuthStore from "../../store/useAuthStore";
import Footer from "../../components/Footer"; 

export default function OrderHistoryPage() {
  const { user } = useAuthStore();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    if (user) {
      fetchMyOrders();
    }
  }, [user]);

  const fetchMyOrders = async () => {
    try {
      const response = await axios.get("https://doan-ecommerce-backend.vercel.app/api/v1/orders");
      
      let allOrders = response.data;

      if (allOrders && typeof allOrders === 'object' && !Array.isArray(allOrders)) {
        allOrders = allOrders.data || allOrders.orders || allOrders.result || [];
      }

      if (!Array.isArray(allOrders)) {
        setOrders([]); 
        return;
      }

      // ==========================================
      // 🚀 BƯỚC 1: BẺ KHÓA TOKEN (Y CHANG BÊN CHECKOUT) ĐỂ LẤY ID THẬT
      // ==========================================
      let realUserId = user?._id || user?.id || user?.userId || user?.data?._id || user?.data?.id;
      let currentToken = user?.token || user?.accessToken;

      if (!currentToken) {
         currentToken = localStorage.getItem("token");
      }

      if (!realUserId && currentToken) {
        try {
          const payload = JSON.parse(atob(currentToken.split('.')[1]));
          realUserId = payload._id || payload.id || payload.userId;
          console.log("🔑 Đã lôi được ID thật từ Token để dò Lịch sử:", realUserId);
        } catch (error) {
          console.log("Token không hợp lệ để bẻ khóa.");
        }
      }

      realUserId = String(realUserId || "");
      const currentUserName = String(user?.username || user?.name || user?.data?.username || "").trim().toLowerCase();
      
      const fakeId1 = "64a5462f086d74c9e772b804";
      const fakeId2 = "69a5462f086d74c9e772b804";

      // ==========================================
      // 🚀 BƯỚC 2: LỌC ĐƠN HÀNG VỚI ID THẬT
      // ==========================================
      const myOrders = allOrders.filter(order => {
        if (!order) return false; 
        
        let orderUserId = "";
        if (order.user) {
           orderUserId = String(typeof order.user === 'object' ? (order.user._id || order.user.id) : order.user);
        }

        // 1. Trúng ID chuẩn là lụm ngay không nói nhiều
        if (realUserId && realUserId !== "undefined" && orderUserId === realUserId) {
            return true;
        }
        
        // 2. Vớt vát: Dò theo Tên nếu ID là ảo
        const orderName = String(order.shippingAddress?.fullName || order.fullName || order.user?.username || "").trim().toLowerCase();

        if (orderUserId === fakeId1 || orderUserId === fakeId2 || !orderUserId) {
            if (currentUserName && orderName.includes(currentUserName)) return true;
            if (currentUserName && currentUserName === orderName) return true;
        }

        return false;
      });

      myOrders.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

      setOrders(myOrders);
    } catch (err) {
      console.error("Lỗi lấy lịch sử đơn hàng:", err);
      setOrders([]); 
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => price?.toLocaleString("vi-VN") + " VNĐ";

  const getStatusColor = (status) => {
    switch (status) {
      case 'Processing': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Shipping': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'Delivered': return 'bg-green-100 text-green-700 border-green-200';
      case 'Cancelled': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'Processing': return 'Đang xử lý';
      case 'Shipping': return 'Đang giao hàng';
      case 'Delivered': return 'Đã giao thành công';
      case 'Cancelled': return 'Đã hủy';
      default: return status || 'Đang chờ';
    }
  };

  if (!isClient) return null;

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <div className="grow flex flex-col items-center justify-center text-center p-6 bg-white/50 backdrop-blur-sm m-4 rounded-3xl border border-slate-100 shadow-sm">
          <div className="text-8xl mb-6 drop-shadow-md">🔒</div>
          <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Khu Vực Tuyệt Mật!</h2>
          <p className="text-slate-500 font-medium mb-10 text-lg">Chủ Tịch phải đăng nhập thì mới xem được lịch sử ăn chơi nha.</p>
          <Link href="/login" className="bg-slate-900 text-white px-10 py-4 rounded-xl font-black hover:bg-blue-600 transition-colors shadow-xl hover:shadow-blue-500/30 uppercase tracking-widest text-sm">
            Đi Tới Đăng Nhập
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <div className="max-w-6xl mx-auto p-6 md:p-10 grow w-full">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
            <div>
                <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-2">
                    Lịch Sử Mua Hàng
                </h1>
                <p className="text-slate-500 font-medium">Nơi lưu giữ những pha chốt đơn kinh điển của Chủ Tịch.</p>
            </div>
            <div className="bg-white px-5 py-2.5 rounded-full shadow-sm border border-slate-200 font-bold text-slate-600">
                Tổng đơn hàng: <span className="text-blue-600">{orders.length}</span>
            </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-32 bg-white rounded-4xl shadow-sm border border-slate-100">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600"></div>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-4xl p-20 text-center border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <div className="text-8xl mb-6 grayscale opacity-30">🏜️</div>
            <h2 className="text-3xl font-black text-slate-800 mb-4 tracking-tight">Trống Trơn!</h2>
            <p className="text-slate-500 mb-10 font-medium text-lg">Chưa thấy dấu vết của sự giàu sang ở đây. Chốt đơn ngay cho nóng!</p>
            <Link href="/products" className="bg-blue-600 text-white px-10 py-4 rounded-xl font-black hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl uppercase tracking-widest text-sm inline-block">
              Bắt đầu mua sắm
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-4xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-100 text-slate-400 text-xs uppercase tracking-widest">
                    <th className="p-6 font-black">Mã Đơn / Ngày Đặt</th>
                    <th className="p-6 font-black">Sản Phẩm</th>
                    <th className="p-6 font-black">Tổng Tiền</th>
                    <th className="p-6 font-black">Trạng Thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {orders.map((order) => (
                    <tr key={order._id} className="hover:bg-slate-50/80 transition-colors duration-200">
                      
                      <td className="p-6">
                        <div className="text-sm font-black text-slate-800 mb-1">
                          #{order._id.substring(order._id.length - 6).toUpperCase()}
                        </div>
                        <div className="text-xs text-slate-500 font-medium">
                          {new Date(order.createdAt).toLocaleDateString('vi-VN')} lúc {new Date(order.createdAt).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}
                        </div>
                      </td>

                      <td className="p-6 text-sm text-slate-600 font-medium">
                        <div className="flex items-center gap-2 bg-slate-100 w-max px-3 py-1.5 rounded-lg border border-slate-200/50">
                          <span className="text-lg">📦</span>
                          <span className="font-bold text-slate-800">{order.orderItems?.length || order.items?.length || 0} món</span>
                        </div>
                      </td>

                      <td className="p-6">
                        <div className="text-base font-black text-red-600">
                          {formatPrice(order.totalPrice || order.totalAmount || 0)}
                        </div>
                        <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1 bg-slate-100 inline-block px-2 py-0.5 rounded">
                          {order.paymentMethod === 'COD' ? 'Tiền mặt (COD)' : 'Chuyển khoản'}
                        </div>
                      </td>

                      <td className="p-6">
                        <span className={`px-4 py-1.5 rounded-lg text-xs font-bold border shadow-sm ${getStatusColor(order.orderStatus || order.status)}`}>
                          {getStatusText(order.orderStatus || order.status)}
                        </span>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
}