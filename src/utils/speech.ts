export function speakText(text: string) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return;
  }

  // Clean out markdown and CSV markers before speaking
  const cleanText = text
    .replace(/\[Dữ liệu chuẩn để copy vào Google Sheets\]:?[\s\S]*$/gi, '')
    .replace(/[*#_`]/g, '')
    .trim();

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(cleanText);
  utterance.lang = 'vi-VN';
  utterance.rate = 1.05;
  utterance.pitch = 1.1; // Cheerful tone

  // Try to find a Vietnamese voice if available
  const voices = window.speechSynthesis.getVoices();
  const viVoice = voices.find((v) => v.lang.startsWith('vi'));
  if (viVoice) {
    utterance.voice = viVoice;
  }

  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}
