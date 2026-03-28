"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import useCartStore from "../../../store/useCartStore"; // <-- Import bí kíp Zustand vô đây

export default function ProductDetail() {
  const params = useParams(); // Lấy các tham số từ URL
  const { id } = params; // Lôi cái ID ra xài
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  // Lôi cái hàm addToCart từ trong kho ra xài
  const addToCart = useCartStore((state) => state.addToCart);

  useEffect(() => {
    if (id) {
      // Gọi API lấy chi tiết 1 sản phẩm theo ID
      axios.get(`https://doan-ecommerce-backend.vercel.app/api/v1/products/${id}`)
        .then((res) => {
          setProduct(res.data);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Lỗi lấy chi tiết:", err);
          setLoading(false);
        });
    }
  }, [id]);

  const formatPrice = (price) => {
    return price?.toLocaleString('vi-VN') + " VNĐ";
  };

  if (loading) return <div className="text-center p-20 text-xl font-bold animate-pulse text-blue-600">Đang tải hàng, đợi xíu nha Phát... ⏳</div>;
  if (!product) return <div className="text-center p-20 text-xl font-bold text-red-500">Trời ơi! Không tìm thấy sản phẩm này! 😢</div>;

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
        
        {/* Cột trái: Hình ảnh bự */}
        <div className="bg-gray-50 rounded-2xl overflow-hidden flex items-center justify-center p-4">
          <img 
            src={product.images && product.images.length > 0 ? product.images[0] : "https://via.placeholder.com/600x600?text=Chua+Co+Anh"} 
            alt={product.title} 
            className="w-full h-auto object-cover rounded-xl hover:scale-105 transition-transform duration-500"
          />
        </div>

        {/* Cột phải: Thông tin chi tiết */}
        <div className="flex flex-col justify-center">
          <span className="text-sm font-black text-blue-500 mb-3 tracking-widest uppercase bg-blue-50 w-max px-3 py-1 rounded-full">
            {product.category || "Hàng Mới Về"}
          </span>
          
          <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-4 leading-tight">
            {product.title}
          </h1>
          
          <div className="text-3xl md:text-4xl font-black text-red-600 mb-8">
            {formatPrice(product.price)}
          </div>
          
          <div className="bg-gray-50 p-6 rounded-2xl mb-8 border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-3 text-lg">Mô tả sản phẩm:</h3>
            <p className="text-gray-600 leading-relaxed whitespace-pre-line text-md">
              {product.description}
            </p>
          </div>

          {/* Nút hành động */}
          <div className="flex gap-4 mt-auto">
            {/* Đã thêm sự kiện onClick vô nút này 👇 */}
            <button 
              onClick={() => {
                addToCart(product); // Quăng cục data sản phẩm vô giỏ
                alert("Đã quăng vô giỏ hàng thành công nha ní! Lên góc phải check liền!"); // Báo cho khách biết
              }}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 flex justify-center items-center gap-2 text-lg"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
              </svg>
              MÚC NGAY CHO NÓNG
            </button>
          </div>
        </div>
        
      </div>
    </div>
  );
}