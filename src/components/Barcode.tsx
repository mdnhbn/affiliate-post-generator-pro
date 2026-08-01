import React from 'react';

interface BarcodeProps {
  code?: string;
  className?: string;
  height?: number;
}

export const Barcode: React.FC<BarcodeProps> = ({ 
  code = 'APG-PRO-2026-X9', 
  className = '',
  height = 24 
}) => {
  // Generate deterministic barcode widths based on char codes
  const bars = React.useMemo(() => {
    const list: { width: number; gap: number }[] = [];
    for (let i = 0; i < code.length; i++) {
      const charCode = code.charCodeAt(i);
      list.push({
        width: (charCode % 3) + 1,
        gap: ((charCode * 3) % 3) + 1,
      });
    }
    return list;
  }, [code]);

  return (
    <div className={`flex flex-col items-center select-none ${className}`}>
      <div className="flex items-stretch gap-0.5 bg-black/10 dark:bg-white/10 p-1 rounded-sm overflow-hidden" style={{ height: `${height}px` }}>
        {bars.map((bar, idx) => (
          <React.Fragment key={idx}>
            <div 
              className="bg-current rounded-xs" 
              style={{ width: `${bar.width * 1.5}px` }} 
            />
            <div style={{ width: `${bar.gap * 1.2}px` }} />
          </React.Fragment>
        ))}
      </div>
      <span className="text-[9px] font-mono tracking-widest text-zinc-500 dark:text-zinc-400 mt-0.5 uppercase">
        *{code}*
      </span>
    </div>
  );
};
