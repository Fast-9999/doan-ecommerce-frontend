"use client";

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

  // 🚀 STATE CHO DASHBOARD THỐNG KÊ
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
        alert("Khu vực cấm! Chỉ dành cho Chủ Tịch!");
        router.push("/");
        return;
      }
      fetchAllOrders();
    } else {
      router.push("/login");
    }
  }, [user, router]);

  const getAuthHeaders = () => {
    return {
      headers: {
        "Content-Type": "application/json",
        ...(user?.token && { Authorization: `Bearer ${user.token}` }),
        ...(user?.accessToken && { Authorization: `Bearer ${user.accessToken}` })
      }
    };
  };

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
        calculateStats(allOrders); // 🚀 Tính toán số liệu cho Dashboard
      }
    } catch (err) {
      console.error("Lỗi lấy danh sách đơn hàng:", err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  // 🚀 Hàm tính toán Thống Kê (Dashboard)
  const calculateStats = (data) => {
    let revenue = 0;
    let proc = 0;
    let deli = 0;

    data.forEach(order => {
      // Chỉ tính doanh thu những đơn đã giao hoặc đang xử lý (không tính đơn hủy)
      const orderStatus = order.orderStatus || order.status;
      if (orderStatus !== 'Cancelled') {
        revenue += (order.totalPrice || order.totalAmount || 0);
      }
      
      if (orderStatus === 'Processing' || !orderStatus) proc++;
      if (orderStatus === 'Delivered') deli++;
    });

    setStats({
      totalRevenue: revenue,
      totalOrders: data.length,
      processing: proc,
      delivered: deli
    });
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    if (!window.confirm(`Xác nhận đổi trạng thái đơn hàng này thành: ${getStatusText(newStatus)}?`)) return;

    try {
      setUpdatingId(orderId);
      
      await axios.put(
        `https://doan-ecommerce-backend.vercel.app/api/v1/orders/${orderId}/status`, 
        {
          orderStatus: newStatus,
          status: newStatus 
        },
        getAuthHeaders() 
      );

      alert("✅ Duyệt đơn thành công!");
      fetchAllOrders(); 
    } catch (err) {
      console.error("Lỗi cập nhật đơn:", err);
      const backendError = err.response?.data?.message || err.response?.data?.error || "Lỗi bí ẩn";
      alert(`❌ Cập nhật thất bại! BE báo nè: "${backendError}"`);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm("⚠️ Ní có chắc chắn muốn xóa vĩnh viễn đơn hàng này không?")) return;

    try {
      await axios.delete(`https://doan-ecommerce-backend.vercel.app/api/v1/orders/${orderId}`, getAuthHeaders());
      alert("🗑️ Đã xóa đơn hàng thành công!");
      fetchAllOrders(); 
    } catch (err) {
      console.error("Lỗi xóa đơn hàng:", err);
      alert("❌ Xóa thất bại! Backend có thể chưa mở cổng router.delete('/:id')");
    }
  };

  const formatPrice = (price) => price?.toLocaleString("vi-VN") + " VNĐ";

  const getStatusColor = (status) => {
    switch (status) {
      case 'Processing': return 'bg-blue-100 text-blue-700';
      case 'Shipping': return 'bg-purple-100 text-purple-700';
      case 'Delivered': return 'bg-green-100 text-green-700';
      case 'Cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
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

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      
      {/* Sidebar Admin Quyền Lực */}
      <div className="w-64 bg-slate-900 text-white p-6 shadow-xl hidden md:block shrink-0 relative z-20">
        <h2 className="text-2xl font-black mb-10 tracking-wider">
          👑 ADMIN <span className="text-blue-500">PANEL</span>
        </h2>
        <nav className="space-y-4">
          <Link href="/admin" className="block px-4 py-3 bg-linear-to-r from-blue-600 to-indigo-600 rounded-xl font-bold shadow-lg shadow-blue-500/30 transition transform hover:translate-x-1">
            📦 Tổng Quan & Đơn Hàng
          </Link>
          <Link href="/admin/products" className="block px-4 py-3 text-slate-300 font-bold hover:bg-slate-800 hover:text-white rounded-xl transition">
            👕 Quản lý Sản Phẩm
          </Link>
          <button className="block w-full text-left px-4 py-3 text-slate-300 font-bold hover:bg-slate-800 hover:text-white rounded-xl transition cursor-not-allowed opacity-50">
            👥 Quản lý Users
          </button>
        </nav>
        
        <div className="absolute bottom-10 left-6 right-6">
           <Link href="/" className="block text-center px-4 py-3 bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 rounded-xl font-bold transition text-sm uppercase tracking-widest">
            ← Về Cửa Hàng
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 md:p-12 overflow-y-auto">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Trạm Điều Hành Tối Cao</h1>
            <p className="text-slate-500 font-medium mt-1">Chào mừng Chủ Tịch trở lại! Đây là tình hình kinh doanh hôm nay.</p>
          </div>
          <div className="bg-white px-5 py-2.5 rounded-full shadow-sm border border-slate-200 font-bold text-slate-600 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            Hệ thống đang hoạt động
          </div>
        </div>

        {/* 🚀 BẢNG ĐIỀU KHIỂN THỐNG KÊ (DASHBOARD) */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            
            {/* Card 1: Doanh Thu */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] relative overflow-hidden group">
              <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-50 rounded-full group-hover:scale-150 transition-transform duration-500 ease-out z-0"></div>
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center text-xl">💰</div>
                  <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">TỔNG DOANH THU</h3>
                </div>
                <div className="text-3xl font-black text-slate-900 truncate" title={formatPrice(stats.totalRevenue)}>
                  {formatPrice(stats.totalRevenue)}
                </div>
              </div>
            </div>

            {/* Card 2: Tổng Đơn Hàng */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] relative overflow-hidden group">
              <div className="absolute -right-6 -top-6 w-24 h-24 bg-purple-50 rounded-full group-hover:scale-150 transition-transform duration-500 ease-out z-0"></div>
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center text-xl">📦</div>
                  <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">TỔNG ĐƠN HÀNG</h3>
                </div>
                <div className="text-4xl font-black text-slate-900">
                  {stats.totalOrders} <span className="text-lg text-slate-400 font-bold">đơn</span>
                </div>
              </div>
            </div>

            {/* Card 3: Chờ Xử Lý */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] relative overflow-hidden group">
              <div className="absolute -right-6 -top-6 w-24 h-24 bg-orange-50 rounded-full group-hover:scale-150 transition-transform duration-500 ease-out z-0"></div>
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center text-xl">⏳</div>
                  <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">CẦN XỬ LÝ GẤP</h3>
                </div>
                <div className="text-4xl font-black text-orange-600">
                  {stats.processing} <span className="text-lg text-slate-400 font-bold">đơn</span>
                </div>
              </div>
            </div>

            {/* Card 4: Thành Công */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] relative overflow-hidden group">
              <div className="absolute -right-6 -top-6 w-24 h-24 bg-green-50 rounded-full group-hover:scale-150 transition-transform duration-500 ease-out z-0"></div>
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-green-100 text-green-600 flex items-center justify-center text-xl">✅</div>
                  <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">ĐÃ GIAO THÀNH CÔNG</h3>
                </div>
                <div className="text-4xl font-black text-green-600">
                  {stats.delivered} <span className="text-lg text-slate-400 font-bold">đơn</span>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* DANH SÁCH ĐƠN HÀNG */}
        <div className="bg-white rounded-4xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden">
          <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h2 className="text-xl font-black text-slate-800">DANH SÁCH ĐƠN HÀNG</h2>
            <button onClick={fetchAllOrders} className="text-blue-600 hover:text-blue-800 font-bold text-sm bg-blue-50 px-4 py-2 rounded-lg transition flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
              Làm mới
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-32"><div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600"></div></div>
          ) : orders.length === 0 ? (
            <div className="p-32 text-center">
              <div className="text-6xl mb-4 grayscale opacity-40">🕸️</div>
              <h2 className="text-2xl font-black text-gray-800 tracking-tight">Chưa có ai mở hàng!</h2>
              <p className="text-slate-500 mt-2 font-medium">Đang móm, chờ khách chốt đơn thôi Chủ Tịch ơi.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white border-b-2 border-slate-100 text-slate-400 text-xs uppercase tracking-widest">
                    <th className="p-6 font-black">Mã Đơn / Ngày</th>
                    <th className="p-6 font-black">Khách Hàng</th>
                    <th className="p-6 font-black">Sản Phẩm</th>
                    <th className="p-6 font-black">Tổng Tiền</th>
                    <th className="p-6 font-black text-center">Trạng Thái & Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {orders.map((order) => {
                    // 🚀 ĐOẠN NÀY LÀ CÚ FIX CHÍ MẠNG 🚀
                    // Dò tìm thông tin bằng mọi giá, nếu shippingAddress trống thì lôi thông tin User ra xài tạm!
                    const customerName = order.shippingAddress?.fullName || order.shippingAddress?.name || order.user?.username || order.user?.name || order.fullName || 'Khách Vãng Lai';
                    const customerPhone = order.shippingAddress?.phone || order.phone || order.user?.phone || 'N/A';
                    const customerAddress = order.shippingAddress?.address || order.address || 'N/A';

                    return (
                    <tr key={order._id} className="hover:bg-slate-50/80 transition-colors duration-200">
                      
                      <td className="p-6">
                        <div className="text-sm font-black text-slate-800 mb-1">
                          #{order._id.substring(order._id.length - 6).toUpperCase()}
                        </div>
                        <div className="text-xs text-slate-500 font-medium">
                          {new Date(order.createdAt).toLocaleString('vi-VN')}
                        </div>
                      </td>

                      <td className="p-6">
                        <div className="text-sm font-bold text-blue-600 mb-1">
                          {customerName}
                        </div>
                        <div className="text-xs text-slate-500 font-medium flex flex-col gap-1">
                          <span>📞 {customerPhone}</span>
                          <span className="line-clamp-1" title={customerAddress}>📍 {customerAddress}</span>
                        </div>
                      </td>

                      <td className="p-6 text-sm text-slate-600 font-medium">
                        <div className="flex items-center gap-2 bg-slate-100 w-max px-3 py-1.5 rounded-lg">
                          <span className="text-lg">📦</span>
                          <span className="font-bold text-slate-800">{order.orderItems?.length || order.items?.length || 0} món</span>
                        </div>
                      </td>

                      <td className="p-6">
                        <div className="text-base font-black text-slate-900">
                          {formatPrice(order.totalPrice || order.totalAmount || 0)}
                        </div>
                        <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1 bg-slate-100 inline-block px-2 py-0.5 rounded">
                          {order.paymentMethod === 'COD' ? 'Thanh toán COD' : 'Online'}
                        </div>
                      </td>

                      <td className="p-6 text-center">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <select
                            disabled={updatingId === order._id}
                            value={order.orderStatus || order.status || 'Processing'}
                            onChange={(e) => handleUpdateStatus(order._id, e.target.value)}
                            className={`text-xs border rounded-xl px-3 py-2 font-black tracking-wide uppercase outline-none cursor-pointer shadow-sm transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 ${getStatusColor(order.orderStatus || order.status)}`}
                          >
                            <option value="Processing">⏳ Đang xử lý</option>
                            <option value="Shipping">🚚 Đang giao hàng</option>
                            <option value="Delivered">✅ Đã giao xong</option>
                            <option value="Cancelled">❌ Hủy đơn</option>
                          </select>
                          
                          <button 
                            onClick={() => handleDeleteOrder(order._id)}
                            className="text-slate-400 hover:text-red-500 text-xs font-bold transition mt-1 underline decoration-transparent hover:decoration-red-500 underline-offset-4"
                          >
                            Xóa vĩnh viễn
                          </button>
                        </div>
                      </td>
                      
                    </tr>
                  )})}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}