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
    if (window.confirm("⚠️ Sếp muốn tước quyền giữ món này của khách thật ạ? Thu hồi về kho nha!")) {
      try {
        await axios.put(`https://doan-ecommerce-backend.vercel.app/api/v1/reservations/${id}/cancel`);
        toast.success("✅ Đã hủy đơn giữ hàng thành công! Hàng đã được nhả ra.", {
          style: { borderRadius: '12px', background: '#0f172a', color: '#fff', fontWeight: 'bold' }
        });
        fetchAllReservations(); // Load lại data
      } catch (err) {
        toast.error("❌ Á đù, lỗi mạng rồi Sếp ơi!");
      }
    }
  };

  const formatPrice = (price) => price?.toLocaleString("vi-VN") + " VNĐ";

  // Thống kê sương sương cho Sếp xem
  const pendingCount = reservations.filter(r => r.status === 'pending' || r.status === 'reserved').length;
  const cancelledCount = reservations.filter(r => r.status === 'cancelled').length;
  const completedCount = reservations.filter(r => r.status === 'actived' || r.status === 'paid' || r.status === 'completed').length;

  return (
    <div className="min-h-screen bg-slate-50/50 py-10 px-4 sm:px-6 lg:px-8 font-sans selection:bg-blue-200">
      <div className="max-w-[1400px] mx-auto">

        {/* 🚀 HEADER KHU VỰC SẾP */}
        <div className="bg-white rounded-[2rem] shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100 p-6 md:p-8 mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-blue-50/50 rounded-bl-full -z-10"></div>

          <div className="flex items-center gap-5 relative z-10">
            <Link href="/admin" className="w-12 h-12 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-center text-slate-500 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50 transition-all shadow-sm group">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
            </Link>
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                <span className="text-3xl drop-shadow-sm">⏳</span> QUẢN LÝ ĐƠN GIỮ HÀNG
              </h1>
              <p className="text-slate-500 font-medium mt-1 text-sm">Kiểm soát danh sách khách hàng đang "đặt gạch" ngâm hàng trong hệ thống.</p>
            </div>
          </div>

          <button
            onClick={fetchAllReservations}
            className="bg-slate-900 text-white hover:bg-blue-600 font-black px-6 py-3.5 rounded-xl shadow-lg hover:shadow-blue-500/30 transition-all hover:-translate-y-0.5 flex items-center gap-2 text-xs tracking-widest uppercase relative z-10"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
            Làm mới sổ sách
          </button>
        </div>

        {/* 🚀 THỐNG KÊ NHANH */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {/* Card 1: Đang ngâm */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] flex items-center gap-5 group hover:border-amber-200 transition-colors">
              <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center text-3xl shadow-inner group-hover:scale-110 transition-transform">⏳</div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">ĐANG NGÂM HÀNG</p>
                <p className="text-3xl font-black text-slate-900 tracking-tight">{pendingCount} <span className="text-sm text-slate-400 font-bold ml-1">đơn</span></p>
              </div>
            </div>

            {/* Card 2: Đã hủy */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] flex items-center gap-5 group hover:border-rose-200 transition-colors">
              <div className="w-16 h-16 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center text-3xl shadow-inner group-hover:scale-110 transition-transform">🗑️</div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">ĐÃ BỊ HỦY / THU HỒI</p>
                <p className="text-3xl font-black text-slate-900 tracking-tight">{cancelledCount} <span className="text-sm text-slate-400 font-bold ml-1">đơn</span></p>
              </div>
            </div>

            {/* Card 3: Đã chốt */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] flex items-center gap-5 group hover:border-emerald-200 transition-colors">
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center text-3xl shadow-inner group-hover:scale-110 transition-transform">✅</div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">ĐÃ CHỐT MUA</p>
                <p className="text-3xl font-black text-slate-900 tracking-tight">{completedCount} <span className="text-sm text-slate-400 font-bold ml-1">đơn</span></p>
              </div>
            </div>
          </div>
        )}

        {/* 🚀 BẢNG QUẢN LÝ CHÍNH */}
        <div className="bg-white rounded-[2rem] shadow-[0_10px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden">
          <div className="px-8 py-6 bg-slate-50/50 border-b border-slate-100">
            <h2 className="text-lg font-black text-slate-800 tracking-tight">DANH SÁCH CHI TIẾT</h2>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-32">
              <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mb-4"></div>
              <p className="text-slate-500 font-bold tracking-widest uppercase text-xs animate-pulse">Đang lôi sổ sách ra xem...</p>
            </div>
          ) : reservations.length === 0 ? (
            <div className="text-center py-32 flex flex-col items-center">
              <div className="text-7xl mb-6 grayscale opacity-30 drop-shadow-sm">📝</div>
              <h3 className="text-2xl font-black text-slate-800 tracking-tight mb-2">Sổ giữ hàng đang trống!</h3>
              <p className="text-slate-500 font-medium">Hiện chưa có khách nào đặt gạch giữ chỗ cả Chủ Tịch ơi.</p>
            </div>
          ) : (
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead>
                  <tr className="bg-white border-b-2 border-slate-100 text-slate-400 text-[10px] uppercase tracking-widest">
                    <th className="px-8 py-5 font-black">Khách Hàng</th>
                    <th className="px-8 py-5 font-black">Sản Phẩm Đang Giữ</th>
                    <th className="px-8 py-5 font-black text-center">Số Lượng</th>
                    <th className="px-8 py-5 font-black text-center">Trạng Thái</th>
                    <th className="px-8 py-5 font-black text-center">Quyền Sinh Sát</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {reservations.map((item) => {
                    const isPending = item.status === 'pending' || item.status === 'reserved';
                    const isCancelled = item.status === 'cancelled';
                    const userName = item.user?.username || item.user?.name || "Khách Ẩn Danh";
                    const productName = item.product?.title || item.product?.name || "Sản phẩm bị lỗi/Đã xóa";
                    const productImg = item.product?.image || (item.product?.images && item.product.images[0]) || "https://via.placeholder.com/150";

                    return (
                      <tr key={item._id} className="hover:bg-slate-50/80 transition-colors duration-200 group">

                        {/* Cột 1: Khách Hàng */}
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-blue-50 border border-blue-100 text-blue-600 font-black flex items-center justify-center shrink-0 uppercase shadow-sm text-lg">
                              {userName.charAt(0)}
                            </div>
                            <div>
                              <p className="font-black text-slate-800 text-sm mb-0.5">{userName}</p>
                              <p className="text-[10px] text-slate-500 font-bold bg-slate-100 px-2 py-0.5 rounded w-max">
                                {item.user?.email || "No email"}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Cột 2: Sản Phẩm */}
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-4">
                            <div className={`w-16 h-16 rounded-2xl border border-slate-100 bg-white p-1.5 shrink-0 shadow-sm overflow-hidden ${isCancelled ? 'grayscale opacity-50' : ''}`}>
                              <img
                                src={productImg}
                                alt="sp"
                                className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform"
                              />
                            </div>
                            <div className="max-w-[250px]">
                              <p className={`font-bold text-sm line-clamp-2 leading-snug mb-1 ${isCancelled ? 'text-slate-400 line-through' : 'text-slate-900 group-hover:text-blue-600 transition-colors'}`}>
                                {productName}
                              </p>
                              <div className="flex items-center gap-3">
                                {item.product?.price && (
                                  <p className="text-xs font-black text-rose-600">{formatPrice(item.product.price)}</p>
                                )}
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                  {new Date(item.createdAt).toLocaleDateString('vi-VN')}
                                </p>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Cột 3: Số Lượng */}
                        <td className="px-8 py-5 text-center">
                          <div className="inline-flex items-center justify-center bg-slate-100 border border-slate-200 px-4 py-1.5 rounded-xl shadow-inner">
                            <span className="font-black text-slate-800 text-sm">{item.quantity}</span>
                            <span className="text-[10px] font-bold text-slate-400 ml-1 uppercase">cái</span>
                          </div>
                        </td>

                        {/* Cột 4: Trạng Thái */}
                        <td className="px-8 py-5 text-center">
                          <span className={`text-[10px] px-3 py-1.5 rounded-lg font-black uppercase tracking-widest border shadow-sm ${isPending ? 'bg-amber-50 text-amber-600 border-amber-200' :
                              isCancelled ? 'bg-rose-50 text-rose-600 border-rose-200' :
                                'bg-emerald-50 text-emerald-600 border-emerald-200'
                            }`}>
                            {isPending ? '⏳ ĐANG CHỜ' : isCancelled ? '❌ ĐÃ HỦY' : '✅ ĐÃ CHỐT'}
                          </span>
                        </td>

                        {/* Cột 5: Quyền Sinh Sát */}
                        <td className="px-8 py-5 text-center">
                          {isPending ? (
                            <button
                              onClick={() => handleCancel(item._id)}
                              className="bg-white border-2 border-rose-100 text-rose-500 hover:bg-rose-500 hover:text-white hover:border-rose-500 font-black px-5 py-2.5 rounded-xl transition-all duration-300 text-[10px] uppercase tracking-widest shadow-sm hover:shadow-rose-500/30 hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-1.5 mx-auto w-max group/btn"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-3.5 h-3.5 group-hover/btn:rotate-180 transition-transform duration-500"><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" /></svg>
                              Thu Hồi
                            </button>
                          ) : (
                            <span className="text-slate-300 text-xs font-bold italic bg-slate-50 px-3 py-1 rounded-md border border-slate-100 inline-block">Đã chốt sổ</span>
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