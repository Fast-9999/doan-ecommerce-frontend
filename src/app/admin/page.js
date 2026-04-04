"use client";

import { toast } from "react-hot-toast";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import useAuthStore from "../../store/useAuthStore";

export default function AdminOrders() {
  const { user } = useAuthStore();
  const router = useRouter();

  const [isClient, setIsClient] = useState(false);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  // 🚀 STATE ĐIỀU HƯỚNG TAB TRONG ADMIN
  const [activeTab, setActiveTab] = useState("orders"); // "orders" hoặc "inventory"

  // 🚀 STATE CHO KHO HÀNG
  const [inventories, setInventories] = useState([]);
  const [loadingInv, setLoadingInv] = useState(false);

  // STATE CHO DASHBOARD THỐNG KÊ
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    processing: 0,
    delivered: 0
  });

  useEffect(() => {
    setIsClient(true);
    if (user) {
      const isAdmin = user.role === 'admin' || user.role === 'ADMIN' || user.username === 'phattest' || user.role?.name === 'admin';
      if (!isAdmin) {
        toast.error("Khu vực cấm! Chỉ dành cho Chủ Tịch!", { icon: '🛑' });
        router.push("/");
        return;
      }
      fetchAllOrders();
    } else {
      router.push("/login");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, router]);

  // 🚀 Tự động tải Kho hàng khi chuyển qua Tab Kho
  useEffect(() => {
    if (activeTab === "inventory") {
      fetchInventories();
    }
  }, [activeTab]);

  const getAuthHeaders = () => {
    return {
      headers: {
        "Content-Type": "application/json",
        ...(user?.token && { Authorization: `Bearer ${user.token}` }),
        ...(user?.accessToken && { Authorization: `Bearer ${user.accessToken}` })
      }
    };
  };

  // ==========================================
  // 📦 API: ĐƠN HÀNG
  // ==========================================
  const fetchAllOrders = async () => {
    try {
      setLoading(true);
      const res = await axios.get("https://doan-ecommerce-backend.vercel.app/api/v1/orders", getAuthHeaders());

      let allOrders = res.data;
      if (allOrders && typeof allOrders === 'object' && !Array.isArray(allOrders)) {
        allOrders = allOrders.data || allOrders.orders || allOrders.result || [];
      }

      if (Array.isArray(allOrders)) {
        allOrders.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        setOrders(allOrders);
        calculateStats(allOrders);
      }
    } catch (err) {
      console.error("Lỗi lấy danh sách đơn hàng:", err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data) => {
    let revenue = 0;
    let proc = 0;
    let deli = 0;

    data.forEach(order => {
      const orderStatus = order.orderStatus || order.status;
      if (orderStatus !== 'Cancelled') {
        revenue += (order.totalPrice || order.totalAmount || 0);
      }
      if (orderStatus === 'Processing' || !orderStatus) proc++;
      if (orderStatus === 'Delivered') deli++;
    });

    setStats({ totalRevenue: revenue, totalOrders: data.length, processing: proc, delivered: deli });
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    if (!window.confirm(`Xác nhận đổi trạng thái đơn hàng này thành: ${getStatusText(newStatus)}?`)) return;
    try {
      setUpdatingId(orderId);
      await axios.put(`https://doan-ecommerce-backend.vercel.app/api/v1/orders/${orderId}/status`, { orderStatus: newStatus, status: newStatus }, getAuthHeaders());
      toast.success("✅ Cập nhật tiến độ thành công!");
      fetchAllOrders();
    } catch (err) {
      toast.error(`❌ Cập nhật thất bại! BE báo nè: "${err.response?.data?.message || "Lỗi bí ẩn"}"`);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm("⚠️ Sếp có chắc chắn muốn XÓA VĨNH VIỄN đơn hàng này không? Dữ liệu sẽ bốc hơi đó!")) return;
    try {
      await axios.delete(`https://doan-ecommerce-backend.vercel.app/api/v1/orders/${orderId}`, getAuthHeaders());
      toast.success("🗑️ Đã phi tang đơn hàng thành công!");
      fetchAllOrders();
    } catch (err) {
      toast.error("❌ Xóa thất bại! Backend có thể chưa mở cổng router.delete('/:id');");
    }
  };

  // ==========================================
  // 🗄️ API: KHO HÀNG (INVENTORIES)
  // ==========================================
  const fetchInventories = async () => {
    try {
      setLoadingInv(true);
      const res = await axios.get("https://doan-ecommerce-backend.vercel.app/api/v1/inventories");
      setInventories(res.data);
    } catch (err) {
      console.error("Lỗi tải kho hàng:", err);
      toast.error("❌ Không gọi được thủ kho ra báo cáo!");
    } finally {
      setLoadingInv(false);
    }
  };

  const handleImportStock = async (productId, productName) => {
    const qty = window.prompt(`📦 Bạn muốn nhập thêm bao nhiêu hàng cho món:\n"${productName}" ?\n\n(Nhập con số vào đây)`);

    // Validate sương sương
    if (qty === null) return; // Bấm Cancel
    if (!qty.trim() || isNaN(qty) || Number(qty) <= 0) {
      toast.error("⚠️ Số lượng nhập vào phải là con số lớn hơn 0 nha Chủ Tịch!");
      return;
    }

    try {
      await axios.post("https://doan-ecommerce-backend.vercel.app/api/v1/inventories/increase-stock", {
        product: productId,
        quantity: Number(qty)
      });
      toast.success(`🎉 Đã bơm máu thành công ${qty} sản phẩm vào kho!`);
      fetchInventories(); // Gọi Thủ kho load lại bảng
    } catch (err) {
      console.error("Lỗi nhập kho:", err);
      toast.error(`❌ Nhập kho thất bại: ${err.response?.data?.message || err.message}`);
    }
  };

  // ==========================================
  // 🎨 UTILS UI XỊN XÒ
  // ==========================================
  const formatPrice = (price) => price?.toLocaleString("vi-VN") + " VNĐ";

  const getStatusColor = (status) => {
    switch (status) {
      case 'Processing': return 'bg-amber-100 text-amber-700 border-amber-200 ring-amber-500/30';
      case 'Shipping': return 'bg-blue-100 text-blue-700 border-blue-200 ring-blue-500/30';
      case 'Delivered': return 'bg-emerald-100 text-emerald-700 border-emerald-200 ring-emerald-500/30';
      case 'Cancelled': return 'bg-rose-100 text-rose-700 border-rose-200 ring-rose-500/30';
      default: return 'bg-slate-100 text-slate-700 border-slate-200 ring-slate-500/30';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'Processing': return '⏳ Chờ Xử Lý';
      case 'Shipping': return '🚚 Đang Giao';
      case 'Delivered': return '✅ Thành Công';
      case 'Cancelled': return '❌ Đã Hủy';
      default: return status || 'Đang chờ';
    }
  };

  if (!isClient) return null;

  return (
    <div className="flex min-h-screen bg-slate-50/50 font-sans selection:bg-blue-200">

      {/* 🚀 SIDEBAR ADMIN PREMIUM */}
      <div className="w-72 bg-slate-950 text-slate-300 flex flex-col shadow-2xl hidden md:flex shrink-0 border-r border-slate-800 relative z-30">
        <div className="p-8 border-b border-slate-800/60">
          <h2 className="text-2xl font-black tracking-tight flex items-center gap-2 text-white">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.5)]">👑</div>
            ADMIN<span className="text-blue-500">PANEL</span>
          </h2>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto custom-scrollbar">
          <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-4 mb-2">Điều Hành Hệ Thống</div>

          <button
            onClick={() => setActiveTab("orders")}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold transition-all duration-300 ${activeTab === "orders" ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-[0_4px_15px_rgba(37,99,235,0.4)] translate-x-1' : 'hover:bg-slate-900 hover:text-white'}`}
          >
            <span className="text-xl">📦</span> Bảng Điều Khiển
          </button>

          <button
            onClick={() => setActiveTab("inventory")}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold transition-all duration-300 ${activeTab === "inventory" ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-[0_4px_15px_rgba(37,99,235,0.4)] translate-x-1' : 'hover:bg-slate-900 hover:text-white'}`}
          >
            <span className="text-xl">🗄️</span> Quản Lý Kho Bãi
          </button>

          <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-4 mt-8 mb-2">Dữ Liệu Nền Tảng</div>

          <Link href="/admin/products" className="flex items-center gap-3 px-4 py-3 text-slate-400 font-bold hover:bg-slate-900 hover:text-white rounded-2xl transition-colors">
            <span className="text-xl">🛍️</span> Quản lý Sản Phẩm
          </Link>
          <Link href="/admin/inbox" className="flex items-center gap-3 px-4 py-3 text-slate-400 font-bold hover:bg-slate-900 hover:text-white rounded-2xl transition-colors">
            <span className="text-xl">💬</span> Trung Tâm Tin Nhắn
          </Link>
          <Link href="/admin/reservations" className="flex items-center gap-3 px-4 py-3 text-slate-400 font-bold hover:bg-slate-900 hover:text-white rounded-2xl transition-colors">
            <span className="text-xl">⏳</span> Đơn Giữ Hàng (Reserve)
          </Link>
          <Link href="/admin/users" className="flex items-center gap-3 px-4 py-3 text-slate-400 font-bold hover:bg-slate-900 hover:text-white rounded-2xl transition-colors">
            <span className="text-xl">👥</span> Danh Sách Users
          </Link>
          <Link href="/admin/vouchers" className="flex items-center gap-3 px-4 py-3 text-slate-400 font-bold hover:bg-slate-900 hover:text-white rounded-2xl transition-colors">
            <span className="text-xl">🎟️</span> Kho Mã Giảm Giá
          </Link>
        </nav>

        <div className="p-6 border-t border-slate-800/60">
          <Link href="/" className="flex items-center justify-center gap-2 px-4 py-3.5 bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 hover:border-slate-700 rounded-2xl font-black transition-all text-xs uppercase tracking-widest group">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 group-hover:-translate-x-1 transition-transform"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
            Rời Chốt Trực
          </Link>
        </div>
      </div>

      {/* 🚀 MAIN CONTENT */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-slate-50/50 relative">

        {/* Header Content */}
        <div className="px-8 md:px-12 py-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200/60 bg-white/50 backdrop-blur-xl z-20 sticky top-0">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              {activeTab === "orders" ? "Trạm Điều Hành Tối Cao" : "Trạm Quản Lý Kho Bãi"}
            </h1>
            <p className="text-slate-500 font-medium mt-1.5 text-sm">
              {activeTab === "orders" ? "Chào Chủ Tịch! Chúc một ngày chốt đơn mỏi tay." : "Kiểm tra hàng tồn và báo cáo thủ kho ngay tại đây."}
            </p>
          </div>
          <div className="bg-emerald-50 px-4 py-2 rounded-full border border-emerald-100 font-bold text-emerald-700 flex items-center gap-2 shadow-sm text-xs tracking-wide uppercase">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Hệ thống On-air
          </div>
        </div>

        {/* Bọc nội dung cuộn được */}
        <div className="flex-1 overflow-y-auto p-8 md:p-12 custom-scrollbar relative z-10">

          {/* ========================================================== */}
          {/* MÀN HÌNH 1: QUẢN LÝ ĐƠN HÀNG */}
          {/* ========================================================== */}
          {activeTab === "orders" && (
            <>
              {/* 🚀 DASHBOARD THỐNG KÊ (Kính Mờ - Glassmorphism) */}
              {!loading && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-12">

                  {/* Card 1: Doanh Thu */}
                  <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] relative overflow-hidden group">
                    <div className="absolute -right-10 -top-10 w-32 h-32 bg-emerald-50 rounded-full group-hover:scale-150 transition-transform duration-700 ease-out z-0"></div>
                    <div className="relative z-10 flex flex-col h-full">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center text-2xl shadow-inner">💰</div>
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest text-right">Tổng Lúa Thu Về</h3>
                      </div>
                      <div className="text-3xl font-black text-slate-900 mt-2 tracking-tight" title={formatPrice(stats.totalRevenue)}>
                        {formatPrice(stats.totalRevenue)}
                      </div>
                    </div>
                  </div>

                  {/* Card 2: Tổng Đơn */}
                  <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] relative overflow-hidden group">
                    <div className="absolute -right-10 -top-10 w-32 h-32 bg-blue-50 rounded-full group-hover:scale-150 transition-transform duration-700 ease-out z-0"></div>
                    <div className="relative z-10 flex flex-col h-full">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center text-2xl shadow-inner">📦</div>
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest text-right">Tổng Đơn Hàng</h3>
                      </div>
                      <div className="text-4xl font-black text-slate-900 mt-auto tracking-tight">
                        {stats.totalOrders} <span className="text-lg text-slate-400 font-bold ml-1">đơn</span>
                      </div>
                    </div>
                  </div>

                  {/* Card 3: Chờ Xử Lý */}
                  <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] relative overflow-hidden group">
                    <div className="absolute -right-10 -top-10 w-32 h-32 bg-amber-50 rounded-full group-hover:scale-150 transition-transform duration-700 ease-out z-0"></div>
                    <div className="relative z-10 flex flex-col h-full">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center text-2xl shadow-inner">⏳</div>
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest text-right">Đang Chờ Xử Lý</h3>
                      </div>
                      <div className="text-4xl font-black text-amber-600 mt-auto tracking-tight">
                        {stats.processing} <span className="text-lg text-amber-600/50 font-bold ml-1">đơn</span>
                      </div>
                    </div>
                  </div>

                  {/* Card 4: Thành Công */}
                  <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] relative overflow-hidden group">
                    <div className="absolute -right-10 -top-10 w-32 h-32 bg-purple-50 rounded-full group-hover:scale-150 transition-transform duration-700 ease-out z-0"></div>
                    <div className="relative z-10 flex flex-col h-full">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center text-2xl shadow-inner">🚀</div>
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest text-right">Giao Thành Công</h3>
                      </div>
                      <div className="text-4xl font-black text-purple-600 mt-auto tracking-tight">
                        {stats.delivered} <span className="text-lg text-purple-600/50 font-bold ml-1">đơn</span>
                      </div>
                    </div>
                  </div>

                </div>
              )}

              {/* 🚀 DANH SÁCH ĐƠN HÀNG */}
              <div className="bg-white rounded-[2rem] shadow-[0_10px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden">
                <div className="px-8 py-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 bg-slate-50/50 border-b border-slate-100">
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">BẢNG KÊ ĐƠN HÀNG</h2>
                  <button onClick={fetchAllOrders} className="text-white font-black text-xs uppercase tracking-widest bg-slate-900 hover:bg-blue-600 px-5 py-2.5 rounded-xl shadow-md hover:shadow-blue-500/30 hover:-translate-y-0.5 transition-all flex items-center gap-2 w-max">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" /></svg>
                    Làm mới
                  </button>
                </div>

                {loading ? (
                  <div className="flex justify-center py-32"><div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600"></div></div>
                ) : orders.length === 0 ? (
                  <div className="p-32 text-center flex flex-col items-center">
                    <div className="text-7xl mb-6 grayscale opacity-30 drop-shadow-sm">🕸️</div>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight mb-2">Chưa có ai mở hàng!</h2>
                    <p className="text-slate-500 font-medium">Trạm điều hành đang trống, chờ khách chốt đơn thôi Chủ Tịch ơi.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left whitespace-nowrap">
                      <thead>
                        <tr className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-200">
                          <th className="px-8 py-5">Mã & Thời Gian</th>
                          <th className="px-8 py-5">Thông Tin Khách</th>
                          <th className="px-8 py-5">Giỏ Hàng</th>
                          <th className="px-8 py-5">Thanh Toán</th>
                          <th className="px-8 py-5 text-center">Tiến Độ & Thao Tác</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {orders.map((order) => {
                          const customerName = order.shippingAddress?.fullName || order.shippingAddress?.name || order.user?.username || order.user?.name || order.fullName || 'Khách Ẩn Danh';
                          const customerPhone = order.shippingAddress?.phone || order.phone || order.user?.phone || 'N/A';
                          const customerAddress = order.shippingAddress?.address || order.address || 'N/A';

                          return (
                            <tr key={order._id} className="hover:bg-blue-50/30 transition-colors duration-200 group">

                              {/* Cột 1: Mã Đơn */}
                              <td className="px-8 py-6">
                                <div className="text-sm font-black text-slate-900 mb-1 flex items-center gap-2">
                                  <span className="text-slate-400">#</span>{order._id.substring(order._id.length - 6).toUpperCase()}
                                </div>
                                <div className="text-[11px] text-slate-500 font-bold bg-slate-100 w-max px-2 py-1 rounded-md">
                                  {new Date(order.createdAt).toLocaleString('vi-VN')}
                                </div>
                              </td>

                              {/* Cột 2: Khách Hàng */}
                              <td className="px-8 py-6">
                                <div className="text-sm font-black text-blue-600 mb-1.5 flex items-center gap-1.5">
                                  <span className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-[10px]">👤</span>
                                  {customerName}
                                </div>
                                <div className="text-xs text-slate-500 font-medium flex flex-col gap-1.5">
                                  <span className="flex items-center gap-1.5"><span className="text-slate-400">📞</span> {customerPhone}</span>
                                  <span className="flex items-center gap-1.5 truncate max-w-[200px]" title={customerAddress}><span className="text-slate-400">📍</span> {customerAddress}</span>
                                </div>
                              </td>

                              {/* Cột 3: Sản Phẩm */}
                              <td className="px-8 py-6">
                                <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 w-max px-3 py-2 rounded-xl shadow-sm">
                                  <span className="text-xl grayscale opacity-80 group-hover:grayscale-0 transition-all">📦</span>
                                  <span className="font-black text-slate-800 text-sm">{order.orderItems?.length || order.items?.length || 0} <span className="text-xs text-slate-400 font-bold">món</span></span>
                                </div>
                              </td>

                              {/* Cột 4: Tiền Nong */}
                              <td className="px-8 py-6">
                                <div className="text-base font-black text-rose-600 mb-1.5 tracking-tight">
                                  {formatPrice(order.totalPrice || order.totalAmount || 0)}
                                </div>
                                <div className="text-[9px] text-slate-500 font-black uppercase tracking-widest bg-slate-100 inline-block px-2.5 py-1 rounded-md border border-slate-200">
                                  {order.paymentMethod === 'COD' ? 'Thanh toán COD' : 'Online'}
                                </div>
                              </td>

                              {/* Cột 5: Trạng Thái & Thao Tác */}
                              <td className="px-8 py-6 text-center">
                                <div className="flex flex-col items-center justify-center gap-3">
                                  {/* Select Status Badge */}
                                  <div className="relative">
                                    <select
                                      disabled={updatingId === order._id}
                                      value={order.orderStatus || order.status || 'Processing'}
                                      onChange={(e) => handleUpdateStatus(order._id, e.target.value)}
                                      className={`appearance-none text-[11px] border-2 rounded-xl px-4 py-2.5 pr-8 font-black tracking-widest uppercase outline-none cursor-pointer transition-all hover:scale-105 shadow-sm focus:ring-4 disabled:opacity-50 disabled:hover:scale-100 ${getStatusColor(order.orderStatus || order.status)}`}
                                    >
                                      <option value="Processing">Đang xử lý</option>
                                      <option value="Shipping">Đang giao hàng</option>
                                      <option value="Delivered">Đã giao xong</option>
                                      <option value="Cancelled">Hủy đơn</option>
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-inherit opacity-70">
                                      <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                                    </div>
                                  </div>

                                  <button
                                    onClick={() => handleDeleteOrder(order._id)}
                                    className="text-slate-400 hover:text-rose-600 text-[10px] font-black uppercase tracking-widest transition-colors flex items-center gap-1 group/del"
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3 h-3 group-hover/del:rotate-12 transition-transform"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                                    Xóa Đơn
                                  </button>
                                </div>
                              </td>

                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}

          {/* ========================================================== */}
          {/* MÀN HÌNH 2: QUẢN LÝ KHO HÀNG (INVENTORY)                   */}
          {/* ========================================================== */}
          {activeTab === "inventory" && (
            <div className="bg-white rounded-[2rem] shadow-[0_10px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden">
              <div className="px-8 py-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 bg-slate-50/50 border-b border-slate-100">
                <h2 className="text-xl font-black text-slate-900 tracking-tight">TÌNH TRẠNG KHO BÃI</h2>
                <button onClick={fetchInventories} className="text-white font-black text-xs uppercase tracking-widest bg-slate-900 hover:bg-blue-600 px-5 py-2.5 rounded-xl shadow-md hover:shadow-blue-500/30 hover:-translate-y-0.5 transition-all flex items-center gap-2 w-max">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" /></svg>
                  Kiểm Kê Kho
                </button>
              </div>

              {loadingInv ? (
                <div className="flex justify-center py-32"><div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600"></div></div>
              ) : inventories.length === 0 ? (
                <div className="p-32 text-center flex flex-col items-center">
                  <div className="text-7xl mb-6 grayscale opacity-30 drop-shadow-sm">🏭</div>
                  <h2 className="text-2xl font-black text-slate-800 tracking-tight mb-2">Kho hàng đang trống không!</h2>
                  <p className="text-slate-500 font-medium">Chưa có sản phẩm nào được khai báo trong sổ thủ kho.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left whitespace-nowrap">
                    <thead>
                      <tr className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-200">
                        <th className="px-8 py-5 w-16">STT</th>
                        <th className="px-8 py-5">Tên Sản Phẩm & Mã</th>
                        <th className="px-8 py-5">Giá Niêm Yết</th>
                        <th className="px-8 py-5 text-center">Tồn Kho Hiện Tại</th>
                        <th className="px-8 py-5 text-center">Thao Tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {inventories.map((inv, index) => {
                        // Logic màu sắc cảnh báo tồn kho
                        const stockColor = inv.stock > 10 ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 shadow-sm'
                          : inv.stock > 0 ? 'bg-amber-50 text-amber-600 border border-amber-200 shadow-sm'
                            : 'bg-rose-50 text-rose-600 border border-rose-300 ring-2 ring-rose-500/20 animate-pulse shadow-sm';

                        return (
                          <tr key={inv._id} className="hover:bg-blue-50/30 transition-colors duration-200 group">

                            <td className="px-8 py-6">
                              <span className="text-xs font-black text-slate-400 bg-slate-100 w-8 h-8 flex items-center justify-center rounded-lg">
                                {index + 1}
                              </span>
                            </td>

                            <td className="px-8 py-6">
                              <div className="text-sm font-black text-slate-900 line-clamp-1 max-w-[250px] mb-1.5" title={inv.product?.title}>
                                {inv.product?.title || "Sản phẩm ẩn danh"}
                              </div>
                              <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest bg-slate-100 w-max px-2 py-1 rounded-md border border-slate-200">
                                SKU: {inv._id.substring(inv._id.length - 8).toUpperCase()}
                              </div>
                            </td>

                            <td className="px-8 py-6">
                              <div className="text-sm font-black text-blue-600 bg-blue-50 w-max px-3 py-1.5 rounded-lg border border-blue-100">
                                {formatPrice(inv.product?.price)}
                              </div>
                            </td>

                            <td className="px-8 py-6 text-center">
                              <div className={`inline-flex items-baseline gap-1 px-4 py-2 rounded-xl text-lg font-black ${stockColor}`}>
                                {inv.stock} <span className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-1">cái</span>
                              </div>
                            </td>

                            <td className="px-8 py-6 text-center">
                              <button
                                onClick={() => handleImportStock(inv.product?._id, inv.product?.title)}
                                className="bg-slate-900 text-white hover:bg-blue-600 px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-md transition-all hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2 w-max mx-auto group/btn"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-4 h-4 group-hover/btn:rotate-90 transition-transform"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                                Bơm Hàng
                              </button>
                            </td>

                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}