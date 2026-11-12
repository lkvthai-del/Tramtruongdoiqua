import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  Copy,
  Check,
  PlusCircle,
  Volume2,
  VolumeX,
  RefreshCw,
  Gift,
  HelpCircle,
  RotateCcw,
} from 'lucide-react';
import { ChatMessage, WasteSubmission } from '../types';
import { QUICK_PROMPTS } from '../constants';
import { fireSuccessConfetti } from '../utils/confetti';
import { speakText, stopSpeaking } from '../utils/speech';

interface AiStationChatProps {
  onSaveToLedger: (sub: Omit<WasteSubmission, 'id' | 'timestamp'>) => void;
}

export const AiStationChat: React.FC<AiStationChatProps> = ({ onSaveToLedger }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      timestamp: 'Vừa xong',
      content: `Yooo! Chào mừng các bạn học sinh và Ban quản trị đến với Green Corner - Trạm Đổi Rác Lấy Quà Xanh nha! 🌱🎉

Mình là Trạm Trưởng Ảo AI đây! Các bạn chỉ cần nhập thông tin học sinh và khối lượng rác mang đến (hoặc gõ tự nhiên như: *"Bạn Nguyễn Văn A lớp 7/2 nộp 2kg giấy vụn và 1.5kg chai nhựa"*). 

Quy tắc đổi điểm: Giấy = 10đ/kg • Nhựa = 15đ/kg • Lon nhôm = 30đ/kg!

Mình sẽ tính toán điểm chuẩn xác, tư vấn quà tặng và xuất sẵn dòng dữ liệu chuẩn Google Sheets cho các bạn copy ngay lập tức! Chúc các bạn một ngày tràn đầy năng lượng cùng Dự án khởi nghiệp xanh học đường! 🌱✨`,
    },
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [addedIds, setAddedIds] = useState<Record<string, boolean>>({});
  const [isSpeaking, setIsSpeaking] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const handleResetChat = () => {
    setMessages([
      {
        id: 'welcome-' + Date.now(),
        role: 'model',
        timestamp: 'Vừa xong',
        content: `Yooo! Chào mừng các bạn học sinh và Ban quản trị đến với Green Corner - Trạm Đổi Rác Lấy Quà Xanh nha! 🌱🎉

Mình là Trạm Trưởng Ảo AI đây! Các bạn chỉ cần nhập thông tin học sinh và khối lượng rác mang đến (hoặc gõ tự nhiên như: *"Bạn Nguyễn Văn A lớp 7/2 nộp 2kg giấy vụn và 1.5kg chai nhựa"*). 

Quy tắc đổi điểm: Giấy = 10đ/kg • Nhựa = 15đ/kg • Lon nhôm = 30đ/kg!

Mình sẽ tính toán điểm chuẩn xác, tư vấn quà tặng và xuất sẵn dòng dữ liệu chuẩn Google Sheets cho các bạn copy ngay lập tức! Chúc các bạn một ngày tràn đầy năng lượng cùng Dự án khởi nghiệp xanh học đường! 🌱✨`,
      },
    ]);
    setInput('');
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (textToSend?: string) => {
    const promptText = (textToSend || input).trim();
    if (!promptText || isLoading) return;

    const userMsgId = 'u-' + Date.now();
    const userMsg: ChatMessage = {
      id: userMsgId,
      role: 'user',
      content: promptText,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: promptText }),
      });

      if (!res.ok) {
        throw new Error('Máy chủ Trạm Xanh bận');
      }

      const data = await res.json();
      const modelMsgId = 'm-' + Date.now();

      const modelMsg: ChatMessage = {
        id: modelMsgId,
        role: 'model',
        content: data.reply,
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        parsedData: data.parsedData,
      };

      setMessages((prev) => [...prev, modelMsg]);

      // If it yielded points, fire celebratory confetti
      if (data.parsedData && data.parsedData.totalPoints > 0) {
        fireSuccessConfetti();
      }
    } catch (err: any) {
      console.error('Chat error:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: 'err-' + Date.now(),
          role: 'model',
          timestamp: 'Vừa xong',
          content:
            'Ôi dường như đường truyền mạng ở Vĩnh Long bị chập chờn một xíu! Nhưng đừng lo, bạn có thể thử nhập lại hoặc sử dụng tab "Cân Điểm Nhanh Tại Trạm" để tính điểm tức thì nhé! 🌱',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyCsv = (csvLine: string, id: string) => {
    navigator.clipboard.writeText(csvLine);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleSaveParsedToLedger = (parsed: NonNullable<ChatMessage['parsedData']>, msgId: string) => {
    const paperPoints = parsed.paperKg * 10;
    const plasticPoints = parsed.plasticKg * 15;
    const aluminumPoints = parsed.aluminumKg * 30;

    onSaveToLedger({
      studentName: parsed.studentName,
      studentClass: parsed.studentClass,
      paperKg: parsed.paperKg,
      plasticKg: parsed.plasticKg,
      aluminumKg: parsed.aluminumKg,
      paperPoints,
      plasticPoints,
      aluminumPoints,
      totalPoints: parsed.totalPoints,
      csvLine: parsed.csvLine,
      note: 'Nhập qua Trạm Trưởng AI',
    });

    setAddedIds((prev) => ({ ...prev, [msgId]: true }));
    fireSuccessConfetti();
  };

  const handleToggleVoice = (text: string) => {
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      speakText(text);
      // Auto reset speaking state after rough duration
      const duration = Math.min(15000, (text.length / 10) * 1000);
      setTimeout(() => setIsSpeaking(false), duration);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] min-h-[620px] max-w-5xl mx-auto p-2 sm:p-4">
      {/* Top AI Station Officer Banner */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-green-700 text-white rounded-2xl p-4 mb-3 shadow-sm border border-emerald-500/30 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl border-2 border-emerald-200 shadow-inner">
              🌱
            </div>
            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-white ring-1 ring-emerald-600"></span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-base sm:text-lg">Trạm Trưởng Ảo AI - Bé Mầm Xanh</h2>
              <span className="bg-emerald-500/40 text-emerald-100 text-[11px] px-2 py-0.5 rounded-full font-semibold border border-emerald-300/30">
                Đang trực trạm
              </span>
            </div>
            <p className="text-xs text-emerald-100/90">
              Quy tắc chuẩn: 1kg Giấy = 10đ • 1kg Chai nhựa = 15đ • 1kg Lon nhôm = 30đ (làm tròn số nguyên)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden lg:block text-xs text-emerald-100 text-right">
            <div>Mục tiêu quà tặng:</div>
            <div className="font-bold text-emerald-50">50đ Bút chì • 100đ Sen đá • 200đ Sổ tay</div>
          </div>
          <button
            onClick={handleResetChat}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-emerald-50 border border-white/20 transition-all cursor-pointer"
            title="Làm mới cuộc trò chuyện"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Làm mới</span>
          </button>
        </div>
      </div>

      {/* Quick Prompts Row */}
      <div className="mb-2">
        <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          Câu mẫu nhập nhanh cho Ban quản trị (Bấm để thử ngay):
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1.5 no-scrollbar">
          {QUICK_PROMPTS.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(prompt)}
              className="text-xs bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200 hover:border-emerald-300 rounded-xl px-3 py-1.5 whitespace-nowrap transition-all shadow-2xs font-medium cursor-pointer"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 bg-white/80 backdrop-blur-sm border border-emerald-100/80 rounded-2xl p-4 overflow-y-auto shadow-inner space-y-4">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-lg text-white shrink-0 shadow-xs">
                  🌱
                </div>
              )}

              <div
                className={`max-w-[88%] sm:max-w-[78%] rounded-2xl px-4 py-3.5 shadow-2xs ${
                  isUser
                    ? 'bg-emerald-600 text-white rounded-tr-xs'
                    : 'bg-emerald-50/60 border border-emerald-100 text-slate-800 rounded-tl-xs'
                }`}
              >
                {/* Header row */}
                <div className="flex items-center justify-between gap-4 mb-1.5 text-[11px] opacity-80">
                  <span className="font-bold">
                    {isUser ? 'Ban Quản Trị / Học Sinh' : 'Trạm Trưởng Ảo AI (Green Corner)'}
                  </span>
                  <div className="flex items-center gap-2">
                    <span>{msg.timestamp}</span>
                    {!isUser && (
                      <button
                        onClick={() => handleToggleVoice(msg.content)}
                        title="Nghe Trạm Trưởng AI đọc"
                        className="text-emerald-700 hover:text-emerald-900 p-0.5 rounded cursor-pointer"
                      >
                        {isSpeaking ? (
                          <VolumeX className="w-3.5 h-3.5 text-red-500" />
                        ) : (
                          <Volume2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Content body */}
                <div className="text-sm leading-relaxed whitespace-pre-wrap font-sans">
                  {msg.content}
                </div>

                {/* Structured CSV & Action Card for Model Responses */}
                {!isUser && msg.parsedData && msg.parsedData.csvLine && (
                  <div className="mt-3 pt-3 border-t border-emerald-200/80 bg-white/90 rounded-xl p-3 border">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                        <Gift className="w-3.5 h-3.5 text-emerald-600" />
                        Dữ liệu chuẩn để copy vào Google Sheets:
                      </div>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-semibold">
                        Định dạng CSV
                      </span>
                    </div>

                    {/* CSV raw line with highlight */}
                    <div className="bg-slate-900 text-emerald-400 font-mono text-xs p-2.5 rounded-lg overflow-x-auto flex items-center justify-between gap-2 border border-slate-800">
                      <code>{msg.parsedData.csvLine}</code>
                      <button
                        onClick={() => handleCopyCsv(msg.parsedData!.csvLine, msg.id)}
                        className="flex items-center gap-1 text-[11px] bg-emerald-700 hover:bg-emerald-600 text-white px-2.5 py-1 rounded font-sans transition-all shrink-0 cursor-pointer"
                      >
                        {copiedId === msg.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-300" />
                            Đã chép!
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            Copy dòng này
                          </>
                        )}
                      </button>
                    </div>

                    {/* Action buttons: Save to station ledger */}
                    <div className="mt-2.5 flex items-center justify-between text-xs pt-1">
                      <div className="text-slate-500 text-[11px]">
                        Cột: [Tên], [Lớp], [Kg Giấy], [Kg Nhựa], [Kg Nhôm], [Tổng Điểm]
                      </div>
                      <button
                        onClick={() => handleSaveParsedToLedger(msg.parsedData!, msg.id)}
                        disabled={addedIds[msg.id]}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          addedIds[msg.id]
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800'
                        }`}
                      >
                        {addedIds[msg.id] ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            Đã lưu vào Nhật Ký
                          </>
                        ) : (
                          <>
                            <PlusCircle className="w-3.5 h-3.5" />
                            Lưu vào Nhật Ký Trạm
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex gap-3 items-center">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white shrink-0 animate-pulse">
              🌱
            </div>
            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl rounded-tl-xs px-4 py-3 text-xs text-emerald-800 flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-600" />
              <span>Trạm Trưởng AI đang tính toán điểm và quy đổi quà xanh cho bạn...</span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Chat Input Bar */}
      <div className="mt-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="relative flex items-center"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Nhập tự nhiên: Ví dụ 'Bạn Nguyễn Văn A lớp 7/2 nộp 2kg giấy vụn và 1.5kg chai nhựa'..."
            disabled={isLoading}
            className="w-full bg-white border border-slate-300 focus:border-emerald-500 focus:ring-3 focus:ring-emerald-500/20 rounded-2xl pl-4 pr-28 py-3.5 text-sm outline-none transition-all placeholder:text-slate-400 text-slate-800 shadow-xs"
          />

          <div className="absolute right-2 flex items-center gap-1.5">
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 shadow-sm cursor-pointer"
            >
              <span>Gửi</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
        <div className="flex items-center justify-between px-2 pt-1.5 text-[11px] text-slate-500">
          <span>💡 Mẹo: Bạn có thể nhập khối lượng thập phân (ví dụ 0.5kg vỏ lon, 1.2kg giấy)</span>
          <span className="text-emerald-700 font-medium">Dự án khởi nghiệp xanh học đường 🌱</span>
        </div>
      </div>
    </div>
  );
};
