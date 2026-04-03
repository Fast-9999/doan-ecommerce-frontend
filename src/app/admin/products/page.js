"use client";

import { toast } from "react-hot-toast";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import useAuthStore from "../../../store/useAuthStore";

export default function AdminProducts() {
  const { user } = useAuthStore();
  const router = useRouter();
  
  const [isClient, setIsClient] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- STATE MODAL ---
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  // 👉 STATE CHO AI
  const [isAnalyzingAI, setIsAnalyzingAI] = useState(false);
  const [base64ForAI, setBase64ForAI] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    price: "",
    category: "",
    description: "", 
    image: "" 
  });

  const fileInputRef = useRef(null);

  useEffect(() => {
    setIsClient(true);
    if (user) {
      const isAdmin = user.role === 'admin' || user.role === 'ADMIN' || user.username === 'phattest' || user.role?.name === 'admin';
      if (!isAdmin) {
        toast.error("Khu vực cấm! Chỉ dành cho Chủ Tịch!");
        router.push("/");
        return;
      }
      fetchProducts();
    } else {
      router.push("/login");
    }
  }, [user, router]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await axios.get("https://doan-ecommerce-backend.vercel.app/api/v1/products?limit=50");
      let data = res.data;
      if (data && typeof data === 'object' && !Array.isArray(data)) {
        data = data.data || data.products || data.result || [];
      }
      if (Array.isArray(data)) {
        data.reverse();
        setProducts(data);
      }
    } catch (err) {
      console.error("Lỗi lấy sản phẩm:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setBase64ForAI(reader.result.split(',')[1]);
    };
    reader.readAsDataURL(file);

    setUploadingImage(true);
    const uploadData = new FormData();
    uploadData.append("file", file); 

    try {
      const res = await axios.post("https://doan-ecommerce-backend.vercel.app/api/v1/upload/single", uploadData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.data.success) {
        setFormData({ ...formData, image: res.data.url });
        toast.success("📸 Up ảnh lên mây thành công! Giờ bấm nút AI được rồi đó ní!");
      }
    } catch (error) {
      console.error("Lỗi upload:", error);
      toast.error("Up ảnh xịt rồi ní ơi!");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleAutoFillWithAI = async () => {
    const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    
    if (!API_KEY) {
      toast.error("⚠️ Lỗi: Chưa tìm thấy API Key trong file .env!");
      return;
    }
    if (!base64ForAI) {
      toast("📸 Ní phải up cái ảnh lên trước thì AI mới có cái dòm chứ!");
      return;
    }

    setIsAnalyzingAI(true);
    try {
      const res = await axios.post(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`, {
        contents: [{
          parts: [
            { text: "Bạn là chuyên gia chốt đơn E-commerce. Nhìn bức ảnh này và trả về ĐÚNG 1 OBJECT JSON (không bọc trong markdown ```json). Cấu trúc bắt buộc: 'title' (Tên sản phẩm ngắn gọn), 'price' (Dự đoán giá bán VNĐ bằng số nguyên, VD: 250000), 'category' (Danh mục VD: Áo thun, Laptop, Phụ kiện), 'description' (Viết 1 đoạn mô tả PR hấp dẫn có emoji)." },
            { inlineData: { mimeType: "image/jpeg", data: base64ForAI } }
          ]
        }]
      });

      let aiText = res.data.candidates[0].content.parts[0].text;
      aiText = aiText.replace(/```json/g, "").replace(/```/g, "").trim();
      
      const aiData = JSON.parse(aiText);

      setFormData((prev) => ({
        ...prev,
        title: aiData.title || prev.title,
        price: aiData.price || prev.price,
        category: aiData.category || prev.category,
        description: aiData.description || prev.description
      }));

      toast("🪄 AI đã phân tích xong! Ní check lại thông tin nha!");
    } catch (err) {
      console.error("Lỗi AI:", err);
      const googleError = err.response?.data?.error?.message || "Lỗi bí ẩn";
      toast.error("❌ Chết dở, Google nó chê nè:\n\n" + googleError);
    } finally {
      setIsAnalyzingAI(false);
    }
  };

  const openAddModal = () => {
    setIsEditing(false);
    setFormData({ title: "", price: "", category: "", description: "", image: "" });
    setBase64ForAI("");
    setShowModal(true);
  };

  const openEditModal = (product) => {
    setIsEditing(true);
    setCurrentId(product._id);
    setFormData({
      title: product.title || "",
      price: product.price || "",
      category: typeof product.category === 'object' ? product.category?.name : product.category || "",
      description: product.description || "",
      image: product.images?.[0] || ""
    });
    setBase64ForAI("");
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.price) {
      toast.error("Nhập đủ Tên và Giá nha Chủ Tịch!");
      return;
    }

    try {
      const payload = {
        title: formData.title,
        price: Number(formData.price),
        category: formData.category || "Chưa phân loại",
        description: formData.description || "Chưa có mô tả.", 
        images: formData.image ? [formData.image] : [], 
        sku: "SP-" + Date.now(),
        slug: formData.title.toLowerCase().replace(/ /g, '-') + '-' + Date.now()
      };

      if (isEditing) {
  await axios.put(
    `https://doan-ecommerce-backend.vercel.app/api/v1/products/${currentId}`,
    payload
  );
  toast.success("✏️ Cập nhật sản phẩm thành công!");
} else {
  await axios.post(
    "https://doan-ecommerce-backend.vercel.app/api/v1/products",
    payload
  );
  toast.success("🎉 Thêm sản phẩm mới thành công!");
}
      
      setShowModal(false);
      fetchProducts(); 
    } catch (err) {
      console.error("Lỗi lưu sản phẩm:", err);
      const backendError = err.response?.data?.message || err.response?.data?.error || JSON.stringify(err.response?.data);
      toast.error(`❌ LỖI RỒI NÍ ƠI! Backend nó nói là:\n\n👉 ${backendError}`);
    }
  };

  const handleDelete = async (id) => {
  if (!window.confirm("⚠️ Bạn có chắc chắn muốn xóa sản phẩm này không?")) return;

  try {
    await axios.delete(`https://doan-ecommerce-backend.vercel.app/api/v1/products/${id}`);
    
    toast.success("🗑️ Xóa sản phẩm thành công!");
    fetchProducts();        // reload danh sách
  } catch (err) {
    console.error("Lỗi khi xóa sản phẩm:", err);
    
    const errorMsg = err.response?.data?.message || err.message || "Không xác định";
    toast.error(`❌ Xóa thất bại!\n${errorMsg}`);
  }
};

  const formatPrice = (price) => price?.toLocaleString("vi-VN") + " VNĐ";

  if (!isClient) return null;

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      
      {/* Sidebar Đã Đồng Bộ */}
      <div className="w-64 bg-slate-900 text-white p-6 shadow-xl hidden md:block shrink-0 relative z-20">
        <h2 className="text-2xl font-black mb-10 tracking-wider">
          👑 ADMIN <span className="text-blue-500">PANEL</span>
        </h2>
        <nav className="space-y-4">
          <Link href="/admin" className="block px-4 py-3 text-slate-300 font-bold hover:bg-slate-800 hover:text-white rounded-xl transition">
            📦 Tổng Quan & Đơn Hàng
          </Link>
          <Link href="/admin/products" className="block px-4 py-3 bg-linear-to-r from-blue-600 to-indigo-600 rounded-xl font-bold shadow-lg shadow-blue-500/30 transition transform hover:translate-x-1">
            👕 Quản lý Sản Phẩm
          </Link>
          <Link href="/admin/users" className="block px-4 py-3 text-slate-300 font-bold hover:bg-slate-800 hover:text-white rounded-xl transition">
            👥 Quản lý Users
          </Link>
          <Link href="/admin/vouchers" className="block px-4 py-3 text-slate-300 font-bold hover:bg-slate-800 hover:text-white rounded-xl transition">
            🎟️ Quản lý Vouchers
          </Link>
        </nav>
        
        <div className="absolute bottom-10 left-6 right-6">
           <Link href="/" className="block text-center px-4 py-3 bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 rounded-xl font-bold transition text-sm uppercase tracking-widest">
            ← Về Cửa Hàng
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 md:p-12 overflow-y-auto">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Kho Tàng Sản Phẩm</h1>
            <p className="text-slate-500 font-medium mt-1">Nơi Chủ Tịch hô biến hàng hóa và úm ba la với AI.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-white px-5 py-2.5 rounded-full shadow-sm border border-slate-200 font-bold text-slate-600">
              Tổng kho: <span className="text-blue-600">{products.length}</span> món
            </div>
            <button 
              onClick={openAddModal}
              className="bg-slate-900 text-white px-6 py-2.5 rounded-full font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center gap-2"
            >
              <svg xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Thêm Mới
            </button>
          </div>
        </div>

        {/* BẢNG DANH SÁCH SẢN PHẨM */}
        <div className="bg-white rounded-4xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden">
          <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h2 className="text-xl font-black text-slate-800">DANH SÁCH SẢN PHẨM</h2>
            <button onClick={fetchProducts} className="text-blue-600 hover:text-blue-800 font-bold text-sm bg-blue-50 px-4 py-2 rounded-lg transition flex items-center gap-2">
              <svg xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
              Làm mới
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-32"><div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600"></div></div>
          ) : products.length === 0 ? (
            <div className="p-32 text-center">
              <div className="text-6xl mb-4 grayscale opacity-40">📦</div>
              <h2 className="text-2xl font-black text-gray-800 tracking-tight">Kho hàng trống rỗng!</h2>
              <p className="text-slate-500 mt-2 font-medium">Bấm Thêm Mới để nhập lô hàng đầu tiên nào.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white border-b-2 border-slate-100 text-slate-400 text-xs uppercase tracking-widest">
                    <th className="p-6 font-black w-24">Hình Ảnh</th>
                    <th className="p-6 font-black">Thông Tin Sản Phẩm</th>
                    <th className="p-6 font-black">Danh Mục</th>
                    <th className="p-6 font-black">Giá Bán</th>
                    <th className="p-6 font-black text-center">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {products.map((p) => (
                    <tr key={p._id} className="hover:bg-slate-50/80 transition-colors duration-200">
                      
                      <td className="p-6">
                        <div className="w-16 h-16 rounded-2xl border border-slate-100 overflow-hidden shadow-sm bg-white">
                          <img 
                            src={p.images?.[0] || "[https://via.placeholder.com/150?text=No+Image](https://via.placeholder.com/150?text=No+Image)"} 
                            alt={p.title} 
                            className="w-full h-full object-cover mix-blend-multiply" 
                          />
                        </div>
                      </td>

                      <td className="p-6">
                        <div className="text-sm font-black text-slate-800 line-clamp-2 max-w-xs leading-snug">
                          {p.title}
                        </div>
                        <div className="text-xs text-slate-400 font-medium mt-1 truncate max-w-xs">
                          SKU: {p.sku || p._id.substring(p._id.length - 6).toUpperCase()}
                        </div>
                      </td>

                      <td className="p-6">
                        <span className="bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg text-xs font-bold tracking-wide uppercase">
                          {typeof p.category === 'object' ? p.category?.name : p.category || "N/A"}
                        </span>
                      </td>

                      <td className="p-6">
                        <div className="text-base font-black text-slate-900">
                          {formatPrice(p.price)}
                        </div>
                      </td>

                      <td className="p-6 text-center">
                        <div className="flex items-center justify-center space-x-3">
                          <button 
                            onClick={() => openEditModal(p)} 
                            className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-600 hover:text-white rounded-xl transition duration-200"
                            title="Chỉnh sửa"
                          >
                            <svg xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                            </svg>
                          </button>
                          <button 
                            onClick={() => handleDelete(p._id)} 
                            className="p-2 text-red-600 bg-red-50 hover:bg-red-600 hover:text-white rounded-xl transition duration-200"
                            title="Xóa vĩnh viễn"
                          >
                            <svg xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                            </svg>
                          </button>
                        </div>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

      {/* ================= MODAL THÊM / SỬA CÓ TÍCH HỢP AI ================= */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-fade-in-up flex flex-col max-h-[90vh] border border-slate-100">
            
            <div className="bg-slate-900 p-6 flex justify-between items-center shrink-0">
              <h3 className="text-xl font-black text-white flex items-center gap-3">
                {isEditing ? "✏️ Chỉnh Sửa Sản Phẩm" : "✨ Thêm Sản Phẩm Mới"}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white text-3xl font-light transition-colors leading-none">&times;</button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 overflow-y-auto space-y-6">
              
              <div className="flex flex-col items-center mb-4 bg-slate-50 p-6 rounded-3xl border border-slate-100">
                <div 
                  className="w-40 h-40 rounded-2xl border-2 border-dashed border-blue-300 bg-white flex items-center justify-center cursor-pointer hover:border-blue-500 hover:shadow-lg transition-all overflow-hidden relative group"
                  onClick={() => fileInputRef.current.click()}
                >
                  {uploadingImage ? (
                    <div className="animate-spin rounded-full h-10 w-10 border-b-4 border-blue-600"></div>
                  ) : formData.image ? (
                    <>
                      <img src={formData.image} alt="Preview" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold text-sm">Đổi ảnh khác</div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-blue-500">
                      <svg xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
                      </svg>
                      <span className="text-xs font-bold text-center">Click tải ảnh lên<br/>(Lưu lên mây)</span>
                    </div>
                  )}
                </div>
                <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                
                {/* 🚀 NÚT PHÉP THUẬT AI GEMINI */}
                {formData.image && base64ForAI && !isEditing && (
                  <button 
                    type="button" 
                    onClick={handleAutoFillWithAI}
                    disabled={isAnalyzingAI}
                    className="mt-6 bg-linear-to-r from-blue-600 via-purple-600 to-pink-600 text-white px-8 py-3 rounded-full text-sm font-black tracking-wide shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-wait"
                  >
                    {isAnalyzingAI ? (
                      <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> Gemini đang soi ảnh...</>
                    ) : (
                      <><span className="text-lg">✨</span> Nhờ AI Gemini Viết Lời Chào Hàng</>
                    )}
                  </button>
                )}
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Tên Sản Phẩm <span className="text-red-500">*</span></label>
                <input required type="text" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full px-5 py-3.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-slate-800 font-medium bg-slate-50 focus:bg-white transition-colors" placeholder="VD: Áo Thun Chủ Tịch Limited" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Giá Bán (VNĐ) <span className="text-red-500">*</span></label>
                  <input required type="number" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} className="w-full px-5 py-3.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-slate-800 font-medium bg-slate-50 focus:bg-white transition-colors" placeholder="VD: 250000" />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Danh Mục</label>
                  <input type="text" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full px-5 py-3.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-slate-800 font-medium bg-slate-50 focus:bg-white transition-colors" placeholder="VD: Thời Trang Nam" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Mô Tả Chi Tiết</label>
                <textarea 
                  rows="4" 
                  value={formData.description} 
                  onChange={(e) => setFormData({...formData, description: e.target.value})} 
                  className="w-full px-5 py-3.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none resize-none text-slate-800 font-medium bg-slate-50 focus:bg-white transition-colors" 
                  placeholder="Nhập mô tả để miêu tả chi tiết sản phẩm. Càng hay khách càng dễ xuống tiền..." 
                ></textarea>
              </div>

              <div className="pt-6 mt-4 flex justify-end gap-3 border-t border-slate-100">
                <button type="button" onClick={() => setShowModal(false)} className="px-8 py-3.5 rounded-xl font-black text-slate-500 bg-slate-100 hover:bg-slate-200 transition-colors uppercase tracking-widest text-xs">Hủy Bỏ</button>
                <button type="submit" disabled={uploadingImage || isAnalyzingAI} className="px-8 py-3.5 rounded-xl font-black text-white bg-slate-900 hover:bg-blue-600 transition-colors shadow-lg uppercase tracking-widest text-xs disabled:opacity-50">
                  {isEditing ? "Lưu Thay Đổi" : "Chốt Đăng Bán"}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}