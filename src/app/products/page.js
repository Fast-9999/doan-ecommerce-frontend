"use client";

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
    };
    
    addToCart(cartItem);
    alert(`🛒 Đã ném "${cartItem.title}" vào giỏ hàng cái vèo!`);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      
      {/* Banner xịn xò */}
      <div className="bg-slate-900 text-white py-14 text-center">
        <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tighter uppercase">
          TẤT CẢ <span className="text-blue-500">SẢN PHẨM</span>
        </h1>
        <p className="text-slate-400 font-medium max-w-2xl mx-auto px-4">
          Khám phá kho hàng siêu cấp VIP Pro. Hàng ngàn deal hời đang chờ Chủ Tịch chốt đơn!
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grow w-full">
        
        {loading ? (
          <div className="flex justify-center items-center py-32">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-slate-900"></div>
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-20 text-center">
            <div className="text-6xl mb-4">🏜️</div>
            <h2 className="text-2xl font-bold text-slate-800">Kho hàng đang trống!</h2>
            <p className="text-slate-500 mt-2 font-medium">Chủ Tịch mau qua trang Admin nhập thêm hàng về bán đi.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map((product) => (
              <Link 
                href={`/product/${product._id}`} 
                key={product._id}
                className="bg-white rounded-2xl shadow-sm hover:shadow-xl border border-slate-100 overflow-hidden group transition-all duration-300 hover:-translate-y-1 flex flex-col"
              >
                {/* Khu vực Hình ảnh */}
                <div className="aspect-4/5 bg-slate-50 relative p-4 flex items-center justify-center overflow-hidden">
                  <span className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-black px-2 py-1 rounded-md z-10 tracking-widest uppercase shadow-sm">
                    MỚI NHẤT
                  </span>
                  
                  <img 
                    src={product.image || (product.images && product.images.length > 0 ? product.images[0] : "https://via.placeholder.com/300")} 
                    alt={product.title || product.name}
                    className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500"
                  />
                </div>

                {/* Khu vực Thông tin */}
                <div className="p-4 md:p-5 flex flex-col grow">
                  <span className="text-[10px] font-black text-slate-400 tracking-widest uppercase mb-1">
                    {product.category?.name || product.category || "THỜI TRANG"}
                  </span>
                  <h3 className="text-sm md:text-base font-bold text-slate-800 line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors">
                    {product.title || product.name}
                  </h3>
                  
                  <div className="mt-auto pt-2 flex flex-col gap-3">
                    <div className="text-base md:text-lg font-black text-red-600">
                      {formatPrice(product.price)}
                    </div>
                    
                    {/* Nút múc nhanh (Z-index cao & dùng preventDefault để không văng qua trang chi tiết) */}
                    <button 
                      onClick={(e) => handleQuickAdd(e, product)}
                      className="w-full bg-slate-100 hover:bg-slate-900 text-slate-800 hover:text-white font-bold py-2.5 rounded-xl text-xs tracking-widest uppercase transition-colors duration-300 flex justify-center items-center gap-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                      </svg>
                      Thêm Vào Giỏ
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