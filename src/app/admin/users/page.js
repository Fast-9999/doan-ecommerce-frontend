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
        toast.error("Khu vực cấm! Chỉ dành cho Chủ Tịch!");
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
      toast.success("🗑️ Đã xóa user thành công!");
      fetchUsers();
    } catch (err) {
      console.error("Lỗi xóa user:", err);
      toast.error("❌ Xóa thất bại! Có thể do Backend không cấp quyền hoặc lỗi mạng.");
    }
  };

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
          {/* Active class cho menu Users */}
          <Link href="/admin/users" className="block px-4 py-3 bg-linear-to-r from-blue-600 to-indigo-600 rounded-xl font-bold shadow-lg shadow-blue-500/30 transition transform hover:translate-x-1">
            👥 Quản lý Users
          </Link>
          <Link href="/admin/vouchers" className="block px-4 py-3 text-slate-300 font-bold hover:bg-slate-800 hover:text-white rounded-xl transition">
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
      <div className="flex-1 p-8 md:p-12 overflow-y-auto">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Hồ Sơ Nhân Sự</h1>
            <p className="text-slate-500 font-medium mt-1">Nơi Chủ Tịch kiểm soát quyền lực và ban phát quyền hành.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-white px-5 py-2.5 rounded-full shadow-sm border border-slate-200 font-bold text-slate-600">
              Tổng số lượng: <span className="text-blue-600">{users.length}</span> thần dân
            </div>
          </div>
        </div>

        {/* BẢNG DANH SÁCH USERS */}
        <div className="bg-white rounded-4xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden">
          <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h2 className="text-xl font-black text-slate-800">DANH SÁCH TÀI KHOẢN</h2>
            <button onClick={fetchUsers} className="text-blue-600 hover:text-blue-800 font-bold text-sm bg-blue-50 px-4 py-2 rounded-lg transition flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
              Làm mới
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-32"><div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600"></div></div>
          ) : users.length === 0 ? (
            <div className="p-32 text-center">
              <div className="text-6xl mb-4 grayscale opacity-40">👻</div>
              <h2 className="text-2xl font-black text-gray-800 tracking-tight">Không có ai ở đây cả!</h2>
              <p className="text-slate-500 mt-2 font-medium">Chưa có thần dân nào quy phục Chủ Tịch.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white border-b-2 border-slate-100 text-slate-400 text-xs uppercase tracking-widest">
                    <th className="p-6 font-black w-20 text-center">Avatar</th>
                    <th className="p-6 font-black">Thông Tin Liên Hệ</th>
                    <th className="p-6 font-black">Quyền Hạn</th>
                    <th className="p-6 font-black">Ngày Gia Nhập</th>
                    <th className="p-6 font-black text-center">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {users.map((u) => {
                    // Logic xác định vai trò
                    let roleDisplay = "Khách hàng";
                    let roleColor = "bg-slate-100 text-slate-600";
                    if (u.role === 'admin' || u.role === 'ADMIN' || u.role?.name === 'admin' || u.isAdmin) {
                      roleDisplay = "ADMIN TỐI CAO";
                      roleColor = "bg-red-100 text-red-700 border border-red-200 animate-pulse";
                    }

                    return (
                    <tr key={u._id} className="hover:bg-slate-50/80 transition-colors duration-200">
                      
                      <td className="p-6 text-center">
                        <div className="w-12 h-12 rounded-full border border-slate-200 overflow-hidden shadow-sm bg-blue-50 mx-auto flex items-center justify-center font-black text-blue-600 text-xl uppercase">
                          {u.avatar ? (
                            <img src={u.avatar} alt={u.username} className="w-full h-full object-cover" />
                          ) : (
                            u.username ? u.username.charAt(0) : "U"
                          )}
                        </div>
                      </td>

                      <td className="p-6">
                        <div className="text-sm font-black text-slate-800">
                          {u.username || u.name || "Khách Vãng Lai"}
                        </div>
                        <div className="text-xs text-slate-400 font-medium mt-1 truncate max-w-xs">
                          📧 {u.email || "Không có Email"}
                        </div>
                        {u.phone && (
                          <div className="text-xs text-slate-400 font-medium mt-0.5">
                            📞 {u.phone}
                          </div>
                        )}
                      </td>

                      <td className="p-6">
                        <span className={`px-3 py-1.5 rounded-lg text-xs font-black tracking-wide uppercase inline-block ${roleColor}`}>
                          {roleDisplay}
                        </span>
                      </td>

                      <td className="p-6">
                        <div className="text-sm font-bold text-slate-600">
                          {new Date(u.createdAt).toLocaleDateString('vi-VN')}
                        </div>
                        <div className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-widest">
                          {new Date(u.createdAt).toLocaleTimeString('vi-VN')}
                        </div>
                      </td>

                      <td className="p-6 text-center">
                        <button 
                          onClick={() => handleDeleteUser(u._id || u.id)} 
                          className="p-2 text-red-600 bg-red-50 hover:bg-red-600 hover:text-white rounded-xl transition duration-200"
                          title="Trảm thị chúng"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                          </svg>
                        </button>
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
