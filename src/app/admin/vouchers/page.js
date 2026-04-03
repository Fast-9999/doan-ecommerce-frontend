"use client";

import { toast } from "react-hot-toast";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import useAuthStore from "../../../store/useAuthStore";

export default function AdminVouchers() {
  const { user, token } = useAuthStore();
  const router = useRouter();

  const [isClient, setIsClient] = useState(false);
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    code: "",
    discountType: "percent", // percent hoặc fixed
    discountValue: "",
    minOrderValue: "",
    expirationDate: "",
    usageLimit: ""
  });

  useEffect(() => {
    setIsClient(true);
    if (user) {
      const isAdmin = user.role === 'admin' || user.role === 'ADMIN' || user.username === 'phattest' || user.role?.name === 'admin' || user.role === '69c79a3c076efe132ceab729' || user.role?._id === '69c79a3c076efe132ceab729';
      if (!isAdmin) {
        toast.error("Khu vực cấm! Chỉ dành cho Chủ Tịch!");
        router.push("/");
        return;
      }
      fetchVouchers();
    } else {
      router.push("/login");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, router]);

  const getAuthHeaders = () => {
    let auth_token = token || user?.token || user?.accessToken;
    if (!token && typeof window !== 'undefined') {
      auth_token = localStorage.getItem("token");
    }
    return {
      headers: { "Authorization": `Bearer ${auth_token}` }
    };
  };

  const fetchVouchers = async () => {
    try {
      setLoading(true);
      const res = await axios.get("https://doan-ecommerce-backend.vercel.app/api/v1/vouchers", getAuthHeaders());
      let data = res.data;
      if (data && typeof data === 'object' && !Array.isArray(data)) {
        data = data.data || data.vouchers || data.result || [];
      }
      if (Array.isArray(data)) {
        data.reverse();
        setVouchers(data);
      }
    } catch (err) {
      console.error("Lỗi lấy danh sách vouchers:", err);
      toast.error("Không tải được kho Voucher!");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateVoucher = async (e) => {
    e.preventDefault();
    if (!formData.code || !formData.discountValue || !formData.expirationDate) {
      toast.error("Vui lòng điền đủ các trường bắt buộc!");
      return;
    }

    try {
      const payload = {
        code: formData.code.toUpperCase(),
        discountType: formData.discountType,
        discountValue: Number(formData.discountValue),
        minOrderValue: Number(formData.minOrderValue) || 0,
        expirationDate: new Date(formData.expirationDate).toISOString(),
        usageLimit: Number(formData.usageLimit) || 100
      };

      await axios.post("https://doan-ecommerce-backend.vercel.app/api/v1/vouchers", payload, getAuthHeaders());
      toast.success("🎉 Tung mã giảm giá mới thành công!");
      setShowModal(false);
      setFormData({ code: "", discountType: "percent", discountValue: "", minOrderValue: "", expirationDate: "", usageLimit: "" });
      fetchVouchers();
    } catch (err) {
      console.error("Lỗi tạo voucher:", err);
      const backendError = err.response?.data?.message || err.response?.data?.error || "Lỗi bí ẩn từ backend";
      toast.error(`❌ Tạo thất bại: ${backendError}`);
    }
  };

  const handleDeleteVoucher = async (id) => {
    if (!window.confirm("⚠️ Xóa mã giảm giá này? Khách hàng sẽ không thể nhập mã này nữa!")) return;
    try {
      await axios.delete(`https://doan-ecommerce-backend.vercel.app/api/v1/vouchers/${id}`, getAuthHeaders());
      toast.success("🗑️ Đã thu hồi mã giảm giá!");
      fetchVouchers();
    } catch (err) {
      toast.error("❌ Xóa thất bại, check lại đường truyền Sếp ơi!");
    }
  };

  const formatPrice = (price) => price?.toLocaleString("vi-VN") + " VNĐ";

  if (!isClient) return null;

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">

      {/* 🚀 SIDEBAR ADMIN */}
      <div className="w-64 bg-slate-900 text-white p-6 shadow-xl hidden md:flex flex-col shrink-0 relative z-20">
        <h2 className="text-2xl font-black mb-10 tracking-wider">
          👑 ADMIN <span className="text-blue-500">PANEL</span>
        </h2>
        <nav className="space-y-4 flex-1">
          <Link href="/admin" className="block px-4 py-3 text-slate-300 font-bold hover:bg-slate-800 hover:text-white rounded-xl transition">
            📦 Tổng Quan & Kho
          </Link>
          <Link href="/admin/products" className="block px-4 py-3 text-slate-300 font-bold hover:bg-slate-800 hover:text-white rounded-xl transition">
            👕 Quản lý Sản Phẩm
          </Link>
          <Link href="/admin/inbox" className="block px-4 py-3 text-slate-300 font-bold hover:bg-slate-800 hover:text-white rounded-xl transition">
            💬 Chăm Sóc Khách
          </Link>
          <Link href="/admin/users" className="block px-4 py-3 text-slate-300 font-bold hover:bg-slate-800 hover:text-white rounded-xl transition">
            👥 Quản lý Users
          </Link>
          <Link href="/admin/vouchers" className="block px-4 py-3 bg-linear-to-r from-blue-600 to-indigo-600 rounded-xl font-bold shadow-lg shadow-blue-500/30 transition transform hover:translate-x-1">
            🎟️ Quản lý Vouchers
          </Link>
        </nav>

        <div className="mt-auto">
          <Link href="/" className="block text-center px-4 py-3 bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 rounded-xl font-bold transition text-sm uppercase tracking-widest">
            ← Về Cửa Hàng
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 md:p-12 overflow-y-auto relative">

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Trung Tâm Khuyến Mãi</h1>
            <p className="text-slate-500 font-medium mt-1">Tạo mã giảm giá để bơm doanh thu và xả kho hàng.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-white px-5 py-2.5 rounded-full shadow-sm border border-slate-200 font-bold text-slate-600">
              Đang có: <span className="text-blue-600">{vouchers.length}</span> mã
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="bg-slate-900 text-white px-6 py-2.5 rounded-full font-bold shadow-lg hover:shadow-xl transition-all flex items-center gap-2 hover:-translate-y-0.5"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Tạo Mã Mới
            </button>
          </div>
        </div>

        {/* BẢNG DANH SÁCH VOUCHERS */}
        <div className="bg-white rounded-4xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden">
          <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h2 className="text-xl font-black text-slate-800">DANH SÁCH MÃ GIẢM GIÁ</h2>
            <button onClick={fetchVouchers} className="text-blue-600 hover:text-blue-800 font-bold text-sm bg-blue-50 px-4 py-2 rounded-lg transition flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
              Làm mới
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-32"><div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600"></div></div>
          ) : vouchers.length === 0 ? (
            <div className="p-32 text-center">
              <div className="text-6xl mb-4 grayscale opacity-40">🏷️</div>
              <h2 className="text-2xl font-black text-gray-800 tracking-tight">Chưa có mã giảm giá nào!</h2>
              <p className="text-slate-500 mt-2 font-medium">Bấm "Tạo Mã Mới" để bắt đầu chiến dịch sale sập sàn ngay.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white border-b-2 border-slate-100 text-slate-400 text-xs uppercase tracking-widest">
                    <th className="p-6 font-black w-1/4">Mã Khuyến Mãi</th>
                    <th className="p-6 font-black">Giá Trị Giảm</th>
                    <th className="p-6 font-black">Điều Kiện & Lượt Dùng</th>
                    <th className="p-6 font-black">Thời Hạn</th>
                    <th className="p-6 font-black text-center">Tình Trạng / Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {vouchers.map((v) => {
                    const isExpired = new Date(v.expirationDate) < new Date();
                    const isUsedUp = v.usedCount >= v.usageLimit;

                    let statusHtml;
                    if (isExpired) {
                      statusHtml = <span className="text-red-500 bg-red-100 px-3 py-1 rounded-sm text-xs font-black uppercase">Đã Hết Hạn</span>;
                    } else if (isUsedUp) {
                      statusHtml = <span className="text-slate-500 bg-slate-100 px-3 py-1 rounded-sm text-xs font-black uppercase">Đã Hết Lượt</span>;
                    } else {
                      statusHtml = <span className="text-green-500 bg-green-100 px-3 py-1 rounded-sm text-xs font-black uppercase">Đang Kích Hoạt</span>;
                    }

                    return (
                      <tr key={v._id} className="hover:bg-slate-50/80 transition-colors duration-200">

                        <td className="p-6">
                          <div className="inline-block border-2 border-dashed border-blue-300 bg-blue-50 text-blue-700 font-black px-4 py-2 rounded-xl text-lg tracking-widest uppercase">
                            {v.code}
                          </div>
                        </td>

                        <td className="p-6">
                          <div className="text-lg font-black text-slate-800">
                            {v.discountType === 'percent' || v.discountType === 'PERCENT' ? `${v.discountValue}%` : formatPrice(v.discountValue)}
                          </div>
                          <div className="text-xs text-slate-400 font-bold uppercase tracking-wide mt-1">
                            {v.discountType === 'percent' || v.discountType === 'PERCENT' ? "Giảm theo phần trăm" : "Giảm giá tiền mặt"}
                          </div>
                        </td>

                        <td className="p-6 pl-4">
                          <div className="text-sm font-bold text-slate-700">
                            Đơn tối thiểu: <span className="text-slate-900">{formatPrice(v.minOrderValue || 0)}</span>
                          </div>
                          <div className="text-xs font-bold mt-1.5 flex items-center gap-2">
                            <div className="w-full bg-slate-100 rounded-full h-2 max-w-[100px]">
                              <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${Math.min(100, ((v.usedCount || 0) / (v.usageLimit || 1)) * 100)}%` }}></div>
                            </div>
                            <span className="text-slate-500">{v.usedCount || 0} / {v.usageLimit || '∞'}</span>
                          </div>
                        </td>

                        <td className="p-6">
                          <div className="text-sm font-bold text-slate-600">
                            {new Date(v.expirationDate).toLocaleDateString('vi-VN')}
                          </div>
                          <div className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-widest">
                            {new Date(v.expirationDate).toLocaleTimeString('vi-VN')}
                          </div>
                        </td>

                        <td className="p-6 text-center">
                          <div className="flex flex-col items-center gap-3">
                            {statusHtml}
                            <button
                              onClick={() => handleDeleteVoucher(v._id || v.id)}
                              className="text-xs text-slate-400 hover:text-red-500 font-bold underline decoration-transparent hover:decoration-red-500 underline-offset-4 transition"
                            >
                              Xóa vĩnh viễn
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

      </div>

      {/* ================= MODAL TẠO VOUCHER ================= */}
      {showModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden relative z-10 animate-fade-in-up border border-slate-100">

            <div className="bg-slate-900 p-6 flex justify-between items-center">
              <h3 className="text-xl font-black text-white flex items-center gap-3">
                🎟️ Đúc Mã Giảm Giá
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white text-3xl font-light transition-colors leading-none">&times;</button>
            </div>

            <form onSubmit={handleCreateVoucher} className="p-8 space-y-5">

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Mã Khuyến Mãi <span className="text-red-500">*</span></label>
                <input required type="text" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })} className="w-full px-5 py-3.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-slate-800 font-black text-lg tracking-widest uppercase bg-slate-50 focus:bg-white" placeholder="VD: SIEUSALE, FREESHIP" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Loại Giảm</label>
                  <select value={formData.discountType} onChange={(e) => setFormData({ ...formData, discountType: e.target.value })} className="w-full px-5 py-3.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-slate-800 font-bold bg-slate-50 focus:bg-white">
                    <option value="percent">Theo Phần Trăm (%)</option>
                    <option value="fixed">Số Tiền (VNĐ)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Giá Trị Cắt Giảm <span className="text-red-500">*</span></label>
                  <input required type="number" min="1" value={formData.discountValue} onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })} className="w-full px-5 py-3.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-slate-800 font-bold bg-slate-50 focus:bg-white" placeholder={formData.discountType === 'percent' ? "1 - 100%" : "VD: 20000"} />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Đơn Hàng Tối Thiểu Được Áp Dụng</label>
                <input type="number" min="0" value={formData.minOrderValue} onChange={(e) => setFormData({ ...formData, minOrderValue: e.target.value })} className="w-full px-5 py-3.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-slate-800 font-medium bg-slate-50 focus:bg-white" placeholder="0 = Áp dụng mọi đơn" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Tổng Số Lượt Dùng</label>
                  <input type="number" min="1" value={formData.usageLimit} onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })} className="w-full px-5 py-3.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-slate-800 font-medium bg-slate-50 focus:bg-white" placeholder="Mặc định: 100" />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Ngày Hết Hạn <span className="text-red-500">*</span></label>
                  <input required type="datetime-local" value={formData.expirationDate} onChange={(e) => setFormData({ ...formData, expirationDate: e.target.value })} className="w-full px-5 py-3.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-slate-800 font-medium bg-slate-50 focus:bg-white" />
                </div>
              </div>

              <div className="pt-6 mt-4 flex justify-end gap-3 border-t border-slate-100">
                <button type="button" onClick={() => setShowModal(false)} className="px-6 py-3.5 rounded-xl font-black text-slate-500 bg-slate-100 hover:bg-slate-200 uppercase tracking-widest text-xs transition">Hủy Bỏ</button>
                <button type="submit" className="px-8 py-3.5 rounded-xl font-black text-white bg-slate-900 hover:bg-blue-600 shadow-lg uppercase tracking-widest text-xs transition">
                  Phát Hành Mã
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
