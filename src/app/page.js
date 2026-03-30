"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import useCartStore from "../store/useCartStore";
import Footer from "../components/Footer"; 

export default function HomePage() {
  const [allProducts, setAllProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  // 🚀 STATE CHO HIỆU ỨNG MÁY ĐÁNH CHỮ XOAY VÒNG (ROTATING TYPEWRITER)
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

  // Hiệu ứng gõ chữ và xóa chữ liên tục
  useEffect(() => {
    const i = loopNum % phrases.length;
    const fullText = phrases[i];

    let timer;

    if (isDeleting) {
      // Tốc độ xóa chữ (50ms - Nhanh)
      timer = setTimeout(() => {
        setTypedText(fullText.substring(0, typedText.length - 1));
      }, 50);
    } else {
      // Tốc độ gõ chữ (150ms - Vừa phải)
      timer = setTimeout(() => {
        setTypedText(fullText.substring(0, typedText.length + 1));
      }, 100);
    }

    // Logic kiểm tra khi nào gõ xong / xóa xong
    if (!isDeleting && typedText === fullText) {
      // Gõ xong 1 câu -> Dừng 2 giây cho khách đọc rồi mới bắt đầu xóa
      clearTimeout(timer);
      timer = setTimeout(() => setIsDeleting(true), 2000);
    } else if (isDeleting && typedText === "") {
      // Xóa hết chữ -> Chuyển sang câu tiếp theo
      clearTimeout(timer);
      setIsDeleting(false);
      setLoopNum(loopNum + 1);
      // Dừng 0.5s trước khi gõ câu mới
      timer = setTimeout(() => {}, 500); 
    }

    return () => clearTimeout(timer);
  }, [typedText, isDeleting, loopNum]);

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
    alert(`🛒 Đã ném "${product.title || product.name}" vào giỏ hàng!`);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      
      {/* 🚀 BANNER TƯƠNG LAI */}
      <div className="relative bg-slate-950 overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-indigo-900/40 via-purple-900/20 to-black opacity-80"></div>
        
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-blue-600/20 blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-purple-600/20 blur-[100px] pointer-events-none"></div>

        <div className="relative max-w-7xl mx-auto px-4 py-24 md:py-32 text-center z-10">
          <span className="inline-block py-1 px-3 rounded-full bg-white/10 border border-white/20 text-blue-300 text-xs font-black tracking-widest uppercase mb-6 backdrop-blur-md">
            Phiên bản 2026
          </span>
          <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter text-white h-32 md:h-20 flex flex-col md:flex-row items-center justify-center gap-2 md:gap-4">
            <span>Trải nghiệm</span>
            <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-purple-500 whitespace-nowrap inline-flex items-center">
              {typedText}
              {/* Con trỏ nhấp nháy */}
              <span className="inline-block w-1.5 h-10 md:h-14 ml-1 bg-blue-500 animate-pulse align-middle"></span>
            </span>
          </h1>
          <p className="text-lg md:text-xl text-slate-300 mb-10 max-w-2xl mx-auto font-medium leading-relaxed">
            Hệ sinh thái E-Commerce thế hệ mới. Săn deal thần tốc, chốt đơn mượt mà với giao diện chuẩn VIP Pro.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-12 relative z-20 grow w-full pb-24">
        
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 md:p-8 mb-12 border border-white/50 ring-1 ring-slate-900/5">
          <div className="relative mb-8 group">
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </div>
            <input
              type="text"
              className="block w-full pl-14 pr-6 py-4.5 bg-slate-100/50 border-0 rounded-2xl text-lg focus:ring-4 focus:ring-blue-500/20 transition-all outline-none font-bold text-slate-800 placeholder:text-slate-400 placeholder:font-medium"
              placeholder="Bạn đang tìm kiếm siêu phẩm gì hôm nay?..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-2 md:gap-3">
            {categories.map((cat, index) => (
              <button
                key={index}
                onClick={() => setSelectedCategory(cat)}
                className={`px-6 py-2.5 rounded-xl text-sm font-black tracking-wide uppercase transition-all duration-300 ${
                  selectedCategory === cat
                    ? "bg-linear-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30 scale-105"
                    : "bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-800"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-8 flex justify-between items-end">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">
            {selectedCategory === "Tất cả" ? "Xu Hướng Mới Nhất" : `${selectedCategory}`}
          </h2>
          <span className="text-slate-500 font-bold bg-slate-200/60 px-4 py-1.5 rounded-lg text-sm uppercase tracking-widest">
            {filteredProducts.length} Kết quả
          </span>
        </div>

        {loading ? (
          <div className="flex justify-center py-32">
            <div className="relative w-20 h-20">
              <div className="absolute inset-0 rounded-full border-t-4 border-blue-500 animate-spin"></div>
              <div className="absolute inset-2 rounded-full border-r-4 border-purple-500 animate-spin flex-reverse"></div>
            </div>
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
                className="bg-white rounded-4xl shadow-[0_2px_20px_rgb(0,0,0,0.02)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.06)] transition-all duration-500 border border-slate-100/80 overflow-hidden group flex flex-col relative"
              >
                <div className="relative aspect-4/5 bg-slate-50/50 p-6 overflow-hidden flex items-center justify-center">
                  <div className="absolute top-4 left-4 z-10">
                    <span className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg shadow-md">
                      MỚI
                    </span>
                  </div>
                  <img 
                    src={product.image || (product.images && product.images.length > 0 ? product.images[0] : "https://via.placeholder.com/300")} 
                    alt={product.title || product.name} 
                    className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-700 ease-out"
                  />
                </div>

                <div className="p-6 flex flex-col grow bg-white relative z-20">
                  <div className="text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">
                    {typeof product.category === 'object' ? product.category?.name : product.category || 'Công nghệ'}
                  </div>
                  
                  <h3 className="text-lg font-bold text-slate-800 mb-3 line-clamp-2 leading-snug group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-linear-to-r group-hover:from-blue-600 group-hover:to-purple-600 transition-all">
                    {product.title || product.name}
                  </h3>

                  <div className="mt-auto pt-4 flex items-center justify-between border-t border-slate-50">
                    <div className="text-xl font-black text-slate-900 tracking-tight">
                      {formatPrice(product.price)}
                    </div>
                    <button 
                      onClick={(e) => handleAddToCart(e, product)}
                      className="w-12 h-12 bg-slate-50 text-slate-600 rounded-2xl hover:bg-blue-600 hover:text-white flex items-center justify-center transition-colors duration-300 shadow-sm"
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
