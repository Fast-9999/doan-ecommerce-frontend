"use client";

import { toast } from "react-hot-toast";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import useAuthStore from "../../../store/useAuthStore";

export default function AdminUsers() {
  const { user, token } = useAuthStore();
  const router = useRouter();

  const [isClient, setIsClient] = useState(false);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setIsClient(true);
    if (user) {
      const isAdmin = user.role === 'admin' || user.role === 'ADMIN' || user.username === 'phattest' || user.role?.name === 'admin' || user.role === '69c79a3c076efe132ceab729' || user.role?._id === '69c79a3c076efe132ceab729';
      if (!isAdmin) {
        toast.error("Khu vực cấm! Chỉ dành cho Chủ Tịch!", { icon: '🛑' });
        router.push("/");
        return;
      }
      fetchUsers();
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

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await axios.get("https://doan-ecommerce-backend.vercel.app/api/v1/users", getAuthHeaders());
      let data = res.data;
      if (data && typeof data === 'object' && !Array.isArray(data)) {
        data = data.data || data.users || data.result || [];
      }
      if (Array.isArray(data)) {
        data.reverse();
        setUsers(data);
      }
    } catch (err) {
      console.error("Lỗi lấy danh sách users:", err);
      toast.error("Không lấy được danh sách nhân sự Sếp ơi!");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm("⚠️ Bạn có chắc chắn muốn XÓA VĨNH VIỄN nhân sự này không? Hành động này không thể hoàn tác!")) return;
    try {
      await axios.delete(`https://doan-ecommerce-backend.vercel.app/api/v1/users/${id}`, getAuthHeaders());
      toast.success("🗑️ Đã trảm user thành công!", {
        style: { borderRadius: '12px', background: '#0f172a', color: '#fff', fontWeight: 'bold' }
      });
      fetchUsers();
    } catch (err) {
      console.error("Lỗi xóa user:", err);
      toast.error("❌ Xóa thất bại! Có thể do Backend không cấp quyền hoặc lỗi mạng.");
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

          <Link href="/admin" className="flex items-center gap-3 px-4 py-3 text-slate-400 font-bold hover:bg-slate-900 hover:text-white rounded-2xl transition-colors">
            <span className="text-xl">📦</span> Bảng Điều Khiển
          </Link>

          <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-4 mt-8 mb-2">Dữ Liệu Nền Tảng</div>

          <Link href="/admin/products" className="flex items-center gap-3 px-4 py-3 text-slate-400 font-bold hover:bg-slate-900 hover:text-white rounded-2xl transition-colors">
            <span className="text-xl">🛍️</span> Quản lý Sản Phẩm
          </Link>
          <Link href="/admin/inbox" className="flex items-center gap-3 px-4 py-3 text-slate-400 font-bold hover:bg-slate-900 hover:text-white rounded-2xl transition-colors">
            <span className="text-xl">💬</span> Trung Tâm Tin Nhắn
          </Link>
          <Link href="/admin/reservations" className="flex items-center gap-3 px-4 py-3 text-slate-400 font-bold hover:bg-slate-900 hover:text-white rounded-2xl transition-colors">
            <span className="text-xl">⏳</span> Đơn Giữ Hàng
          </Link>

          {/* Active Tab */}
          <Link href="/admin/users" className="flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold transition-all duration-300 bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-[0_4px_15px_rgba(37,99,235,0.4)] translate-x-1">
            <span className="text-xl">👥</span> Danh Sách Users
          </Link>

          <Link href="/admin/vouchers" className="flex items-center gap-3 px-4 py-3 text-slate-400 font-bold hover:bg-slate-900 hover:text-white rounded-2xl transition-colors">
            <span className="text-xl">🎟️</span> Kho Mã Giảm Giá
          </Link>
        </nav>

        <div className="p-6 border-t border-slate-800/60">
          <Link href="/" className="flex items-center justify-center gap-2 px-4 py-3.5 bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 hover:border-slate-700 rounded-2xl font-black transition-all text-xs uppercase tracking-widest group">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 group-hover:-translate-x-1 transition-transform"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
            Về Cửa Hàng
          </Link>
        </div>
      </div>

      {/* 🚀 MAIN CONTENT */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-slate-50/50 relative">

        {/* Header Content Sticky */}
        <div className="px-8 md:px-12 py-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200/60 bg-white/50 backdrop-blur-xl z-20 sticky top-0">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              HỒ SƠ NHÂN SỰ
            </h1>
            <p className="text-slate-500 font-medium mt-1.5 text-sm">
              Nơi Chủ Tịch kiểm soát thần dân và ban phát quyền lực.
            </p>
          </div>
          <div className="bg-blue-50 px-5 py-2.5 rounded-full border border-blue-100 font-bold text-blue-700 flex items-center gap-2 shadow-sm text-sm">
            Tổng cộng: <span className="font-black text-blue-900 text-lg">{users.length}</span> thần dân
          </div>
        </div>

        {/* Bọc nội dung cuộn được */}
        <div className="flex-1 overflow-y-auto p-8 md:p-12 custom-scrollbar relative z-10">

          {/* 🚀 BẢNG DANH SÁCH USERS */}
          <div className="bg-white rounded-[2rem] shadow-[0_10px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden">
            <div className="px-8 py-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 bg-slate-50/50 border-b border-slate-100">
              <h2 className="text-xl font-black text-slate-800 tracking-tight">DANH SÁCH TÀI KHOẢN</h2>
              <button onClick={fetchUsers} className="text-white font-black text-xs uppercase tracking-widest bg-slate-900 hover:bg-blue-600 px-5 py-2.5 rounded-xl shadow-md hover:shadow-blue-500/30 hover:-translate-y-0.5 transition-all flex items-center gap-2 w-max">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" /></svg>
                Làm mới
              </button>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-32">
                <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mb-4"></div>
                <p className="text-slate-500 font-bold tracking-widest uppercase text-xs animate-pulse">Đang quét dữ liệu...</p>
              </div>
            ) : users.length === 0 ? (
              <div className="p-32 text-center flex flex-col items-center">
                <div className="text-7xl mb-6 grayscale opacity-30 drop-shadow-sm">👻</div>
                <h2 className="text-2xl font-black text-slate-800 tracking-tight mb-2">Không có ai ở đây cả!</h2>
                <p className="text-slate-500 font-medium">Chưa có thần dân nào quy phục Chủ Tịch.</p>
              </div>
            ) : (
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left whitespace-nowrap">
                  <thead>
                    <tr className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-200">
                      <th className="px-8 py-5 w-20 text-center">Avatar</th>
                      <th className="px-8 py-5">Thông Tin Liên Hệ</th>
                      <th className="px-8 py-5">Quyền Hạn</th>
                      <th className="px-8 py-5">Ngày Gia Nhập</th>
                      <th className="px-8 py-5 text-center">Thao Tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {users.map((u) => {
                      // Logic xác định vai trò
                      let roleDisplay = "Khách hàng";
                      let roleColor = "bg-slate-100 text-slate-600 border border-slate-200";

                      if (u.role === 'admin' || u.role === 'ADMIN' || u.role?.name === 'admin' || u.isAdmin) {
                        roleDisplay = "ADMIN TỐI CAO";
                        roleColor = "bg-rose-50 text-rose-600 border border-rose-200 shadow-sm animate-pulse";
                      }

                      return (
                        <tr key={u._id} className="hover:bg-blue-50/30 transition-colors duration-200 group">

                          {/* Avatar */}
                          <td className="px-8 py-6 text-center">
                            <div className="w-12 h-12 rounded-full border-2 border-white outline outline-1 outline-slate-200 overflow-hidden shadow-sm bg-blue-50 mx-auto flex items-center justify-center font-black text-blue-600 text-xl uppercase relative">
                              {u.avatar ? (
                                <img src={u.avatar} alt={u.username} className="w-full h-full object-cover" />
                              ) : (
                                u.username ? u.username.charAt(0) : "U"
                              )}
                            </div>
                          </td>

                          {/* Thông tin liên hệ */}
                          <td className="px-8 py-6">
                            <div className="text-sm font-black text-slate-900 mb-1 group-hover:text-blue-600 transition-colors">
                              {u.username || u.name || "Khách Vãng Lai"}
                            </div>
                            <div className="flex flex-col gap-1 mt-1.5">
                              <div className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                                <span className="text-slate-400">📧</span> {u.email || "Không có Email"}
                              </div>
                              {u.phone && (
                                <div className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                                  <span className="text-slate-400">📞</span> {u.phone}
                                </div>
                              )}
                            </div>
                          </td>

                          {/* Quyền hạn */}
                          <td className="px-8 py-6">
                            <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black tracking-widest uppercase inline-block ${roleColor}`}>
                              {roleDisplay}
                            </span>
                          </td>

                          {/* Ngày gia nhập */}
                          <td className="px-8 py-6">
                            <div className="text-sm font-bold text-slate-700 mb-1">
                              {new Date(u.createdAt).toLocaleDateString('vi-VN')}
                            </div>
                            <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest bg-slate-100 w-max px-2 py-0.5 rounded">
                              {new Date(u.createdAt).toLocaleTimeString('vi-VN')}
                            </div>
                          </td>

                          {/* Thao tác (Trảm) */}
                          <td className="px-8 py-6 text-center">
                            <button
                              onClick={() => handleDeleteUser(u._id || u.id)}
                              className="p-2.5 text-rose-500 bg-rose-50 hover:bg-rose-500 hover:text-white rounded-xl transition-all duration-300 shadow-sm hover:shadow-rose-500/30 group/btn"
                              title="Trảm thị chúng"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 group-hover/btn:rotate-12 transition-transform">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                              </svg>
                            </button>
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
      </div>
    </div>
  );
}
