import express from 'express';
import type { Request, Response } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json());

// Initialize Gemini client server-side
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const SYSTEM_INSTRUCTION = `Bạn là "Trạm Trưởng Ảo AI" của dự án khởi nghiệp học đường mang tên "Green Corner - Trạm Đổi Rác Lấy Quà Xanh" tại trường THCS Phạm Văn Bảy - xã Tân Thành Bình - tỉnh Vĩnh Long.

Nhiệm vụ của bạn là hỗ trợ các bạn học sinh trong Ban quản trị trạm tính toán điểm thưởng, quy đổi quà tặng, phân loại rác thải và xuất định dạng dữ liệu chuẩn để các bạn ấy dễ dàng copy-paste vào bảng tính Google Sheets của dự án.

QUY ĐỊNH VỀ KHỐI LƯỢNG VÀ QUY ĐỔI ĐIỂM SỐ (BẮT BUỘC TUÂN THỦ CHÍNH XÁC 100%):
- Giấy vụn (sách cũ, báo, carton): 1 kg = 10 điểm.
- Chai nhựa (PET, vỏ chai nước suối, trà sữa): 1 kg = 15 điểm.
- Vỏ lon nhôm (lon nước ngọt, lon bia): 1 kg = 30 điểm.
*Lưu ý: Nếu khối lượng lẻ (ví dụ 0.5kg), hãy tính điểm theo tỷ lệ (ví dụ: 0.5kg vỏ lon = 15 điểm; 1.5kg nhựa = 22.5 -> làm tròn thành 23 điểm). Làm tròn điểm số thành số nguyên gần nhất (Math.round).

DANH MỤC QUÀ TẶNG ĐỔI ĐIỂM:
- 50 điểm = 1 Bút chì sinh học (ươm mầm cây xanh).
- 100 điểm = 1 Cây sen đá mini.
- 200 điểm = 1 Cuốn sổ tay làm từ giấy tái chế.

PHONG CÁCH GIAO TIẾP:
- Thân thiện, năng động, dễ thương, phù hợp với lứa tuổi học sinh cấp Trung học cơ sở (THCS - từ lớp 6 đến lớp 9).
- Sử dụng các thán từ vui tươi: "Yooo!", "Chào bạn...", "Cảm ơn bạn đã ghé Trạm Xanh Green Corner nha! 🎉", biểu tượng cảm xúc sinh động (🌱, 🌟, 🌿, 🥤, 📚, 🎁, 🌳).
- Sử dụng ngôn ngữ tích cực, gắn liền với Dự án khởi nghiệp xanh học đường. Định dạng lớp học luôn sử dụng dạng gạch chéo ví dụ 7/2, 6/1, 8/3, 9/4.

KHI HỌC SINH HOẶC BAN QUẢN TRỊ NHẬP DỮ LIỆU:
1. Hãy tính tổng số điểm mà học sinh đó nhận được dựa trên khối lượng rác mang đến (chi tiết từng loại giấy, nhựa, lon nhôm và làm tròn chuẩn).
2. Kiểm tra xem với số điểm đó, học sinh có thể đổi được những món quà gì trong danh mục, hoặc nếu chưa đủ thì cần thêm bao nhiêu điểm nữa để đạt mốc quà kế tiếp (ví dụ còn thiếu bao nhiêu điểm nữa để rinh Bút chì sinh học hoặc Sen đá).
3. Luôn luôn xuất ra một dòng dữ liệu cuối cùng ở định dạng ngăn cách bằng dấu phẩy (CSV) để Ban quản trị sao chép vào Google Sheets theo cấu trúc:
[Tên học sinh], [Lớp], [Số kg Giấy], [Số kg Nhựa], [Số kg Nhôm], [Tổng điểm]

VÍ DỤ MẪU:
Nếu nhận: "Bạn Nguyễn Văn A lớp 7/2 nộp 2kg giấy vụn và 1.5kg chai nhựa."
Trả lời:
"Yooo! Chào bạn Văn A lớp 7/2 nha! 🎉 Cảm ơn bạn đã ghé Trạm Xanh Green Corner. Hôm nay bạn đóng góp rất nhiều nè:
- 2kg giấy vụn = 20 điểm.
- 1.5kg chai nhựa = 22.5 điểm (làm tròn thành 23 điểm).
Tổng điểm tích lũy hôm nay của bạn là: 43 điểm! 🌟
Bạn chỉ cần tích thêm 7 điểm nữa là đổi được một chiếc Bút chì sinh học siêu xinh rồi đó! Hãy tiếp tục tham gia Dự án khởi nghiệp xanh học đường nhé! 🌱

[Dữ liệu chuẩn để copy vào Google Sheets]:
Nguyễn Văn A, 7/2, 2, 1.5, 0, 43"`;

// Server-side helper to compute standard points deterministically
function calculatePoints(paperKg: number, plasticKg: number, aluminumKg: number): {
  paperPoints: number;
  plasticPoints: number;
  aluminumPoints: number;
  rawTotal: number;
  totalPoints: number;
} {
  const paperPoints = paperKg * 10;
  const plasticPoints = plasticKg * 15;
  const aluminumPoints = aluminumKg * 30;
  const rawTotal = paperPoints + plasticPoints + aluminumPoints;
  const totalPoints = Math.round(rawTotal);
  return {
    paperPoints,
    plasticPoints,
    aluminumPoints,
    rawTotal,
    totalPoints,
  };
}

// POST /api/chat - Conversational Trạm Trưởng AI
app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    const { message, history } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Nội dung tin nhắn không hợp lệ' });
    }

    if (!process.env.GEMINI_API_KEY) {
      // Graceful local fallback parsing if no API key is provided
      const parsed = extractWasteData(message);
      const { paperPoints, plasticPoints, aluminumPoints, totalPoints } = calculatePoints(
        parsed.paperKg,
        parsed.plasticKg,
        parsed.aluminumKg
      );

      const reply = `Yooo! Chào bạn ${parsed.studentName || 'bạn'} lớp ${parsed.studentClass || '7/2'} nha! 🎉 Cảm ơn bạn đã ghé Trạm Xanh Green Corner - THCS Phạm Văn Bảy (xã Tân Thành Bình)!
Hôm nay bạn đã mang đến trạm:
${parsed.paperKg > 0 ? `- ${parsed.paperKg}kg giấy vụn = ${paperPoints} điểm.\n` : ''}${parsed.plasticKg > 0 ? `- ${parsed.plasticKg}kg chai nhựa = ${plasticPoints} điểm.\n` : ''}${parsed.aluminumKg > 0 ? `- ${parsed.aluminumKg}kg vỏ lon nhôm = ${aluminumPoints} điểm.\n` : ''}
Tổng điểm tích lũy hôm nay của bạn là: ${totalPoints} điểm! 🌟
${
  totalPoints >= 200
    ? '🎉 Tuyệt vời quá! Bạn đủ điểm đổi ngay 1 Cuốn sổ tay giấy tái chế (200đ) hoặc Sen đá mini / Bút chì sinh học nha!'
    : totalPoints >= 100
    ? '🌱 Quá xịn! Bạn có thể đổi ngay 1 Cây sen đá mini (100đ) hoặc 2 Bút chì sinh học (50đ) nè!'
    : totalPoints >= 50
    ? '✏️ Chúc mừng bạn! Bạn đã đủ điểm nhận ngay 1 Bút chì sinh học ươm mầm (50đ) xinh xắn!'
    : `Bạn chỉ cần tích thêm ${50 - totalPoints} điểm nữa là rước ngay chiếc Bút chì sinh học đầu tiên rồi đó!`
}
Dự án khởi nghiệp xanh học đường 🌱✨

[Dữ liệu chuẩn để copy vào Google Sheets]:
${parsed.studentName || 'Học sinh'}, ${parsed.studentClass || '7/2'}, ${parsed.paperKg}, ${parsed.plasticKg}, ${parsed.aluminumKg}, ${totalPoints}`;

      return res.json({
        reply,
        parsedData: {
          studentName: parsed.studentName || 'Học sinh',
          studentClass: parsed.studentClass || '',
          paperKg: parsed.paperKg,
          plasticKg: parsed.plasticKg,
          aluminumKg: parsed.aluminumKg,
          totalPoints,
          csvLine: `${parsed.studentName || 'Học sinh'}, ${parsed.studentClass || ''}, ${parsed.paperKg}, ${parsed.plasticKg}, ${parsed.aluminumKg}, ${totalPoints}`,
        },
      });
    }

    // Call Gemini 3.8 Flash model
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: message,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
      },
    });

    const replyText = response.text || '';

    // Extract structured data from reply or input
    const csvMatch = replyText.match(/\[Dữ liệu chuẩn để copy vào Google Sheets\]:?\s*\n*([^\n\r]+)/i);
    let csvLine = '';
    let parsedStudent = { studentName: '', studentClass: '', paperKg: 0, plasticKg: 0, aluminumKg: 0, totalPoints: 0 };

    if (csvMatch && csvMatch[1]) {
      csvLine = csvMatch[1].trim();
      const parts = csvLine.split(',').map((p) => p.trim());
      if (parts.length >= 6) {
        parsedStudent = {
          studentName: parts[0],
          studentClass: parts[1],
          paperKg: parseFloat(parts[2]) || 0,
          plasticKg: parseFloat(parts[3]) || 0,
          aluminumKg: parseFloat(parts[4]) || 0,
          totalPoints: parseInt(parts[5], 10) || 0,
        };
      }
    }

    if (!csvLine) {
      const fallback = extractWasteData(message);
      const points = calculatePoints(fallback.paperKg, fallback.plasticKg, fallback.aluminumKg);
      csvLine = `${fallback.studentName || 'Học sinh'}, ${fallback.studentClass || ''}, ${fallback.paperKg}, ${fallback.plasticKg}, ${fallback.aluminumKg}, ${points.totalPoints}`;
      parsedStudent = {
        studentName: fallback.studentName || 'Học sinh',
        studentClass: fallback.studentClass || '',
        paperKg: fallback.paperKg,
        plasticKg: fallback.plasticKg,
        aluminumKg: fallback.aluminumKg,
        totalPoints: points.totalPoints,
      };
    }

    res.json({
      reply: replyText,
      parsedData: {
        ...parsedStudent,
        csvLine,
      },
    });
  } catch (error: any) {
    console.error('Error generating AI response:', error);
    res.status(500).json({
      error: 'Không thể kết nối đến Trạm Trưởng Ảo AI lúc này. Vui lòng thử lại!',
      details: error?.message,
    });
  }
});

// POST /api/generate-cheer - Quick AI encouragement for station counter
app.post('/api/generate-cheer', async (req: Request, res: Response) => {
  try {
    const { studentName, studentClass, paperKg, plasticKg, aluminumKg, totalPoints } = req.body;
    const prompt = `Học sinh: ${studentName || 'Bạn học sinh'}, Lớp: ${studentClass || '7/2'}, Giấy: ${paperKg}kg, Nhựa: ${plasticKg}kg, Nhôm: ${aluminumKg}kg, Tổng điểm: ${totalPoints} điểm. Hãy gửi một lời khen ngợi, lời động viên siêu dễ thương và truyền cảm hứng ngắn gọn (khoảng 3-4 câu) từ Trạm Trưởng Ảo AI Green Corner cho Dự án khởi nghiệp xanh học đường!`;

    if (!process.env.GEMINI_API_KEY) {
      return res.json({
        cheer: `Yooo! Chúc mừng bạn ${studentName || 'bạn'} lớp ${studentClass || '7/2'} đã thu gom được ${totalPoints} điểm! Cảm ơn bạn đã tham gia Dự án khởi nghiệp xanh học đường nha! 🌱🎉`,
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.8,
      },
    });

    res.json({ cheer: response.text });
  } catch (error: any) {
    res.json({
      cheer: `Cảm ơn bạn đã đồng hành cùng Dự án khởi nghiệp xanh học đường! Bạn thật tuyệt vời! 🌟🌿`,
    });
  }
});

// Helper regex fallback parser for Vietnamese waste submission text
function extractWasteData(text: string) {
  let studentName = '';
  let studentClass = '';
  let paperKg = 0;
  let plasticKg = 0;
  let aluminumKg = 0;

  // Name match
  const nameMatch = text.match(/(?:bạn|học sinh|em)\s+([A-ZÀ-Ỹa-zà-ỹ\s]+?)(?:\s+lớp|\s+nộp|\s+đem|\s+gửi|$|,)/i);
  if (nameMatch && nameMatch[1]) {
    studentName = nameMatch[1].trim();
  }

  // Class match e.g. 7/2, 6/1, 8/3, 9/4 or 7A1
  const classMatch = text.match(/lớp\s*([0-9]+\s*[\/]\s*[0-9]+|[0-9]+[A-Za-z0-9\/\-_]+)/i);
  if (classMatch && classMatch[1]) {
    studentClass = classMatch[1].replace(/\s+/g, '').trim();
  }

  // Paper match: 2kg giấy, 2.5 kg giấy vụn, carton
  const paperMatch = text.match(/([0-9]+(?:[\.,][0-9]+)?)\s*(?:kg|kí|ký)?\s*(?:giấy|carton|báo|sách)/i) ||
                     text.match(/(?:giấy|carton|báo|sách)[^0-9]*([0-9]+(?:[\.,][0-9]+)?)\s*(?:kg|kí|ký)/i);
  if (paperMatch && paperMatch[1]) {
    paperKg = parseFloat(paperMatch[1].replace(',', '.'));
  }

  // Plastic match: 1.5kg chai nhựa, nhựa, chai PET
  const plasticMatch = text.match(/([0-9]+(?:[\.,][0-9]+)?)\s*(?:kg|kí|ký)?\s*(?:nhựa|chai nhựa|chai pet|pet)/i) ||
                       text.match(/(?:nhựa|chai nhựa|chai pet|pet)[^0-9]*([0-9]+(?:[\.,][0-9]+)?)\s*(?:kg|kí|ký)/i);
  if (plasticMatch && plasticMatch[1]) {
    plasticKg = parseFloat(plasticMatch[1].replace(',', '.'));
  }

  // Aluminum match: 0.5kg vỏ lon, lon nhôm, lon bia, lon nước ngọt
  const alumMatch = text.match(/([0-9]+(?:[\.,][0-9]+)?)\s*(?:kg|kí|ký)?\s*(?:nhôm|lon|vỏ lon|lon bia|lon nước ngọt)/i) ||
                    text.match(/(?:nhôm|lon|vỏ lon|lon bia|lon nước ngọt)[^0-9]*([0-9]+(?:[\.,][0-9]+)?)\s*(?:kg|kí|ký)/i);
  if (alumMatch && alumMatch[1]) {
    aluminumKg = parseFloat(alumMatch[1].replace(',', '.'));
  }

  return { studentName, studentClass, paperKg, plasticKg, aluminumKg };
}

// Dev vs Prod Vite middleware
async function startServer() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const portNum = Number(PORT);
  app.listen(portNum, '0.0.0.0', () => {
    console.log(`Green Corner Server running on http://0.0.0.0:${portNum}`);
  });
}

startServer();
