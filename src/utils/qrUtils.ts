/**
 * توليد كود SVG بسيط يمثل QR Code / Barcode لوسم الأجهزة بالمستشفى
 */
export function generateSimpleQRCodeSVG(text: string): string {
  // كود مبسط لتمثيل رمز مصفوفي بصري قابل للطباعة
  const hash = Array.from(text).reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const size = 21;
  const cells: boolean[][] = Array(size).fill(0).map(() => Array(size).fill(false));

  // أنماط الزوايا ثابتة لرمز QR
  const addFinderPattern = (startRow: number, startCol: number) => {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        if (r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4)) {
          cells[startRow + r][startCol + c] = true;
        }
      }
    }
  };

  addFinderPattern(0, 0);
  addFinderPattern(0, size - 7);
  addFinderPattern(size - 7, 0);

  // ملء الوسط بناءً على النص والـ Hash
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if ((r < 7 && c < 7) || (r < 7 && c >= size - 7) || (r >= size - 7 && c < 7)) {
        continue;
      }
      const val = (r * 31 + c * 17 + hash + text.charCodeAt((r + c) % text.length)) % 3;
      cells[r][c] = val === 0;
    }
  }

  const cellSize = 6;
  const svgWidth = size * cellSize;
  let rects = '';

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (cells[r][c]) {
        rects += `<rect x="${c * cellSize}" y="${r * cellSize}" width="${cellSize}" height="${cellSize}" fill="#0f172a" />`;
      }
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${svgWidth} ${svgWidth}" class="w-24 h-24 bg-white p-1 rounded border border-slate-200">${rects}</svg>`;
}
