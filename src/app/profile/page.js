"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import useAuthStore from "../../store/useAuthStore";
import axios from "axios";
import Link from "next/link";
import Footer from "../../components/Footer";

export default function ProfilePage() {
  const { user, login } = useAuthStore();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    setIsClient(true);
    if (!user) {
      router.push("/login");
    } else {
      setPreviewImage(user.avatarUrl || "https://i.stack.imgur.com/l60Hf.png");
    }
  }, [user, router]);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Vui lòng chọn file hình ảnh nha ní!");
      return;
    }

    setPreviewImage(URL.createObjectURL(file));
    await handleUpload(file);
  };

  const handleUpload = async (file) => {
    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post("https://doan-ecommerce-backend.vercel.app/api/v1/upload/single", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (res.data.success) {
        const newAvatarUrl = res.data.url;
        alert("🎉 Đổi Avatar thành công rực rỡ!");
        login({ ...user, avatarUrl: newAvatarUrl });
      }
    } catch (error) {
      console.error("Lỗi upload:", error);
      alert("Huhu upload xịt rồi, check console thử ní ơi!");
      setPreviewImage(user?.avatarUrl || "https://i.stack.imgur.com/l60Hf.png");
    } finally {
      setLoading(false);
    }
  };

  if (!isClient || !user) return null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      
      {/* 🚀 Header Cover mỏng */}
      <div className="bg-slate-900 py-16 text-center border-b-4 border-blue-600">
        <h1 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter">
          HỒ SƠ <span className="text-blue-500">CÁ NHÂN</span>
        </h1>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grow w-full">
        
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* CỘT TRÁI: AVATAR & THẺ TÊN */}
          <div className="md:w-1/3">
            <div className="bg-white rounded-4xl shadow-sm border border-slate-100 overflow-hidden relative group">
              {/* Background gradient nhạt bên trong thẻ */}
              <div className="absolute inset-0 bg-linear-to-b from-blue-50 to-white pointer-events-none"></div>
              
              <div className="relative p-8 flex flex-col items-center z-10">
                <div className="relative mb-6">
                  {/* Khung viền gradient bao quanh Avatar */}
                  <div className="absolute -inset-1.5 bg-linear-to-r from-blue-500 to-purple-500 rounded-full blur-sm opacity-30 group-hover:opacity-60 transition-opacity duration-300"></div>
                  
                  <img 
                    src={previewImage} 
                    alt="Avatar" 
                    className={`relative w-40 h-40 rounded-full border-4 border-white shadow-lg object-cover bg-slate-50 transition-all duration-300 ${loading ? 'opacity-50 grayscale' : 'group-hover:scale-[1.02]'}`}
                  />
                  
                  {loading && (
                    <div className="absolute inset-0 flex items-center justify-center z-20">
                      <div className="animate-spin rounded-full h-10 w-10 border-b-4 border-blue-600"></div>
                    </div>
                  )}

                  <button 
                    onClick={() => fileInputRef.current.click()}
                    disabled={loading}
                    className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 hover:opacity-100 transition-opacity duration-300 z-10 cursor-pointer"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-8 h-8 text-white">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
                    </svg>
                  </button>

                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    accept="image/*" 
                    className="hidden" 
                  />
                </div>

                <h3 className="text-2xl font-black text-slate-900 tracking-tight text-center">{user.username || user.name}</h3>
                <p className="text-sm font-medium text-slate-500 mt-1">{user.email}</p>
                
                <div className="mt-5 bg-slate-900 text-white px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest shadow-md">
                  {user.role?.name || user.role || 'THÀNH VIÊN VIP'}
                </div>

              </div>
            </div>
          </div>

          {/* CỘT PHẢI: FORM THÔNG TIN (UI Mockup) */}
          <div className="md:w-2/3">
            <div className="bg-white rounded-4xl shadow-sm border border-slate-100 p-8 md:p-10 h-full flex flex-col">
              
              <h2 className="text-2xl font-black text-slate-900 mb-8 pb-4 border-b border-slate-100 flex items-center gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-7 h-7 text-blue-500">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
                Chi Tiết Tài Khoản
              </h2>

              <form className="space-y-6 grow">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Tên hiển thị</label>
                    <input 
                      type="text" 
                      defaultValue={user.username || user.name}
                      readOnly
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-3.5 text-slate-700 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-not-allowed opacity-80" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Địa chỉ Email</label>
                    <input 
                      type="email" 
                      defaultValue={user.email}
                      readOnly
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-3.5 text-slate-700 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-not-allowed opacity-80" 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Số điện thoại (Dự kiến)</label>
                  <input 
                    type="text" 
                    placeholder="Tính năng đang được dev bằng cả sinh mệnh..."
                    disabled
                    className="w-full bg-slate-100 border border-slate-200 rounded-xl px-5 py-3.5 text-slate-400 font-medium cursor-not-allowed" 
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Địa chỉ giao hàng (Dự kiến)</label>
                  <textarea 
                    rows="3"
                    placeholder="Chức năng này chờ Chủ Tịch rót vốn mới làm tiếp..."
                    disabled
                    className="w-full bg-slate-100 border border-slate-200 rounded-xl px-5 py-3.5 text-slate-400 font-medium cursor-not-allowed resize-none" 
                  ></textarea>
                </div>
              </form>

              <div className="mt-8 pt-8 border-t border-slate-100 flex justify-end gap-4">
                <button 
                  type="button"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-black px-8 py-3.5 rounded-xl uppercase tracking-widest text-sm transition-colors shadow-lg hover:shadow-xl hover:-translate-y-0.5 opacity-50 cursor-not-allowed"
                  title="Hiện tại chỉ đổi được Avatar thôi ní ơi!"
                >
                  Lưu Thay Đổi
                </button>
              </div>

            </div>
          </div>

        </div>
      </div>

      <Footer />
    </div>
  );
}