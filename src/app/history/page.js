"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import axios from "axios";
import useAuthStore from "../../store/useAuthStore";

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
      // 1. Lấy TẤT CẢ đơn hàng từ Backend
      const response = await axios.get("https://doan-ecommerce-backend.vercel.app/api/v1/orders");
      
      // BẮT BỆNH TẠI ĐÂY: Dò tìm cái mảng đơn hàng
      let allOrders = response.data;

      // Nếu BE gói data trong 1 object (ví dụ: { data: [...] } hoặc { orders: [...] })
      if (allOrders && typeof allOrders === 'object' && !Array.isArray(allOrders)) {
        allOrders = allOrders.data || allOrders.orders || allOrders.result || [];
      }

      // CODE PHÒNG THỦ: Tránh sập web nếu allOrders vẫn không phải là mảng
      if (!Array.isArray(allOrders)) {
        console.error("Dữ liệu BE trả về không phải là mảng:", response.data);
        setOrders([]); // Ép về mảng rỗng
        return;
      }

      // 2. Tự FE lọc ra đơn hàng của user hiện tại
      // LƯU Ý: Đang xài tạm cái ID hardcode hồi nãy chốt đơn để test cho ra dữ liệu nha!
      const currentUserId = user?.id || user?._id || "69a5462f086d74c9e772b804";
      
      const myOrders = allOrders.filter(order => {
        if (!order || !order.user) return false; // Né lỗi nếu đơn hàng bị rỗng
        // Xử lý trường hợp BE trả về user là Object hoặc String ID
        const orderUserId = typeof order.user === 'object' ? order.user._id : order.user;
        return orderUserId === currentUserId;
      });

      // Sắp xếp đơn mới nhất lên đầu (Dựa vào createdAt hoặc _id)
      myOrders.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

      setOrders(myOrders);
    } catch (err) {
      console.error("Lỗi lấy lịch sử đơn hàng:", err);
      setOrders([]); // Bị lỗi thì trả về mảng rỗng luôn cho an toàn
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => price?.toLocaleString("vi-VN") + " VNĐ";

  // Đổi màu cái nhãn trạng thái cho nó xịn
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
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6">
        <div className="text-6xl mb-6">🔒</div>
        <h2 className="text-3xl font-extrabold text-gray-900 mb-4">Bạn chưa đăng nhập!</h2>
        <p className="text-gray-600 font-medium mb-8 text-lg">Vui lòng đăng nhập để xem lịch sử mua hàng nha ní.</p>
        <Link href="/login" className="bg-blue-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-blue-700 transition">
          Đi tới Đăng nhập
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-10 min-h-[70vh]">
      <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-8 tracking-tight">
        🕒 Lịch Sử Mua Hàng
      </h1>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 text-center border border-gray-100 shadow-sm">
          <div className="text-6xl mb-6">🏜️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Chưa có đơn hàng nào!</h2>
          <p className="text-gray-500 mb-8">Ní chưa chốt đơn nào hết á, ra lựa vài món ủng hộ shop đi!</p>
          <Link href="/" className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition">
            Bắt đầu mua sắm
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-sm uppercase tracking-wider">
                  <th className="p-5 font-bold">Mã Đơn Hàng</th>
                  <th className="p-5 font-bold">Ngày Đặt</th>
                  <th className="p-5 font-bold">Sản Phẩm</th>
                  <th className="p-5 font-bold">Tổng Tiền</th>
                  <th className="p-5 font-bold">Trạng Thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50 transition">
                    <td className="p-5 text-sm font-bold text-gray-700">
                      #{order._id.substring(order._id.length - 6).toUpperCase()}
                    </td>
                    <td className="p-5 text-sm text-gray-500 font-medium">
                      {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="p-5 text-sm text-gray-600 font-medium">
                      {order.items?.length || 0} món
                    </td>
                    <td className="p-5 text-base font-black text-red-600">
                      {formatPrice(order.totalAmount)}
                    </td>
                    <td className="p-5">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(order.orderStatus)}`}>
                        {getStatusText(order.orderStatus)}
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
  );
}