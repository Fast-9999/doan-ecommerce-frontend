"use client";
import { toast } from "react-hot-toast";
import { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";

export default function AdminReservations() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllReservations();
  }, []);

  const fetchAllReservations = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`https://doan-ecommerce-backend.vercel.app/api/v1/reservations`);
      let data = res.data.data || [];
      // Sắp xếp người mới đặt lên trên cùng
      data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setReservations(data);
    } catch (error) {
      console.error("Lỗi lấy danh sách:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if(confirm("Sếp muốn tước quyền giữ món này của khách thật ạ? Thu hồi về kho nha!")) {
      try {
        await axios.put(`https://doan-ecommerce-backend.vercel.app/api/v1/reservations/${id}/cancel`);
        toast.success("✅ Đã hủy đơn giữ hàng thành công! Hàng đã được nhả ra.");
        fetchAllReservations(); // Load lại data
      } catch (err) {
        toast.error("❌ Á đù, lỗi mạng rồi Sếp ơi!");
      }
    }
  };

  const formatPrice = (price) => price?.toLocaleString("vi-VN") + " VNĐ";

  // Thống kê sương sương cho Sếp xem
  const pendingCount = reservations.filter(r => r.status === 'pending').length;
  const cancelledCount = reservations.filter(r => r.status === 'cancelled').length;
  const completedCount = reservations.filter(r => r.status === 'actived' || r.status === 'paid').length;

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER KHU VỰC SẾP */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="w-12 h-12 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-500 hover:text-blue-600 hover:border-blue-600 transition-colors shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
            </Link>
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                👑 QUẢN LÝ TỒN/GIỮ HÀNG
              </h1>
              <p className="text-slate-500 font-medium mt-1 text-sm">Kiểm soát danh sách khách hàng đang &quot;đặt gạch&quot; ngâm hàng</p>
            </div>
          </div>
          
          <button onClick={fetchAllReservations} className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold px-6 py-2.5 rounded-xl shadow-sm transition-all flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
            Làm mới
          </button>
        </div>

        {/* THỐNG KÊ NHANH */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center text-3xl">⏳</div>
              <div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">ĐANG NGÂM HÀNG</p>
                <p className="text-3xl font-black text-slate-900">{pendingCount} <span className="text-sm text-slate-500 font-medium">đơn</span></p>
              </div>
            </div>
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center text-3xl">🗑️</div>
              <div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">ĐÃ BỊ HỦY</p>
                <p className="text-3xl font-black text-slate-900">{cancelledCount} <span className="text-sm text-slate-500 font-medium">đơn</span></p>
              </div>
            </div>
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-green-100 text-green-600 flex items-center justify-center text-3xl">✅</div>
              <div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">ĐÃ CHỐT MUA</p>
                <p className="text-3xl font-black text-slate-900">{completedCount} <span className="text-sm text-slate-500 font-medium">đơn</span></p>
              </div>
            </div>
          </div>
        )}

        {/* BẢNG QUẢN LÝ CHÍNH */}
        <div className="bg-white rounded-4xl shadow-sm border border-slate-100 overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32">
              <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mb-4"></div>
              <p className="text-slate-500 font-bold">Đang lôi sổ sách ra xem...</p>
            </div>
          ) : reservations.length === 0 ? (
            <div className="text-center py-32">
              <div className="text-6xl mb-4 grayscale opacity-40">📝</div>
              <h3 className="text-xl font-black text-slate-800">Sổ giữ hàng đang trống</h3>
              <p className="text-slate-500 mt-2 font-medium">Hiện chưa có khách nào đặt gạch giữ chỗ cả.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-white text-xs uppercase tracking-widest">
                    <th className="p-5 font-black rounded-tl-3xl">Khách Hàng</th>
                    <th className="p-5 font-black">Sản Phẩm Đang Giữ</th>
                    <th className="p-5 font-black text-center">Số Lượng</th>
                    <th className="p-5 font-black text-center">Trạng Thái</th>
                    <th className="p-5 font-black text-center rounded-tr-3xl">Quyền Sinh Sát</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {reservations.map((item) => {
                    const isPending = item.status === 'pending';
                    const isCancelled = item.status === 'cancelled';
                    const userName = item.user?.username || item.user?.name || "Khách Ẩn Danh";
                    const productName = item.product?.title || item.product?.name || "Sản phẩm bị lỗi/Đã xóa";
                    const productImg = item.product?.image || (item.product?.images && item.product.images[0]) || "https://via.placeholder.com/150";

                    return (
                      <tr key={item._id} className="hover:bg-slate-50/80 transition-colors duration-200">
                        
                        {/* Cột Khách Hàng */}
                        <td className="p-5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 font-black flex items-center justify-center shrink-0 uppercase">
                              {userName.charAt(0)}
                            </div>
                            <div>
                              <p className="font-black text-slate-800 text-sm">{userName}</p>
                              <p className="text-[10px] text-slate-400 font-bold mt-0.5">{item.user?.email || "No email"}</p>
                            </div>
                          </div>
                        </td>

                        {/* Cột Sản Phẩm (Đã fix lỗi trống tên + thêm hình) */}
                        <td className="p-5">
                          <div className="flex items-center gap-4">
                            <img 
                              src={productImg} 
                              alt="sp" 
                              className={`w-14 h-14 object-contain rounded-lg border border-slate-100 bg-slate-50 p-1 shrink-0 ${isCancelled ? 'grayscale opacity-50' : ''}`}
                            />
                            <div>
                              <p className={`font-bold text-sm line-clamp-2 ${isCancelled ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
                                {productName}
                              </p>
                              {item.product?.price && (
                                <p className="text-xs font-black text-blue-600 mt-1">{formatPrice(item.product.price)}</p>
                              )}
                              <p className="text-[10px] text-slate-400 font-bold mt-1">
                                Tạo lúc: {new Date(item.createdAt).toLocaleString('vi-VN')}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Cột Số Lượng */}
                        <td className="p-5 text-center">
                          <div className="inline-block bg-slate-100 px-3 py-1 rounded-lg">
                            <span className="font-black text-slate-800">{item.quantity}</span>
                          </div>
                        </td>

                        {/* Cột Trạng Thái */}
                        <td className="p-5 text-center">
                          <span className={`text-[10px] px-3 py-1.5 rounded-lg font-black uppercase tracking-widest ${
                            isPending ? 'bg-orange-100 text-orange-600 border border-orange-200' : 
                            isCancelled ? 'bg-red-100 text-red-600 border border-red-200' : 
                            'bg-green-100 text-green-600 border border-green-200'
                          }`}>
                            {isPending ? 'ĐANG CHỜ' : isCancelled ? 'ĐÃ HỦY' : item.status}
                          </span>
                        </td>

                        {/* Cột Nút Hành Động */}
                        <td className="p-5 text-center">
                          {isPending ? (
                            <button 
                              onClick={() => handleCancel(item._id)} 
                              className="bg-white border-2 border-slate-200 text-red-500 hover:bg-red-50 hover:border-red-500 font-black px-4 py-2 rounded-xl transition-all text-xs uppercase tracking-widest shadow-sm"
                            >
                              Thu Hồi
                            </button>
                          ) : (
                            <span className="text-slate-300 text-xs font-bold italic">Đã chốt sổ</span>
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
    </div>
  );
}