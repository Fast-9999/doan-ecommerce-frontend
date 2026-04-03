"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import useCartStore from "../store/useCartStore";
import Footer from "../components/Footer";
import { toast } from "react-hot-toast";
import ProductSkeleton from "../components/ProductSkeleton";

// 🚀 BỨNG CSS RA NGOÀI ĐỂ KHÔNG BỊ RE-RENDER MỖI 50ms
const floatAnimationCss = `
  .custom-float-anim {
    animation: float 6s ease-in-out infinite;
  }
  @keyframes float {
    0%, 100% { transform: translateY(0px) rotate(-12deg); }
    50% { transform: translateY(-20px) rotate(-8deg); }
  }
`;

export default function HomePage() {
  const [allProducts, setAllProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [selectedCategory, setSelectedCategory] = useState("Tất cả");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  // 🚀 STATE CHO HIỆU ỨNG MÁY ĐÁNH CHỮ
  const phrases = [
    "Mua Sắm Tương Lai",
    "Săn Deal Thần Tốc",
    "Chốt Đơn Mỏi Tay",
    "Hàng Chuẩn VIP Pro"
  ];
  const [typedText, setTypedText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [loopNum, setLoopNum] = useState(0);

  const addToCart = useCartStore((state) => state.addToCart);

  // Hiệu ứng gõ chữ
  useEffect(() => {
    const i = loopNum % phrases.length;
    const fullText = phrases[i];
    let timer;

    if (isDeleting) {
      timer = setTimeout(() => setTypedText(fullText.substring(0, typedText.length - 1)), 50);
    } else {
      timer = setTimeout(() => setTypedText(fullText.substring(0, typedText.length + 1)), 100);
    }

    if (!isDeleting && typedText === fullText) {
      clearTimeout(timer);
      timer = setTimeout(() => setIsDeleting(true), 2000);
    } else if (isDeleting && typedText === "") {
      clearTimeout(timer);
      setIsDeleting(false);
      setLoopNum(loopNum + 1);
      timer = setTimeout(() => { }, 500);
    }

    return () => clearTimeout(timer);
  }, [typedText, isDeleting, loopNum]);

  // Gọi API lấy sản phẩm
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await axios.get("https://doan-ecommerce-backend.vercel.app/api/v1/products?limit=20");

      let data = res.data;
      if (data && typeof data === 'object' && !Array.isArray(data)) {
        data = data.data || data.products || data.result || [];
      }

      if (Array.isArray(data)) {
        setAllProducts(data);
        const extractedCategories = ["Tất cả", ...new Set(data.map(p => {
          return typeof p.category === 'object' ? p.category?.name : p.category;
        }).filter(Boolean))];
        setCategories(extractedCategories);
        setFilteredProducts(data);
      }
    } catch (error) {
      console.error("Lỗi lấy sản phẩm:", error);
    } finally {
      setLoading(false);
    }
  };

  // Lọc sản phẩm
  useEffect(() => {
    let result = allProducts;
    if (selectedCategory !== "Tất cả") {
      result = result.filter(p => {
        const catName = typeof p.category === 'object' ? p.category?.name : p.category;
        return catName === selectedCategory;
      });
    }
    if (searchQuery.trim() !== "") {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(p => p.title?.toLowerCase().includes(lowerQuery));
    }
    setFilteredProducts(result);
  }, [searchQuery, selectedCategory, allProducts]);

  const formatPrice = (price) => price?.toLocaleString("vi-VN") + " VNĐ";

  const handleAddToCart = (e, product) => {
    e.preventDefault();
    addToCart({
      _id: product._id,
      title: product.title || product.name,
      price: product.price,
      image: product.image || (product.images && product.images.length > 0 ? product.images[0] : "https://via.placeholder.com/300"),
      quantity: 1
    });
    toast.success(`Đã ném "${product.title || product.name}" vào giỏ hàng!`, {
      icon: '🛒',
      duration: 3000,
      style: { borderRadius: '12px', background: '#0f172a', color: '#fff', fontWeight: 'bold' }
    });
  };

  // 🚀 DỮ LIỆU ĐỂ HIỂN THỊ CAM KẾT (TRUST BADGES)
  const trustFeatures = [
    { icon: "🚀", title: "Giao Hàng Hỏa Tốc", desc: "Nhận hàng trong 2h" },
    { icon: "🛡️", title: "100% Chính Hãng", desc: "Đền gấp 10 nếu Fake" },
    { icon: "🔄", title: "Đổi Trả 7 Ngày", desc: "Lỗi là đổi mới liền" },
    { icon: "🎧", title: "Hỗ Trợ 24/7", desc: "CSKH luôn túc trực" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* 🚀 INJECT CSS CHUẨN XÁC VÀO DOM */}
      <style dangerouslySetInnerHTML={{ __html: floatAnimationCss }} />

      {/* 🚀 BANNER TƯƠNG LAI */}
      <div className="relative bg-slate-950 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute inset-0 bg-linear-to-br from-indigo-900/50 via-slate-900 to-black opacity-90"></div>
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-blue-600/20 blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] rounded-full bg-purple-600/20 blur-[120px] pointer-events-none"></div>

        <div className="relative max-w-7xl mx-auto px-4 py-20 md:py-28 z-10 flex flex-col lg:flex-row items-center gap-12">

          {/* Cột trái: Text */}
          <div className="w-full lg:w-1/2 text-center lg:text-left">
            <span className="inline-block py-1 px-4 rounded-full bg-white/10 border border-white/20 text-blue-300 text-[10px] md:text-xs font-black tracking-widest uppercase mb-6 backdrop-blur-md shadow-[0_0_15px_rgba(59,130,246,0.3)]">
              ✨ Phiên bản Mới Nhất 2026
            </span>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black mb-6 tracking-tighter text-white h-32 md:h-40 lg:h-48 flex flex-col justify-center">
              <span>Trải nghiệm</span>
              <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-400 via-indigo-400 to-purple-500 mt-2">
                {typedText}
                <span className="inline-block w-1.5 h-10 md:h-12 lg:h-16 ml-2 bg-blue-500 animate-pulse align-middle rounded-full"></span>
              </span>
            </h1>
            <p className="text-slate-300 mb-8 max-w-xl mx-auto lg:mx-0 font-medium leading-relaxed text-lg">
              Hệ sinh thái E-Commerce thế hệ mới. Săn deal thần tốc, chốt đơn mượt mà với giao diện chuẩn VIP Pro dành riêng cho Chủ Tịch.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <button onClick={() => window.scrollTo({ top: 800, behavior: 'smooth' })} className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl shadow-[0_10px_30px_rgba(37,99,235,0.4)] transition-all hover:-translate-y-1 uppercase tracking-widest text-sm flex items-center justify-center gap-2">
                Săn Deal Ngay
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
              </button>
            </div>
          </div>

          {/* Cột phải: Hình ảnh 3D nổi bật */}
          <div className="w-full lg:w-1/2 hidden md:flex justify-center relative">
            {/* 🚀 Đã thay bằng class custom-float-anim chống giật lag */}
            <div className="relative w-[80%] aspect-square custom-float-anim">
              {/* Vòng sáng phía sau */}
              <div className="absolute inset-0 bg-linear-to-tr from-blue-500 to-purple-500 rounded-full blur-[80px] opacity-30"></div>
              {/* Hình ảnh siêu phẩm */}
              <img
                src="https://giaycaosmartmen.com/wp-content/uploads/2020/09/giay-sneaker-la-gi.jpg"
                alt="Hero Product"
                className="relative z-10 w-full h-full object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] -rotate-12"
              />
              {/* Tag nổi */}
              <div className="absolute bottom-10 -left-4 z-20 bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl shadow-xl flex items-center gap-3">
                <div className="bg-red-500 text-white p-2 rounded-xl text-xl font-black">-50%</div>
                <div>
                  <p className="text-white font-black text-sm">Flash Sale</p>
                  <p className="text-blue-200 text-xs font-bold">Chỉ hôm nay</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 🚀 KHU VỰC CAM KẾT (TRUST BADGES) */}
      <div className="max-w-7xl mx-auto px-4 relative z-20 -mt-10 mb-10 w-full">
        <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-100 p-6 md:p-8 grid grid-cols-2 md:grid-cols-4 gap-6 divide-x-0 md:divide-x divide-slate-100">
          {trustFeatures.map((item, idx) => (
            <div key={idx} className="flex flex-col items-center text-center px-4">
              <div className="w-14 h-14 bg-slate-50 text-2xl flex items-center justify-center rounded-full mb-3 text-blue-600 border border-slate-100">
                {item.icon}
              </div>
              <h4 className="font-black text-slate-800 text-sm mb-1">{item.title}</h4>
              <p className="text-xs font-medium text-slate-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 🚀 KHU VỰC TÌM KIẾM VÀ BỘ LỌC */}
      <div className="max-w-7xl mx-auto px-4 w-full mb-12">
        <div className="flex flex-col md:flex-row gap-4 items-center bg-white p-4 rounded-3xl shadow-sm border border-slate-100">

          <div className="relative w-full md:w-1/3">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 text-slate-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </div>
            <input
              type="text"
              className="block w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-800 placeholder:text-slate-400 transition-all"
              placeholder="Tìm siêu phẩm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="w-full md:w-2/3 flex overflow-x-auto pb-2 md:pb-0 custom-scrollbar gap-2">
            {categories.map((cat, index) => (
              <button
                key={index}
                onClick={() => setSelectedCategory(cat)}
                className={`whitespace-nowrap px-5 py-2.5 rounded-xl text-xs font-black tracking-wide uppercase transition-all shrink-0 ${selectedCategory === cat
                  ? "bg-slate-900 text-white shadow-md"
                  : "bg-slate-50 text-slate-500 hover:bg-slate-200 hover:text-slate-800"
                  }`}
              >
                {cat === "Tất cả" ? "🔥 Tất cả" : cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 🚀 KHU VỰC SẢN PHẨM */}
      <div className="max-w-7xl mx-auto px-4 w-full grow pb-24">
        <div className="mb-8 flex justify-between items-end border-l-4 border-blue-600 pl-4">
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase">
              {selectedCategory === "Tất cả" ? "Sản Phẩm Trending" : `${selectedCategory}`}
            </h2>
            <p className="text-slate-500 font-medium text-sm mt-1">Săn ngay kẻo lỡ deal hời Sếp ơi!</p>
          </div>
          <span className="hidden sm:inline-block text-blue-600 font-black bg-blue-50 px-4 py-2 rounded-xl text-xs uppercase tracking-widest">
            {filteredProducts.length} Kết quả
          </span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
            {[...Array(8)].map((_, index) => (
              <ProductSkeleton key={index} />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-32 bg-white rounded-4xl border border-slate-100 shadow-sm">
            <div className="text-7xl mb-6 grayscale opacity-50">🛸</div>
            <h3 className="text-2xl font-black text-slate-800 tracking-tight">Vũ trụ này không có sản phẩm!</h3>
            <p className="text-slate-500 mt-3 font-medium text-lg">Ní thử gõ từ khóa khác hoặc quét radar danh mục "Tất cả" xem sao nha.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
            {filteredProducts.map((product) => (
              <Link
                href={`/product/${product._id}`}
                key={product._id}
                className="bg-white rounded-3xl shadow-[0_2px_15px_rgb(0,0,0,0.03)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-all duration-500 border border-slate-100 overflow-hidden group flex flex-col relative"
              >
                <div className="relative aspect-4/5 bg-slate-50 p-6 overflow-hidden flex items-center justify-center">
                  {/* Tag góc trái */}
                  <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                    <span className="bg-red-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg shadow-md">
                      HOT
                    </span>
                  </div>
                  <img
                    src={product.image || (product.images && product.images.length > 0 ? product.images[0] : "https://via.placeholder.com/300")}
                    alt={product.title || product.name}
                    className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 group-hover:rotate-2 transition-transform duration-700 ease-out"
                  />
                </div>

                <div className="p-5 flex flex-col grow bg-white relative z-20">
                  <div className="flex justify-between items-center mb-2">
                    <div className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-1 rounded-md">
                      {typeof product.category === 'object' ? product.category?.name : product.category || 'Công nghệ'}
                    </div>
                    {/* Fake lượt bán cho uy tín */}
                    <div className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                      ⭐ 4.9 (1.2k bán)
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-slate-800 mb-3 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">
                    {product.title || product.name}
                  </h3>

                  <div className="mt-auto pt-4 flex items-center justify-between border-t border-slate-100/50">
                    <div>
                      <div className="text-[10px] text-slate-400 line-through font-bold mb-0.5">
                        {/* Fake giá gốc để tôn lên giá giảm */}
                        {formatPrice(product.price * 1.2)}
                      </div>
                      <div className="text-lg font-black text-red-600 tracking-tight">
                        {formatPrice(product.price)}
                      </div>
                    </div>
                    <button
                      onClick={(e) => handleAddToCart(e, product)}
                      className="w-10 h-10 bg-slate-900 text-white rounded-xl hover:bg-blue-600 flex items-center justify-center transition-colors duration-300 shadow-md hover:shadow-blue-500/30 hover:-translate-y-1"
                      title="Thêm vào giỏ"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                      </svg>
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
