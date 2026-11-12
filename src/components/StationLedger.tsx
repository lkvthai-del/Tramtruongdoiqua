import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Download,
  Copy,
  Check,
  Search,
  Trash2,
  ExternalLink,
  Layers,
  ArrowUpDown,
  Filter,
  FileCode,
  RotateCcw,
} from 'lucide-react';
import { WasteSubmission } from '../types';
import { exportToExcel } from '../utils/excelExport';

interface StationLedgerProps {
  submissions: WasteSubmission[];
  onDeleteSubmission: (id: string) => void;
  onClearAll: () => void;
}

export const StationLedger: React.FC<StationLedgerProps> = ({
  submissions,
  onDeleteSubmission,
  onClearAll,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [gradeFilter, setGradeFilter] = useState<string>('all');
  const [copiedBatch, setCopiedBatch] = useState(false);
  const [copiedRowId, setCopiedRowId] = useState<string | null>(null);

  // Filter submissions
  const filteredSubmissions = submissions.filter((sub) => {
    const matchesSearch =
      sub.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.studentClass.toLowerCase().includes(searchTerm.toLowerCase());

    if (gradeFilter === 'all') return matchesSearch;
    return matchesSearch && sub.studentClass.startsWith(gradeFilter);
  });

  // Calculate totals
  const totalPaper = submissions.reduce((acc, curr) => acc + curr.paperKg, 0);
  const totalPlastic = submissions.reduce((acc, curr) => acc + curr.plasticKg, 0);
  const totalAluminum = submissions.reduce((acc, curr) => acc + curr.aluminumKg, 0);
  const totalPoints = submissions.reduce((acc, curr) => acc + curr.totalPoints, 0);

  // Copy entire dataset in standard Google Sheets format (TSV so pasting in Google Sheets pastes into columns directly!)
  const handleCopyForGoogleSheets = () => {
    // Header line
    let tsv = 'Tên học sinh\tLớp\tSố kg Giấy\tSố kg Nhựa\tSố kg Nhôm\tTổng điểm\tQuà đã đổi\tThời gian\n';
    submissions.forEach((s) => {
      tsv += `${s.studentName}\t${s.studentClass}\t${s.paperKg}\t${s.plasticKg}\t${s.aluminumKg}\t${s.totalPoints}\t${s.redeemedGift || 'Tích lũy'}\t${s.timestamp}\n`;
    });

    navigator.clipboard.writeText(tsv);
    setCopiedBatch(true);
    setTimeout(() => setCopiedBatch(false), 2500);
  };

  // Download raw CSV file
  const handleDownloadCsv = () => {
    let csv = 'Tên học sinh,Lớp,Số kg Giấy,Số kg Nhựa,Số kg Nhôm,Tổng điểm,Quà đã đổi,Thời gian\n';
    submissions.forEach((s) => {
      csv += `"${s.studentName}","${s.studentClass}",${s.paperKg},${s.plasticKg},${s.aluminumKg},${s.totalPoints},"${s.redeemedGift || 'Tích lũy'}","${s.timestamp}"\n`;
    });

    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Green_Corner_THCS_Pham_Van_Bay_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopySingleCsv = (line: string, id: string) => {
    navigator.clipboard.writeText(line);
    setCopiedRowId(id);
    setTimeout(() => setCopiedRowId(null), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto p-3 sm:p-6 space-y-6">
      {/* Top Banner with Sheets integration guidance */}
      <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-green-800 text-white rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-white/20 backdrop-blur-md">
              <FileSpreadsheet className="w-5 h-5 text-emerald-200" />
            </span>
            <h2 className="text-xl font-extrabold tracking-tight">
              Nhật Ký Giao Dịch & Xuất Google Sheets
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-emerald-100 max-w-2xl">
            Tất cả dữ liệu được chuẩn hóa theo quy định: <code>[Tên học sinh], [Lớp], [Số kg Giấy], [Số kg Nhựa], [Số kg Nhôm], [Tổng điểm]</code>. Ban Quản Trị chỉ cần bấm "Sao chép toàn bộ" rồi dán trực tiếp (Ctrl+V) vào bảng tính Google Sheets của dự án!
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => exportToExcel(filteredSubmissions)}
            className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-white font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm shadow-md transition-all cursor-pointer border border-emerald-300/40"
            title="Tải toàn bộ dữ liệu dưới dạng file Microsoft Excel (.xlsx)"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-100" />
            <span>Xuất File Excel (.xlsx)</span>
          </button>

          <button
            onClick={handleCopyForGoogleSheets}
            className="flex items-center gap-1.5 bg-white text-emerald-800 hover:bg-emerald-50 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-md transition-all cursor-pointer"
          >
            {copiedBatch ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                Đã chép vào Clipboard!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-emerald-700" />
                Sao chép dán vào Google Sheets
              </>
            )}
          </button>

          <button
            onClick={handleDownloadCsv}
            className="flex items-center gap-1.5 bg-emerald-600/80 hover:bg-emerald-600 text-white border border-emerald-400/40 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Tải CSV (.csv)
          </button>
        </div>
      </div>

      {/* Aggregate Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white border border-amber-200/80 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold text-amber-700 uppercase mb-1">
            <span>Giấy Vụn (x10đ)</span>
            <span>📚</span>
          </div>
          <div className="text-2xl font-black text-slate-800">
            {totalPaper.toLocaleString('vi-VN', { maximumFractionDigits: 1 })}{' '}
            <span className="text-xs font-semibold text-slate-500">kg</span>
          </div>
          <div className="text-[11px] text-amber-700 font-semibold mt-1">
            = {(totalPaper * 10).toLocaleString('vi-VN')} điểm phát hành
          </div>
        </div>

        <div className="bg-white border border-sky-200/80 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold text-sky-700 uppercase mb-1">
            <span>Chai Nhựa (x15đ)</span>
            <span>🥤</span>
          </div>
          <div className="text-2xl font-black text-slate-800">
            {totalPlastic.toLocaleString('vi-VN', { maximumFractionDigits: 1 })}{' '}
            <span className="text-xs font-semibold text-slate-500">kg</span>
          </div>
          <div className="text-[11px] text-sky-700 font-semibold mt-1">
            = {(totalPlastic * 15).toLocaleString('vi-VN')} điểm phát hành
          </div>
        </div>

        <div className="bg-white border border-emerald-200/80 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold text-emerald-700 uppercase mb-1">
            <span>Lon Nhôm (x30đ)</span>
            <span>🥫</span>
          </div>
          <div className="text-2xl font-black text-slate-800">
            {totalAluminum.toLocaleString('vi-VN', { maximumFractionDigits: 1 })}{' '}
            <span className="text-xs font-semibold text-slate-500">kg</span>
          </div>
          <div className="text-[11px] text-emerald-700 font-semibold mt-1">
            = {(totalAluminum * 30).toLocaleString('vi-VN')} điểm phát hành
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold text-emerald-100 uppercase mb-1">
            <span>Tổng Điểm Đã Cấp</span>
            <span>🌟</span>
          </div>
          <div className="text-2xl font-black text-white">
            {totalPoints.toLocaleString('vi-VN')}{' '}
            <span className="text-xs font-semibold text-emerald-200">điểm</span>
          </div>
          <div className="text-[11px] text-emerald-200 mt-1">
            Từ {submissions.length} lượt học sinh tham gia
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo tên học sinh hoặc lớp..."
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 rounded-xl outline-none transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto justify-end">
          <div className="flex items-center gap-1 text-xs text-slate-500 font-medium">
            <Filter className="w-3.5 h-3.5" />
            <span>Khối lớp:</span>
          </div>
          {['all', '6', '7', '8', '9'].map((g) => (
            <button
              key={g}
              onClick={() => setGradeFilter(g)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                gradeFilter === g
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {g === 'all' ? 'Tất cả' : `Khối ${g}`}
            </button>
          ))}

          <button
            onClick={() => exportToExcel(filteredSubmissions, `Green_Corner_THCS_Vinh_Long_${gradeFilter !== 'all' ? 'Khoi_' + gradeFilter : 'Tat_Ca'}`)}
            className="flex items-center gap-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-xs font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer ml-1"
            title="Xuất danh sách đang xem ra file Excel"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
            <span>Xuất Excel ({filteredSubmissions.length})</span>
          </button>

          <button
            onClick={() => {
              setSearchTerm('');
              setGradeFilter('all');
            }}
            className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ml-1"
            title="Làm mới bộ lọc và ô tìm kiếm"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Làm mới lọc</span>
          </button>

          {submissions.length > 0 && (
            <button
              onClick={() => {
                if (confirm('Bạn có chắc chắn muốn xóa toàn bộ nhật ký trạm hôm nay không?')) {
                  onClearAll();
                }
              }}
              className="text-red-500 hover:text-red-700 text-xs px-2.5 py-1.5 hover:bg-red-50 rounded-lg transition-all flex items-center gap-1 cursor-pointer ml-2"
              title="Xóa toàn bộ"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Xóa</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Ledger Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-700 font-bold uppercase border-b border-slate-200 text-[11px]">
              <tr>
                <th className="py-3.5 px-4">#</th>
                <th className="py-3.5 px-4">Tên học sinh</th>
                <th className="py-3.5 px-4">Lớp</th>
                <th className="py-3.5 px-3 text-right">Giấy (kg)</th>
                <th className="py-3.5 px-3 text-right">Nhựa (kg)</th>
                <th className="py-3.5 px-3 text-right">Lon (kg)</th>
                <th className="py-3.5 px-4 text-right">Tổng điểm</th>
                <th className="py-3.5 px-4">Quà đã đổi</th>
                <th className="py-3.5 px-4">Dòng CSV Google Sheets</th>
                <th className="py-3.5 px-3 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredSubmissions.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    <Layers className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    Chưa có lượt nộp rác nào khớp với tìm kiếm.
                  </td>
                </tr>
              ) : (
                filteredSubmissions.map((sub, idx) => (
                  <tr key={sub.id} className="hover:bg-emerald-50/40 transition-colors">
                    <td className="py-3 px-4 font-mono text-slate-400">{idx + 1}</td>
                    <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-1.5">
                      <span>{sub.studentName}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold text-[11px]">
                        {sub.studentClass}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-semibold text-amber-800">
                      {sub.paperKg > 0 ? `${sub.paperKg}kg` : '-'}
                    </td>
                    <td className="py-3 px-3 text-right font-semibold text-sky-800">
                      {sub.plasticKg > 0 ? `${sub.plasticKg}kg` : '-'}
                    </td>
                    <td className="py-3 px-3 text-right font-semibold text-emerald-800">
                      {sub.aluminumKg > 0 ? `${sub.aluminumKg}kg` : '-'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="font-black text-emerald-700 text-sm bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                        {sub.totalPoints}đ
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {sub.redeemedGift ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold bg-emerald-100/60 px-2 py-0.5 rounded-md text-[11px]">
                          🎁 {sub.redeemedGift}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Tích lũy điểm</span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-600">
                      <div className="flex items-center gap-2">
                        <code className="bg-slate-100 px-2 py-0.5 rounded truncate max-w-[200px]">
                          {sub.csvLine}
                        </code>
                        <button
                          onClick={() => handleCopySingleCsv(sub.csvLine, sub.id)}
                          className="text-slate-400 hover:text-emerald-700 p-1 rounded hover:bg-slate-100 transition-all cursor-pointer"
                          title="Copy dòng CSV"
                        >
                          {copiedRowId === sub.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => onDeleteSubmission(sub.id)}
                        className="text-slate-400 hover:text-red-600 p-1 rounded hover:bg-red-50 transition-all cursor-pointer"
                        title="Xóa dòng"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info */}
        <div className="bg-slate-50 border-t border-slate-200 px-4 py-3 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <span>
            Hiển thị <strong>{filteredSubmissions.length}</strong> / <strong>{submissions.length}</strong> giao dịch
          </span>
          <span className="text-emerald-700 font-semibold">
            Dự án khởi nghiệp xanh học đường
          </span>
        </div>
      </div>
    </div>
  );
};
