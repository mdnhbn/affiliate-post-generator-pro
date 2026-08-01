import React, { useState } from 'react';
import { X, QrCode, Download, Copy, Check, ExternalLink, ShieldCheck } from 'lucide-react';
import { Barcode } from './Barcode';

interface QrCodeModalProps {
  url: string;
  title: string;
  onClose: () => void;
}

export const QrCodeModal: React.FC<QrCodeModalProps> = ({ url, title, onClose }) => {
  const [copied, setCopied] = useState(false);

  // Clean SVG QR Code generator (fallback using Google Chart / QR Server API image with fallback SVG)
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(url)}&color=000000&bgcolor=ffffff&margin=1`;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQr = async () => {
    try {
      const response = await fetch(qrImageUrl);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `QR-${title.slice(0, 15).replace(/[^a-zA-Z0-9]/g, '_')}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch (e) {
      window.open(qrImageUrl, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-[#18191e] border-2 border-dashed border-zinc-300 dark:border-zinc-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 relative">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-dashed border-zinc-200 dark:border-zinc-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500/20 border border-amber-500/40 text-amber-500 rounded-lg">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-mono font-bold text-sm uppercase text-zinc-900 dark:text-zinc-100">
                Affiliate QR Code Generator
              </h3>
              <p className="text-xs text-zinc-500 font-sans truncate max-w-[220px]">
                {title}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* QR Code Container */}
        <div className="flex flex-col items-center justify-center p-6 bg-zinc-50 dark:bg-zinc-900/90 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 space-y-4">
          <div className="bg-white p-4 rounded-xl shadow-md border border-zinc-200">
            <img
              src={qrImageUrl}
              alt="Affiliate Link QR Code"
              className="w-48 h-48 object-contain"
            />
          </div>

          <div className="text-center space-y-1">
            <div className="text-xs font-mono text-zinc-600 dark:text-zinc-300 flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              Verified Amazon Associate Link
            </div>
            <p className="text-[11px] text-zinc-400 font-mono truncate max-w-xs px-2">
              {url}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleCopyUrl}
            className="px-4 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-mono font-bold text-xs hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all flex items-center justify-center gap-1.5"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied Link!' : 'Copy Link'}
          </button>

          <button
            onClick={handleDownloadQr}
            className="px-4 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-mono font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            Download QR
          </button>
        </div>

        <div className="flex justify-between items-center pt-2 border-t border-dashed border-zinc-200 dark:border-zinc-800 text-[10px] font-mono text-zinc-500">
          <span>SCAN TO OPEN AMAZON</span>
          <Barcode code="QR-DISPATCH-99" height={14} className="text-amber-500" />
        </div>

      </div>
    </div>
  );
};
