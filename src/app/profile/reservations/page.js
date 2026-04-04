"use client";
import { toast } from "react-hot-toast";
import { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import useAuthStore from "../../../store/useAuthStore";

export default function MyReservations() {
  const { user } = useAuthStore();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyReservations();
  }, [user]);

  const fetchMyReservations = async () => {
    try {
      setLoading(true);

      // 🚀 THUẬT TOÁN TRUY TÌM ID TUYỆT ĐỐI (GIỮ NGUYÊN BẢN GỐC)
      let currentUser = user;
      let currentToken = user?.token || (typeof window !== "undefined" ? localStorage.getItem("token") : "");

      // 1. Mò trong LocalStorage nếu state bị rỗng
      if (!currentUser || (!currentUser._id && !currentUser.id)) {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          try {
            const item = JSON.parse(localStorage.getItem(key));
            if (item?.state?.user) currentUser = item.state.user;
            if (item?.state?.token) currentToken = item.state.token;
          } catch (error) { }
        }
      }

      let userId = currentUser?._id || currentUser?.id || currentUser?.userId || currentUser?.data?._id;

      // 2. Kẹt quá thì giải mã luôn Token (Hack mode)
      if (!userId && currentToken) {
        try {
          const payload = JSON.parse(atob(currentToken.split('.')[1]));
          userId = payload._id || payload.id || payload.userId;
        } catch (error) { }
      }

      // 3. Nếu vẫn không ra thì đành chịu
      if (!userId) {
        console.log("Đang chờ tải thông tin Chủ Tịch...");
        setLoading(false);
        return;
      }

      // ĐÃ CÓ ID -> GỌI API LẤY ĐƠN HÀNG
      const res = await axios.get(`https://doan-ecommerce-backend.vercel.app/api/v1/reservations/user/${userId}`);

      // Sắp xếp đơn mới nhất lên đầu
      let data = res.data.data || [];
      data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      setReservations(data);
    } catch (error) {
      console.error("Lỗi tải danh sách:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (window.confirm("⚠️ Chắc chắn muốn nhả món này không Sếp? Hủy xong là người khác cướp mất ráng chịu nha!")) {
      try {
        await axios.put(`https://doan-ecommerce-backend.vercel.app/api/v1/reservations/${id}/cancel`);
        toast.success("✅ Đã nhả hàng thành công! Nhường cơ hội cho anh em khác.", {
          style: { borderRadius: '12px', background: '#0f172a', color: '#fff', fontWeight: 'bold' }
        });
        fetchMyReservations(); // Tải lại danh sách ngay lập tức
      } catch (err) {
        toast.error("❌ Hủy thất bại, có vẻ mạng lag. Sếp thử lại sau nha!");
      }
    }
  };

  const formatPrice = (price) => price?.toLocaleString("vi-VN") + " VNĐ";

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-purple-200">

      {/* 🚀 HEADER BANNER CAO CẤP */}
      <div className="bg-slate-900 pt-16 pb-24 relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-[-50%] right-[-10%] w-[500px] h-[500px] rounded-full bg-purple-600/20 blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-[-20%] left-[-10%] w-[300px] h-[300px] rounded-full bg-blue-600/20 blur-[100px] pointer-events-none"></div>

        <div className="max-w-5xl mx-auto px-4 relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <Link href="/profile" className="w-12 h-12 bg-white/10 border border-white/20 rounded-2xl flex items-center justify-center text-white hover:bg-white hover:text-slate-900 transition-all shadow-lg backdrop-blur-md group">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 group-hover:-translate-x-1 transition-transform">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
            </Link>
            <div>
              <span className="inline-block py-1 px-3 rounded-full bg-white/10 border border-white/20 text-purple-300 text-[10px] font-black tracking-widest uppercase mb-3 backdrop-blur-md">
                Khu vực cá nhân
              </span>
              <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-2 flex items-center gap-3">
                KHO GIỮ HÀNG
              </h1>
              <p className="text-slate-400 font-medium text-sm md:text-base">Quản lý những siêu phẩm Chủ Tịch đã "đặt gạch".</p>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 px-6 py-4 rounded-2xl text-center shadow-lg hidden sm:block">
            <div className="text-3xl font-black text-white">{reservations.length}</div>
            <div className="text-[10px] text-purple-300 font-bold uppercase tracking-widest mt-1">Đang Lưu Trữ</div>
          </div>
        </div>
      </div>

      {/* 🚀 MAIN CONTENT */}
      <div className="max-w-5xl mx-auto px-4 w-full grow -mt-12 relative z-20 pb-20">

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 bg-white rounded-[2rem] border border-slate-100 shadow-sm">
            <div className="relative w-16 h-16 mb-6">
              <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-purple-600 rounded-full border-t-transparent animate-spin"></div>
            </div>
            <p className="text-slate-500 font-bold tracking-widest uppercase text-xs animate-pulse">Đang lục kho tìm hàng...</p>
          </div>
        ) : reservations.length === 0 ? (
          <div className="text-center py-24 md:py-32 bg-white rounded-[3rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <div className="w-32 h-32 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8 border-4 border-white shadow-inner">
              <div className="text-6xl grayscale opacity-40">🕸️</div>
            </div>
            <h3 className="text-3xl font-black text-slate-800 tracking-tight mb-4">Kho hàng trống rỗng!</h3>
            <p className="text-slate-500 mt-2 mb-10 font-medium text-lg max-w-md mx-auto">Chủ Tịch chưa nhắm được món nào sao? Ra ngoài dạo một vòng rồi "cất" vô đây nhé!</p>
            <Link href="/products" className="inline-flex items-center gap-2 bg-slate-900 hover:bg-purple-600 text-white font-black px-8 py-4 rounded-2xl uppercase tracking-widest text-xs transition-all shadow-lg hover:shadow-purple-500/30 hover:-translate-y-1 group">
              VÀO CỬA HÀNG SĂN ĐỒ
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-4 h-4 group-hover:translate-x-1 transition-transform"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {reservations.map((item) => {
              const isPending = item.status === 'pending' || item.status === 'reserved';
              const isCancelled = item.status === 'cancelled';

              return (
                <div key={item._id} className="p-6 md:p-8 border border-slate-100 rounded-[2rem] shadow-[0_4px_20px_rgb(0,0,0,0.02)] flex flex-col md:flex-row justify-between items-start md:items-center bg-white hover:shadow-[0_10px_30px_rgb(0,0,0,0.06)] hover:border-purple-100 transition-all duration-300 gap-6 md:gap-8 group">

                  {/* Cụm thông tin trái */}
                  <div className="flex items-center gap-6 w-full md:w-auto">
                    {/* Hình ảnh */}
                    <div className="relative w-24 h-24 md:w-28 md:h-28 shrink-0">
                      <div className={`w-full h-full bg-slate-50 rounded-2xl p-2 border border-slate-100 flex items-center justify-center overflow-hidden ${isCancelled ? 'grayscale opacity-50' : ''}`}>
                        <img
                          src={item.product?.image || (item.product?.images && item.product.images[0]) || "https://via.placeholder.com/150"}
                          alt={item.product?.title || item.product?.name}
                          className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>
                      <span className="absolute -top-2 -right-2 bg-slate-900 text-white w-7 h-7 flex items-center justify-center rounded-full text-xs font-black shadow-md border-2 border-white">
                        x{item.quantity}
                      </span>
                    </div>

                    {/* Thông tin Text */}
                    <div className="flex-1">
                      <h3 className={`font-black text-lg md:text-xl line-clamp-2 leading-snug mb-2 transition-colors ${isCancelled ? 'text-slate-400 line-through' : 'text-slate-900 group-hover:text-purple-600'}`}>
                        {item.product?.title || item.product?.name || "Sản phẩm đã bị xóa khỏi hệ thống"}
                      </h3>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-3">
                        <div className="text-xl font-black text-rose-600 tracking-tight">
                          {formatPrice(item.product?.price)}
                        </div>
                        <div className="hidden sm:block text-slate-300">|</div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest bg-slate-50 px-2 py-1 rounded w-max">
                          Lưu lúc: {new Date(item.createdAt).toLocaleDateString('vi-VN')}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Cụm nút bấm phải */}
                  <div className="flex flex-row md:flex-col items-center justify-between md:justify-center w-full md:w-48 gap-4 border-t md:border-t-0 md:border-l border-slate-100 pt-5 md:pt-0 md:pl-6">
                    <span className={`w-full text-center text-[10px] px-4 py-2 rounded-xl font-black uppercase tracking-widest border shadow-sm ${isPending ? 'bg-amber-50 text-amber-600 border-amber-200' :
                        isCancelled ? 'bg-slate-50 text-slate-400 border-slate-200' :
                          'bg-emerald-50 text-emerald-600 border-emerald-200'
                      }`}>
                      {isPending ? '⏳ ĐANG GIỮ HÀNG' : isCancelled ? '❌ ĐÃ HỦY' : '✅ ĐÃ CHỐT'}
                    </span>

                    {isPending && (
                      <button
                        onClick={() => handleCancel(item._id)}
                        className="w-full px-4 py-3 bg-white border-2 border-slate-200 text-slate-500 rounded-xl hover:border-rose-500 hover:text-rose-500 hover:bg-rose-50 font-black uppercase tracking-widest text-[10px] transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-1.5"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                        Nhả Hàng
                      </button>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}