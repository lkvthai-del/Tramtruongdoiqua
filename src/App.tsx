import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { AiStationChat } from './components/AiStationChat';
import { QuickCalculator } from './components/QuickCalculator';
import { StationLedger } from './components/StationLedger';
import { GiftsShowcase } from './components/GiftsShowcase';
import { SortingGuide } from './components/SortingGuide';
import { WasteSubmission } from './types';
import { INITIAL_SUBMISSIONS } from './constants';
import { Check, Sparkles, Heart } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'chat' | 'calculator' | 'ledger' | 'gifts' | 'guide'>('chat');
  const [submissions, setSubmissions] = useState<WasteSubmission[]>(() => {
    try {
      const saved = localStorage.getItem('green_corner_submissions');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load submissions from localStorage', e);
    }
    return INITIAL_SUBMISSIONS;
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem('green_corner_submissions', JSON.stringify(submissions));
    } catch (e) {
      console.error('Failed to save submissions to localStorage', e);
    }
  }, [submissions]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleAddSubmission = (subData: Omit<WasteSubmission, 'id' | 'timestamp'>) => {
    const newSub: WasteSubmission = {
      ...subData,
      id: 'gc-' + Date.now(),
      timestamp: new Date().toLocaleString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    setSubmissions((prev) => [newSub, ...prev]);
    showToast(`Đã lưu giao dịch của bạn ${newSub.studentName} (${newSub.totalPoints}đ) vào Nhật Ký!`);
  };

  const handleDeleteSubmission = (id: string) => {
    setSubmissions((prev) => prev.filter((s) => s.id !== id));
    showToast('Đã xóa dòng giao dịch.');
  };

  const handleClearAll = () => {
    setSubmissions([]);
    showToast('Đã làm trống toàn bộ nhật ký trạm.');
  };

  const handleResetData = () => {
    setSubmissions(INITIAL_SUBMISSIONS);
    showToast('Đã làm mới lại dữ liệu trạm về trạng thái ban đầu!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/60 via-slate-50 to-teal-50/40 text-slate-800 flex flex-col font-sans">
      {/* Header with quick stats & tab bar */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        submissions={submissions}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto pb-12 pt-2">
        {activeTab === 'chat' && (
          <AiStationChat onSaveToLedger={handleAddSubmission} />
        )}

        {activeTab === 'calculator' && (
          <QuickCalculator
            onSaveToLedger={handleAddSubmission}
            submissions={submissions}
          />
        )}

        {activeTab === 'ledger' && (
          <StationLedger
            submissions={submissions}
            onDeleteSubmission={handleDeleteSubmission}
            onClearAll={handleClearAll}
          />
        )}

        {activeTab === 'gifts' && <GiftsShowcase />}

        {activeTab === 'guide' && <SortingGuide />}
      </main>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs sm:text-sm font-semibold px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 border border-slate-700 animate-bounce">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* School Footer */}
      <footer className="border-t border-emerald-100 bg-white/80 backdrop-blur-md py-6 px-4 text-center text-xs text-slate-500">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 font-bold text-slate-700">
            <span>🌱 Green Corner - Trạm Đổi Rác Lấy Quà Xanh</span>
            <span className="text-emerald-700 font-semibold">• THCS Phạm Văn Bảy - Xã Tân Thành Bình - Tỉnh Vĩnh Long</span>
          </div>
          <div className="text-emerald-700 font-bold">
            Dự án khởi nghiệp xanh học đường
          </div>
        </div>
      </footer>
    </div>
  );
}
