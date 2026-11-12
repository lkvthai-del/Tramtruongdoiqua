import React, { useState } from 'react';
import {
  Calculator,
  Save,
  Copy,
  Check,
  Sparkles,
  Gift,
  RotateCcw,
  ArrowRight,
  TrendingUp,
  FileSpreadsheet,
} from 'lucide-react';
import { GIFTS_CATALOG, WASTE_RATES } from '../constants';
import { WasteSubmission } from '../types';
import { fireBigCelebration, fireSuccessConfetti } from '../utils/confetti';
import { exportToExcel } from '../utils/excelExport';

interface QuickCalculatorProps {
  onSaveToLedger: (sub: Omit<WasteSubmission, 'id' | 'timestamp'>) => void;
  submissions?: WasteSubmission[];
}

export const QuickCalculator: React.FC<QuickCalculatorProps> = ({ onSaveToLedger, submissions = [] }) => {
  const [studentName, setStudentName] = useState('');
  const [studentClass, setStudentClass] = useState('7/2');
  const [paperKg, setPaperKg] = useState<number | ''>('');
  const [plasticKg, setPlasticKg] = useState<number | ''>('');
  const [aluminumKg, setAluminumKg] = useState<number | ''>('');
  const [redeemedGift, setRedeemedGift] = useState<string>('');
  const [note, setNote] = useState('');

  const [aiCheer, setAiCheer] = useState<string | null>(null);
  const [loadingCheer, setLoadingCheer] = useState(false);
  const [copied, setCopied] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Numeric weights
  const numPaper = typeof paperKg === 'number' ? paperKg : 0;
  const numPlastic = typeof plasticKg === 'number' ? plasticKg : 0;
  const numAluminum = typeof aluminumKg === 'number' ? aluminumKg : 0;

  // Points calculation as mandated:
  // Giấy 10đ/kg, Nhựa 15đ/kg, Nhôm 30đ/kg, làm tròn số nguyên gần nhất
  const paperPoints = numPaper * 10;
  const plasticPoints = numPlastic * 15;
  const aluminumPoints = numAluminum * 30;
  const rawTotal = paperPoints + plasticPoints + aluminumPoints;
  const totalPoints = Math.round(rawTotal);

  // Selected gift points deduction
  const selectedGiftObj = GIFTS_CATALOG.find((g) => g.id === redeemedGift);
  const giftCost = selectedGiftObj ? selectedGiftObj.pointsRequired : 0;
  const pointsRemaining = Math.max(0, totalPoints - giftCost);

  // Standard CSV line: [Tên học sinh], [Lớp], [Số kg Giấy], [Số kg Nhựa], [Số kg Nhôm], [Tổng điểm]
  const csvLine = `${studentName.trim() || 'Học sinh'}, ${studentClass.trim() || '7/2'}, ${numPaper}, ${numPlastic}, ${numAluminum}, ${totalPoints}`;

  const handleReset = () => {
    setStudentName('');
    setPaperKg('');
    setPlasticKg('');
    setAluminumKg('');
    setRedeemedGift('');
    setNote('');
    setAiCheer(null);
    setSavedSuccess(false);
  };

  const handleSaveAndCopy = () => {
    if (!studentName.trim()) {
      alert('Vui lòng nhập tên bạn học sinh nhé!');
      return;
    }
    if (totalPoints <= 0) {
      alert('Vui lòng nhập khối lượng rác nộp (ít nhất 1 loại giấy, nhựa hoặc lon nhôm)!');
      return;
    }

    // Save to ledger
    onSaveToLedger({
      studentName: studentName.trim(),
      studentClass: studentClass.trim(),
      paperKg: numPaper,
      plasticKg: numPlastic,
      aluminumKg: numAluminum,
      paperPoints,
      plasticPoints,
      aluminumPoints,
      totalPoints,
      redeemedGift: selectedGiftObj ? `${selectedGiftObj.name} (${selectedGiftObj.pointsRequired}đ)` : undefined,
      pointsRemaining: selectedGiftObj ? pointsRemaining : undefined,
      csvLine,
      note: note.trim() || undefined,
    });

    // Copy to clipboard
    navigator.clipboard.writeText(csvLine);
    setCopied(true);
    setSavedSuccess(true);
    fireBigCelebration();

    setTimeout(() => {
      setCopied(false);
    }, 3000);
  };

  const handleGetAiCheer = async () => {
    if (totalPoints <= 0) {
      alert('Hãy nhập khối lượng rác trước để Trạm Trưởng AI gửi lời khen phù hợp nha!');
      return;
    }

    setLoadingCheer(true);
    try {
      const res = await fetch('/api/generate-cheer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentName: studentName.trim() || 'Bạn học sinh',
          studentClass: studentClass.trim(),
          paperKg: numPaper,
          plasticKg: numPlastic,
          aluminumKg: numAluminum,
          totalPoints,
        }),
      });
      const data = await res.json();
      setAiCheer(data.cheer || 'Cảm ơn bạn đã bảo vệ môi trường!');
      fireSuccessConfetti();
    } catch {
      setAiCheer(
        `Yooo! Bạn ${studentName || 'bạn'} lớp ${studentClass} đã tích được ${totalPoints} điểm! Cảm ơn bạn đã tham gia Dự án khởi nghiệp xanh học đường nha! 🌿✨`
      );
    } finally {
      setLoadingCheer(false);
    }
  };

  const addWeight = (type: 'paper' | 'plastic' | 'aluminum', amount: number) => {
    if (type === 'paper') {
      setPaperKg((prev) => +(Number(prev || 0) + amount).toFixed(2));
    } else if (type === 'plastic') {
      setPlasticKg((prev) => +(Number(prev || 0) + amount).toFixed(2));
    } else {
      setAluminumKg((prev) => +(Number(prev || 0) + amount).toFixed(2));
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-3 sm:p-6 space-y-6">
      {/* Intro banner */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-green-700 text-white rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-white/20 backdrop-blur-md">
              <Calculator className="w-5 h-5 text-emerald-100" />
            </span>
            <h2 className="text-xl font-extrabold tracking-tight">Quầy Cân Điểm Nhanh Tại Trạm</h2>
          </div>
          <p className="text-xs sm:text-sm text-emerald-100 max-w-2xl">
            Dành cho Ban Quản Trị trực quầy vào giờ ra chơi hoặc giờ chào cờ: cân ký, bấm nút tính điểm tức thì, đổi quà ngay và xuất dòng chuẩn Google Sheets chỉ với 1 cú click!
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-emerald-50 border border-white/20 transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            Làm mới quầy
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: Student info & Waste Weights */}
        <div className="lg:col-span-7 space-y-5">
          {/* Card: Student Identity */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-black">
                1
              </span>
              Thông tin học sinh nộp rác
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div className="sm:col-span-8">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Họ và tên học sinh <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="Ví dụ: Nguyễn Văn A, Lê Hoàng Khôi..."
                  className="w-full bg-slate-50 border border-slate-300 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-xl px-3.5 py-2.5 text-sm outline-none transition-all"
                />
              </div>

              <div className="sm:col-span-4">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Lớp (THCS) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={studentClass}
                  onChange={(e) => setStudentClass(e.target.value)}
                  placeholder="Ví dụ: 7/2, 6/1, 8/3, 9/4..."
                  className="w-full bg-slate-50 border border-slate-300 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-xl px-3.5 py-2.5 text-sm outline-none transition-all font-medium"
                />
                <div className="flex gap-1.5 mt-1.5 overflow-x-auto pb-0.5">
                  {['6/1', '7/2', '8/3', '9/4'].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setStudentClass(c)}
                      className={`px-2 py-0.5 rounded text-[11px] font-bold border transition-all cursor-pointer ${
                        studentClass === c
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-200'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Card: Waste Weights Input with Quick Add Steppers */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-black">
                2
              </span>
              Khối lượng rác mang đến cân
            </h3>

            {/* Paper */}
            <div className="border border-amber-200 bg-amber-50/40 rounded-xl p-3.5 transition-all">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">📚</span>
                  <div>
                    <div className="font-bold text-sm text-amber-900">Giấy vụn, sách báo, carton</div>
                    <div className="text-[11px] text-amber-700">Tỷ lệ quy đổi: 1 kg = 10 điểm</div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-amber-700 font-medium">Quy đổi: </span>
                  <span className="font-extrabold text-amber-900 text-base">{paperPoints} điểm</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={paperKg}
                    onChange={(e) => setPaperKg(e.target.value === '' ? '' : parseFloat(e.target.value))}
                    placeholder="0.0"
                    className="w-full bg-white border border-amber-300 rounded-lg px-3 py-2 text-sm font-semibold text-slate-800 outline-none focus:border-amber-500"
                  />
                  <span className="absolute right-3 top-2 text-xs font-bold text-amber-700">kg</span>
                </div>
                <div className="flex gap-1">
                  {[0.5, 1, 2, 5].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => addWeight('paper', amt)}
                      className="px-2 py-1 bg-white hover:bg-amber-100 border border-amber-300 text-amber-800 text-xs font-bold rounded-md transition-all cursor-pointer"
                    >
                      +{amt}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Plastic */}
            <div className="border border-sky-200 bg-sky-50/40 rounded-xl p-3.5 transition-all">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🥤</span>
                  <div>
                    <div className="font-bold text-sm text-sky-900">Chai nhựa, ly PET, can nhựa sạch</div>
                    <div className="text-[11px] text-sky-700">Tỷ lệ quy đổi: 1 kg = 15 điểm</div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-sky-700 font-medium">Quy đổi: </span>
                  <span className="font-extrabold text-sky-900 text-base">{plasticPoints} điểm</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={plasticKg}
                    onChange={(e) => setPlasticKg(e.target.value === '' ? '' : parseFloat(e.target.value))}
                    placeholder="0.0"
                    className="w-full bg-white border border-sky-300 rounded-lg px-3 py-2 text-sm font-semibold text-slate-800 outline-none focus:border-sky-500"
                  />
                  <span className="absolute right-3 top-2 text-xs font-bold text-sky-700">kg</span>
                </div>
                <div className="flex gap-1">
                  {[0.5, 1, 2, 3].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => addWeight('plastic', amt)}
                      className="px-2 py-1 bg-white hover:bg-sky-100 border border-sky-300 text-sky-800 text-xs font-bold rounded-md transition-all cursor-pointer"
                    >
                      +{amt}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Aluminum */}
            <div className="border border-emerald-200 bg-emerald-50/40 rounded-xl p-3.5 transition-all">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🥫</span>
                  <div>
                    <div className="font-bold text-sm text-emerald-900">Vỏ lon nhôm (nước ngọt, bia)</div>
                    <div className="text-[11px] text-emerald-700">Tỷ lệ quy đổi: 1 kg = 30 điểm</div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-emerald-700 font-medium">Quy đổi: </span>
                  <span className="font-extrabold text-emerald-900 text-base">{aluminumPoints} điểm</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={aluminumKg}
                    onChange={(e) => setAluminumKg(e.target.value === '' ? '' : parseFloat(e.target.value))}
                    placeholder="0.0"
                    className="w-full bg-white border border-emerald-300 rounded-lg px-3 py-2 text-sm font-semibold text-slate-800 outline-none focus:border-emerald-500"
                  />
                  <span className="absolute right-3 top-2 text-xs font-bold text-emerald-700">kg</span>
                </div>
                <div className="flex gap-1">
                  {[0.2, 0.5, 1, 2].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => addWeight('aluminum', amt)}
                      className="px-2 py-1 bg-white hover:bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-bold rounded-md transition-all cursor-pointer"
                    >
                      +{amt}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Battery */}
          </div>

          {/* Optional Note & Gift Redemption at Counter */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-black">
                3
              </span>
              Đổi quà trực tiếp tại quầy (Tùy chọn)
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Học sinh muốn dùng điểm đổi quà ngay hôm nay?
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setRedeemedGift('')}
                  className={`p-2.5 rounded-xl border text-xs font-semibold text-left transition-all cursor-pointer ${
                    redeemedGift === ''
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="font-bold">Chưa đổi (Tích lũy)</div>
                  <div className="text-[11px] text-slate-500">Giữ nguyên {totalPoints} điểm</div>
                </button>

                {GIFTS_CATALOG.map((g) => {
                  const eligible = totalPoints >= g.pointsRequired;
                  const isSelected = redeemedGift === g.id;
                  return (
                    <button
                      key={g.id}
                      type="button"
                      disabled={!eligible}
                      onClick={() => setRedeemedGift(g.id)}
                      className={`p-2.5 rounded-xl border text-xs text-left transition-all cursor-pointer ${
                        !eligible
                          ? 'opacity-40 bg-slate-100 border-slate-200 cursor-not-allowed'
                          : isSelected
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20 font-bold'
                          : 'border-slate-200 hover:bg-emerald-50/50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold">{g.name}</span>
                        <span>{g.image}</span>
                      </div>
                      <div className="text-[11px] text-emerald-700 font-semibold">
                        Cần {g.pointsRequired} điểm
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Ghi chú thêm (ví dụ: Chi đội 7A1, phong trào Kế hoạch nhỏ...)
              </label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Ghi chú thêm nếu cần..."
                className="w-full bg-slate-50 border border-slate-300 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-xl px-3.5 py-2 text-xs outline-none transition-all"
              />
            </div>
          </div>
        </div>

        {/* Right Summary Column: Total Points, Milestones, AI Cheer, Google Sheets Export */}
        <div className="lg:col-span-5 space-y-5">
          {/* Main Calculation Result Box */}
          <div className="bg-gradient-to-br from-emerald-600 to-teal-800 text-white rounded-2xl p-5 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-6 -mt-6 w-32 h-32 rounded-full bg-white/10 blur-xl pointer-events-none" />

            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase tracking-wider font-bold text-emerald-200">
                Tổng Điểm Tích Lũy
              </span>
              <span className="bg-white/20 text-white text-[11px] px-2.5 py-0.5 rounded-full font-bold">
                Làm tròn số nguyên
              </span>
            </div>

            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-5xl font-black tracking-tight">{totalPoints}</span>
              <span className="text-lg font-bold text-emerald-200">điểm</span>
              {rawTotal !== totalPoints && (
                <span className="text-xs text-emerald-300 ml-2">
                  (Từ {rawTotal.toFixed(1)} điểm lẻ)
                </span>
              )}
            </div>

            {/* Breakdown mini badges */}
            <div className="grid grid-cols-3 gap-2 bg-black/15 p-2.5 rounded-xl text-center text-xs mb-4">
              <div>
                <div className="text-[10px] text-emerald-200">Giấy ({numPaper}kg)</div>
                <div className="font-bold text-sm">+{paperPoints}đ</div>
              </div>
              <div className="border-x border-white/20">
                <div className="text-[10px] text-emerald-200">Nhựa ({numPlastic}kg)</div>
                <div className="font-bold text-sm">+{plasticPoints}đ</div>
              </div>
              <div>
                <div className="text-[10px] text-emerald-200">Lon ({numAluminum}kg)</div>
                <div className="font-bold text-sm">+{aluminumPoints}đ</div>
              </div>
            </div>

            {/* Gift Milestones Progress */}
            <div className="space-y-2 border-t border-white/20 pt-3">
              <div className="text-xs font-bold text-emerald-100 flex items-center justify-between">
                <span>Mốc quà tặng tiếp theo:</span>
                <span>
                  {totalPoints >= 200
                    ? '🎉 Đạt mốc cao nhất!'
                    : totalPoints >= 100
                    ? `Cần thêm ${200 - totalPoints}đ để lấy Sổ tay`
                    : totalPoints >= 50
                    ? `Cần thêm ${100 - totalPoints}đ để lấy Sen đá`
                    : `Cần thêm ${50 - totalPoints}đ để lấy Bút chì`}
                </span>
              </div>

              {/* Progress bar to 200 points */}
              <div className="w-full bg-black/25 rounded-full h-3 p-0.5">
                <div
                  className="bg-gradient-to-r from-amber-400 to-emerald-300 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (totalPoints / 200) * 100)}%` }}
                />
              </div>

              <div className="flex justify-between text-[10px] text-emerald-200 pt-0.5 font-bold">
                <span className={totalPoints >= 50 ? 'text-amber-300' : ''}>50đ: Bút chì 🌱</span>
                <span className={totalPoints >= 100 ? 'text-amber-300' : ''}>100đ: Sen đá 🪴</span>
                <span className={totalPoints >= 200 ? 'text-amber-300' : ''}>200đ: Sổ tay 📓</span>
              </div>
            </div>

            {selectedGiftObj && (
              <div className="mt-3 bg-white/20 rounded-xl p-2.5 text-xs text-emerald-50 flex items-center justify-between">
                <span>Đã chọn đổi: <strong>{selectedGiftObj.name}</strong> (-{selectedGiftObj.pointsRequired}đ)</span>
                <span className="font-bold">Còn dư: {pointsRemaining}đ</span>
              </div>
            )}
          </div>

          {/* Ready-to-Copy CSV Card for Google Sheets */}
          <div className="bg-white border border-emerald-200 rounded-2xl p-4 sm:p-5 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900 uppercase">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                Dòng CSV chuẩn cho Google Sheets:
              </div>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                6 Cột
              </span>
            </div>

            <p className="text-[11px] text-slate-500 mb-2">
              Cấu trúc: <code>[Tên học sinh], [Lớp], [Kg Giấy], [Kg Nhựa], [Kg Nhôm], [Tổng điểm]</code>
            </p>

            <div className="bg-slate-900 text-emerald-400 font-mono text-xs p-3 rounded-xl overflow-x-auto border border-slate-800 flex items-center justify-between gap-2 mb-3">
              <span className="truncate">{csvLine}</span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(csvLine);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2500);
                }}
                className="shrink-0 bg-emerald-700 hover:bg-emerald-600 text-white px-2.5 py-1 rounded text-[11px] font-sans flex items-center gap-1 transition-all cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Đã copy' : 'Copy'}
              </button>
            </div>

            {/* Primary Action Button: Save to Ledger & Copy */}
            <button
              type="button"
              onClick={handleSaveAndCopy}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl text-sm transition-all shadow-md shadow-emerald-700/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              Lưu Vào Nhật Ký & Copy Sang Google Sheets
            </button>

            {submissions.length > 0 && (
              <button
                type="button"
                onClick={() => exportToExcel(submissions)}
                className="w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold py-2.5 px-4 rounded-xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                Xuất Báo Cáo Ra File Excel (.xlsx) ({submissions.length} lượt)
              </button>
            )}

            {savedSuccess && (
              <div className="mt-2 text-center text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 py-1.5 rounded-lg flex items-center justify-center gap-1">
                <Check className="w-3.5 h-3.5" />
                Đã lưu thành công và sao chép vào bộ nhớ tạm!
              </div>
            )}
          </div>

          {/* AI Encouragement Box ("Lời khen từ Trạm Trưởng AI") */}
          <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4 sm:p-5 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                Trạm Trưởng Ảo AI Cổ Vũ Học Sinh
              </div>
              <button
                type="button"
                onClick={handleGetAiCheer}
                disabled={loadingCheer}
                className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 bg-emerald-100 hover:bg-emerald-200 px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer"
              >
                {loadingCheer ? 'Đang viết...' : 'Tạo lời khen AI'}
              </button>
            </div>

            {aiCheer ? (
              <div className="bg-white p-3 rounded-xl border border-emerald-200 text-xs text-slate-700 leading-relaxed italic relative">
                "{aiCheer}"
              </div>
            ) : (
              <p className="text-xs text-slate-500 leading-relaxed">
                Bấm nút "Tạo lời khen AI" để Trạm Trưởng AI gửi lời động viên siêu dễ thương về tinh thần bảo vệ dòng sông Cổ Chiên Vĩnh Long cho bạn học sinh này nhé! 🌱
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
