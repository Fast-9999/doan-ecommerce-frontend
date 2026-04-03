"use client";

import { toast } from "react-hot-toast";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import useCartStore from "../../../store/useCartStore"; 
import useAuthStore from "../../../store/useAuthStore";
import Footer from "../../../components/Footer";

export default function ProductDetail() {
  const { id } = useParams(); 
  const router = useRouter();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  
  // 🚀 BỔ SUNG: State lưu trữ số lượng tồn kho
  const [stock, setStock] = useState(null); 

  const { user } = useAuthStore();
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { addToCart } = useCartStore();

  useEffect(() => {
    if (id) {
      fetchProductData();
      fetchReviews();
      fetchInventory(); // 🚀 BỔ SUNG: Gọi thủ kho check hàng
    }
  }, [id]);

  const fetchProductData = async () => {
    try {
      const res = await axios.get(`https://doan-ecommerce-backend.vercel.app/api/v1/products/${id}`);
      let data = res.data;
      if (data && typeof data === 'object' && !data._id) {
         data = data.data || data.product || data.result || data;
      }
      setProduct(data);
    } catch (err) {
      console.error("Lỗi lấy chi tiết:", err);
    } finally {
      setLoading(false);
    }
  };

  // 🚀 BỔ SUNG: Hàm gọi API quét kho hàng
  const fetchInventory = async () => {
    try {
      const res = await axios.get(`https://doan-ecommerce-backend.vercel.app/api/v1/inventories`);
      const allInventories = res.data;
      
      // Tìm đúng cái kho của sản phẩm hiện tại
      const currentItem = allInventories.find(inv => 
        (inv.product?._id || inv.product) === id
      );
      
      if (currentItem) {
        setStock(currentItem.stock);
      } else {
        setStock(0); // Không tìm thấy trong sổ thì coi như hết hàng
      }
    } catch (err) {
      console.error("Lỗi lấy tồn kho:", err);
      setStock(0);
    }
  };

  const fetchReviews = async () => {
    try {
      const res = await axios.get(`https://doan-ecommerce-backend.vercel.app/api/v1/reviews/product/${id}`);
      if (res.data.success) {
        setReviews(res.data.reviews);
      }
    } catch (err) {
      console.error("Lỗi lấy reviews:", err);
    }
  };

  const formatPrice = (price) => price?.toLocaleString('vi-VN') + " VNĐ";

  // 🚀 BỔ SUNG LOGIC CHẶN TĂNG SỐ LƯỢNG LỐ KHO
  const handleIncrease = () => {
    if (stock !== null && quantity >= stock) {
      toast.error(`Kho chỉ còn đúng ${stock} cái thôi Chủ Tịch ơi! Khách thông cảm nhen!`);
      return;
    }
    setQuantity(q => q + 1);
  };
  
  const handleDecrease = () => setQuantity(q => (q > 1 ? q - 1 : 1));

  const handleAddToCart = () => {
    if (!product || stock <= 0) return; // Hết hàng thì cấm chạy hàm này
    const cartItem = {
      _id: product._id,
      title: product.title || product.name,
      price: product.price,
      image: product.image || (product.images && product.images.length > 0 ? product.images[0] : "https://via.placeholder.com/600x600?text=Chua+Co+Anh"),
    };

    for(let i = 0; i < quantity; i++) {
       addToCart(cartItem);
    }
    toast.success(`🛒 Đã ném ${quantity} món "${cartItem.title}" vào giỏ hàng!`);
  };

  const handleBuyNow = () => {
    if (stock <= 0) return; // Hết hàng cấm mua
    handleAddToCart();
    router.push("/cart"); 
  };

  // 🚀 BỔ SUNG HÀM XỬ LÝ ĐẶT CHỖ / GIỮ HÀNG
  const handleReserve = async () => {
    let currentUser = (user && Object.keys(user).length > 0) ? user : null;
    let currentToken = user?.token || "";

    // Tìm user từ local storage nếu chưa có
    if (!currentUser || !currentToken) {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        try {
          const item = JSON.parse(localStorage.getItem(key));
          if (item?.state?.user) currentUser = item.state.user;
          if (item?.state?.token) currentToken = item.state.token;
        } catch (error) {}
      }
    }

    if (!currentToken) currentToken = localStorage.getItem("token") || "";
    let userId = currentUser?._id || currentUser?.id || currentUser?.userId || currentUser?.data?._id;

    if (!userId && currentToken) {
      try {
        const payload = JSON.parse(atob(currentToken.split('.')[1])); 
        userId = payload._id || payload.id || payload.userId;
      } catch (error) {}
    }

    if (!userId) {
      toast("Ní ơi, đăng nhập trước rồi mới giữ hàng được nha!");
      return router.push('/login');
    }

    if (stock !== null && quantity > stock) {
      toast.error(`Kho chỉ còn đúng ${stock} cái thôi Chủ Tịch ơi! Không đủ để giữ hàng.`);
      return;
    }

    try {
      const res = await axios.post("https://doan-ecommerce-backend.vercel.app/api/v1/reservations", {
        userId: userId,
        productId: id,
        quantity: quantity
      });

      if (res.data.success || res.status === 201) {
        toast.success("🎉 Đã đặt gạch giữ hàng thành công! Ní vô Profile để kiểm tra nha.");
      }
    } catch (error) {
      console.error("Lỗi giữ hàng:", error);
      toast.error("Hết chỗ giữ rồi hoặc lỗi mạng, thử lại sau nha Sếp!");
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    
    let currentUser = (user && Object.keys(user).length > 0) ? user : null;
    let currentToken = user?.token || "";

    if (!currentUser || !currentToken) {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        try {
          const item = JSON.parse(localStorage.getItem(key));
          if (item?.state?.user) currentUser = item.state.user;
          if (item?.state?.token) currentToken = item.state.token;
        } catch (error) {}
      }
    }

    if (!currentToken) currentToken = localStorage.getItem("token") || "";

    let userId = currentUser?._id || currentUser?.id || currentUser?.userId || currentUser?.data?._id;

    if (!userId && currentToken) {
      try {
        const payload = JSON.parse(atob(currentToken.split('.')[1])); 
        userId = payload._id || payload.id || payload.userId;
      } catch (error) {}
    }

    if (!userId) {
      toast.error("Hệ thống vẫn không tìm thấy tài khoản của ông. Ní thử xóa lịch sử web rồi đăng nhập lại xem!");
      return;
    }

    if (!comment.trim()) {
      toast("Nhập vài chữ review cho xôm tụ đi ní ơi!");
      return;
    }

    try {
      setIsSubmitting(true);
      
      const res = await axios.post("https://doan-ecommerce-backend.vercel.app/api/v1/reviews", 
        {
          product: id,
          user: userId,
          rating,
          comment
        },
        {
          headers: {
            Authorization: `Bearer ${currentToken}` 
          }
        }
      );

      if (res.data.success || res.status === 201 || res.status === 200) {
        toast.success("🎉 Đã gửi đánh giá thành công rực rỡ!");
        setComment("");
        setRating(5);
        fetchReviews(); 
      }
    } catch (error) {
      console.error("Lỗi gửi review:", error);
      const errorMsg = error.response?.data?.message || error.message;
      toast.error(`Huhu gửi xịt rồi: ${errorMsg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-slate-900"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-center p-6">
        <div className="text-8xl mb-6">🤷‍♂️</div>
        <h1 className="text-3xl font-black text-slate-800 mb-4">Sản phẩm đi lạc rồi!</h1>
        <Link href="/products" className="bg-slate-900 text-white px-8 py-4 rounded-xl font-bold shadow-lg hover:bg-blue-600 transition-colors">
          Quay lại cửa hàng
        </Link>
      </div>
    );
  }

  const avgRating = reviews.length > 0 ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1) : 0;
  const isUserValid = (user && Object.keys(user).length > 0) || (typeof window !== 'undefined' && localStorage.getItem("token"));
  
  // 🚀 Biến check Hết Hàng
  const isOutOfStock = stock !== null && stock <= 0;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      
      {/* Breadcrumb */}
      <div className="bg-white border-b border-slate-100 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-sm font-bold text-slate-400 flex items-center gap-2">
          <Link href="/" className="hover:text-slate-900 transition-colors">TRANG CHỦ</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-slate-900 transition-colors">SẢN PHẨM</Link>
          <span>/</span>
          <span className="text-slate-900 line-clamp-1 uppercase">{product.title || product.name}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        
        {/* KHỐI 1: THÔNG TIN SẢN PHẨM */}
        <div className="bg-white rounded-4xl shadow-sm border border-slate-100 overflow-hidden flex flex-col lg:flex-row mb-12">
          
          <div className="lg:w-1/2 p-8 md:p-12 bg-slate-50 flex items-center justify-center relative group">
            {isOutOfStock ? (
              <span className="absolute top-6 left-6 bg-slate-500 text-white text-xs font-black uppercase tracking-widest px-3 py-1.5 rounded-lg z-10 shadow-sm">
                HẾT HÀNG
              </span>
            ) : (
              <span className="absolute top-6 left-6 bg-red-500 text-white text-xs font-black uppercase tracking-widest px-3 py-1.5 rounded-lg z-10 shadow-sm">
                MỚI NHẤT
              </span>
            )}
            
            <img 
              src={product.image || (product.images && product.images.length > 0 ? product.images[0] : "https://via.placeholder.com/600x600?text=Chua+Co+Anh")} 
              alt={product.title || product.name}
              className={`w-full max-w-md aspect-square object-contain mix-blend-multiply transition-transform duration-500 ${isOutOfStock ? 'grayscale opacity-60' : 'group-hover:scale-105'}`}
            />
          </div>

          <div className="lg:w-1/2 p-8 md:p-12 flex flex-col">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1.5 rounded-md tracking-widest uppercase">
                {product.category?.name || product.category || "CÔNG NGHỆ"}
              </span>
              {reviews.length > 0 && (
                <span className="flex items-center text-sm font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-md">
                  <span className="text-yellow-400 mr-1">★</span> {avgRating} ({reviews.length} đánh giá)
                </span>
              )}
            </div>

            <h1 className="text-3xl md:text-4xl font-black text-slate-900 leading-tight mb-6">
              {product.title || product.name}
            </h1>
            
            <div className="text-3xl md:text-4xl font-black text-red-600 mb-8 pb-8 border-b border-slate-100 flex items-end gap-4">
              {formatPrice(product.price)}
              {/* 🚀 Hiển thị badge Tồn kho */}
              {stock !== null && stock > 0 && (
                <span className="text-sm font-bold text-green-600 bg-green-50 px-3 py-1.5 rounded-lg border border-green-100 mb-1">
                  Còn {stock} sản phẩm
                </span>
              )}
            </div>

            <div className="text-slate-600 font-medium leading-relaxed mb-10 text-justify">
              <p>{product.description || "Sản phẩm này hiện chưa có mô tả chi tiết. Chốt đơn ngay kẻo lỡ!"}</p>
            </div>

            <div className="mt-auto space-y-6">
              <div>
                <span className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">SỐ LƯỢNG</span>
                <div className="flex items-center w-max bg-slate-50 rounded-xl border border-slate-200 p-1">
                  <button 
                    onClick={handleDecrease} 
                    disabled={isOutOfStock}
                    className="w-12 h-10 flex items-center justify-center text-slate-600 font-black hover:bg-white hover:shadow-sm rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >-</button>
                  <span className="w-14 text-center font-black text-slate-900">{isOutOfStock ? 0 : quantity}</span>
                  <button 
                    onClick={handleIncrease} 
                    disabled={isOutOfStock}
                    className="w-12 h-10 flex items-center justify-center text-slate-600 font-black hover:bg-white hover:shadow-sm rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >+</button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button 
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className={`flex-1 font-black py-4 rounded-xl transition-colors duration-300 shadow-sm flex justify-center items-center gap-2 tracking-widest uppercase text-sm ${
                    isOutOfStock 
                      ? 'bg-slate-200 text-slate-400 border-2 border-slate-200 cursor-not-allowed' 
                      : 'bg-white border-2 border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  {isOutOfStock ? '🚫 HẾT HÀNG' : 'THÊM VÀO GIỎ'}
                </button>
                <button 
                  onClick={handleBuyNow}
                  disabled={isOutOfStock}
                  className={`flex-1 font-black py-4 rounded-xl shadow-lg transition-colors duration-300 tracking-widest uppercase text-sm ${
                    isOutOfStock
                      ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {isOutOfStock ? 'KHÔNG THỂ MUA' : 'MUA NGAY'}
                </button>
                {/* 🚀 BỔ SUNG NÚT GIỮ HÀNG TẠI ĐÂY */}
                <button 
                  onClick={handleReserve}
                  disabled={isOutOfStock}
                  className={`flex-1 font-black py-4 rounded-xl shadow-lg transition-colors duration-300 tracking-widest uppercase text-sm ${
                    isOutOfStock
                      ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
                      : 'bg-purple-600 hover:bg-purple-700 text-white'
                  }`}
                >
                  ⏳ GIỮ HÀNG
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 🚀 KHỐI 2: ĐÁNH GIÁ VÀ NHẬN XÉT (REVIEWS) */}
        <div className="bg-white rounded-4xl shadow-sm border border-slate-100 p-8 md:p-12">
          {/* ... (Khối Review giữ nguyên 100% không đổi) ... */}
          <h2 className="text-2xl font-black text-slate-900 mb-8 tracking-tight uppercase border-b border-slate-100 pb-4">
            Khách Hàng Nói Gì? ({reviews.length})
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            
            {/* Cột form viết đánh giá */}
            <div className="lg:col-span-1">
              <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 sticky top-24">
                <h3 className="text-lg font-black text-slate-800 mb-4">Viết đánh giá của bạn</h3>
                
                {isUserValid ? (
                  <form onSubmit={handleSubmitReview} className="space-y-5">
                    <div>
                      <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Chấm điểm sao</label>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            className={`text-2xl focus:outline-none transition-transform hover:scale-125 ${rating >= star ? 'text-yellow-400' : 'text-slate-300'}`}
                          >
                            ★
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Trải nghiệm của bạn</label>
                      <textarea
                        rows="4"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Sản phẩm xịn xò, admin đẹp trai..."
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                      ></textarea>
                    </div>

                    <button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="w-full bg-slate-900 hover:bg-blue-600 text-white font-black py-3 rounded-xl uppercase tracking-widest text-xs transition-colors disabled:opacity-50"
                    >
                      {isSubmitting ? "Đang gửi..." : "GỬI ĐÁNH GIÁ"}
                    </button>
                  </form>
                ) : (
                  <div className="text-center py-6">
                    <div className="text-4xl mb-3">🔒</div>
                    <p className="text-sm font-medium text-slate-500 mb-4">Bạn phải đăng nhập để chém gió nha!</p>
                    <Link href="/login" className="inline-block bg-blue-100 text-blue-600 hover:bg-blue-600 hover:text-white font-bold px-6 py-2 rounded-lg transition-colors text-sm">
                      Đăng nhập ngay
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Cột danh sách bình luận */}
            <div className="lg:col-span-2 space-y-6">
              {reviews.length === 0 ? (
                <div className="text-center py-16 bg-slate-50 rounded-3xl border border-slate-100">
                  <div className="text-5xl mb-4 grayscale opacity-40">📝</div>
                  <h3 className="text-lg font-bold text-slate-800">Chưa có đánh giá nào!</h3>
                  <p className="text-slate-500 mt-2 text-sm">Hãy là người đầu tiên bóc tem sản phẩm này.</p>
                </div>
              ) : (
                reviews.map((rv, idx) => (
                  <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_2px_10px_rgb(0,0,0,0.02)] flex gap-4">
                    
                    <img 
                      src={rv.user?.avatarUrl || "https://i.stack.imgur.com/l60Hf.png"} 
                      alt="avatar" 
                      className="w-12 h-12 rounded-full object-cover border border-slate-200 shadow-sm shrink-0"
                    />
                    
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <div>
                          <h4 className="font-black text-slate-800 text-sm">{rv.user?.username || rv.user?.name || "Người Dùng Bí Ẩn"}</h4>
                          <div className="flex text-yellow-400 text-sm mt-0.5">
                            {"★".repeat(rv.rating)}{"☆".repeat(5 - rv.rating)}
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-slate-400">
                          {new Date(rv.createdAt).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                      <p className="text-slate-600 font-medium text-sm mt-2 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100 inline-block">
                        {rv.comment}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

          </div>
        </div>

      </div>

      <Footer />
    </div>
  );
}