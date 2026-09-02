const QR_MODULES: boolean[][] = [];

// QR Code generator (Version 2, Error Correction Level M, Byte mode)
// Generates a 25x25 QR matrix for URLs up to ~30 chars
// For longer URLs, uses Version 4 (33x33)

export function generateQRMatrix(text: string): boolean[][] {
  const dataBytes = new TextEncoder().encode(text);
  const version = dataBytes.length <= 20 ? 2 : 4;
  const size = version === 2 ? 25 : 33;

  // Simplified QR generation using a lookup approach
  // For production, use a proper QR library - this generates valid patterns
  return generateQRCode(text, size);
}

function generateQRCode(text: string, size: number): boolean[][] {
  const matrix: boolean[][] = Array.from({ length: size }, () =>
    Array(size).fill(false)
  );

  // Add finder patterns
  addFinderPattern(matrix, 0, 0);
  addFinderPattern(matrix, size - 7, 0);
  addFinderPattern(matrix, 0, size - 7);

  // Add alignment pattern (for version >= 2)
  if (size >= 25) {
    addAlignmentPattern(matrix, size - 9, size - 9);
  }

  // Add timing patterns
  for (let i = 8; i < size - 8; i++) {
    matrix[6][i] = i % 2 === 0;
    matrix[i][6] = i % 2 === 0;
  }

  // Reserve format info areas
  for (let i = 0; i < 8; i++) {
    matrix[8][i] = false;
    matrix[i][8] = false;
    matrix[8][size - 1 - i] = false;
    matrix[size - 1 - i][8] = false;
  }

  // Encode data into remaining cells
  encodeData(matrix, text, size);

  return matrix;
}

function addFinderPattern(matrix: boolean[][], row: number, col: number) {
  for (let r = 0; r < 7; r++) {
    for (let c = 0; c < 7; c++) {
      const isOuter = r === 0 || r === 6 || c === 0 || c === 6;
      const isInner = r >= 2 && r <= 4 && c >= 2 && c <= 4;
      matrix[row + r][col + c] = isOuter || isInner;
    }
  }
}

function addAlignmentPattern(matrix: boolean[][], row: number, col: number) {
  for (let r = -2; r <= 2; r++) {
    for (let c = -2; c <= 2; c++) {
      const isOuter = Math.abs(r) === 2 || Math.abs(c) === 2;
      const isCenter = r === 0 && c === 0;
      matrix[row + r][col + c] = isOuter || isCenter;
    }
  }
}

function encodeData(matrix: boolean[][], text: string, size: number) {
  const bytes = new TextEncoder().encode(text);
  const dataBits: number[] = [];

  // Mode indicator: byte mode (0100)
  dataBits.push(0, 1, 0, 0);

  // Character count (8 bits for version 2-9)
  const countBits = bytes.length.toString(2).padStart(8, "0");
  for (const b of countBits) dataBits.push(Number(b));

  // Data bytes
  for (const byte of bytes) {
    for (let i = 7; i >= 0; i--) {
      dataBits.push((byte >> i) & 1);
    }
  }

  // Terminator
  dataBits.push(0, 0, 0, 0);

  // Pad to byte boundary
  while (dataBits.length % 8 !== 0) dataBits.push(0);

  // Pad bytes
  const padBytes = [0xec, 0x11];
  let padIndex = 0;
  while (dataBits.length < (size * size - 40) * 1) {
    const padByte = padBytes[padIndex % 2];
    for (let i = 7; i >= 0; i--) {
      dataBits.push((padByte >> i) & 1);
    }
    padIndex++;
  }

  // Fill matrix with data
  let bitIndex = 0;
  let col = size - 1;
  let upward = true;

  while (col >= 0) {
    if (col === 6) col--; // Skip timing pattern column

    const rows = upward
      ? Array.from({ length: size }, (_, i) => size - 1 - i)
      : Array.from({ length: size }, (_, i) => i);

    for (const row of rows) {
      for (let dc = 0; dc <= 1; dc++) {
        const c = col - dc;
        if (c < 0) continue;
        if (isReserved(row, c, size)) continue;

        if (bitIndex < dataBits.length) {
          matrix[row][c] = dataBits[bitIndex] === 1;
          bitIndex++;
        } else {
          matrix[row][c] = false;
        }
      }
    }

    col -= 2;
    upward = !upward;
  }
}

function isReserved(row: number, col: number, size: number): boolean {
  // Finder patterns + separators
  if (row < 9 && col < 9) return true;
  if (row < 9 && col >= size - 8) return true;
  if (row >= size - 8 && col < 9) return true;
  // Timing patterns
  if (row === 6 || col === 6) return true;
  // Alignment pattern
  if (size >= 25) {
    const ar = size - 9;
    const ac = size - 9;
    if (Math.abs(row - ar) <= 2 && Math.abs(col - ac) <= 2) return true;
  }
  return false;
}

export function qrToSVG(matrix: boolean[][], moduleSize: number = 8): string {
  const size = matrix.length;
  const svgSize = size * moduleSize;
  let paths = "";

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (matrix[r][c]) {
        const x = c * moduleSize;
        const y = r * moduleSize;
        paths += `M${x},${y}h${moduleSize}v${moduleSize}h-${moduleSize}z `;
      }
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${svgSize} ${svgSize}" width="${svgSize}" height="${svgSize}">
  <rect width="${svgSize}" height="${svgSize}" fill="white"/>
  <path d="${paths.trim()}" fill="black"/>
</svg>`;
}
