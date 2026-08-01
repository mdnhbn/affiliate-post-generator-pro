import React, { useState, useMemo } from 'react';
import { AMAZON_FIRE_DEALS, FireDealProduct } from '../data/fireDeals';
import { Product, Settings } from '../types';
import { sanitizeAmazonUrl } from '../utils/amazon';
import { Flame, Search, ExternalLink, Sparkles, Plus, Check, TrendingUp, AlertTriangle, Calendar } from 'lucide-react';

interface FireDealsViewProps {
  settings: Settings;
  onAddProduct: (product: Omit<Product, 'id' | 'createdAt'>) => void;
  onSelectForPost: (product: Product) => void;
}

export const FireDealsView: React.FC<FireDealsViewProps> = ({
  settings,
  onAddProduct,
  onSelectForPost,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [addedIds, setAddedIds] = useState<string[]>([]);
  const [needsRecheckMap, setNeedsRecheckMap] = useState<Record<string, boolean>>({});

  const defaultTag = settings.defaultAffiliateTag || 'yourtag-20';

  const categories = [
    'All',
    'Tech & Electronics',
    'Smart Home',
    'Kitchen & Dining',
    'Fitness & Health',
    'Beauty & Personal Care',
    'Fashion & Accessories',
  ];

  const filteredDeals = useMemo(() => {
    return AMAZON_FIRE_DEALS.filter((deal) => {
      const matchesCategory = selectedCategory === 'All' || deal.category === selectedCategory;
      const matchesSearch = 
        deal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        deal.features.toLowerCase().includes(searchQuery.toLowerCase()) ||
        deal.category.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const toggleRecheck = (id: string) => {
    setNeedsRecheckMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleGenerateForDeal = (deal: FireDealProduct) => {
    const cleanUrl = sanitizeAmazonUrl(deal.amazonUrl, defaultTag, settings.marketplaces);
    const prod: Product = {
      id: `prod-fire-${deal.id}-${Date.now()}`,
      title: deal.title,
      amazonUrl: cleanUrl,
      features: deal.features,
      priceDiscount: deal.priceDiscount,
      imageUrl: deal.imageUrl,
      createdAt: Date.now(),
      lastVerifiedAt: Date.now(),
    };

    onAddProduct(prod);
    onSelectForPost(prod);
  };

  const handleSaveToLibrary = (deal: FireDealProduct) => {
    const cleanUrl = sanitizeAmazonUrl(deal.amazonUrl, defaultTag, settings.marketplaces);
    const prod: Product = {
      id: `prod-fire-${deal.id}-${Date.now()}`,
      title: deal.title,
      amazonUrl: cleanUrl,
      features: deal.features,
      priceDiscount: deal.priceDiscount,
      imageUrl: deal.imageUrl,
      createdAt: Date.now(),
      lastVerifiedAt: Date.now(),
    };

    onAddProduct(prod);
    setAddedIds((prev) => [...prev, deal.id]);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      
      {/* Top Banner */}
      <div className="p-5 rounded-lg bg-zinc-900 text-zinc-100 border-2 border-dashed border-rose-500/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-mono font-bold uppercase tracking-tight text-zinc-100 flex items-center gap-2">
            <Flame className="w-5 h-5 text-rose-500 fill-rose-500 animate-pulse" />
            Amazon Fire Deals & Best Sellers Catalog
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Handpicked high-converting products updated weekly. Select any deal to generate viral posts or save to library in 1-Click with tag <span className="text-amber-400 font-mono font-bold">"{defaultTag}"</span>.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-rose-500/10 border border-rose-500/30 text-rose-400 font-mono text-xs font-bold">
          <TrendingUp className="w-4 h-4" />
          EST. COMMISSION: 8% - 10%
        </div>
      </div>

      {/* Category Pills & Search Bar */}
      <div className="space-y-3 bg-white dark:bg-[#18191e] p-4 rounded-lg border-2 border-dashed border-zinc-200 dark:border-zinc-800">
        
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search high-converting Fire Deals, categories, specs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-md bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-amber-500 font-mono"
          />
        </div>

        {/* Categories Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-mono font-bold whitespace-nowrap transition-all border ${
                selectedCategory === cat
                  ? 'bg-amber-500 text-zinc-950 border-amber-400 shadow-sm'
                  : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-300 dark:border-zinc-800 hover:border-zinc-400'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

      </div>

      {/* Grid of Deals */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredDeals.map((deal) => {
          const isAdded = addedIds.includes(deal.id);
          const needsRecheck = !!needsRecheckMap[deal.id];

          return (
            <div
              key={deal.id}
              className={`p-4 rounded-lg bg-white dark:bg-[#18191e] border-2 border-dashed transition-all flex flex-col justify-between space-y-3 ${
                needsRecheck
                  ? 'border-amber-500/80 bg-amber-500/5 opacity-80'
                  : 'border-zinc-300 dark:border-zinc-800 hover:border-amber-500/60'
              }`}
            >
              <div>
                {/* Header Badges */}
                <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono font-bold bg-rose-500/15 text-rose-500 px-2 py-0.5 rounded border border-rose-500/30">
                      {deal.badge}
                    </span>
                    {deal.addedDate && (
                      <span className="text-[10px] font-mono text-zinc-500 flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">
                        <Calendar className="w-3 h-3 text-amber-500" /> Added {deal.addedDate}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                      needsRecheck
                        ? 'bg-amber-500/20 text-amber-500 border-amber-500/40'
                        : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                    }`}>
                      {needsRecheck ? '⚠️ NEEDS RECHECK' : 'STILL ACCURATE'}
                    </span>
                    <button
                      onClick={() => toggleRecheck(deal.id)}
                      className="text-[10px] font-mono text-zinc-400 hover:text-amber-500 underline"
                    >
                      {needsRecheck ? 'Mark Accurate' : 'Flag Recheck'}
                    </button>
                  </div>
                </div>

                {/* Product Title */}
                <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 leading-snug">
                  {deal.title}
                </h3>

                {/* Category & Price */}
                <div className="flex items-center gap-3 mt-1.5 text-xs font-mono">
                  <span className="text-zinc-500 dark:text-zinc-400">
                    📂 {deal.category}
                  </span>
                  <span className="text-amber-500 font-bold">
                    💰 {deal.priceDiscount}
                  </span>
                </div>

                {/* Features */}
                <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-2 line-clamp-3 leading-relaxed">
                  {deal.features}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-dashed border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center gap-2">
                <button
                  onClick={() => handleSaveToLibrary(deal)}
                  disabled={isAdded}
                  className={`w-full sm:w-1/2 py-2 px-3 rounded text-xs font-mono font-bold flex items-center justify-center gap-1.5 border transition-all ${
                    isAdded
                      ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700 border-zinc-300 dark:border-zinc-700'
                  }`}
                >
                  {isAdded ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Plus className="w-3.5 h-3.5" />}
                  {isAdded ? 'Saved to Library' : 'Save to Library'}
                </button>

                <button
                  onClick={() => handleGenerateForDeal(deal)}
                  className="w-full sm:w-1/2 py-2 px-3 rounded bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-mono font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-95"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  ⚡ 1-Click Generate
                </button>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
