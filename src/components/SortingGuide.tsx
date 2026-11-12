import React from 'react';
import { BookOpen, CheckCircle, AlertCircle, Droplets, Sparkles, MapPin } from 'lucide-react';
import { VINH_LONG_ECO_TIPS, WASTE_RATES } from '../constants';

export const SortingGuide: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto p-3 sm:p-6 space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-green-700 text-white rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-white/20 backdrop-blur-md">
              <BookOpen className="w-5 h-5 text-emerald-200" />
            </span>
            <h2 className="text-xl font-extrabold tracking-tight">
              Cẩm Nang Phân Loại Rác Chuẩn THCS Phạm Văn Bảy
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-emerald-100 max-w-2xl">
            Phân loại đúng giúp trạm cân nhanh hơn, điểm tính chuẩn hơn và nhà máy tái chế xử lý hiệu quả gấp 3 lần!
          </p>
        </div>
        <div className="flex items-center gap-1.5 bg-emerald-800/40 text-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-400/30 text-xs">
          <MapPin className="w-4 h-4 text-emerald-300" />
          <span>THCS Phạm Văn Bảy • Xã Tân Thành Bình</span>
        </div>
      </div>

      {/* 3 Categories in Detail */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Paper */}
        <div className="bg-white border border-amber-200 rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center text-2xl">
              📚
            </div>
            <span className="bg-amber-100 text-amber-800 font-extrabold text-xs px-2.5 py-1 rounded-full">
              1 kg = 10 điểm
            </span>
          </div>

          <h3 className="text-base font-bold text-slate-800">Giấy Vụn & Bìa Carton</h3>

          <div className="space-y-2 text-xs">
            <div className="flex items-start gap-2 text-emerald-700">
              <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                <strong>Được nhận:</strong> Sách giáo khoa cũ, vở bài tập đã viết hết, giấy A4 photo hỏng, báo cũ, thùng bìa carton chuyển hàng.
              </span>
            </div>
            <div className="flex items-start gap-2 text-red-600">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                <strong>Không nhận:</strong> Giấy đã dính dầu mỡ đồ ăn, khăn giấy vệ sinh đã qua sử dụng, giấy bạc gói thức ăn.
              </span>
            </div>
          </div>

          <div className="bg-amber-50 p-3 rounded-xl border border-amber-200/60 text-[11px] text-amber-900 font-medium">
            💡 <em>Mẹo nhỏ:</em> Buộc giấy thành từng chồng vuông vức bằng dây gai hoặc cho vào thùng carton giúp cân ký nhanh hơn rất nhiều.
          </div>
        </div>

        {/* Plastic */}
        <div className="bg-white border border-sky-200 rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-800 flex items-center justify-center text-2xl">
              🥤
            </div>
            <span className="bg-sky-100 text-sky-800 font-extrabold text-xs px-2.5 py-1 rounded-full">
              1 kg = 15 điểm
            </span>
          </div>

          <h3 className="text-base font-bold text-slate-800">Chai Nhựa & Ly PET</h3>

          <div className="space-y-2 text-xs">
            <div className="flex items-start gap-2 text-emerald-700">
              <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                <strong>Được nhận:</strong> Vỏ chai nước suối (Aquafina, Lavie...), ly/chai trà sữa đã rửa sạch, chai dầu ăn/nước mắm đã súc ráo.
              </span>
            </div>
            <div className="flex items-start gap-2 text-red-600">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                <strong>Không nhận:</strong> Chai đựng hóa chất độc hại, chai nhựa còn đầy nước ngọt hoặc thạch trân châu thừa.
              </span>
            </div>
          </div>

          <div className="bg-sky-50 p-3 rounded-xl border border-sky-200/60 text-[11px] text-sky-900 font-medium">
            💡 <em>Mẹo nhỏ:</em> Hãy tháo nắp, đổ sạch nước thừa rồi giẫm bẹp vỏ chai để vừa tiết kiệm diện tích ba lô vừa giúp trạm chứa được nhiều hơn.
          </div>
        </div>

        {/* Aluminum */}
        <div className="bg-white border border-emerald-200 rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center text-2xl">
              🥫
            </div>
            <span className="bg-emerald-100 text-emerald-800 font-extrabold text-xs px-2.5 py-1 rounded-full">
              1 kg = 30 điểm
            </span>
          </div>

          <h3 className="text-base font-bold text-slate-800">Vỏ Lon Nhôm</h3>

          <div className="space-y-2 text-xs">
            <div className="flex items-start gap-2 text-emerald-700">
              <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                <strong>Được nhận:</strong> Vỏ lon nước ngọt (Coca, Pepsi, Sprite...), lon bò húc, lon nước yến, lon bia đã uống hết.
              </span>
            </div>
            <div className="flex items-start gap-2 text-red-600">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                <strong>Không nhận:</strong> Hộp sữa đặc sắt tây bị rỉ sét nặng hoặc các loại pin độc hại.
              </span>
            </div>
          </div>

          <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200/60 text-[11px] text-emerald-900 font-medium">
            💡 <em>Mẹo nhỏ:</em> Lon nhôm có tỷ lệ đổi điểm cao nhất (30đ/kg). Chỉ cần khoảng 1.7kg lon nhôm là đủ đổi ngay 1 Bút chì sinh học!
          </div>
        </div>
      </div>

      {/* Dự Án Khởi Nghiệp Xanh Học Đường Section */}
      <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-sky-50 border border-emerald-200 rounded-2xl p-5 sm:p-6 shadow-xs">
        <div className="flex items-center gap-2 mb-2">
          <Droplets className="w-5 h-5 text-teal-600" />
          <h3 className="text-base font-bold text-slate-800">
            Dự án khởi nghiệp xanh học đường
          </h3>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed mb-4">
          Dự án "Green Corner - Trạm Đổi Rác Lấy Quà Xanh" được triển khai nhằm nâng cao ý thức phân loại rác thải tại nguồn cho các bạn học sinh THCS, xây dựng mô hình tái chế tuần hoàn trong nhà trường.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {VINH_LONG_ECO_TIPS.map((tip, idx) => (
            <div key={idx} className="bg-white p-3.5 rounded-xl border border-emerald-100 shadow-2xs">
              <div className="text-xs font-bold text-emerald-800 mb-1 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                {tip.title}
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                {tip.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
