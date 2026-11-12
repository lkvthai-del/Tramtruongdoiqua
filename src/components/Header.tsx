import React from 'react';
import { Leaf, Award, Recycle, Sparkles, BookOpen, Layers } from 'lucide-react';
import { WasteSubmission } from '../types';

interface HeaderProps {
  activeTab: 'chat' | 'calculator' | 'ledger' | 'gifts' | 'guide';
  setActiveTab: (tab: 'chat' | 'calculator' | 'ledger' | 'gifts' | 'guide') => void;
  submissions: WasteSubmission[];
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, submissions }) => {
  const totalSubmissions = submissions.length;
  const totalKg = submissions.reduce(
    (acc, curr) => acc + (curr.paperKg + curr.plasticKg + curr.aluminumKg),
    0
  );
  const totalPoints = submissions.reduce((acc, curr) => acc + curr.totalPoints, 0);

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-emerald-100 sticky top-0 z-40 shadow-xs">
      {/* Top green ticker banner */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white text-xs py-1.5 px-4 font-medium flex items-center justify-between overflow-x-auto whitespace-nowrap">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-100 text-[11px] font-bold border border-emerald-400/40">
            THCS PHẠM VĂN BẢY - XÃ TÂN THÀNH BÌNH - TỈNH VĨNH LONG
          </span>
          <span>Dự án khởi nghiệp xanh học đường</span>
        </div>
        <div className="hidden md:flex items-center gap-4 text-emerald-100 text-[11px]">
          <span>✨ Giấy = 10đ/kg • Nhựa = 15đ/kg • Lon nhôm = 30đ/kg</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Logo & title */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 p-0.5 shadow-md shadow-emerald-600/20 flex items-center justify-center text-white shrink-0">
              <div className="w-full h-full rounded-[14px] bg-emerald-600 flex items-center justify-center">
                <Leaf className="w-6 h-6 text-emerald-200 fill-emerald-200/40" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-extrabold tracking-tight text-slate-800 font-display">
                  GREEN CORNER
                </h1>
                <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200">
                  Trạm Trưởng Ảo AI
                </span>
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
                THCS Phạm Văn Bảy - Xã Tân Thành Bình - Tỉnh Vĩnh Long • Dự án khởi nghiệp xanh học đường
              </p>
            </div>
          </div>

          {/* Quick Realtime Stats */}
          <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-1 md:pb-0">
            <div className="bg-emerald-50/80 border border-emerald-100 rounded-xl px-3 py-1.5 text-center min-w-[85px]">
              <div className="text-[10px] uppercase font-bold text-emerald-700">Lượt thu gom</div>
              <div className="text-base font-extrabold text-emerald-900">{totalSubmissions} lượt</div>
            </div>
            <div className="bg-sky-50/80 border border-sky-100 rounded-xl px-3 py-1.5 text-center min-w-[95px]">
              <div className="text-[10px] uppercase font-bold text-sky-700">Tổng rác gom</div>
              <div className="text-base font-extrabold text-sky-900">
                {totalKg.toLocaleString('vi-VN', { maximumFractionDigits: 1 })} kg
              </div>
            </div>
            <div className="bg-amber-50/80 border border-amber-100 rounded-xl px-3 py-1.5 text-center min-w-[95px]">
              <div className="text-[10px] uppercase font-bold text-amber-700">Điểm đã phát</div>
              <div className="text-base font-extrabold text-amber-900">{totalPoints} điểm</div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mt-4 flex items-center gap-1.5 overflow-x-auto no-scrollbar border-t border-slate-100 pt-2.5">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 ${
              activeTab === 'chat'
                ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-700/20'
                : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-50'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Trạm Trưởng Ảo AI
          </button>

          <button
            onClick={() => setActiveTab('calculator')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 ${
              activeTab === 'calculator'
                ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-700/20'
                : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-50'
            }`}
          >
            <Recycle className="w-4 h-4" />
            Cân Điểm Nhanh Tại Trạm
          </button>

          <button
            onClick={() => setActiveTab('ledger')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 ${
              activeTab === 'ledger'
                ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-700/20'
                : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-50'
            }`}
          >
            <Layers className="w-4 h-4" />
            Nhật Ký Google Sheets
            <span className="ml-1 px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
              {submissions.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('gifts')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 ${
              activeTab === 'gifts'
                ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-700/20'
                : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-50'
            }`}
          >
            <Award className="w-4 h-4" />
            Kệ Quà Xanh Đổi Điểm
          </button>

          <button
            onClick={() => setActiveTab('guide')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 ${
              activeTab === 'guide'
                ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-700/20'
                : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-50'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Cẩm Nang Phân Loại
          </button>
        </div>
      </div>
    </header>
  );
};
