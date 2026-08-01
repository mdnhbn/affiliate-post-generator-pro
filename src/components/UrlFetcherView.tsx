import React, { useState, useMemo } from 'react';
import { Product, Settings } from '../types';
import { sanitizeAmazonUrl, extractInfoFromAmazonUrlSlug, extractAsinFromUrl } from '../utils/amazon';
import { Link2, Sparkles, Check, ExternalLink, Zap, PackagePlus, AlertCircle } from 'lucide-react';

interface UrlFetcherViewProps {
  settings: Settings;
  onAddProduct: (product: Omit<Product, 'id' | 'createdAt'>) => void;
  onSelectForPost: (product: Product) => void;
}

export const UrlFetcherView: React.FC<UrlFetcherViewProps> = ({
  settings,
  onAddProduct,
  onSelectForPost,
}) => {
  const [rawUrl, setRawUrl] = useState('');
  const [customTitle, setCustomTitle] = useState('');
  const [customPrice, setCustomPrice] = useState('');
  const [customFeatures, setCustomFeatures] = useState('');
  const [customTag, setCustomTag] = useState(settings.defaultAffiliateTag || 'yourtag-20');
  
  const [extractedInfo, setExtractedInfo] = useState<{
    title: string;
    priceDiscount: string;
    features: string;
    asin: string | null;
  } | null>(null);

  const [isExtracted, setIsExtracted] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const [customImageUrl, setCustomImageUrl] = useState('');

  const cleanAffiliateUrl = useMemo(() => {
    if (!rawUrl.trim()) return '';
    return sanitizeAmazonUrl(rawUrl, customTag, settings.marketplaces);
  }, [rawUrl, customTag, settings.marketplaces]);

  const handleExtract = () => {
    if (!rawUrl.trim()) return;
    
    const info = extractInfoFromAmazonUrlSlug(rawUrl);
    const asin = extractAsinFromUrl(rawUrl);

    setExtractedInfo({
      title: info.title,
      priceDiscount: info.priceDiscount,
      features: info.features,
      asin: asin,
    });

    setCustomTitle(info.title);
    setCustomPrice(info.priceDiscount);
    setCustomFeatures(info.features);
    setCustomImageUrl('');
    setIsExtracted(true);
  };

  const handleCreateProductAndGenerate = () => {
    if (!cleanAffiliateUrl) return;

    const newProd: Product = {
      id: `prod-${Date.now()}`,
      title: customTitle.trim() || extractedInfo?.title || 'Amazon Product',
      amazonUrl: cleanAffiliateUrl,
      features: customFeatures.trim() || extractedInfo?.features || 'Top selling Amazon product.',
      priceDiscount: customPrice.trim() || extractedInfo?.priceDiscount || 'Amazon Price',
      imageUrl: customImageUrl.trim() || undefined,
      createdAt: Date.now(),
      lastVerifiedAt: Date.now(),
    };

    onAddProduct(newProd);
    onSelectForPost(newProd);
  };

  const handleSaveOnly = () => {
    if (!cleanAffiliateUrl) return;

    const newProd: Product = {
      id: `prod-${Date.now()}`,
      title: customTitle.trim() || extractedInfo?.title || 'Amazon Product',
      amazonUrl: cleanAffiliateUrl,
      features: customFeatures.trim() || extractedInfo?.features || 'Top selling Amazon product.',
      priceDiscount: customPrice.trim() || extractedInfo?.priceDiscount || 'Amazon Price',
      imageUrl: customImageUrl.trim() || undefined,
      createdAt: Date.now(),
      lastVerifiedAt: Date.now(),
    };

    onAddProduct(newProd);
    setActionSuccess('Product saved to your library!');
    setTimeout(() => setActionSuccess(null), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* Header Banner */}
      <div className="p-5 rounded-lg bg-zinc-900 text-zinc-100 border-2 border-dashed border-amber-500/50 space-y-2">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded bg-amber-500 text-zinc-950 font-bold">
            <Zap className="w-5 h-5 fill-current" />
          </div>
          <div>
            <h2 className="text-xl font-mono font-bold uppercase tracking-tight text-zinc-100">
              1-Click Amazon URL Auto-Post Generator
            </h2>
            <p className="text-xs text-zinc-400">
              Paste ANY Amazon link. The system cleans tracking tags, embeds your associate tag <span className="text-amber-400 font-mono font-bold">"{customTag}"</span>, extracts info, and generates posts instantly!
            </p>
          </div>
        </div>
      </div>

      {/* Main Form Box */}
      <div className="p-6 rounded-lg bg-white dark:bg-[#18191e] border-2 border-dashed border-zinc-200 dark:border-zinc-800 space-y-5">
        
        {/* Amazon URL Input */}
        <div>
          <label className="block text-xs font-mono font-bold text-zinc-700 dark:text-zinc-300 uppercase mb-2 flex items-center justify-between">
            <span>Paste Amazon Product Link (URL / ASIN)</span>
            <span className="text-amber-500 font-normal">Auto-Sanitized & Tagged</span>
          </label>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Link2 className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="e.g. https://www.amazon.com/dp/B08N5WRWNW or https://amazon.in/dp/..."
                value={rawUrl}
                onChange={(e) => {
                  setRawUrl(e.target.value);
                  setIsExtracted(false);
                }}
                className="w-full pl-9 pr-3 py-2.5 rounded-md bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-xs font-mono text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <button
              onClick={handleExtract}
              disabled={!rawUrl.trim()}
              className="px-5 py-2.5 rounded-md bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold font-mono text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50 shrink-0 shadow-sm"
            >
              <Zap className="w-4 h-4" />
              Extract Info
            </button>
          </div>
        </div>

        {/* Affiliate Tag Settings Row */}
        <div className="p-3 rounded bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
            <span>AFFILIATE TAG TO EMBED:</span>
            <input
              type="text"
              value={customTag}
              onChange={(e) => setCustomTag(e.target.value)}
              className="px-2 py-1 rounded bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-amber-500 font-bold w-32 focus:outline-none focus:border-amber-500 text-center"
            />
          </div>

          {cleanAffiliateUrl && (
            <div className="text-emerald-500 font-mono text-[11px] truncate max-w-full flex items-center gap-1">
              <Check className="w-3.5 h-3.5" />
              Sanitized Link: <a href={cleanAffiliateUrl} target="_blank" rel="noreferrer" className="underline truncate hover:text-emerald-400">{cleanAffiliateUrl}</a>
            </div>
          )}
        </div>

        {/* Extracted Details Editable Card */}
        {isExtracted && (
          <div className="space-y-4 pt-4 border-t border-dashed border-zinc-200 dark:border-zinc-800 animate-fadeIn">
            {/* Review Step Banner */}
            <div className="p-3 rounded bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-mono flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Review before generating (auto-extracted — please check accuracy)</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-amber-500 uppercase flex items-center gap-1">
                <Sparkles className="w-4 h-4" />
                Extracted Product Details (Editable)
              </span>
              {extractedInfo?.asin && (
                <span className="text-[11px] font-mono bg-zinc-200 dark:bg-zinc-800 px-2 py-0.5 rounded text-zinc-700 dark:text-zinc-300">
                  ASIN: {extractedInfo.asin}
                </span>
              )}
            </div>

            {/* Title Input */}
            <div>
              <label className="block text-[11px] font-mono text-zinc-500 mb-1">Product Title</label>
              <input
                type="text"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                className="w-full px-3 py-2 rounded bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-xs text-zinc-900 dark:text-zinc-100 font-bold focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Price / Discount & Image URL */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-mono text-zinc-500 mb-1">Price / Discount Note</label>
                <input
                  type="text"
                  value={customPrice}
                  onChange={(e) => setCustomPrice(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-zinc-500 mb-1">Image URL (Optional)</label>
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/..."
                  value={customImageUrl}
                  onChange={(e) => setCustomImageUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>
            </div>

            {/* Features */}
            <div>
              <label className="block text-[11px] font-mono text-zinc-500 mb-1">Key Selling Features</label>
              <textarea
                rows={3}
                value={customFeatures}
                onChange={(e) => setCustomFeatures(e.target.value)}
                className="w-full px-3 py-2 rounded bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-3 border-t border-zinc-200 dark:border-zinc-800">
              <button
                onClick={handleSaveOnly}
                className="w-full sm:w-auto px-4 py-2.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-mono font-bold flex items-center justify-center gap-2 border border-zinc-700 transition-colors"
              >
                <PackagePlus className="w-4 h-4 text-blue-400" />
                Save to Library Only
              </button>

              <button
                onClick={handleCreateProductAndGenerate}
                className="w-full sm:w-auto px-6 py-2.5 rounded bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-mono font-bold flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
              >
                <Sparkles className="w-4 h-4" />
                ⚡ Generate Social Posts Now
              </button>
            </div>

            {actionSuccess && (
              <div className="p-3 rounded bg-emerald-500/20 text-emerald-400 text-xs font-mono flex items-center gap-2">
                <Check className="w-4 h-4" />
                {actionSuccess}
              </div>
            )}
          </div>
        )}

      </div>

    </div>
  );
};
