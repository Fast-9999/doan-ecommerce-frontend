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
      // 🚀 BƯỚC 1: BẺ KHÓA TOKEN ĐỂ LẤY ID THẬT
      // ==========================================
      let realUserId = user?._id || user?.id || user?.userId || user?.data?._id || user?.data?.id;
      let currentToken = user?.token || user?.accessToken;

      if (!currentToken && typeof window !== 'undefined') {
        currentToken = localStorage.getItem("token");
      }

      if (!realUserId && currentToken) {
        try {
          const payload = JSON.parse(atob(currentToken.split('.')[1]));
          realUserId = payload._id || payload.id || payload.userId;
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

        // 1. Trúng ID chuẩn là lụm
        if (realUserId && realUserId !== "undefined" && orderUserId === realUserId) {
          return true;
        }

        // 2. Vớt vát theo Tên nếu ID ảo
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
    switch (status?.toLowerCase()) {
      case 'processing': return 'bg-blue-50 text-blue-600 border-blue-200 ring-blue-100';
      case 'shipping': return 'bg-indigo-50 text-indigo-600 border-indigo-200 ring-indigo-100';
      case 'delivered': return 'bg-emerald-50 text-emerald-600 border-emerald-200 ring-emerald-100';
      case 'cancelled': return 'bg-rose-50 text-rose-600 border-rose-200 ring-rose-100';
      default: return 'bg-slate-50 text-slate-600 border-slate-200 ring-slate-100';
    }
  };

  const getStatusText = (status) => {
    switch (status?.toLowerCase()) {
      case 'processing': return '⏳ Đang xử lý';
      case 'shipping': return '🚚 Đang giao hàng';
      case 'delivered': return '✅ Giao thành công';
      case 'cancelled': return '❌ Đã hủy';
      default: return status || 'Đang chờ';
    }
  };

  // Helper để lấy ảnh sản phẩm đầu tiên trong đơn hàng
  const getFirstProductImage = (order) => {
    const items = order.orderItems || order.items || [];
    if (items.length > 0) {
      const firstItem = items[0];
      // Xử lý các trường hợp lưu ảnh khác nhau từ Backend
      if (firstItem.image) return firstItem.image;
      if (firstItem.product?.image) return firstItem.product.image;
      if (firstItem.product?.images && firstItem.product.images.length > 0) return firstItem.product.images[0];
    }
    return "https://res.cloudinary.com/dvktw2kls/image/upload/v1707981504/default_image_placeholder.jpg"; // Placeholder mặc định
  };

  if (!isClient) return null;

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <div className="grow flex flex-col items-center justify-center text-center p-6 m-4 md:m-10">
          <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-lg border border-slate-100 mb-6 relative">
            <div className="text-6xl drop-shadow-md">🕵️‍♂️</div>
            <div className="absolute -bottom-2 -right-2 bg-rose-500 text-white w-10 h-10 rounded-full flex items-center justify-center border-4 border-slate-50 text-xl">🔒</div>
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4 tracking-tight">Khu Vực Tuyệt Mật!</h2>
          <p className="text-slate-500 font-medium mb-10 max-w-md text-lg">Chủ Tịch vui lòng đăng nhập để xem lại những chiến tích săn sale của mình nha.</p>
          <Link href="/login" className="group relative inline-flex items-center justify-center px-10 py-4 font-black text-white transition-all duration-200 bg-slate-900 border border-transparent rounded-2xl hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 shadow-xl hover:shadow-blue-500/30 uppercase tracking-widest text-sm">
            Đăng Nhập Ngay
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">

      {/* HEADER BANNER */}
      <div className="bg-slate-900 pt-16 pb-24 relative overflow-hidden">
        <div className="absolute top-[-50%] right-[-10%] w-[500px] h-[500px] rounded-full bg-blue-600/20 blur-[100px] pointer-events-none"></div>
        <div className="max-w-5xl mx-auto px-4 relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <span className="inline-block py-1 px-3 rounded-full bg-white/10 border border-white/20 text-blue-300 text-xs font-black tracking-widest uppercase mb-4 backdrop-blur-md">
              Tài khoản của bạn
            </span>
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-2">
              Lịch Sử Đơn Hàng
            </h1>
            <p className="text-slate-400 font-medium text-lg">Quản lý những siêu phẩm Sếp đã rước về dinh.</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md border border-white/20 px-6 py-4 rounded-2xl text-center shadow-lg">
            <div className="text-3xl font-black text-white">{orders.length}</div>
            <div className="text-[10px] text-blue-300 font-bold uppercase tracking-widest mt-1">Đơn Hàng</div>
          </div>
        </div>
      </div>

      {/* DANH SÁCH ĐƠN HÀNG */}
      <div className="max-w-5xl mx-auto px-4 -mt-12 relative z-20 grow w-full mb-20">

        {loading ? (
          <div className="flex justify-center items-center py-32 bg-white rounded-3xl shadow-sm border border-slate-100">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 border-4 border-blue-100 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
            </div>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 md:p-24 text-center border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <div className="w-40 h-40 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8 border-8 border-white shadow-inner">
              <div className="text-7xl grayscale opacity-40">🛍️</div>
            </div>
            <h2 className="text-2xl font-black text-slate-800 mb-3 tracking-tight">Chưa có đơn hàng nào!</h2>
            <p className="text-slate-500 mb-10 font-medium max-w-md mx-auto">Giỏ hàng của Sếp đang trống vắng. Hãy dạo quanh cửa hàng và chọn cho mình những món đồ ưng ý nhất nhé!</p>
            <Link href="/products" className="bg-blue-600 text-white px-8 py-4 rounded-xl font-black hover:bg-slate-900 transition-colors shadow-lg hover:shadow-xl uppercase tracking-widest text-sm inline-block">
              Khám Phá Ngay
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {orders.map((order) => {
              const itemsCount = order.orderItems?.length || order.items?.length || 0;
              const firstImage = getFirstProductImage(order);

              return (
                <div key={order._id} className="bg-white rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_10px_40px_rgb(0,0,0,0.08)] transition-all duration-300 border border-slate-100 overflow-hidden group">

                  {/* Header của từng đơn hàng */}
                  <div className="bg-slate-50/50 px-6 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center text-xl font-black text-slate-800">
                        #{order._id.substring(order._id.length - 4).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Ngày Đặt Hàng</div>
                        <div className="text-sm font-black text-slate-800">
                          {new Date(order.createdAt).toLocaleDateString('vi-VN')} <span className="text-slate-400 font-medium">| {new Date(order.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                    </div>
                    <span className={`px-4 py-1.5 rounded-full text-xs font-black border ring-2 ring-offset-1 ${getStatusColor(order.orderStatus || order.status)} uppercase tracking-wide`}>
                      {getStatusText(order.orderStatus || order.status)}
                    </span>
                  </div>

                  {/* Body của từng đơn hàng */}
                  <div className="p-6 flex flex-col md:flex-row gap-6 items-center md:items-start">

                    {/* Hình ảnh đại diện */}
                    <div className="w-24 h-24 bg-slate-100 rounded-2xl flex-shrink-0 overflow-hidden border border-slate-200 relative">
                      <img src={firstImage} alt="Order Thumbnail" className="w-full h-full object-cover mix-blend-multiply group-hover:scale-110 transition-transform duration-500" />
                      {itemsCount > 1 && (
                        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center text-white font-black text-sm">
                          +{itemsCount - 1}
                        </div>
                      )}
                    </div>

                    {/* Thông tin chính */}
                    <div className="flex-1 text-center md:text-left">
                      <h3 className="text-lg font-black text-slate-800 mb-2 leading-tight">
                        Đơn hàng {itemsCount} sản phẩm
                      </h3>
                      <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-sm font-medium text-slate-500 mb-4">
                        <span className="flex items-center gap-1 bg-slate-100 px-3 py-1 rounded-lg">
                          💳 {order.paymentMethod === 'COD' ? 'Tiền mặt (COD)' : 'Chuyển khoản'}
                        </span>
                        <span className="flex items-center gap-1 bg-slate-100 px-3 py-1 rounded-lg">
                          📍 {order.shippingAddress?.city || 'Giao tận nơi'}
                        </span>
                      </div>
                    </div>

                    {/* Tổng tiền và Nút */}
                    <div className="flex flex-col items-center md:items-end justify-center min-w-[150px] border-t md:border-t-0 md:border-l border-slate-100 pt-6 md:pt-0 md:pl-6 w-full md:w-auto">
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Tổng thanh toán</div>
                      <div className="text-2xl font-black text-rose-600 tracking-tight mb-4">
                        {formatPrice(order.totalPrice || order.totalAmount || 0)}
                      </div>
                      {/* Tạm thời vô hiệu hóa nút Xem Chi Tiết do chưa có route, Sếp có thể tự bật lại nếu cần */}
                      <button className="w-full px-6 py-2.5 bg-slate-900 text-white text-xs font-black rounded-xl hover:bg-blue-600 transition-colors uppercase tracking-widest cursor-not-allowed opacity-50">
                        Xem Chi Tiết
                      </button>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}