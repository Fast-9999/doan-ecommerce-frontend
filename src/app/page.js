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
  .hide-scrollbar::-webkit-scrollbar {
    display: none;
  }
  .hide-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
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
    "Săn Deal Thần Tốc",
    "Chốt Đơn Mỏi Tay",
    "Hàng Chuẩn VIP Pro",
    "Phong Cách Dẫn Đầu"
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
      timer = setTimeout(() => setTypedText(fullText.substring(0, typedText.length - 1)), 40);
    } else {
      timer = setTimeout(() => setTypedText(fullText.substring(0, typedText.length + 1)), 80);
    }

    if (!isDeleting && typedText === fullText) {
      clearTimeout(timer);
      timer = setTimeout(() => setIsDeleting(true), 2500);
    } else if (isDeleting && typedText === "") {
      clearTimeout(timer);
      setIsDeleting(false);
      setLoopNum(loopNum + 1);
      timer = setTimeout(() => { }, 300);
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
        // Đảo ngược để đưa hàng mới lên đầu
        const reversedData = data.reverse();
        setAllProducts(reversedData);

        const extractedCategories = ["Tất cả", ...new Set(reversedData.map(p => {
          return typeof p.category === 'object' ? p.category?.name : p.category;
        }).filter(Boolean))];

        setCategories(extractedCategories);
        setFilteredProducts(reversedData);
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
    toast.success(`Đã ném "${product.title || product.name}" vào giỏ!`, {
      icon: '🛒',
      style: { borderRadius: '12px', background: '#0f172a', color: '#fff', fontWeight: 'bold' }
    });
  };

  // DỮ LIỆU ĐỂ HIỂN THỊ CAM KẾT
  const trustFeatures = [
    { icon: "🚀", title: "Giao Hàng Hỏa Tốc", desc: "Nhận ngay trong 2h" },
    { icon: "🛡️", title: "100% Chính Hãng", desc: "Fake đền gấp 10 lần" },
    { icon: "🔄", title: "Đổi Trả 7 Ngày", desc: "Lỗi là đổi mới liền" },
    { icon: "🎧", title: "Hỗ Trợ 24/7", desc: "CSKH trực xuyên đêm" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-blue-200">
      <style dangerouslySetInnerHTML={{ __html: floatAnimationCss }} />

      {/* 🚀 HERO BANNER CHUẨN CYBERPUNK */}
      <div className="relative bg-slate-950 overflow-hidden">
        {/* Lưới Grid Background */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

        {/* Glowing Orbs */}
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-blue-600/30 blur-[150px] pointer-events-none mix-blend-screen"></div>
        <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-purple-600/20 blur-[150px] pointer-events-none mix-blend-screen"></div>

        <div className="relative max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32 z-10 flex flex-col lg:flex-row items-center gap-16">

          {/* Cột trái: Text */}
          <div className="w-full lg:w-1/2 text-center lg:text-left flex flex-col items-center lg:items-start">
            <div className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-slate-800/50 border border-slate-700 text-blue-400 text-xs font-black tracking-widest uppercase mb-8 backdrop-blur-md shadow-2xl">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              Phiên Bản Giới Hạn 2026
            </div>

            <h1 className="text-5xl md:text-7xl font-black mb-8 tracking-tighter text-white leading-[1.1]">
              Trải Nghiệm <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 h-[1.2em] inline-block">
                {typedText}
                <span className="inline-block w-1 md:w-2 h-[0.8em] ml-1 bg-blue-500 animate-pulse align-baseline rounded-full"></span>
              </span>
            </h1>

            <p className="text-slate-400 mb-10 max-w-xl font-medium leading-relaxed text-lg md:text-xl">
              Định hình phong cách Chủ Tịch với hệ sinh thái E-Commerce thế hệ mới. Khám phá hàng ngàn siêu phẩm đang chờ bạn bóc tem.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <button onClick={() => window.scrollTo({ top: 900, behavior: 'smooth' })} className="px-8 py-4 bg-white text-slate-900 font-black rounded-2xl shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_rgba(255,255,255,0.5)] transition-all hover:-translate-y-1 uppercase tracking-widest text-sm flex items-center justify-center gap-3 group">
                VÀO KHO HÀNG
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-5 h-5 group-hover:translate-x-1 transition-transform"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
              </button>
            </div>
          </div>

          {/* Cột phải: Hình ảnh 3D nổi bật */}
          <div className="w-full lg:w-1/2 hidden lg:flex justify-center relative">
            <div className="relative w-full max-w-lg aspect-square custom-float-anim">
              {/* Bệ đỡ phát sáng */}
              <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-3/4 h-10 bg-blue-500/30 blur-2xl rounded-full"></div>

              <img
                src="https://giaycaosmartmen.com/wp-content/uploads/2020/09/giay-sneaker-la-gi.jpg"
                alt="Hero Product"
                className="relative z-10 w-full h-full object-contain drop-shadow-[0_30px_50px_rgba(0,0,0,0.6)] -rotate-12 scale-110"
              />

              {/* Tag Nổi Float */}
              <div className="absolute top-10 right-0 z-20 bg-slate-900/80 backdrop-blur-xl border border-slate-700 p-4 rounded-2xl shadow-2xl flex items-center gap-4 animate-[bounce_4s_infinite]">
                <div className="bg-gradient-to-br from-rose-500 to-orange-500 text-white p-3 rounded-xl text-2xl font-black shadow-inner">-50%</div>
                <div>
                  <p className="text-white font-black text-sm uppercase tracking-widest">Siêu Sale</p>
                  <p className="text-slate-400 text-xs font-bold">Kết thúc trong 2h</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* 🚀 KHU VỰC CAM KẾT (TRUST BADGES) */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 relative z-20 -mt-12 w-full mb-16">
        <div className="bg-white/80 backdrop-blur-2xl rounded-[2rem] shadow-[0_10px_40px_rgb(0,0,0,0.08)] border border-slate-100 p-6 lg:p-8 grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 divide-x-0 lg:divide-x divide-slate-100">
          {trustFeatures.map((item, idx) => (
            <div key={idx} className="flex flex-col sm:flex-row items-center text-center sm:text-left px-2 gap-4 group">
              <div className="w-16 h-16 shrink-0 bg-slate-50 text-3xl flex items-center justify-center rounded-2xl text-blue-600 border border-slate-100 group-hover:scale-110 group-hover:bg-blue-50 group-hover:border-blue-200 transition-all duration-300">
                {item.icon}
              </div>
              <div>
                <h4 className="font-black text-slate-900 text-sm md:text-base mb-1 tracking-tight">{item.title}</h4>
                <p className="text-xs font-medium text-slate-500">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 w-full grow pb-24">

        {/* 🚀 KHU VỰC TÌM KIẾM VÀ BỘ LỌC KÍNH MỜ */}
        <div className="flex flex-col md:flex-row gap-4 items-center bg-white p-2 md:p-3 rounded-full shadow-sm border border-slate-200 mb-12">

          <div className="relative w-full md:w-[350px] shrink-0">
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 text-slate-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </div>
            <input
              type="text"
              className="block w-full pl-12 pr-6 py-3.5 bg-slate-50 hover:bg-slate-100 border-none rounded-full text-sm focus:ring-0 outline-none font-bold text-slate-800 placeholder:text-slate-400 transition-colors"
              placeholder="Tìm kiếm siêu phẩm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="w-full flex overflow-x-auto hide-scrollbar gap-2 pr-2">
            {categories.map((cat, index) => (
              <button
                key={index}
                onClick={() => setSelectedCategory(cat)}
                className={`whitespace-nowrap px-6 py-3.5 rounded-full text-xs font-black tracking-widest uppercase transition-all duration-300 shrink-0 ${selectedCategory === cat
                  ? "bg-slate-900 text-white shadow-md scale-100"
                  : "bg-transparent text-slate-500 hover:bg-slate-100 hover:text-slate-900 scale-95 hover:scale-100"
                  }`}
              >
                {cat === "Tất cả" ? "🔥 TẤT CẢ DANH MỤC" : cat}
              </button>
            ))}
          </div>
        </div>

        {/* 🚀 KHU VỰC SẢN PHẨM */}
        <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight uppercase">
              {selectedCategory === "Tất cả" ? "Sản Phẩm Đang Hot" : `${selectedCategory}`}
            </h2>
            <p className="text-slate-500 font-medium text-sm mt-2">Cập nhật liên tục những item cháy hàng nhất hệ mặt trời.</p>
          </div>
          <span className="text-slate-900 font-black bg-slate-100 px-4 py-2 rounded-xl text-xs uppercase tracking-widest border border-slate-200">
            {filteredProducts.length} Kết quả
          </span>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6 lg:gap-8">
            {[...Array(10)].map((_, index) => (
              <ProductSkeleton key={index} />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-24 md:py-32 bg-white rounded-[3rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <div className="w-40 h-40 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8 border-8 border-white shadow-inner">
              <div className="text-7xl grayscale opacity-30">🛸</div>
            </div>
            <h3 className="text-3xl font-black text-slate-800 tracking-tight mb-4">Vũ Trụ Trống Rỗng!</h3>
            <p className="text-slate-500 font-medium text-lg max-w-md mx-auto">Không tìm thấy sản phẩm nào khớp với radar của Chủ Tịch. Hãy thử từ khóa khác nhé.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6 lg:gap-8">
            {filteredProducts.map((product) => (
              <Link
                href={`/product/${product._id}`}
                key={product._id}
                className="bg-white rounded-[2rem] shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] border border-slate-100 overflow-hidden group flex flex-col relative transition-all duration-500 hover:-translate-y-2"
              >
                {/* Tag góc trái */}
                <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                  <span className="bg-red-500/90 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg shadow-sm border border-red-400">
                    SALE MẠNH
                  </span>
                </div>

                <div className="relative aspect-square bg-slate-50 overflow-hidden flex items-center justify-center p-6 border-b border-slate-50">
                  <div className="absolute inset-0 bg-gradient-to-tr from-blue-100/40 to-purple-100/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 mix-blend-multiply"></div>
                  <img
                    src={product.image || (product.images && product.images.length > 0 ? product.images[0] : "https://via.placeholder.com/300")}
                    alt={product.title || product.name}
                    className="relative z-10 w-full h-full object-contain mix-blend-multiply group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-700 ease-out drop-shadow-sm"
                  />
                </div>

                <div className="p-5 md:p-6 flex flex-col grow bg-white">
                  <div className="flex justify-between items-center mb-3">
                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-slate-100 px-2.5 py-1 rounded-md">
                      {typeof product.category === 'object' ? product.category?.name : product.category || 'Công nghệ'}
                    </div>
                  </div>

                  <h3 className="text-sm md:text-base font-black text-slate-800 mb-2 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">
                    {product.title || product.name}
                  </h3>

                  <div className="mt-auto pt-4 flex items-end justify-between">
                    <div>
                      {/* Fake giá gốc để buff uy tín */}
                      <div className="text-[11px] text-slate-400 line-through font-bold mb-0.5">
                        {formatPrice(product.price * 1.2)}
                      </div>
                      <div className="text-lg md:text-xl font-black text-rose-600 tracking-tight">
                        {formatPrice(product.price)}
                      </div>
                    </div>

                    {/* Nút thêm giỏ hàng Hover */}
                    <button
                      onClick={(e) => handleAddToCart(e, product)}
                      className="w-10 h-10 md:w-12 md:h-12 bg-slate-100 text-slate-600 rounded-2xl group-hover:bg-slate-900 group-hover:text-white flex items-center justify-center transition-all duration-300 group-hover:shadow-lg group-hover:shadow-slate-900/30 group-hover:-translate-y-1 shrink-0"
                      title="Múc ngay"
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
