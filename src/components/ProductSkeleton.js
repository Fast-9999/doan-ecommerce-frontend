"use client";

export default function ProductSkeleton() {
  return (
    <div className="bg-white rounded-4xl shadow-[0_2px_20px_rgb(0,0,0,0.02)] border border-slate-100/80 overflow-hidden flex flex-col relative animate-pulse">
      {/* Hình ảnh */}
      <div className="relative aspect-[4/5] bg-slate-100/60 p-6 flex items-center justify-center">
        <div className="w-16 h-16 bg-slate-200/80 rounded-full"></div>
      </div>

      {/* Thông tin */}
      <div className="p-6 flex flex-col grow bg-white">
        {/* Category */}
        <div className="w-20 h-3 bg-slate-200 rounded-full mb-3"></div>
        
        {/* Title */}
        <div className="w-full h-5 bg-slate-200 rounded-lg mb-2"></div>
        <div className="w-2/3 h-5 bg-slate-200 rounded-lg mb-6"></div>

        {/* Giá & Nút Add to Cart */}
        <div className="mt-auto pt-4 flex items-center justify-between border-t border-slate-50">
          <div className="w-24 h-6 bg-slate-200 rounded-lg"></div>
          <div className="w-12 h-12 bg-slate-200 rounded-2xl"></div>
        </div>
      </div>
    </div>
  );
}
