import React, { useState, useMemo } from 'react';
import { 
  Product, 
  PlatformId, 
  ContentTypeId, 
  ToneId, 
  GenerationOptions, 
  PostResult, 
  GenerationCardState, 
  Settings 
} from '../types';
import { 
  PLATFORM_NAMES, 
  CONTENT_TYPE_NAMES, 
  TONE_NAMES, 
  generateSinglePost 
} from '../utils/ai';
import { sanitizeAmazonUrl } from '../utils/amazon';
import { logAnalyticsEvent } from '../utils/storage';
import { QrCodeModal } from './QrCodeModal';
import { ScheduleModal } from './ScheduleModal';
import { 
  Sparkles, 
  Package, 
  Plus, 
  Check, 
  Copy, 
  RotateCw, 
  X, 
  Sliders, 
  Info, 
  Video, 
  Image as ImageIcon, 
  Share2,
  AlertTriangle,
  Flame,
  Wand2,
  Users,
  Target,
  QrCode,
  Calendar,
  Download
} from 'lucide-react';
import { Barcode } from './Barcode';

interface GenerateViewProps {
  products: Product[];
  settings: Settings;
  onAddProduct: (product: Omit<Product, 'id' | 'createdAt'>) => void;
  onPostGenerated: (result: PostResult) => void;
  onSettingsUpdated: (updated: Settings) => void;
  selectedProductForPost?: Product | null;
  onClearSelectedProductForPost?: () => void;
}

const PRESET_LANGUAGES = ['English', 'Bengali', 'Arabic', 'Hindi', 'Urdu'];

const TARGET_AUDIENCES = [
  'General Online Shoppers',
  'Gen Z & Tech Enthusiasts',
  'Bargain & Discount Hunters',
  'Busy Parents & Home Makers',
  'Fitness & Wellness Enthusiasts',
  'Professionals & Remote Workers'
];

const CTA_TYPES = [
  'Direct Affiliate Link in Post',
  'Link in Bio / Profile',
  'DM for Direct Buying Link',
  'Comment WANT to get Link'
];

export const GenerateView: React.FC<GenerateViewProps> = ({
  products,
  settings,
  onAddProduct,
  onPostGenerated,
  onSettingsUpdated,
  selectedProductForPost,
  onClearSelectedProductForPost,
}) => {
  // Product Selection Mode
  const [selectedProductId, setSelectedProductId] = useState<string>(
    selectedProductForPost ? selectedProductForPost.id : products[0]?.id || ''
  );
  
  // Multi-product selection for Listicle
  const [listicleProductIds, setListicleProductIds] = useState<string[]>(
    products.slice(0, 3).map((p) => p.id)
  );

  // Quick Inline Product Mode
  const [showQuickAdd, setShowQuickAdd] = useState<boolean>(false);
  const [quickTitle, setQuickTitle] = useState('');
  const [quickUrl, setQuickUrl] = useState('');
  const [quickFeatures, setQuickFeatures] = useState('');
  const [quickPrice, setQuickPrice] = useState('');
  const [saveQuickToLibrary, setSaveQuickToLibrary] = useState(true);

  // Platforms Selection
  const [selectedPlatforms, setSelectedPlatforms] = useState<PlatformId[]>(
    settings.defaultPlatforms.length > 0 ? settings.defaultPlatforms : ['instagram_post', 'facebook']
  );

  // Languages Selection
  const [availableLanguages, setAvailableLanguages] = useState<string[]>([
    ...new Set([...PRESET_LANGUAGES, ...settings.defaultLanguages])
  ]);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(
    settings.defaultLanguages.length > 0 ? settings.defaultLanguages : ['English', 'Bengali']
  );
  const [customLangInput, setCustomLangInput] = useState('');

  // Options
  const [contentType, setContentType] = useState<ContentTypeId>('promotional');
  const [tone, setTone] = useState<ToneId>('friendly');
  const [targetAudience, setTargetAudience] = useState<string>(TARGET_AUDIENCES[0]);
  const [ctaType, setCtaType] = useState<string>(CTA_TYPES[0]);
  
  // Toggles (default ON except last two)
  const [includeCta, setIncludeCta] = useState(true);
  const [includeHashtags, setIncludeHashtags] = useState(true);
  const [includeEmoji, setIncludeEmoji] = useState(true);
  const [includeDisclosure, setIncludeDisclosure] = useState(settings.amazonAssociateDisclosure ?? true);
  const [generateImagePrompt, setGenerateImagePrompt] = useState(false);
  const [generateVideoHook, setGenerateVideoHook] = useState(false);
  const [generateHookVariants, setGenerateHookVariants] = useState(false);
  const [generateActualImage, setGenerateActualImage] = useState(true);

  // Quick Inline Product Mode Image URL State
  const [quickImageUrl, setQuickImageUrl] = useState('');

  // Active Variant Switcher per Card ID State
  const [activeVariantMap, setActiveVariantMap] = useState<Record<string, 'A' | 'B'>>({});

  // Advanced / Inspiration
  const [customInstructions, setCustomInstructions] = useState('');
  const [inspirationPost, setInspirationPost] = useState('');

  // Generation Cards State
  const [cards, setCards] = useState<GenerationCardState[]>([]);
  const [isGeneratingBatch, setIsGeneratingBatch] = useState(false);
  const [copiedCardId, setCopiedCardId] = useState<string | null>(null);

  // Modals state
  const [qrModalData, setQrModalData] = useState<{ url: string; title: string } | null>(null);
  const [scheduleModalPost, setScheduleModalPost] = useState<PostResult | null>(null);

  // Handle Add Custom Language Chip
  const handleAddCustomLanguage = () => {
    const trimmed = customLangInput.trim();
    if (!trimmed) return;
    if (!availableLanguages.includes(trimmed)) {
      setAvailableLanguages([...availableLanguages, trimmed]);
    }
    if (!selectedLanguages.includes(trimmed)) {
      setSelectedLanguages([...selectedLanguages, trimmed]);
    }
    setCustomLangInput('');
  };

  const togglePlatform = (p: PlatformId) => {
    setSelectedPlatforms((prev) =>
      prev.includes(p) ? prev.filter((item) => item !== p) : [...prev, p]
    );
  };

  const toggleLanguage = (lang: string) => {
    setSelectedLanguages((prev) =>
      prev.includes(lang) ? prev.filter((item) => item !== lang) : [...prev, lang]
    );
  };

  const toggleListicleProduct = (id: string) => {
    setListicleProductIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  // Calculated Post Count
  const totalCount = useMemo(() => {
    return selectedPlatforms.length * selectedLanguages.length;
  }, [selectedPlatforms.length, selectedLanguages.length]);

  // Construct current active product list (with auto tag sanitization)
  const activeProducts = useMemo(() => {
    if (showQuickAdd) {
      const sanitizedUrl = sanitizeAmazonUrl(quickUrl || 'https://amazon.com', settings.defaultAffiliateTag, settings.marketplaces);
      return [{
        id: `quick-${Date.now()}`,
        title: quickTitle || 'Amazon Product',
        amazonUrl: sanitizedUrl,
        features: quickFeatures,
        priceDiscount: quickPrice,
        imageUrl: quickImageUrl.trim() || undefined,
        createdAt: Date.now(),
        lastVerifiedAt: Date.now(),
      }];
    }

    if (contentType === 'listicle') {
      return products.filter((p) => listicleProductIds.includes(p.id));
    }

    const single = products.find((p) => p.id === selectedProductId);
    return single ? [single] : (products.length > 0 ? [products[0]] : []);
  }, [showQuickAdd, quickTitle, quickUrl, quickFeatures, quickPrice, quickImageUrl, contentType, products, listicleProductIds, selectedProductId, settings.defaultAffiliateTag, settings.marketplaces]);

  // Execute Batch Concurrent Generation
  const handleGenerateBatch = async () => {
    if (selectedPlatforms.length === 0) {
      alert('Please select at least one target platform.');
      return;
    }
    if (selectedLanguages.length === 0) {
      alert('Please select at least one target language.');
      return;
    }

    if (showQuickAdd && (!quickTitle.trim() || !quickUrl.trim())) {
      alert('Please fill out the Quick-Add Product Title and Amazon Link.');
      return;
    }

    if (contentType === 'listicle' && activeProducts.length < 2) {
      alert('Listicle mode requires selecting at least 2 products from your library.');
      return;
    }

    if (!showQuickAdd && activeProducts.length === 0) {
      alert('Please select a product or add one to your library.');
      return;
    }

    // Save Quick Add product if checked
    if (showQuickAdd && saveQuickToLibrary && quickTitle.trim() && quickUrl.trim()) {
      const sanitizedUrl = sanitizeAmazonUrl(quickUrl.trim(), settings.defaultAffiliateTag, settings.marketplaces);
      onAddProduct({
        title: quickTitle.trim(),
        amazonUrl: sanitizedUrl,
        features: quickFeatures.trim(),
        priceDiscount: quickPrice.trim(),
        imageUrl: quickImageUrl.trim() || undefined,
        lastVerifiedAt: Date.now(),
      });
      setShowQuickAdd(false);
    }

    const options: GenerationOptions = {
      products: activeProducts,
      platforms: selectedPlatforms,
      languages: selectedLanguages,
      contentType,
      tone,
      targetAudience,
      ctaType,
      includeCta,
      includeHashtags,
      includeEmoji,
      includeDisclosure,
      generateImagePrompt,
      generateVideoHook,
      generateHookVariants,
      generateActualImage,
      customInstructions: customInstructions.trim() || undefined,
      inspirationPost: inspirationPost.trim() || undefined,
    };

    // Build initial skeleton cards
    const initialCards: GenerationCardState[] = [];
    selectedPlatforms.forEach((platform) => {
      selectedLanguages.forEach((lang) => {
        initialCards.push({
          id: `card-${platform}-${lang}-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
          platform,
          language: lang,
          product: activeProducts[0],
          status: 'loading',
        });
      });
    });

    setCards(initialCards);
    setIsGeneratingBatch(true);

    // Concurrently trigger each card generation independently!
    initialCards.forEach(async (card) => {
      try {
        const result = await generateSinglePost(
          options,
          card.platform,
          card.language,
          settings,
          onSettingsUpdated
        );

        // Update individual card state on resolution
        setCards((prev) =>
          prev.map((c) => (c.id === card.id ? { ...c, status: 'success', result } : c))
        );

        // Auto-save result to history
        onPostGenerated(result);

        // Log analytics
        logAnalyticsEvent({
          postId: result.id,
          productId: result.productId,
          productTitle: result.productTitle,
          platform: result.platform,
          language: result.language,
          action: 'generated',
        });
      } catch (err: any) {
        setCards((prev) =>
          prev.map((c) =>
            c.id === card.id
              ? { ...c, status: 'error', error: err.message || 'Generation failed' }
              : c
          )
        );
      }
    });

    setIsGeneratingBatch(false);
  };

  // Single Card Retry / Regenerate
  const handleRegenerateCard = async (cardId: string) => {
    const card = cards.find((c) => c.id === cardId);
    if (!card) return;

    setCards((prev) =>
      prev.map((c) => (c.id === cardId ? { ...c, status: 'loading', error: undefined } : c))
    );

    const options: GenerationOptions = {
      products: activeProducts,
      platforms: [card.platform],
      languages: [card.language],
      contentType,
      tone,
      targetAudience,
      ctaType,
      includeCta,
      includeHashtags,
      includeEmoji,
      includeDisclosure,
      generateImagePrompt,
      generateVideoHook,
      customInstructions: customInstructions.trim() || undefined,
      inspirationPost: inspirationPost.trim() || undefined,
    };

    try {
      const result = await generateSinglePost(
        options,
        card.platform,
        card.language,
        settings,
        onSettingsUpdated
      );

      setCards((prev) =>
        prev.map((c) => (c.id === cardId ? { ...c, status: 'success', result } : c))
      );

      onPostGenerated(result);
    } catch (err: any) {
      setCards((prev) =>
        prev.map((c) =>
          c.id === cardId
            ? { ...c, status: 'error', error: err.message || 'Regeneration failed' }
            : c
        )
      );
    }
  };

  const handleDismissCard = (cardId: string) => {
    setCards((prev) => prev.filter((c) => c.id !== cardId));
  };

  const handleCopyCardText = (result: PostResult) => {
    navigator.clipboard.writeText(result.text);
    setCopiedCardId(result.id);
    setTimeout(() => setCopiedCardId(null), 2000);

    logAnalyticsEvent({
      postId: result.id,
      productId: result.productId,
      productTitle: result.productTitle,
      platform: result.platform,
      language: result.language,
      action: 'copied',
    });
  };

  const handleBulkExport = () => {
    const successful = cards.filter((c) => c.status === 'success' && c.result).map((c) => c.result!);
    if (successful.length === 0) return;

    const formatted = successful.map((p, idx) => 
      `--- POST #${idx + 1} (${PLATFORM_NAMES[p.platform]} - ${p.language}) ---\nProduct: ${p.productTitle}\nLink: ${p.productUrl}\n\n${p.text}\n\n`
    ).join('\n');

    const blob = new Blob([formatted], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Batch-Posts-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      
      {/* Configuration Studio Form */}
      <div className="bg-white dark:bg-[#18191e] border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl p-5 md:p-6 shadow-sm space-y-6">
        
        {/* Parcel Form Title Header */}
        <div className="flex items-center justify-between border-b border-dashed border-zinc-200 dark:border-zinc-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-amber-500 text-zinc-950 font-bold shadow-sm">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-mono font-bold text-lg text-zinc-900 dark:text-zinc-100 uppercase tracking-tight flex items-center gap-2">
                Viral Content Studio
                <span className="text-[10px] bg-amber-500/20 text-amber-500 px-2 py-0.5 rounded border border-amber-500/30">
                  DISPATCH CONTROL
                </span>
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Select products, target social networks, target languages, and AI tone.
              </p>
            </div>
          </div>

          <Barcode code="DISPATCH-STD-09" height={18} className="hidden sm:flex text-amber-500" />
        </div>

        {/* 1. Product Selection */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-mono font-bold uppercase text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
              <Package className="w-4 h-4 text-amber-500" />
              1. Select Amazon Product(s)
            </label>

            <button
              onClick={() => setShowQuickAdd(!showQuickAdd)}
              className="text-xs font-mono text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 font-bold"
            >
              {showQuickAdd ? '← Select from Library' : '+ Quick-Add Product Inline'}
            </button>
          </div>

          {showQuickAdd ? (
            /* Quick Add Inline Form */
            <div className="p-4 rounded-lg bg-amber-500/10 border-2 border-dashed border-amber-500/40 space-y-3">
              <div className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400 uppercase">
                ⚡ Quick Inline Product Add
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Product Title *"
                  value={quickTitle}
                  onChange={(e) => setQuickTitle(e.target.value)}
                  className="px-3 py-2 rounded bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-amber-500"
                />
                <input
                  type="url"
                  placeholder="Amazon Affiliate Link *"
                  value={quickUrl}
                  onChange={(e) => setQuickUrl(e.target.value)}
                  className="px-3 py-2 rounded bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="Price / Discount (e.g. $29.99 20% off)"
                  value={quickPrice}
                  onChange={(e) => setQuickPrice(e.target.value)}
                  className="px-3 py-2 rounded bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-amber-500"
                />
                <input
                  type="text"
                  placeholder="Key Features & Pain Points"
                  value={quickFeatures}
                  onChange={(e) => setQuickFeatures(e.target.value)}
                  className="px-3 py-2 rounded bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-amber-500"
                />
                <input
                  type="url"
                  placeholder="Image URL (Optional)"
                  value={quickImageUrl}
                  onChange={(e) => setQuickImageUrl(e.target.value)}
                  className="px-3 py-2 rounded bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <label className="flex items-center gap-2 text-xs font-mono text-zinc-700 dark:text-zinc-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={saveQuickToLibrary}
                  onChange={(e) => setSaveQuickToLibrary(e.target.checked)}
                  className="rounded border-zinc-700 text-amber-500 focus:ring-amber-500"
                />
                Save this product to your library for future posts
              </label>
            </div>
          ) : contentType === 'listicle' ? (
            /* Listicle Multi-Product Selection */
            <div className="p-4 rounded-lg bg-purple-500/10 border-2 border-dashed border-purple-500/40 space-y-3">
              <div className="text-xs font-mono font-bold text-purple-600 dark:text-purple-400 uppercase flex items-center justify-between">
                <span>📋 Listicle Multi-Product Selection (Choose 2-5 Items)</span>
                <span>{listicleProductIds.length} Selected</span>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {products.map((prod) => (
                  <button
                    key={prod.id}
                    onClick={() => toggleListicleProduct(prod.id)}
                    className={`p-2.5 rounded-md border text-left transition-all text-xs font-mono flex items-center gap-2 ${
                      listicleProductIds.includes(prod.id)
                        ? 'border-purple-500 bg-purple-500/20 text-purple-700 dark:text-purple-300 font-bold'
                        : 'border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                      listicleProductIds.includes(prod.id) ? 'bg-purple-500 text-zinc-950 border-purple-400' : 'border-zinc-500'
                    }`}>
                      {listicleProductIds.includes(prod.id) && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <span className="truncate">{prod.title}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Single Product Picker Dropdown */
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-md bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-sm font-mono text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-amber-500"
            >
              {products.map((prod) => (
                <option key={prod.id} value={prod.id}>
                  {prod.title} ({prod.priceDiscount || 'No price tag'})
                </option>
              ))}
            </select>
          )}
        </div>

        {/* 2. Target Platforms (Multi-Select Chips) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-mono font-bold uppercase text-zinc-800 dark:text-zinc-200">
              2. Target Social Platforms ({selectedPlatforms.length} Selected)
            </label>
            <span className="text-[11px] font-mono text-zinc-500">Each selected platform generates a tailored post</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {(Object.keys(PLATFORM_NAMES) as PlatformId[]).map((pId) => {
              const isSelected = selectedPlatforms.includes(pId);
              return (
                <button
                  key={pId}
                  onClick={() => togglePlatform(pId)}
                  className={`px-3 py-1.5 rounded-full border text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-amber-500 text-zinc-950 border-amber-400 shadow-sm'
                      : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-400 border-zinc-300 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-700'
                  }`}
                >
                  {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                  {PLATFORM_NAMES[pId]}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Languages (Multi-Select Chips + Custom Input) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-mono font-bold uppercase text-zinc-800 dark:text-zinc-200">
              3. Target Languages ({selectedLanguages.length} Selected)
            </label>
            <span className="text-[11px] font-mono text-zinc-500">Culturally fluent non-literal AI translations</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {availableLanguages.map((lang) => {
              const isSelected = selectedLanguages.includes(lang);
              return (
                <button
                  key={lang}
                  onClick={() => toggleLanguage(lang)}
                  className={`px-3 py-1.5 rounded-full border text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-purple-500 text-zinc-950 border-purple-400 shadow-sm'
                      : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-400 border-zinc-300 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-700'
                  }`}
                >
                  {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                  {lang}
                </button>
              );
            })}

            {/* Custom Language Add Input */}
            <div className="flex items-center gap-1">
              <input
                type="text"
                placeholder="+ Add language..."
                value={customLangInput}
                onChange={(e) => setCustomLangInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCustomLanguage())}
                className="px-3 py-1 rounded-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-xs font-mono text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-purple-500 w-36"
              />
              <button
                type="button"
                onClick={handleAddCustomLanguage}
                className="p-1 rounded-full bg-purple-500 text-zinc-950 hover:bg-purple-400 font-bold"
                title="Add Language Chip"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* 4. Content Type & Tone Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-mono font-bold uppercase text-zinc-800 dark:text-zinc-200 mb-1">
              Content Angle / Format
            </label>
            <select
              value={contentType}
              onChange={(e) => setContentType(e.target.value as ContentTypeId)}
              disabled={!!inspirationPost.trim()}
              className="w-full px-3 py-2 rounded-md bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-xs font-mono text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-amber-500 disabled:opacity-50"
            >
              {Object.entries(CONTENT_TYPE_NAMES).map(([id, name]) => (
                <option key={id} value={id}>{name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-mono font-bold uppercase text-zinc-800 dark:text-zinc-200 mb-1">
              Tone of Voice
            </label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value as ToneId)}
              disabled={!!inspirationPost.trim()}
              className="w-full px-3 py-2 rounded-md bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-xs font-mono text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-amber-500 disabled:opacity-50"
            >
              {Object.entries(TONE_NAMES).map(([id, name]) => (
                <option key={id} value={id}>{name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-mono font-bold uppercase text-zinc-800 dark:text-zinc-200 mb-1 flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-amber-500" /> Target Audience
            </label>
            <select
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              className="w-full px-3 py-2 rounded-md bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-xs font-mono text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-amber-500"
            >
              {TARGET_AUDIENCES.map((aud) => (
                <option key={aud} value={aud}>{aud}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-mono font-bold uppercase text-zinc-800 dark:text-zinc-200 mb-1 flex items-center gap-1">
              <Target className="w-3.5 h-3.5 text-purple-500" /> Call-To-Action Style
            </label>
            <select
              value={ctaType}
              onChange={(e) => setCtaType(e.target.value)}
              className="w-full px-3 py-2 rounded-md bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-xs font-mono text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-amber-500"
            >
              {CTA_TYPES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Compliance Warning & Price Disclaimer Banners */}
        {(!includeDisclosure || !settings.amazonAssociateDisclosure) && (
          <div className="p-3 rounded-lg bg-amber-500/15 border border-amber-500/40 text-amber-600 dark:text-amber-400 text-xs font-mono flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-500" />
            <span>⚠️ Warning: Amazon Associate Disclosure is currently disabled. Amazon Operating Agreement requires explicit affiliate disclosures on promotional posts.</span>
          </div>
        )}

        <div className="p-2.5 rounded bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[11px] font-mono text-zinc-500 flex items-center justify-between">
          <span>ℹ️ Prices and deals change frequently on Amazon — double-check pricing before publishing.</span>
          <span className="text-amber-500 font-bold">100% Client Security</span>
        </div>

        {/* 5. Toggles Grid */}
        <div className="space-y-2 pt-2 border-t border-dashed border-zinc-200 dark:border-zinc-800">
          <label className="text-xs font-mono font-bold uppercase text-zinc-800 dark:text-zinc-200 block">
            Post Feature Toggles
          </label>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            
            <label className="flex items-center gap-2 text-xs font-mono text-zinc-700 dark:text-zinc-300 cursor-pointer">
              <input
                type="checkbox"
                checked={includeCta}
                onChange={(e) => setIncludeCta(e.target.checked)}
                className="rounded border-zinc-700 text-amber-500 focus:ring-amber-500"
              />
              Include Call to Action
            </label>

            <label className="flex items-center gap-2 text-xs font-mono text-zinc-700 dark:text-zinc-300 cursor-pointer">
              <input
                type="checkbox"
                checked={includeHashtags}
                onChange={(e) => setIncludeHashtags(e.target.checked)}
                className="rounded border-zinc-700 text-amber-500 focus:ring-amber-500"
              />
              Include Hashtags
            </label>

            <label className="flex items-center gap-2 text-xs font-mono text-zinc-700 dark:text-zinc-300 cursor-pointer">
              <input
                type="checkbox"
                checked={includeEmoji}
                onChange={(e) => setIncludeEmoji(e.target.checked)}
                className="rounded border-zinc-700 text-amber-500 focus:ring-amber-500"
              />
              Include Emojis
            </label>

            <label className="flex items-center gap-2 text-xs font-mono text-zinc-700 dark:text-zinc-300 cursor-pointer">
              <input
                type="checkbox"
                checked={includeDisclosure}
                onChange={(e) => setIncludeDisclosure(e.target.checked)}
                className="rounded border-zinc-700 text-amber-500 focus:ring-amber-500"
              />
              Amazon Associate Disclosure
            </label>

            <label className="flex items-center gap-2 text-xs font-mono text-zinc-700 dark:text-zinc-300 cursor-pointer">
              <input
                type="checkbox"
                checked={generateHookVariants}
                onChange={(e) => setGenerateHookVariants(e.target.checked)}
                className="rounded border-zinc-700 text-amber-500 focus:ring-amber-500"
              />
              Generate 2 A/B Hook Variants
            </label>

            <label className="flex items-center gap-2 text-xs font-mono text-zinc-700 dark:text-zinc-300 cursor-pointer">
              <input
                type="checkbox"
                checked={generateActualImage}
                onChange={(e) => setGenerateActualImage(e.target.checked)}
                className="rounded border-zinc-700 text-amber-500 focus:ring-amber-500"
              />
              Generate Actual Image
            </label>

            <label className="flex items-center gap-2 text-xs font-mono text-zinc-700 dark:text-zinc-300 cursor-pointer">
              <input
                type="checkbox"
                checked={generateImagePrompt}
                onChange={(e) => setGenerateImagePrompt(e.target.checked)}
                className="rounded border-zinc-700 text-amber-500 focus:ring-amber-500"
              />
              Generate Matching Image Specs
            </label>

            <label className="flex items-center gap-2 text-xs font-mono text-zinc-700 dark:text-zinc-300 cursor-pointer">
              <input
                type="checkbox"
                checked={generateVideoHook}
                onChange={(e) => setGenerateVideoHook(e.target.checked)}
                className="rounded border-zinc-700 text-amber-500 focus:ring-amber-500"
              />
              Generate Short-Video Script Outline
            </label>

          </div>
        </div>

        {/* 6. Advanced Custom Instructions & Inspiration Post */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          
          <div>
            <label className="block text-xs font-mono font-bold uppercase text-zinc-800 dark:text-zinc-200 mb-1">
              Custom Prompts & Instructions (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Focus on battery life for travelers, use localized slang..."
              value={customInstructions}
              onChange={(e) => setCustomInstructions(e.target.value)}
              className="w-full px-3 py-2 rounded-md bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-xs font-sans text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-mono font-bold uppercase text-zinc-800 dark:text-zinc-200 mb-1 flex items-center justify-between">
              <span>Inspiration Post Mimicry (Optional)</span>
              {inspirationPost.trim() && <span className="text-amber-500 font-bold">MIMIC MODE ACTIVE</span>}
            </label>
            <textarea
              rows={2}
              placeholder="Paste a viral post here to mimic its hook rhythm & line breaking..."
              value={inspirationPost}
              onChange={(e) => setInspirationPost(e.target.value)}
              className="w-full px-3 py-2 rounded-md bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-xs font-sans text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-amber-500"
            />
          </div>

        </div>

        {/* Generate Dispatch Button */}
        <div className="pt-4 border-t-2 border-dashed border-zinc-200 dark:border-zinc-800 flex items-center justify-between flex-wrap gap-4">
          <div className="text-xs font-mono text-zinc-500 dark:text-zinc-400">
            Batch size: <span className="text-amber-500 font-bold">{selectedPlatforms.length} Platforms × {selectedLanguages.length} Languages</span> = <span className="text-amber-400 font-bold underline">{totalCount} Posts</span>
          </div>

          <button
            onClick={handleGenerateBatch}
            disabled={isGeneratingBatch || totalCount === 0}
            className="w-full sm:w-auto px-8 py-3.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold font-mono text-base shadow-lg shadow-amber-500/20 transition-all border border-amber-300 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isGeneratingBatch ? (
              <>
                <RotateCw className="w-5 h-5 animate-spin" />
                Dispatching Concurrent Calls...
              </>
            ) : (
              <>
                <Wand2 className="w-5 h-5 stroke-[2.2]" />
                Generate {totalCount} Posts Concurrent
              </>
            )}
          </button>
        </div>

      </div>

      {/* Results Section: Stream of Generation Cards */}
      {cards.length > 0 && (
        <div className="space-y-4">
          
          <div className="flex items-center justify-between border-b border-dashed border-zinc-200 dark:border-zinc-800 pb-2 flex-wrap gap-2">
            <h3 className="font-mono font-bold text-base uppercase text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-500" />
              Live Generation Stream ({cards.filter((c) => c.status === 'success').length}/{cards.length} Completed)
            </h3>

            <div className="flex items-center gap-2">
              <button
                onClick={handleBulkExport}
                className="px-3 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-amber-400 font-mono font-bold text-xs flex items-center gap-1 border border-zinc-700"
              >
                <Download className="w-3.5 h-3.5" /> Bulk Export .TXT
              </button>
              <button
                onClick={() => setCards([])}
                className="text-xs font-mono text-zinc-400 hover:text-zinc-200 px-2 py-1"
              >
                Clear Stream
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {cards.map((card) => {
              const platformName = PLATFORM_NAMES[card.platform];

              return (
                <div
                  key={card.id}
                  className="rounded-xl bg-white dark:bg-[#18191e] border-2 border-dashed border-zinc-300 dark:border-zinc-800 p-5 shadow-md flex flex-col justify-between space-y-4 transition-all"
                >
                  
                  {/* Card Header Stamp */}
                  <div className="flex items-center justify-between border-b border-dashed border-zinc-200 dark:border-zinc-800 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 px-2.5 py-0.5 rounded border border-amber-500/40">
                        {platformName}
                      </span>
                      <span className="text-xs font-mono bg-purple-500/15 text-purple-600 dark:text-purple-400 px-2 py-0.5 rounded border border-purple-500/40 font-bold">
                        🌐 {card.language}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      {card.status === 'success' && (
                        <button
                          onClick={() => handleRegenerateCard(card.id)}
                          className="p-1.5 rounded text-zinc-400 hover:text-amber-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                          title="Regenerate this card"
                        >
                          <RotateCw className="w-3.5 h-3.5" />
                        </button>
                      )}

                      <button
                        onClick={() => handleDismissCard(card.id)}
                        className="p-1.5 rounded text-zinc-400 hover:text-rose-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                        title="Dismiss Card"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Card Loading Skeleton State */}
                  {card.status === 'loading' && (
                    <div className="space-y-3 py-6 animate-pulse">
                      <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-3/4"></div>
                      <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-full"></div>
                      <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-5/6"></div>
                      <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-1/2"></div>
                      <div className="text-center pt-2">
                        <span className="text-xs font-mono text-amber-500">Executing {card.platform} ({card.language}) AI API Call...</span>
                      </div>
                    </div>
                  )}

                  {/* Card Error State */}
                  {card.status === 'error' && (
                    <div className="p-4 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 space-y-3">
                      <div className="flex items-center gap-2 font-mono font-bold text-xs">
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        Generation Failed
                      </div>
                      <p className="text-xs font-sans text-zinc-700 dark:text-zinc-300">
                        {card.error}
                      </p>
                      <button
                        onClick={() => handleRegenerateCard(card.id)}
                        className="px-3 py-1.5 rounded bg-rose-500 text-zinc-950 font-bold font-mono text-xs shadow-sm hover:bg-rose-400 flex items-center gap-1"
                      >
                        <RotateCw className="w-3.5 h-3.5" /> Retry Card Only
                      </button>
                    </div>
                  )}

                  {/* Card Success State */}
                  {card.status === 'success' && card.result && (
                    <div className="space-y-4">
                      
                      {/* A/B Hook Variants Switcher (If available) */}
                      {card.result.variantAText && card.result.variantBText && (
                        <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 space-y-2">
                          <div className="flex items-center justify-between text-xs font-mono font-bold text-amber-600 dark:text-amber-400">
                            <span>⚡ A/B HOOK VARIANTS GENERATED</span>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => setActiveVariantMap((prev) => ({ ...prev, [card.id]: 'A' }))}
                                className={`px-2 py-0.5 rounded text-[11px] transition-all ${
                                  (activeVariantMap[card.id] || 'A') === 'A'
                                    ? 'bg-amber-500 text-zinc-950 font-bold'
                                    : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                                }`}
                              >
                                Variant A (Curiosity)
                              </button>
                              <button
                                onClick={() => setActiveVariantMap((prev) => ({ ...prev, [card.id]: 'B' }))}
                                className={`px-2 py-0.5 rounded text-[11px] transition-all ${
                                  activeVariantMap[card.id] === 'B'
                                    ? 'bg-amber-500 text-zinc-950 font-bold'
                                    : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                                }`}
                              >
                                Variant B (Pain Point)
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Generated Text */}
                      <div className="bg-zinc-50 dark:bg-zinc-900/90 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 whitespace-pre-line font-sans leading-relaxed">
                        {card.result.variantAText && card.result.variantBText
                          ? (activeVariantMap[card.id] === 'B' ? card.result.variantBText : card.result.variantAText)
                          : card.result.text}
                      </div>

                      {/* Generated Actual Image Thumbnail */}
                      {card.result.generatedImageUrl && (
                        <div className="p-3 rounded bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-2">
                          <div className="font-mono font-bold text-[11px] text-amber-500 flex items-center justify-between">
                            <span className="flex items-center gap-1"><ImageIcon className="w-3.5 h-3.5" /> AI Generated Image Asset</span>
                            <a
                              href={card.result.generatedImageUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[10px] text-zinc-400 hover:text-amber-400 underline"
                            >
                              Open Full HD
                            </a>
                          </div>
                          <img
                            src={card.result.generatedImageUrl}
                            alt="Generated AI Banner"
                            className="w-full h-44 object-cover rounded-md border border-zinc-300 dark:border-zinc-700 shadow-sm"
                          />
                        </div>
                      )}

                      {/* Hashtags Visual Badge Group */}
                      {card.result.hashtags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {card.result.hashtags.map((tag, idx) => (
                            <span key={idx} className="text-[10px] font-mono text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Image Prompt Showcase Visual */}
                      {card.result.imagePrompt && (
                        <div className="p-3 rounded bg-purple-500/10 border border-purple-500/30 text-xs text-purple-700 dark:text-purple-300 space-y-1">
                          <div className="font-mono font-bold text-[11px] flex items-center gap-1 text-purple-600 dark:text-purple-400">
                            <ImageIcon className="w-3.5 h-3.5" /> MATCHING IMAGE SPECIFICATION
                          </div>
                          <p className="font-sans text-[11px] text-zinc-700 dark:text-zinc-300">
                            {card.result.imagePrompt}
                          </p>
                        </div>
                      )}

                      {/* Tools bar: QR Code & Schedule Reminders */}
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          onClick={() => setQrModalData({ url: card.result!.productUrl, title: card.result!.productTitle })}
                          className="px-2.5 py-1 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-mono text-[11px] hover:bg-zinc-200 dark:hover:bg-zinc-700 flex items-center gap-1 border border-zinc-300 dark:border-zinc-700"
                          title="Generate QR Code"
                        >
                          <QrCode className="w-3 h-3 text-purple-400" /> QR Code
                        </button>

                        <button
                          onClick={() => setScheduleModalPost(card.result!)}
                          className="px-2.5 py-1 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-mono text-[11px] hover:bg-zinc-200 dark:hover:bg-zinc-700 flex items-center gap-1 border border-zinc-300 dark:border-zinc-700"
                          title="AI Social Scheduler"
                        >
                          <Calendar className="w-3 h-3 text-amber-400" /> Schedule (.ics)
                        </button>
                      </div>

                      {/* Card Action Footer */}
                      <div className="flex items-center justify-between pt-2 border-t border-dashed border-zinc-200 dark:border-zinc-800">
                        <span className="text-[10px] font-mono text-zinc-400">
                          {card.result.providerUsed}
                        </span>

                        <button
                          onClick={() => handleCopyCardText(card.result!)}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-md bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold font-mono text-xs shadow-sm transition-all"
                        >
                          {copiedCardId === card.result.id ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Copy className="w-3.5 h-3.5" />}
                          {copiedCardId === card.result.id ? 'Copied to Clipboard!' : 'Copy Post Text'}
                        </button>
                      </div>

                    </div>
                  )}

                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* Render QR Modal if open */}
      {qrModalData && (
        <QrCodeModal
          url={qrModalData.url}
          title={qrModalData.title}
          onClose={() => setQrModalData(null)}
        />
      )}

      {/* Render Schedule Modal if open */}
      {scheduleModalPost && (
        <ScheduleModal
          post={scheduleModalPost}
          onClose={() => setScheduleModalPost(null)}
        />
      )}

    </div>
  );
};
