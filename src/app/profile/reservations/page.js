"use client";
import { toast } from "react-hot-toast";
import { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
// Đã fix cứng chuẩn đường dẫn
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
      
      // 🚀 THUẬT TOÁN TRUY TÌM ID TUYỆT ĐỐI
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
          } catch (error) {}
        }
      }

      let userId = currentUser?._id || currentUser?.id || currentUser?.userId || currentUser?.data?._id;

      // 2. Kẹt quá thì giải mã luôn Token (Hack mode)
      if (!userId && currentToken) {
        try {
          const payload = JSON.parse(atob(currentToken.split('.')[1]));
          userId = payload._id || payload.id || payload.userId;
        } catch (error) {}
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
    if(confirm("Chắc chắn muốn hủy giữ món này không ní? Hủy xong là người khác mua mất ráng chịu nha!")) {
      try {
        await axios.put(`https://doan-ecommerce-backend.vercel.app/api/v1/reservations/${id}/cancel`);
        toast.success("✅ Đã nhả hàng thành công!");
        fetchMyReservations(); // Tải lại danh sách ngay lập tức
      } catch (err) {
        toast.error("❌ Hủy thất bại, thử lại sau nha Sếp!");
      }
    }
  };

  const formatPrice = (price) => price?.toLocaleString("vi-VN") + " VNĐ";

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto">
        
        <div className="flex items-center gap-4 mb-8">
          <Link href="/profile" className="w-10 h-10 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-500 hover:text-purple-600 hover:border-purple-600 transition-colors shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </Link>
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">📦 KHO HÀNG CỦA TÔI</h2>
            <p className="text-slate-500 font-medium text-sm mt-1">Nơi quản lý những siêu phẩm bạn đã "đặt gạch"</p>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-purple-600 mb-4"></div>
            <p className="text-slate-500 font-bold">Đang vô kho tìm hàng cho Sếp...</p>
          </div>
        ) : reservations.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
            <div className="text-6xl mb-4 grayscale opacity-40">🕸️</div>
            <h3 className="text-xl font-black text-slate-800">Chưa đặt gạch món nào hết!</h3>
            <p className="text-slate-500 mt-2 mb-6 font-medium text-sm">Ra ngoài săn sale rồi quăng vô đây đi Chủ Tịch.</p>
            <Link href="/products" className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-black px-8 py-3 rounded-xl uppercase tracking-widest text-sm transition-colors shadow-lg hover:-translate-y-1">
              ĐI SĂN HÀNG NGAY
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {reservations.map((item) => {
              const isPending = item.status === 'pending';
              const isCancelled = item.status === 'cancelled';
              
              return (
                <div key={item._id} className="p-6 border border-slate-100 rounded-3xl shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center bg-white hover:shadow-md transition-shadow gap-6">
                  
                  <div className="flex items-center gap-5 w-full md:w-auto">
                    <img 
                      src={item.product?.image || (item.product?.images && item.product.images[0]) || "https://via.placeholder.com/150"} 
                      alt={item.product?.title || item.product?.name} 
                      className={`w-20 h-20 object-contain mix-blend-multiply bg-slate-50 rounded-xl p-2 border border-slate-100 shrink-0 ${isCancelled ? 'grayscale opacity-50' : ''}`} 
                    />
                    <div>
                      <h3 className={`font-black text-lg line-clamp-1 ${isCancelled ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
                        {item.product?.title || item.product?.name || "Sản phẩm đã bị xóa"}
                      </h3>
                      <div className="flex flex-wrap items-center gap-3 mt-2 text-sm">
                        <span className="font-bold text-slate-500">SL: <span className="text-slate-900">{item.quantity}</span></span>
                        <span className="text-slate-300">|</span>
                        <span className="font-black text-blue-600">{formatPrice(item.product?.price)}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-bold mt-1">
                        Ngày đặt: {new Date(item.createdAt).toLocaleString('vi-VN')}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between w-full md:w-auto gap-4 border-t md:border-t-0 border-slate-100 pt-4 md:pt-0">
                    <span className={`text-xs px-3 py-1.5 rounded-lg font-black uppercase tracking-widest ${
                      isPending ? 'bg-orange-100 text-orange-600 border border-orange-200' : 
                      isCancelled ? 'bg-red-100 text-red-600 border border-red-200' : 
                      'bg-green-100 text-green-600 border border-green-200'
                    }`}>
                      {isPending ? 'ĐANG GIỮ HÀNG' : isCancelled ? 'ĐÃ HỦY' : item.status}
                    </span>
                    
                    {isPending && (
                      <button 
                        onClick={() => handleCancel(item._id)} 
                        className="px-5 py-2.5 bg-white border-2 border-slate-200 text-slate-600 rounded-xl hover:border-red-500 hover:text-red-500 hover:bg-red-50 font-black uppercase tracking-widest text-xs transition-colors"
                      >
                        Hủy Giữ
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