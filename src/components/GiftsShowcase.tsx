import React, { useState } from 'react';
import { Gift, Sparkles, CheckCircle2, ArrowRight, HeartHandshake, TreePine } from 'lucide-react';
import { GIFTS_CATALOG } from '../constants';
import { fireSuccessConfetti } from '../utils/confetti';

export const GiftsShowcase: React.FC = () => {
  const [testPoints, setTestPoints] = useState<number>(75);

  const calculateRewardOptions = (points: number) => {
    const notebooks = Math.floor(points / 200);
    const remAfterNotebooks = points % 200;

    const succulents = Math.floor(remAfterNotebooks / 100);
    const remAfterSucculents = remAfterNotebooks % 100;

    const pencils = Math.floor(remAfterSucculents / 50);
    const leftover = remAfterSucculents % 50;

    return { notebooks, succulents, pencils, leftover };
  };

  const options = calculateRewardOptions(testPoints);

  return (
    <div className="max-w-6xl mx-auto p-3 sm:p-6 space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-green-700 text-white rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-white/20 backdrop-blur-md">
              <Gift className="w-5 h-5 text-emerald-200" />
            </span>
            <h2 className="text-xl font-extrabold tracking-tight">Kệ Quà Xanh Đổi Điểm</h2>
          </div>
          <p className="text-xs sm:text-sm text-emerald-100 max-w-2xl">
            Các món quà tại Trạm Xanh Green Corner thuộc Dự án khởi nghiệp xanh học đường, mang thông điệp ươm mầm sự sống và phân loại rác tại nguồn!
          </p>
        </div>
        <div className="bg-white/10 px-3.5 py-2 rounded-xl text-center border border-white/20">
          <div className="text-[10px] text-emerald-200 font-bold uppercase">Mức điểm tối thiểu</div>
          <div className="text-lg font-black text-white">Chỉ từ 50 điểm</div>
        </div>
      </div>

      {/* 3 Main Gifts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {GIFTS_CATALOG.map((gift) => (
          <div
            key={gift.id}
            className="bg-white border border-emerald-100 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-start justify-between mb-3">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                  {gift.image}
                </div>
                <div className="text-right">
                  <span className="inline-block bg-emerald-600 text-white font-black text-sm px-2.5 py-1 rounded-xl shadow-xs">
                    {gift.pointsRequired} điểm
                  </span>
                  <div className="text-[11px] text-emerald-700 font-bold mt-1">
                    {gift.badge}
                  </div>
                </div>
              </div>

              <h3 className="text-base font-bold text-slate-800 mb-2 group-hover:text-emerald-700 transition-colors">
                {gift.name}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-3">
                {gift.description}
              </p>
            </div>

            <div className="border-t border-slate-100 pt-3 mt-2">
              <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold mb-2">
                <TreePine className="w-3.5 h-3.5" />
                <span>Ý nghĩa môi trường:</span>
              </div>
              <p className="text-[11px] text-slate-500 italic bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-100/60">
                "{gift.ecoBenefit}"
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Interactive Reward Calculator / Simulator */}
      <div className="bg-white border border-emerald-200 rounded-2xl p-5 sm:p-6 shadow-xs">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-5 h-5 text-amber-500" />
          <h3 className="text-base font-bold text-slate-800">
            Bộ Mô Phỏng Đổi Quà Trực Tuyến
          </h3>
        </div>
        <p className="text-xs text-slate-600 mb-4">
          Nhập số điểm học sinh đang có để xem các phương án đổi quà thông minh nhất hoặc số điểm còn thiếu:
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
          <div className="w-full sm:w-64">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Số điểm tích lũy của bạn:
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                value={testPoints}
                onChange={(e) => setTestPoints(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full bg-slate-50 border border-slate-300 focus:bg-white focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-base font-bold text-slate-800 outline-none"
              />
              <span className="absolute right-3 top-3 text-xs font-bold text-slate-400">điểm</span>
            </div>
          </div>

          {/* Quick preset chips */}
          <div className="flex flex-wrap items-center gap-2 pt-4 sm:pt-4">
            {[43, 50, 80, 100, 160, 200, 350].map((pts) => (
              <button
                key={pts}
                type="button"
                onClick={() => {
                  setTestPoints(pts);
                  fireSuccessConfetti();
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  testPoints === pts
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 hover:bg-emerald-50 text-slate-700'
                }`}
              >
                {pts} điểm
              </button>
            ))}
          </div>
        </div>

        {/* Results breakdown */}
        <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4 sm:p-5">
          <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider mb-3">
            Gợi ý từ Trạm Trưởng Ảo AI cho {testPoints} điểm:
          </h4>

          {testPoints < 50 ? (
            <div className="flex items-center gap-3 bg-white p-3.5 rounded-xl border border-amber-200 text-amber-800 text-xs">
              <span className="text-2xl">🌱</span>
              <div>
                <div className="font-bold">Bạn đang có {testPoints} điểm!</div>
                <div>
                  Chỉ cần tích thêm <strong>{50 - testPoints} điểm nữa</strong> là đổi được một chiếc{' '}
                  <strong>Bút chì sinh học</strong> siêu xinh rồi đó! Hãy tiếp tục tham gia Dự án khởi nghiệp xanh học đường nhé! 🌱
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-white p-3.5 rounded-xl border border-emerald-100 shadow-2xs">
                  <div className="text-xs text-slate-500 font-semibold mb-1">Cách đổi 1 (Tối ưu nhất):</div>
                  <div className="text-sm font-bold text-emerald-800">
                    {options.notebooks > 0 && `📓 ${options.notebooks} Sổ tay tái chế `}
                    {options.succulents > 0 && `🪴 ${options.succulents} Sen đá `}
                    {options.pencils > 0 && `🌱 ${options.pencils} Bút chì `}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    Còn dư: <strong>{options.leftover} điểm</strong> để dành lần sau.
                  </div>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-emerald-100 shadow-2xs">
                  <div className="text-xs text-slate-500 font-semibold mb-1">Cách đổi 2 (Toàn bộ Bút chì):</div>
                  <div className="text-sm font-bold text-emerald-800">
                    🌱 {Math.floor(testPoints / 50)} Bút chì sinh học
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    Còn dư: <strong>{testPoints % 50} điểm</strong>.
                  </div>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-emerald-100 shadow-2xs">
                  <div className="text-xs text-slate-500 font-semibold mb-1">Mục tiêu kế tiếp:</div>
                  <div className="text-sm font-bold text-amber-800">
                    {testPoints < 100
                      ? `Cần thêm ${100 - testPoints}đ lấy Sen đá 🪴`
                      : testPoints < 200
                      ? `Cần thêm ${200 - testPoints}đ lấy Sổ tay 📓`
                      : `Đã vượt mốc cao nhất! Tiếp tục nhận quà nhân đôi 🎉`}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    Tương đương ~ {testPoints < 100 ? (100 - testPoints) / 10 : (200 - testPoints) / 10} kg giấy vụn
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
