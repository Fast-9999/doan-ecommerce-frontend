"use client";

import { toast } from "react-hot-toast";
import { useState, useEffect } from "react";
import Link from "next/link";
import axios from "axios";
import useCartStore from "../../store/useCartStore";
import Footer from "../../components/Footer";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Lôi chiêu thêm vào giỏ hàng ra xài
  const { addToCart } = useCartStore();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await axios.get("https://doan-ecommerce-backend.vercel.app/api/v1/products?limit=50");

      // Bắt bệnh cấu trúc data BE trả về
      let data = res.data;
      if (data && typeof data === 'object' && !Array.isArray(data)) {
        data = data.data || data.products || data.result || [];
      }

      if (Array.isArray(data)) {
        // Đảo ngược mảng để sản phẩm mới đăng hiện lên đầu tiên
        setProducts(data.reverse());
      }
    } catch (err) {
      console.error("Lỗi lấy danh sách sản phẩm:", err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => price?.toLocaleString("vi-VN") + " VNĐ";

  // Hàm múc đồ nhanh ngay tại trang danh sách
  const handleQuickAdd = (e, product) => {
    e.preventDefault(); // Ngăn cái thẻ Link bọc bên ngoài chuyển trang

    const cartItem = {
      _id: product._id,
      title: product.title || product.name,
      price: product.price,
      image: product.image || (product.images && product.images.length > 0 ? product.images[0] : "https://via.placeholder.com/300"),
      quantity: 1
    };

    addToCart(cartItem);
    toast.success(`🛒 Đã ném "${cartItem.title}" vào giỏ hàng cái vèo!`, {
      style: { borderRadius: '12px', background: '#0f172a', color: '#fff', fontWeight: 'bold' }
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-blue-200">

      {/* 🚀 BANNER SIÊU CẤP VIP PRO */}
      <div className="relative bg-slate-900 pt-20 pb-24 overflow-hidden">
        {/* Vòng sáng trang trí */}
        <div className="absolute top-[-50%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue-600/30 blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-[-50%] right-[-10%] w-[500px] h-[500px] rounded-full bg-purple-600/20 blur-[120px] pointer-events-none"></div>

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <span className="inline-block py-1.5 px-4 rounded-full bg-white/10 border border-white/20 text-blue-300 text-xs font-black tracking-widest uppercase mb-6 backdrop-blur-md shadow-lg">
            Bộ Sưu Tập Mới Nhất
          </span>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight leading-tight">
            KHÁM PHÁ CỬA HÀNG <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">SIÊU PHẨM CÔNG NGHỆ</span>
          </h1>
          <p className="text-slate-400 font-medium text-lg max-w-2xl mx-auto leading-relaxed">
            Nơi hội tụ những deal hời "khét lẹt" nhất hành tinh. Chủ Tịch lướt mỏi tay, chốt đơn liền tay kẻo lỡ!
          </p>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-16 grow w-full -mt-8 relative z-20">

        {loading ? (
          <div className="flex flex-col justify-center items-center py-32 bg-white rounded-[2rem] shadow-sm border border-slate-100">
            <div className="relative w-20 h-20 mb-6">
              <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
            </div>
            <p className="text-slate-400 font-bold tracking-widest uppercase text-sm animate-pulse">Đang tải kho hàng...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-[3rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-24 text-center">
            <div className="w-40 h-40 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8 border-8 border-white shadow-inner">
              <div className="text-7xl grayscale opacity-40">🏜️</div>
            </div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-4">Kho Hàng Trống Trơn!</h2>
            <p className="text-slate-500 font-medium text-lg max-w-md mx-auto">Chủ Tịch quên nhập hàng hay là khách mua sạch rồi? Mau vào Admin thêm sản phẩm mới thôi!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6 lg:gap-8">
            {products.map((product) => (
              <Link
                href={`/product/${product._id}`}
                key={product._id}
                className="bg-white rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_10px_40px_rgb(0,0,0,0.08)] border border-slate-100 overflow-hidden group transition-all duration-500 hover:-translate-y-2 flex flex-col relative"
              >
                {/* 🚀 Khu vực Hình ảnh */}
                <div className="aspect-square bg-slate-50/50 relative p-6 flex items-center justify-center overflow-hidden border-b border-slate-50">
                  {/* Badge Mới Nhất Xịn Xò */}
                  <span className="absolute top-4 left-4 bg-white/80 backdrop-blur-md text-slate-900 border border-slate-200 text-[10px] font-black px-3 py-1.5 rounded-lg z-10 tracking-widest uppercase shadow-sm">
                    ✨ MỚI
                  </span>

                  {/* Nền xịn mờ phía sau ảnh */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-blue-100/30 to-purple-100/30 rounded-full blur-3xl scale-75 group-hover:scale-100 transition-transform duration-700"></div>

                  <img
                    src={product.image || (product.images && product.images.length > 0 ? product.images[0] : "https://via.placeholder.com/300")}
                    alt={product.title || product.name}
                    className="relative z-10 w-full h-full object-contain mix-blend-multiply group-hover:scale-110 group-hover:-rotate-3 transition-all duration-500 drop-shadow-sm"
                  />
                </div>

                {/* 🚀 Khu vực Thông tin */}
                <div className="p-5 md:p-6 flex flex-col grow bg-white">

                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md tracking-widest uppercase">
                      {product.category?.name || product.category || "Hot Trend"}
                    </span>
                  </div>

                  <h3 className="text-sm md:text-base font-black text-slate-800 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">
                    {product.title || product.name}
                  </h3>

                  <div className="mt-auto pt-4 flex flex-col gap-4">
                    <div className="text-lg md:text-xl font-black text-rose-600 tracking-tight">
                      {formatPrice(product.price)}
                    </div>

                    {/* Nút múc nhanh - Hiệu ứng trượt màu cực xịn */}
                    <button
                      onClick={(e) => handleQuickAdd(e, product)}
                      className="w-full relative overflow-hidden bg-slate-100 text-slate-800 font-black py-3.5 rounded-xl text-xs tracking-widest uppercase transition-all duration-300 group/btn"
                    >
                      {/* Lớp nền màu xanh trượt từ dưới lên */}
                      <div className="absolute inset-0 bg-slate-900 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300 ease-out"></div>

                      <div className="relative z-10 flex justify-center items-center gap-2 group-hover/btn:text-white transition-colors duration-300">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                        MÚC NGAY
                      </div>
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}