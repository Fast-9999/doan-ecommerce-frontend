"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import useAuthStore from "../../store/useAuthStore";

export default function AdminDashboard() {
  const { user } = useAuthStore();
  const router = useRouter();
  
  const [isClient, setIsClient] = useState(false);
  const [allOrders, setAllOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- STATE PHỤC VỤ CRUD UPDATE ---
  const [editingOrderId, setEditingOrderId] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("");
  const availableStatuses = ['Processing', 'Shipping', 'Delivered', 'Cancelled'];

  useEffect(() => {
    setIsClient(true);
    
    // BẢO VỆ LỚP 1: Chặn đứng mấy thanh niên đi cửa sau
    if (user) {
      // LƯỚI LỌC CHỦ TỊCH
      const isAdmin = user.role === 'admin' || 
                      user.role === 'ADMIN' || 
                      user.role === '69c79a3c076efe132ceab729' || 
                      user.role?.name === 'admin' || 
                      user.role?._id === '69c79a3c076efe132ceab729' ||
                      user.username === 'phattest'; 
      
      if (!isAdmin) {
        alert("Khu vực cấm! Chỉ Chủ Tịch mới được vào nha mấy ní!");
        router.push("/");
        return;
      } 
      
      fetchAllUsersOrders();
    } else {
      router.push("/login");
    }
  }, [user, router]);

  const fetchAllUsersOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get("https://doan-ecommerce-backend.vercel.app/api/v1/orders");
      
      let data = response.data;
      if (data && typeof data === 'object' && !Array.isArray(data)) {
        data = data.data || data.orders || data.result || [];
      }

      if (Array.isArray(data)) {
        data.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        setAllOrders(data);
      } else {
        setAllOrders([]);
      }
    } catch (err) {
      console.error("Lỗi lấy danh sách tổng:", err);
    } finally {
      setLoading(false);
    }
  };

  // --- CÁC HÀM XỬ LÝ CRUD ---

  // [UPDATE] 1. Bật chế độ sửa
  const startEditing = (order) => {
    setEditingOrderId(order._id);
    setSelectedStatus(order.orderStatus);
  };

  // [UPDATE] 2. Tắt chế độ sửa
  const cancelEditing = () => {
    setEditingOrderId(null);
    setSelectedStatus("");
  };

  // [UPDATE] 3. Gọi API PUT để lưu trạng thái
  const handleSaveStatus = async (orderId) => {
    try {
      await axios.put(
        `https://doan-ecommerce-backend.vercel.app/api/v1/orders/${orderId}/status`,
        { orderStatus: selectedStatus }
      );
      alert(`🎉 Đã đổi trạng thái đơn hàng thành công sang "${getStatusText(selectedStatus)}"!`);
      cancelEditing();
      fetchAllUsersOrders(); 
    } catch (err) {
      console.error("Lỗi cập nhật trạng thái:", err);
      alert("Cập nhật thất bại rồi ní ơi. Check console coi lỗi gì nha.");
    }
  };

  // [DELETE] 4. Gọi API DELETE để xóa vĩnh viễn đơn hàng
  const handleDeleteOrder = async (orderId) => {
    // Hiện bảng hỏi lại cho chắc ăn
    const isConfirm = window.confirm("⚠️ Ní có chắc chắn muốn xóa vĩnh viễn đơn hàng này không? Hành động này bay màu luôn không khôi phục được đâu nha!");
    
    if (!isConfirm) return; // Bấm Cancel thì hủy lệnh

    try {
      // Bắn API xóa đơn hàng theo ID
      await axios.delete(`https://doan-ecommerce-backend.vercel.app/api/v1/orders/${orderId}`);
      
      alert("🗑️ Đã xóa đơn hàng thành công!");
      fetchAllUsersOrders(); // Load lại bảng ngay và luôn
    } catch (err) {
      console.error("Lỗi xóa đơn hàng:", err);
      // Nếu Backend chưa có API DELETE /orders/:id thì nó sẽ văng vô đây
      alert("Xóa thất bại! Ní nhớ check lại xem BE file routes/orders.js đã có viết API router.delete('/:id') chưa nha.");
    }
  };


  // --- HELPER PHỤC VỤ GIAO DIỆN ---
  const formatPrice = (price) => price?.toLocaleString("vi-VN") + " VNĐ";

  const getStatusColor = (status) => {
    switch (status) {
      case 'Processing': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Shipping': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Delivered': return 'bg-green-100 text-green-800 border-green-200';
      case 'Cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'Processing': return 'Đang xử lý';
      case 'Shipping': return 'Đang giao';
      case 'Delivered': return 'Đã giao';
      case 'Cancelled': return 'Đã hủy';
      default: return status;
    }
  };

  if (!isClient) return null;

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mb-4"></div>
        <h2 className="text-xl font-bold text-gray-700">Đang kiểm tra quyền hạn...</h2>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      
      {/* Sidebar Menu Trái */}
      <div className="w-64 bg-slate-900 text-white p-6 shadow-xl hidden md:block">
        <h2 className="text-2xl font-black mb-10 tracking-wider logo-admin">
          👑 ADMIN <span className="text-orange-500">PANEL</span>
        </h2>
        <nav className="space-y-4">
          <Link href="/admin" className="block px-4 py-3 bg-blue-600 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg">
            📦 Quản lý Đơn Hàng
          </Link>
          <button className="block w-full text-left px-4 py-3 text-slate-300 font-bold hover:bg-slate-800 hover:text-white rounded-xl transition cursor-not-allowed opacity-50">
            👕 Quản lý Sản Phẩm
          </button>
          <button className="block w-full text-left px-4 py-3 text-slate-300 font-bold hover:bg-slate-800 hover:text-white rounded-xl transition cursor-not-allowed opacity-50">
            👥 Quản lý Users
          </button>
        </nav>
      </div>

      {/* Vùng Nội Dung Chính Bên Phải */}
      <div className="flex-1 p-8 md:p-12 overflow-y-auto">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Tổng Trạm Đơn Hàng</h1>
          <span className="bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-sm">
            Admin: {user.username}
          </span>
        </div>

        {loading && allOrders.length === 0 ? (
          <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div></div>
        ) : (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-gray-100 text-slate-600 text-sm uppercase tracking-wider">
                  <th className="p-5 font-black">Mã Đơn</th>
                  <th className="p-5 font-black">Khách Hàng</th>
                  <th className="p-5 font-black">Tổng Tiền</th>
                  <th className="p-5 font-black">Trạng Thái</th>
                  <th className="p-5 font-black text-center">Hành Động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {allOrders.map((order) => {
                  const isEditing = order._id === editingOrderId;
                  
                  return (
                    <tr key={order._id} className="hover:bg-slate-50 transition">
                      <td className="p-5 text-sm font-bold text-gray-700">
                        #{order._id.substring(order._id.length - 6).toUpperCase()}
                      </td>
                      <td className="p-5 text-sm text-gray-600 font-medium">
                        {typeof order.user === 'object' ? (order.user?.username || order.user?._id) : order.user}
                      </td>
                      <td className="p-5 text-base font-black text-red-600">
                        {formatPrice(order.totalAmount)}
                      </td>

                      <td className="p-5">
                        {isEditing ? (
                          <select 
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold border outline-none focus:ring-2 focus:ring-blue-200 ${getStatusColor(selectedStatus)}`}
                          >
                            {availableStatuses.map(status => (
                              <option key={status} value={status} className="bg-white text-gray-800 font-sans">
                                {getStatusText(status)}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(order.orderStatus)}`}>
                            {getStatusText(order.orderStatus)}
                          </span>
                        )}
                      </td>

                      <td className="p-5 text-center">
                        {isEditing ? (
                          <div className="flex items-center justify-center space-x-2">
                            <button 
                              onClick={() => handleSaveStatus(order._id)}
                              className="bg-green-600 text-white hover:bg-green-700 px-4 py-2 rounded-lg text-xs font-bold transition shadow-sm"
                            >
                              Lưu
                            </button>
                            <button 
                              onClick={cancelEditing}
                              className="bg-gray-100 text-gray-700 hover:bg-gray-200 px-4 py-2 rounded-lg text-xs font-bold transition"
                            >
                              Hủy
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center space-x-2">
                            <button 
                              onClick={() => startEditing(order)}
                              className="bg-blue-100 text-blue-700 hover:bg-blue-600 hover:text-white px-4 py-2 rounded-lg text-xs font-bold transition shadow-sm"
                            >
                              Cập nhật
                            </button>
                            {/* NÚT XÓA MỚI THÊM NÈ */}
                            <button 
                              onClick={() => handleDeleteOrder(order._id)}
                              className="bg-red-100 text-red-700 hover:bg-red-600 hover:text-white px-4 py-2 rounded-lg text-xs font-bold transition shadow-sm"
                            >
                              Xóa
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}