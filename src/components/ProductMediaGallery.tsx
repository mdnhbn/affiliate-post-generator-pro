import React, { useState } from 'react';
import { 
  getAmazonProductGalleryImages, 
  getAmazonProductVideoResources, 
  extractAsinFromUrl 
} from '../utils/amazon';
import { 
  Package, 
  Video, 
  Download, 
  Copy, 
  ExternalLink, 
  Check, 
  Sparkles, 
  Film,
  Play,
  Image as ImageIcon
} from 'lucide-react';

interface ProductMediaGalleryProps {
  productUrl: string;
  productTitle: string;
  mainImageUrl?: string;
  generatedImageUrl?: string;
}

export const ProductMediaGallery: React.FC<ProductMediaGalleryProps> = ({
  productUrl,
  productTitle,
  mainImageUrl,
  generatedImageUrl,
}) => {
  const images = getAmazonProductGalleryImages(productUrl, mainImageUrl);
  const videos = getAmazonProductVideoResources(productUrl);
  const asin = extractAsinFromUrl(productUrl);

  const [selectedImg, setSelectedImg] = useState<string>(
    generatedImageUrl || images[0] || ''
  );
  const [copiedLink, setCopiedLink] = useState(false);
  const [showAiImage, setShowAiImage] = useState(!!generatedImageUrl);

  const activeDisplayImg = showAiImage && generatedImageUrl ? generatedImageUrl : selectedImg;

  const handleCopyLink = () => {
    if (!activeDisplayImg) return;
    navigator.clipboard.writeText(activeDisplayImg);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleDownloadImage = (url: string, index: number) => {
    const a = document.createElement('a');
    a.href = url;
    a.target = '_blank';
    a.download = `${productTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_photo_${index + 1}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/90 border-2 border-dashed border-zinc-200 dark:border-zinc-800 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between font-mono font-bold text-xs flex-wrap gap-2">
        <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
          <Package className="w-4 h-4 text-amber-500 shrink-0" />
          <span>📦 Amazon Product Media Gallery ({images.length} Photos & Video Resources)</span>
        </div>

        {generatedImageUrl && (
          <button
            type="button"
            onClick={() => setShowAiImage(!showAiImage)}
            className="text-[11px] font-mono text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 bg-amber-500/10 px-2 py-1 rounded border border-amber-500/20"
          >
            {showAiImage ? '← View Amazon Original Photos' : '✨ View AI Generated Banner'}
          </button>
        )}
      </div>

      {/* Main Selected Image Preview Box */}
      <div className="relative group bg-white dark:bg-zinc-950 rounded-lg border border-zinc-200 dark:border-zinc-800 p-3 flex flex-col items-center justify-center min-h-[200px] max-h-[320px] overflow-hidden">
        <img
          src={activeDisplayImg}
          alt={productTitle}
          onError={(e) => {
            if (asin) {
              (e.target as HTMLImageElement).src = `https://images-na.ssl-images-amazon.com/images/P/${asin}.01._SCLZZZZZZZ_.jpg`;
            }
          }}
          className="max-h-[280px] w-auto object-contain rounded transition-all duration-200 group-hover:scale-105"
        />
        <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-zinc-900/80 text-amber-400 font-mono text-[10px] backdrop-blur-sm border border-amber-500/30">
          {showAiImage ? 'AI Generated Banner' : 'Amazon Original CDN Photo'}
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center justify-between gap-2 flex-wrap text-xs font-mono">
        <span className="text-zinc-500 text-[11px]">
          Click thumbnail below to preview or download HD assets
        </span>

        <div className="flex items-center gap-2">
          {activeDisplayImg && (
            <button
              type="button"
              onClick={() => handleDownloadImage(activeDisplayImg, 1)}
              className="px-2.5 py-1.5 rounded-md bg-amber-500 text-zinc-950 hover:bg-amber-400 font-bold flex items-center gap-1 shadow-sm transition-all text-xs"
            >
              <Download className="w-3.5 h-3.5" /> Download HD Photo
            </button>
          )}

          {activeDisplayImg && (
            <button
              type="button"
              onClick={handleCopyLink}
              className="px-2.5 py-1.5 rounded-md bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-amber-500 flex items-center gap-1 text-xs"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedLink ? 'Copied Link!' : 'Copy Image Link'}
            </button>
          )}
        </div>
      </div>

      {/* Thumbnails Multi-Photo Carousel */}
      {images.length > 0 && (
        <div className="space-y-1.5">
          <label className="text-[11px] font-mono font-bold text-zinc-500 uppercase flex items-center gap-1">
            <ImageIcon className="w-3 h-3 text-amber-500" />
            Product Photo Angles ({images.length} HD Shots)
          </label>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
            {images.map((imgUrl, idx) => {
              const isSelected = selectedImg === imgUrl && !showAiImage;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setSelectedImg(imgUrl);
                    setShowAiImage(false);
                  }}
                  className={`relative shrink-0 w-16 h-16 rounded-md border-2 p-1 bg-white dark:bg-zinc-950 transition-all ${
                    isSelected
                      ? 'border-amber-500 ring-2 ring-amber-500/30'
                      : 'border-zinc-200 dark:border-zinc-800 hover:border-amber-400/60 opacity-80 hover:opacity-100'
                  }`}
                >
                  <img
                    src={imgUrl}
                    alt={`Angle ${idx + 1}`}
                    className="w-full h-full object-contain rounded"
                  />
                  <span className="absolute bottom-0 right-0 px-1 text-[9px] font-mono bg-zinc-900/80 text-zinc-200 rounded-tl">
                    #{idx + 1}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Official Amazon Video Resources Section */}
      {videos.length > 0 && (
        <div className="pt-2 border-t border-dashed border-zinc-200 dark:border-zinc-800 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono font-bold text-purple-600 dark:text-purple-400">
            <span className="flex items-center gap-1.5">
              <Film className="w-4 h-4 text-purple-500" />
              Amazon Official Video & Customer Demo Hub
            </span>
            <span className="text-[10px] bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
              HD VIDEO RESOURCES
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {videos.map((vid, idx) => (
              <a
                key={idx}
                href={vid.videoPageUrl}
                target="_blank"
                rel="noreferrer"
                className="p-2.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-700 dark:text-purple-300 font-mono text-xs flex items-center justify-between transition-all group"
              >
                <div className="flex items-center gap-2 truncate">
                  <div className="p-1.5 rounded-full bg-purple-500 text-zinc-950 group-hover:scale-110 transition-transform shrink-0">
                    <Play className="w-3 h-3 fill-current" />
                  </div>
                  <span className="truncate text-[11px] font-bold">{vid.title}</span>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-purple-400 shrink-0 ml-2" />
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
