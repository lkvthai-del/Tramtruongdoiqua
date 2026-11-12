export interface WasteRate {
  id: 'paper' | 'plastic' | 'aluminum';
  name: 'Giấy vụn' | 'Chai nhựa' | 'Vỏ lon nhôm';
  unit: string;
  pointsPerKg: number;
  description: string;
  examples: string;
  color: string;
  bgColor: string;
  borderColor: string;
  iconName: string;
}

export interface GiftItem {
  id: string;
  name: string;
  pointsRequired: number;
  image: string;
  badge: string;
  description: string;
  ecoBenefit: string;
}

export interface WasteSubmission {
  id: string;
  timestamp: string;
  studentName: string;
  studentClass: string;
  paperKg: number;
  plasticKg: number;
  aluminumKg: number;
  paperPoints: number;
  plasticPoints: number;
  aluminumPoints: number;
  totalPoints: number;
  redeemedGift?: string;
  pointsRemaining?: number;
  csvLine: string;
  note?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
  parsedData?: {
    studentName: string;
    studentClass: string;
    paperKg: number;
    plasticKg: number;
    aluminumKg: number;
    totalPoints: number;
    csvLine: string;
  };
}
