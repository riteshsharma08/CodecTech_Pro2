import React from 'react';

interface QRCodeDisplayProps {
  value: string;
  size?: number;
  className?: string;
}

// Deterministic matrix generator for realistic SVG QR representation
export const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({ value, size = 180, className = '' }) => {
  const gridSize = 25;
  
  // Deterministic pattern based on hash of string
  const getMatrix = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }

    const matrix: boolean[][] = [];
    for (let r = 0; r < gridSize; r++) {
      matrix[r] = [];
      for (let c = 0; c < gridSize; c++) {
        // Standard QR Finder patterns (top-left, top-right, bottom-left)
        const isTL = r < 7 && c < 7;
        const isTR = r < 7 && c >= gridSize - 7;
        const isBL = r >= gridSize - 7 && c < 7;

        if (isTL || isTR || isBL) {
          const rowInBox = isBL ? r - (gridSize - 7) : r;
          const colInBox = isTR ? c - (gridSize - 7) : c;
          // Standard 7x7 finder pattern with 1px border, 1px white, 3x3 solid center
          if (rowInBox === 0 || rowInBox === 6 || colInBox === 0 || colInBox === 6) {
            matrix[r][c] = true;
          } else if (rowInBox >= 2 && rowInBox <= 4 && colInBox >= 2 && colInBox <= 4) {
            matrix[r][c] = true;
          } else {
            matrix[r][c] = false;
          }
        } else if (r === 6 || c === 6) {
          // Timing patterns
          matrix[r][c] = (r + c) % 2 === 0;
        } else {
          // Data bits derived from hash and coordinate
          const bit = Math.abs(hash ^ (r * 31 + c * 17) ^ (r * c)) % 3 !== 0;
          matrix[r][c] = bit;
        }
      }
    }
    return matrix;
  };

  const matrix = getMatrix(value);
  const cellSize = size / gridSize;

  return (
    <div className={`inline-block p-3 bg-white rounded-xl shadow-lg border border-slate-200/80 ${className}`}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="block">
        {matrix.map((row, r) =>
          row.map((filled, c) => {
            if (!filled) return null;
            return (
              <rect
                key={`${r}-${c}`}
                x={c * cellSize}
                y={r * cellSize}
                width={cellSize + 0.3}
                height={cellSize + 0.3}
                fill="#0F172A"
                rx={cellSize > 5 ? 1 : 0}
              />
            );
          })
        )}
      </svg>
    </div>
  );
};
