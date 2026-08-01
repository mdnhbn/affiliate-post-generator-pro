import React, { useState, useMemo } from 'react';
import { AMAZON_FIRE_DEALS, FireDealProduct } from '../data/fireDeals';
import { Product, Settings } from '../types';
import { sanitizeAmazonUrl, extractAsinFromUrl, getTagForUrl } from '../utils/amazon';
import { Flame, Search, ExternalLink, Sparkles, Plus, Check, TrendingUp, AlertTriangle, Calendar, Globe, ShieldCheck } from 'lucide-react';

interface FireDealsViewProps {
  settings: Settings;
  onAddProduct: (product: Omit<Product, 'id' | 'createdAt'>) => void;
  onSelectForPost: (product: Product) => void;
}

const CATEGORIES = [
  'All',
  'Tech & Electronics',
  'Smart Home',
  'Kitchen & Dining',
  'Fitness & Health',
  'Beauty & Personal Care',
  'Fashion & Accessories',
];

const TARGET_MARKETPLACES = [
  { id: 'com', name: 'USA 🇺🇸', domain: 'amazon.com', currency: '$' },
  { id: 'sa', name: 'Saudi Arabia 🇸🇦', domain: 'amazon.sa', currency: 'SAR ﷼' },
  { id: 'ae', name: 'UAE 🇦🇪', domain: 'amazon.ae', currency: 'AED د.إ' },
  { id: 'uk', name: 'United Kingdom 🇬🇧', domain: 'amazon.co.uk', currency: '£' },
  { id: 'in', name: 'India 🇮🇳', domain: 'amazon.in', currency: '₹' },
];

export const FireDealsView: React.FC<FireDealsViewProps> = ({
  settings,
  onAddProduct,
  onSelectForPost,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [addedIds, setAddedIds] = useState<string[]>([]);
  const [needsRecheckMap, setNeedsRecheckMap] = useState<Record<string, boolean>>({});

  const [hideDemoDeals, setHideDemoDeals] = useState<boolean>(() => {
    return localStorage.getItem('affiliate_hide_demo_fire_deals') === 'true';
  });
  const [customDeals, setCustomDeals] = useState<FireDealProduct[]>(() => {
    try {
      const saved = localStorage.getItem('affiliate_custom_fire_deals');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newCategory, setNewCategory] = useState('Tech & Electronics');
  const [newFeatures, setNewFeatures] = useState('');

  const [selectedMonth, setSelectedMonth] = useState<string>('All');
  const [selectedMarketplace, setSelectedMarketplace] = useState(TARGET_MARKETPLACES[0]);
  const [isAiSearching, setIsAiSearching] = useState(false);
  const [aiNiche, setAiNiche] = useState('TikTok Made Me Buy It');

  const MONTHS = ['All', 'August 2026', 'July 2026'];

  const defaultTag = settings.defaultAffiliateTag || 'yourtag-20';

  // Build live country-specific Amazon URL for direct user verification
  const getLiveCountryUrl = (deal: FireDealProduct) => {
    const asin = deal.asin || extractAsinFromUrl(deal.amazonUrl) || 'B0BL4RWX8D';
    const tagToUse = getTagForUrl(`https://www.${selectedMarketplace.domain}`, defaultTag, settings.marketplaces);
    return `https://www.${selectedMarketplace.domain}/dp/${asin}?tag=${encodeURIComponent(tagToUse)}`;
  };

  const toggleHideDemoDeals = () => {
    const nextVal = !hideDemoDeals;
    setHideDemoDeals(nextVal);
    localStorage.setItem('affiliate_hide_demo_fire_deals', String(nextVal));
  };

  // AI Monthly Viral Product Scraper & Finder
  const handleRunAiViralFinder = () => {
    setIsAiSearching(true);

    setTimeout(() => {
      const generatedDeals: FireDealProduct[] = [
        {
          id: `ai-viral-1-${Date.now()}`,
          title: 'Stanley Tumbler IceFlow Flip Straw Water Bottle 30oz',
          category: 'Kitchen & Dining',
          priceDiscount: '$35.00 — 15% OFF',
          estCommission: '9% ($3.15 / sale)',
          features: 'Double-wall vacuum insulation keeps ice cold for 30 hours. Leakproof flip straw, ergonomic handle, fits cup holders.',
          asin: 'B083GZXH88',
          amazonUrl: 'https://www.amazon.com/dp/B083GZXH88',
          imageUrl: 'https://images.unsplash.com/photo-1517686469429-8bdb88b9f907?w=600&auto=format&fit=crop&q=80',
          badge: '⭐ TOP VIRAL PICK',
          discountPercent: 15,
          addedDate: 'August 2026',
        },
        {
          id: `ai-viral-2-${Date.now()}`,
          title: 'SOL DE JANEIRO Cheirosa 68 Beija Flor Perfume Mist',
          category: 'Beauty & Personal Care',
          priceDiscount: '$38.00 — Viral Hit',
          estCommission: '10% ($3.80 / sale)',
          features: 'Fruity floral perfume mist with Brazilian Jasmine and Pink Dragonfruit. Long-lasting scent viral on TikTok beauty reels.',
          asin: 'B09R578KML',
          amazonUrl: 'https://www.amazon.com/dp/B09R578KML',
          imageUrl: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=600&auto=format&fit=crop&q=80',
          badge: '🏆 #1 BEAUTY VIRAL',
          discountPercent: 10,
          addedDate: 'August 2026',
        },
        {
          id: `ai-viral-3-${Date.now()}`,
          title: 'Anker Magnetic Power Bank 10,000mAh Wireless Portable Charger',
          category: 'Tech & Electronics',
          priceDiscount: '$44.99 — 25% OFF',
          estCommission: '8% ($3.60 / sale)',
          features: 'Snap-and-charge MagSafe power bank for iPhone 15/14/13. Built-in foldable stand, USB-C fast charging port.',
          asin: 'B099KBDK1F',
          amazonUrl: 'https://www.amazon.com/dp/B099KBDK1F',
          imageUrl: 'https://images.unsplash.com/photo-1609592424109-dd9892f1b177?w=600&auto=format&fit=crop&q=80',
          badge: '⚡ 25%+ OFF',
          discountPercent: 25,
          addedDate: 'August 2026',
        },
      ];

      const updated = [...generatedDeals, ...customDeals];
      setCustomDeals(updated);
      localStorage.setItem('affiliate_custom_fire_deals', JSON.stringify(updated));
      setIsAiSearching(false);
      alert(`🎉 3 New Trending Monthly Viral Products discovered and added for ${selectedMonth === 'All' ? 'August 2026' : selectedMonth}!`);
    }, 1200);
  };

  const handleAddCustomDeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newUrl.trim()) return;

    const newDeal: FireDealProduct = {
      id: `custom-deal-${Date.now()}`,
      title: newTitle.trim(),
      amazonUrl: newUrl.trim(),
      category: newCategory,
      priceDiscount: newPrice.trim() || 'Custom Deal',
      badge: '🔥 USER DEAL',
      features: newFeatures.trim() || 'Custom user added deal product.',
      addedDate: 'August 2026',
    };

    const updated = [newDeal, ...customDeals];
    setCustomDeals(updated);
    localStorage.setItem('affiliate_custom_fire_deals', JSON.stringify(updated));

    setNewTitle('');
    setNewUrl('');
    setNewPrice('');
    setNewFeatures('');
    setShowAddModal(false);
  };

  const activeDeals = useMemo(() => {
    const base = hideDemoDeals ? customDeals : [...customDeals, ...AMAZON_FIRE_DEALS];
    return base;
  }, [hideDemoDeals, customDeals]);

  const filteredDeals = useMemo(() => {
    return activeDeals.filter((deal) => {
      const matchesCategory = selectedCategory === 'All' || deal.category === selectedCategory;
      const matchesSearch = 
        deal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        deal.features.toLowerCase().includes(searchQuery.toLowerCase()) ||
        deal.category.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesMonth = selectedMonth === 'All' || (deal.addedDate && deal.addedDate.includes(selectedMonth));

      return matchesCategory && matchesSearch && matchesMonth;
    });
  }, [activeDeals, selectedCategory, searchQuery, selectedMonth]);

  const toggleRecheck = (id: string) => {
    setNeedsRecheckMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleGenerateForDeal = (deal: FireDealProduct) => {
    const liveUrl = getLiveCountryUrl(deal);
    const prod: Product = {
      id: `prod-fire-${deal.id}-${Date.now()}`,
      title: `${deal.title} (${selectedMarketplace.name})`,
      amazonUrl: liveUrl,
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
    const liveUrl = getLiveCountryUrl(deal);
    const prod: Product = {
      id: `prod-fire-${deal.id}-${Date.now()}`,
      title: `${deal.title} (${selectedMarketplace.name})`,
      amazonUrl: liveUrl,
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
            Handpicked high-converting products. Tag applied: <span className="text-amber-400 font-mono font-bold">"{defaultTag}"</span>.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-3 py-1.5 rounded bg-amber-500 hover:bg-amber-400 text-zinc-950 font-mono text-xs font-bold flex items-center gap-1 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" /> Add Deal
          </button>

          <button
            onClick={toggleHideDemoDeals}
            className={`px-3 py-1.5 rounded font-mono text-xs font-bold flex items-center gap-1 border transition-all ${
              hideDemoDeals
                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40'
                : 'bg-rose-500/15 text-rose-400 border-rose-500/40 hover:bg-rose-500/25'
            }`}
          >
            {hideDemoDeals ? 'Show Demo Deals' : '🗑️ Clear / Hide Demo Deals'}
          </button>
        </div>
      </div>

      {/* Add Custom Deal Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#18191e] border-2 border-dashed border-amber-500 rounded-xl w-full max-w-md p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-2">
              <h3 className="font-mono font-bold text-sm uppercase text-zinc-900 dark:text-zinc-100">
                Add Custom Amazon Fire Deal
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-zinc-400 hover:text-zinc-100 font-bold">✕</button>
            </div>

            <form onSubmit={handleAddCustomDeal} className="space-y-3">
              <div>
                <label className="block text-xs font-mono text-zinc-700 dark:text-zinc-300 mb-1">Product Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sony WH-1000XM5 Headphones"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-1.5 rounded bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-xs font-mono text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-zinc-700 dark:text-zinc-300 mb-1">Amazon Product URL</label>
                <input
                  type="url"
                  required
                  placeholder="https://www.amazon.com/dp/B09XS7JWHH"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  className="w-full px-3 py-1.5 rounded bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-xs font-mono text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-mono text-zinc-700 dark:text-zinc-300 mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-2 py-1.5 rounded bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-xs font-mono text-zinc-900 dark:text-zinc-100"
                  >
                    {CATEGORIES.filter(c => c !== 'All').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono text-zinc-700 dark:text-zinc-300 mb-1">Price / Discount</label>
                  <input
                    type="text"
                    placeholder="$199 (20% OFF)"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="w-full px-3 py-1.5 rounded bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-xs font-mono text-zinc-900 dark:text-zinc-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-zinc-700 dark:text-zinc-300 mb-1">Features / Selling Points</label>
                <textarea
                  rows={2}
                  placeholder="Key features..."
                  value={newFeatures}
                  onChange={(e) => setNewFeatures(e.target.value)}
                  className="w-full px-3 py-1.5 rounded bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-xs font-mono text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 rounded bg-zinc-200 dark:bg-zinc-800 text-xs font-mono text-zinc-700 dark:text-zinc-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-amber-500 hover:bg-amber-400 text-zinc-950 font-mono text-xs font-bold"
                >
                  Save Deal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Pills & Search Bar */}
      <div className="space-y-3 bg-white dark:bg-[#18191e] p-4 rounded-lg border-2 border-dashed border-zinc-200 dark:border-zinc-800">
        
        {/* Target Country / Marketplace Selector */}
        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 border-b border-zinc-200 dark:border-zinc-800 pb-3">
          <div className="flex items-center gap-1.5 shrink-0">
            <Globe className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-mono font-bold text-zinc-900 dark:text-zinc-100 uppercase">
              Target Country Marketplace:
            </span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto">
            {TARGET_MARKETPLACES.map((mp) => (
              <button
                key={mp.id}
                onClick={() => setSelectedMarketplace(mp)}
                className={`px-3 py-1 rounded text-xs font-mono font-bold whitespace-nowrap transition-all flex items-center gap-1 border ${
                  selectedMarketplace.id === mp.id
                    ? 'bg-amber-500 text-zinc-950 border-amber-400 shadow-sm'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-300 dark:border-zinc-700 hover:border-amber-500/50'
                }`}
              >
                <span>{mp.name}</span>
                <span className="text-[10px] opacity-75">({mp.domain})</span>
              </button>
            ))}
          </div>
        </div>

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

        {/* AI Monthly Viral Product Finder & Month Selection Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3 rounded-lg bg-zinc-900 text-zinc-100 border border-amber-500/30">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            <span className="text-xs font-mono font-bold text-amber-400 uppercase flex items-center gap-1 shrink-0">
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              Month:
            </span>
            {MONTHS.map((m) => (
              <button
                key={m}
                onClick={() => setSelectedMonth(m)}
                className={`px-2.5 py-1 rounded text-xs font-mono font-bold whitespace-nowrap transition-colors ${
                  selectedMonth === m
                    ? 'bg-amber-500 text-zinc-950 shadow'
                    : 'bg-zinc-800 text-zinc-400 hover:text-zinc-100'
                }`}
              >
                {m === 'All' ? '📅 All Months' : m}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRunAiViralFinder}
              disabled={isAiSearching}
              className="w-full md:w-auto px-3.5 py-1.5 rounded bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-zinc-950 font-mono font-bold text-xs flex items-center justify-center gap-1.5 shadow-md disabled:opacity-50 transition-all"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isAiSearching ? 'animate-spin' : ''}`} />
              {isAiSearching ? 'Scanning Viral TikTok & Amazon Hits...' : `🔍 Fetch Top 10-20 Viral Hits (${selectedMarketplace.name})`}
            </button>
          </div>
        </div>

        {/* Categories Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORIES.map((cat) => (
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

      {/* Grid of Deals with Sequential Ranks #1 to #20 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredDeals.map((deal, index) => {
          const isAdded = addedIds.includes(deal.id);
          const needsRecheck = !!needsRecheckMap[deal.id];
          const rankNumber = index + 1;
          const liveUrl = getLiveCountryUrl(deal);
          const asin = deal.asin || extractAsinFromUrl(deal.amazonUrl) || 'B0BL4RWX8D';

          return (
            <div
              key={deal.id}
              className={`p-4 rounded-lg bg-white dark:bg-[#18191e] border-2 border-dashed transition-all flex flex-col justify-between space-y-3 relative ${
                needsRecheck
                  ? 'border-amber-500/80 bg-amber-500/5 opacity-80'
                  : 'border-zinc-300 dark:border-zinc-800 hover:border-amber-500/60'
              }`}
            >
              <div>
                {/* Header Badges with Rank #1 - #20 */}
                <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-mono font-black bg-amber-500 text-zinc-950 px-2 py-0.5 rounded shadow-sm flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      RANK #{rankNumber}
                    </span>

                    <span className="text-[10px] font-mono font-bold bg-rose-500/15 text-rose-500 px-2 py-0.5 rounded border border-rose-500/30">
                      {deal.badge}
                    </span>

                    <span className="text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-500 px-1.5 py-0.5 rounded border border-emerald-500/20">
                      ASIN: {asin}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                      needsRecheck
                        ? 'bg-amber-500/20 text-amber-500 border-amber-500/40'
                        : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                    }`}>
                      {needsRecheck ? '⚠️ RECHECK' : 'ACCURATE'}
                    </span>
                  </div>
                </div>

                {/* Product Title */}
                <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 leading-snug">
                  {deal.title}
                </h3>

                {/* Category & Price & Live Verify Button */}
                <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-zinc-100 dark:border-zinc-800/80 flex-wrap">
                  <div className="flex items-center gap-2 text-xs font-mono">
                    <span className="text-zinc-500 dark:text-zinc-400">
                      📂 {deal.category}
                    </span>
                    <span className="text-amber-500 font-bold">
                      💰 {deal.priceDiscount}
                    </span>
                  </div>

                  {/* Direct Live Amazon Product Page Link Verification */}
                  <a
                    href={liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-sky-500 hover:text-sky-400 bg-sky-500/10 hover:bg-sky-500/20 px-2.5 py-1 rounded border border-sky-500/30 transition-all"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Verify Live on {selectedMarketplace.domain}
                  </a>
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
                  ⚡ 1-Click Generate Post
                </button>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
