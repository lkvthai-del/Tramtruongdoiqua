import * as XLSX from 'xlsx';
import { WasteSubmission } from '../types';

export function exportToExcel(submissions: WasteSubmission[], filenamePrefix = 'Green_Corner_THCS_Pham_Van_Bay') {
  if (!submissions || submissions.length === 0) {
    alert('Chưa có dữ liệu nào để xuất ra file Excel!');
    return;
  }

  // 1. Data rows for detailed transactions
  const dataRows = submissions.map((sub, index) => ({
    'STT': index + 1,
    'Họ và tên học sinh': sub.studentName,
    'Lớp': sub.studentClass,
    'Giấy vụn (kg)': sub.paperKg,
    'Chai nhựa (kg)': sub.plasticKg,
    'Vỏ lon nhôm (kg)': sub.aluminumKg,
    'Điểm Giấy (x10)': sub.paperPoints,
    'Điểm Nhựa (x15)': sub.plasticPoints,
    'Điểm Lon (x30)': sub.aluminumPoints,
    'Tổng điểm nhận': sub.totalPoints,
    'Quà tặng đã đổi': sub.redeemedGift || 'Tích lũy',
    'Điểm còn lại': sub.pointsRemaining ?? sub.totalPoints,
    'Dòng chuẩn Google Sheets': sub.csvLine,
    'Thời gian nộp': sub.timestamp,
    'Ghi chú': sub.note || '',
  }));

  // Create worksheet
  const worksheet = XLSX.utils.json_to_sheet(dataRows);

  // Set column widths for clean readability
  worksheet['!cols'] = [
    { wch: 6 },  // STT
    { wch: 22 }, // Họ và tên
    { wch: 10 }, // Lớp
    { wch: 14 }, // Giấy (kg)
    { wch: 14 }, // Nhựa (kg)
    { wch: 16 }, // Lon (kg)
    { wch: 16 }, // Điểm Giấy
    { wch: 16 }, // Điểm Nhựa
    { wch: 16 }, // Điểm Lon
    { wch: 16 }, // Tổng điểm
    { wch: 26 }, // Quà đã đổi
    { wch: 14 }, // Điểm còn lại
    { wch: 32 }, // Dòng CSV
    { wch: 18 }, // Thời gian
    { wch: 25 }, // Ghi chú
  ];

  // 2. Summary sheet for school management & reports
  const totalPaper = submissions.reduce((acc, curr) => acc + curr.paperKg, 0);
  const totalPlastic = submissions.reduce((acc, curr) => acc + curr.plasticKg, 0);
  const totalAluminum = submissions.reduce((acc, curr) => acc + curr.aluminumKg, 0);
  const totalPoints = submissions.reduce((acc, curr) => acc + curr.totalPoints, 0);
  const totalKg = totalPaper + totalPlastic + totalAluminum;

  const summaryRows = [
    { 'Chỉ số thống kê': 'Trường & Địa bàn', 'Giá trị': 'THCS Phạm Văn Bảy - Xã Tân Thành Bình - Tỉnh Vĩnh Long' },
    { 'Chỉ số thống kê': 'Dự án', 'Giá trị': 'Green Corner - Trạm Đổi Rác Lấy Quà Xanh' },
    { 'Chỉ số thống kê': 'Ngày xuất báo cáo', 'Giá trị': new Date().toLocaleString('vi-VN') },
    { 'Chỉ số thống kê': 'Tổng số lượt học sinh nộp rác', 'Giá trị': `${submissions.length} lượt` },
    { 'Chỉ số thống kê': 'Tổng khối lượng rác thu gom', 'Giá trị': `${totalKg.toFixed(2)} kg` },
    { 'Chỉ số thống kê': 'Tổng Giấy vụn (1kg = 10đ)', 'Giá trị': `${totalPaper.toFixed(2)} kg` },
    { 'Chỉ số thống kê': 'Tổng Chai nhựa (1kg = 15đ)', 'Giá trị': `${totalPlastic.toFixed(2)} kg` },
    { 'Chỉ số thống kê': 'Tổng Vỏ lon nhôm (1kg = 30đ)', 'Giá trị': `${totalAluminum.toFixed(2)} kg` },
    { 'Chỉ số thống kê': 'Tổng điểm thưởng đã phát hành', 'Giá trị': `${totalPoints} điểm` },
    { 'Chỉ số thống kê': 'Chương trình', 'Giá trị': 'Dự án khởi nghiệp xanh học đường' },
  ];

  const summaryWorksheet = XLSX.utils.json_to_sheet(summaryRows);
  summaryWorksheet['!cols'] = [
    { wch: 35 },
    { wch: 55 },
  ];

  // Create workbook and append sheets
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Nhật Ký Nộp Rác');
  XLSX.utils.book_append_sheet(workbook, summaryWorksheet, 'Báo Cáo Tổng Hợp');

  // Trigger file download
  const dateStr = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(workbook, `${filenamePrefix}_${dateStr}.xlsx`);
}
