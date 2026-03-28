"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Đã thêm ?limit=20 để lôi hết hàng tồn kho ra, không bị kẹt ở mức 5 cái nữa
    axios.get("https://doan-ecommerce-backend.vercel.app/api/v1/products?limit=20")
      .then((response) => {
        setProducts(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Trục trặc rồi ní ơi:", error);
        setLoading(false);
      });
  }, []);

  const formatPrice = (price) => {
    return price?.toLocaleString('vi-VN') + " VNĐ";
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      
      {/* 1. HERO BANNER - Bảng hiệu chà bá đập vô mắt */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="relative rounded-3xl overflow-hidden bg-blue-600 shadow-2xl">
          <div className="absolute inset-0">
            <img 
              src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=2070" 
              alt="Banner" 
              className="w-full h-full object-cover opacity-40 mix-blend-multiply"
            />
          </div>
          <div className="relative px-8 py-20 md:py-32 flex flex-col items-center text-center">
            <h1 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight drop-shadow-lg">
              ĐỒ ÁN E-COMMERCE <br/> <span className="text-yellow-400">SIÊU CẤP VIP PRO</span>
            </h1>
            <p className="text-lg md:text-xl text-blue-100 font-medium mb-10 max-w-2xl drop-shadow">
              Hàng mới về ngập kho. Chốt đơn liền tay, rinh ngay điểm A+ từ thầy giáo!
            </p>
            <button className="bg-white text-blue-600 font-bold text-lg px-8 py-4 rounded-full shadow-xl hover:bg-yellow-400 hover:text-gray-900 transition-all duration-300 transform hover:-translate-y-1">
              Bắt Đầu Mua Sắm
            </button>
          </div>
        </div>
      </div>

      {/* 2. DANH MỤC NHANH (Category Pills) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 mb-8 flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
        {["Tất Cả", "Thời Trang Nam", "Thời Trang Nữ", "Giày Dép", "Phụ Kiện"].map((cat, index) => (
          <button key={index} className={`whitespace-nowrap px-6 py-2 rounded-full font-bold text-sm transition-all shadow-sm border ${index === 0 ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-600 hover:text-blue-600'}`}>
            {cat}
          </button>
        ))}
      </div>

      {/* 3. DANH SÁCH SẢN PHẨM */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 uppercase tracking-tight">
            🔥 Sản Phẩm <span className="text-blue-600">Nổi Bật</span>
          </h2>
          <a href="#" className="text-blue-600 font-semibold hover:underline hidden sm:block">Xem tất cả &rarr;</a>
        </div>
        
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mb-4"></div>
            <p className="text-gray-500 font-medium">Đang kéo xe hàng về...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {products.length > 0 ? (
              products.map((item) => (
                <div key={item._id} className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col group border border-gray-100">
                  
                  {/* Hình Ảnh có bọc Link */}
                  <Link href={`/product/${item._id}`} className="relative w-full aspect-square bg-gray-50 overflow-hidden cursor-pointer block">
                    <img 
                      src={item.images && item.images.length > 0 ? item.images[0] : "https://via.placeholder.com/300x300?text=Chua+Co+Anh"} 
                      alt={item.title} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out"
                    />
                    <div className="absolute top-3 left-3 bg-red-500 text-white text-[10px] uppercase font-black px-2 py-1 rounded shadow-sm tracking-wider">
                      MỚI
                    </div>
                  </Link>

                  {/* Nội Dung */}
                  <div className="p-4 flex flex-col grow">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{item.category}</p>
                    <h2 className="text-md font-bold text-gray-800 mb-1 line-clamp-2 hover:text-blue-600 transition-colors" title={item.title}>
                      <Link href={`/product/${item._id}`}>{item.title}</Link>
                    </h2>
                    
                    <div className="mt-auto pt-3 flex items-center justify-between">
                      <span className="text-lg font-black text-red-600">
                        {formatPrice(item.price)}
                      </span>
                      <button className="bg-blue-50 text-blue-600 p-2 rounded-lg hover:bg-blue-600 hover:text-white transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-10 text-gray-500">Chưa có sản phẩm nào.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
