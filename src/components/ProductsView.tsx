import React, { useState } from 'react';
import { Product, Settings } from '../types';
import { Plus, Edit2, Trash2, ExternalLink, Sparkles, Package, Image as ImageIcon, QrCode, Check, FileSpreadsheet, Upload, AlertTriangle, ShieldCheck, Film } from 'lucide-react';
import { Barcode } from './Barcode';
import { sanitizeAmazonUrl } from '../utils/amazon';
import { QrCodeModal } from './QrCodeModal';
import { ProductMediaGallery } from './ProductMediaGallery';
import Papa from 'papaparse';

interface ProductsViewProps {
  products: Product[];
  settings: Settings;
  onAddProduct: (product: Omit<Product, 'id' | 'createdAt'>) => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
  onSelectForPost: (product: Product) => void;
  onSelectBatchForPost?: (products: Product[]) => void;
}

interface CsvRowPreview {
  id: string;
  title: string;
  amazonUrl: string;
  priceDiscount: string;
  features: string;
  imageUrl: string;
  selected: boolean;
}

export const ProductsView: React.FC<ProductsViewProps> = ({
  products,
  settings,
  onAddProduct,
  onEditProduct,
  onDeleteProduct,
  onSelectForPost,
  onSelectBatchForPost,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [qrModalData, setQrModalData] = useState<{ url: string; title: string } | null>(null);
  const [expandedGalleryId, setExpandedGalleryId] = useState<string | null>(null);

  // CSV Bulk Import Modal state
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  const [csvText, setCsvText] = useState('');
  const [csvRows, setCsvRows] = useState<CsvRowPreview[]>([]);
  const [csvError, setCsvError] = useState('');

  // Multi-select batch generation state
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);

  // Form State
  const [title, setTitle] = useState('');
  const [amazonUrl, setAmazonUrl] = useState('');
  const [features, setFeatures] = useState('');
  const [priceDiscount, setPriceDiscount] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [error, setError] = useState('');

  const defaultTag = settings.defaultAffiliateTag || 'yourtag-20';

  const toggleSelectCard = (id: string) => {
    setSelectedProductIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAllCards = () => {
    if (selectedProductIds.length === products.length) {
      setSelectedProductIds([]);
    } else {
      setSelectedProductIds(products.map((p) => p.id));
    }
  };

  const handleTriggerBatchGenerate = () => {
    const selectedList = products.filter((p) => selectedProductIds.includes(p.id));
    if (selectedList.length === 0) return;

    if (onSelectBatchForPost) {
      onSelectBatchForPost(selectedList);
    } else if (selectedList.length > 0) {
      onSelectForPost(selectedList[0]);
    }
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setTitle('');
    setAmazonUrl('');
    setFeatures('');
    setPriceDiscount('');
    setImageUrl('');
    setError('');
    setIsModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setTitle(p.title);
    setAmazonUrl(p.amazonUrl);
    setFeatures(p.features);
    setPriceDiscount(p.priceDiscount || '');
    setImageUrl(p.imageUrl || '');
    setError('');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Product title is required');
      return;
    }
    if (!amazonUrl.trim()) {
      setError('Amazon affiliate link is required');
      return;
    }

    const sanitizedUrl = sanitizeAmazonUrl(amazonUrl.trim(), defaultTag, settings.marketplaces);

    if (editingProduct) {
      onEditProduct({
        ...editingProduct,
        title: title.trim(),
        amazonUrl: sanitizedUrl,
        features: features.trim(),
        priceDiscount: priceDiscount.trim(),
        imageUrl: imageUrl.trim() || undefined,
        lastVerifiedAt: Date.now(),
      });
    } else {
      onAddProduct({
        title: title.trim(),
        amazonUrl: sanitizedUrl,
        features: features.trim(),
        priceDiscount: priceDiscount.trim(),
        imageUrl: imageUrl.trim() || undefined,
        lastVerifiedAt: Date.now(),
      });
    }

    setIsModalOpen(false);
  };

  // CSV Parse Handler
  const parseCsvData = (rawString: string) => {
    setCsvError('');
    Papa.parse(rawString, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (!results.data || results.data.length === 0) {
          setCsvError('No valid data found in CSV.');
          return;
        }

        const parsed: CsvRowPreview[] = (results.data as Record<string, string>[]).map((row, idx) => {
          const rawTitle = row.title || row.Title || row.name || row.Name || `Imported Item #${idx + 1}`;
          const rawLink = row.amazon_link || row.amazonUrl || row.link || row.Link || row.url || row.URL || '';
          const rawPrice = row.price_discount || row.price || row.Price || row.discount || '';
          const rawFeatures = row.features || row.Features || row.description || row.Description || '';
          const rawImg = row.image_url || row.imageUrl || row.image || row.Image || '';

          return {
            id: `csv-${idx}-${Date.now()}`,
            title: rawTitle,
            amazonUrl: rawLink,
            priceDiscount: rawPrice,
            features: rawFeatures,
            imageUrl: rawImg,
            selected: true,
          };
        });

        setCsvRows(parsed);
      },
      error: (err: unknown) => {
        setCsvError(err instanceof Error ? err.message : 'CSV parsing error.');
      }
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      setCsvText(text);
      parseCsvData(text);
    };
    reader.readAsText(file);
  };

  const handleConfirmCsvImport = () => {
    const selectedRows = csvRows.filter((r) => r.selected && r.title && r.amazonUrl);
    if (selectedRows.length === 0) {
      alert('Please select at least one row with title and URL to import.');
      return;
    }

    selectedRows.forEach((row) => {
      const cleanUrl = sanitizeAmazonUrl(row.amazonUrl, defaultTag, settings.marketplaces);
      onAddProduct({
        title: row.title,
        amazonUrl: cleanUrl,
        features: row.features,
        priceDiscount: row.priceDiscount,
        imageUrl: row.imageUrl || undefined,
        lastVerifiedAt: Date.now(),
      });
    });

    setIsCsvModalOpen(false);
    setCsvRows([]);
    setCsvText('');
  };

  const handleMarkVerifiedToday = (product: Product) => {
    onEditProduct({
      ...product,
      lastVerifiedAt: Date.now(),
    });
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      
      {/* Top Banner & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg bg-zinc-900 text-zinc-100 border-2 border-dashed border-amber-500/40">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-mono font-bold uppercase tracking-tight text-zinc-100 flex items-center gap-2">
              <Package className="w-5 h-5 text-amber-500" />
              Products Library
            </h2>
            <span className="text-xs font-mono bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded border border-amber-500/30">
              {products.length} ITEM(S) IN STOCK
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Store Amazon items to generate viral affiliate posts anytime. Auto-applies tag: <span className="font-mono text-amber-400">{defaultTag}</span>
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => {
              setCsvRows([]);
              setCsvText('');
              setCsvError('');
              setIsCsvModalOpen(true);
            }}
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-emerald-400 font-bold font-mono text-xs border border-zinc-700 transition-all"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Bulk Import CSV
          </button>

          <button
            onClick={openAddModal}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-md bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold font-mono text-sm shadow-md transition-all border border-amber-300 active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            + Add Product
          </button>
        </div>
      </div>

      {/* Multi-Select Floating Batch Action Bar */}
      {selectedProductIds.length > 0 && (
        <div className="p-3.5 rounded-lg bg-amber-500 text-zinc-950 font-mono font-bold text-xs flex items-center justify-between shadow-lg border border-amber-300 animate-fadeIn">
          <div className="flex items-center gap-3">
            <span className="bg-zinc-950 text-amber-400 px-2 py-0.5 rounded text-[11px]">
              {selectedProductIds.length} SELECTED
            </span>
            <span>Batch generation mode active</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedProductIds([])}
              className="px-2.5 py-1 rounded bg-zinc-950/10 hover:bg-zinc-950/20 text-zinc-900"
            >
              Clear Selection
            </button>
            <button
              onClick={handleTriggerBatchGenerate}
              className="px-4 py-1.5 rounded bg-zinc-950 text-amber-400 hover:bg-zinc-900 flex items-center gap-1.5 shadow-sm"
            >
              <Sparkles className="w-4 h-4" />
              Generate Posts for {selectedProductIds.length} Products
            </button>
          </div>
        </div>
      )}

      {/* Grid of Products or Empty State */}
      {products.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-xl border-2 border-dashed border-zinc-300 dark:border-zinc-800 bg-zinc-100/50 dark:bg-zinc-900/40 space-y-4">
          <div className="inline-flex p-4 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">
            <Package className="w-10 h-10" />
          </div>
          <h3 className="text-lg font-mono font-bold text-zinc-800 dark:text-zinc-200 uppercase">
            No Products Saved Yet
          </h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-md mx-auto">
            Add your first Amazon product link or import via CSV to start generating high-converting social media posts.
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={openAddModal}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold font-mono text-sm shadow-md transition-all"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              Add First Product
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs font-mono text-zinc-500 px-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedProductIds.length === products.length && products.length > 0}
                onChange={handleSelectAllCards}
                className="rounded border-zinc-700 text-amber-500 focus:ring-amber-500"
              />
              Select All Products ({products.length})
            </label>
            <span>Click cards or check boxes for batch operations</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {products.map((product) => {
              const isSelected = selectedProductIds.includes(product.id);
              const lastVerified = product.lastVerifiedAt || product.createdAt;
              const daysOld = Math.floor((Date.now() - lastVerified) / (1000 * 60 * 60 * 24));
              const isOld = daysOld >= 7;

              return (
                <div
                  key={product.id}
                  className={`group relative flex flex-col justify-between rounded-lg bg-white dark:bg-[#191a1f] border-2 border-dashed p-4 transition-all shadow-sm hover:shadow-md ${
                    isSelected
                      ? 'border-amber-500 bg-amber-500/5'
                      : 'border-zinc-300 dark:border-zinc-800 hover:border-amber-500/60'
                  }`}
                >
                  {/* Parcel Header + Checkbox + Stamp */}
                  <div className="flex items-center justify-between border-b border-dashed border-zinc-200 dark:border-zinc-800 pb-3 mb-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectCard(product.id)}
                        className="rounded border-zinc-700 text-amber-500 focus:ring-amber-500"
                      />
                      <span className="text-[10px] font-mono font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 dark:bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/30">
                        PARCEL #{product.id.slice(-6).toUpperCase()}
                      </span>
                    </div>
                    <Barcode code={product.id.slice(-6).toUpperCase()} height={14} className="text-zinc-400" />
                  </div>

                  {/* Verification Badge */}
                  {isOld ? (
                    <div className="mb-2 p-2 rounded bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-[11px] font-mono flex items-center justify-between">
                      <span className="flex items-center gap-1 font-bold">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" /> Verify price — added {daysOld} days ago
                      </span>
                      <button
                        onClick={() => handleMarkVerifiedToday(product)}
                        className="px-2 py-0.5 rounded bg-amber-500 text-zinc-950 font-bold hover:bg-amber-400 text-[10px]"
                      >
                        Mark verified today
                      </button>
                    </div>
                  ) : (
                    <div className="mb-2 text-[10px] font-mono text-emerald-500 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> Price verified ({daysOld === 0 ? 'Today' : `${daysOld}d ago`})
                    </div>
                  )}

                  {/* Product Info */}
                  <div className="space-y-3">
                    {product.imageUrl && (
                      <div className="w-full h-36 rounded-md overflow-hidden bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                        <img 
                          src={product.imageUrl} 
                          alt={product.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      </div>
                    )}

                    <div>
                      <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 text-base line-clamp-2 group-hover:text-amber-500 transition-colors">
                        {product.title}
                      </h4>
                      
                      {product.priceDiscount && (
                        <div className="mt-1 font-mono text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded inline-block">
                          🏷️ {product.priceDiscount}
                        </div>
                      )}
                    </div>

                    <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-3 bg-zinc-50 dark:bg-zinc-900/60 p-2.5 rounded border border-zinc-200 dark:border-zinc-800/80 font-sans">
                      {product.features || 'No features described.'}
                    </p>

                    <div className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 truncate">
                      <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                      <a 
                        href={product.amazonUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="hover:underline truncate"
                      >
                        {product.amazonUrl}
                      </a>
                    </div>
                  </div>

                  {/* Expandable Amazon Media & Video Gallery */}
                  {expandedGalleryId === product.id && (
                    <div className="mt-3 pt-3 border-t border-dashed border-zinc-200 dark:border-zinc-800 animate-fadeIn">
                      <ProductMediaGallery
                        productUrl={product.amazonUrl}
                        productTitle={product.title}
                        mainImageUrl={product.imageUrl}
                      />
                    </div>
                  )}

                  {/* Card Actions */}
                  <div className="mt-4 pt-3 border-t border-dashed border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setQrModalData({ url: product.amazonUrl, title: product.title })}
                        className="p-1.5 rounded text-zinc-500 hover:text-purple-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                        title="Generate QR Code"
                      >
                        <QrCode className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openEditModal(product)}
                        className="p-1.5 rounded text-zinc-500 hover:text-amber-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                        title="Edit Product"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeleteProduct(product.id)}
                        className="p-1.5 rounded text-zinc-500 hover:text-rose-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                        title="Delete Product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setExpandedGalleryId(expandedGalleryId === product.id ? null : product.id)}
                        className={`px-2.5 py-1.5 rounded text-xs font-mono font-bold flex items-center gap-1 border transition-all ${
                          expandedGalleryId === product.id
                            ? 'bg-purple-500 text-zinc-950 border-purple-400'
                            : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-300 dark:border-zinc-800 hover:border-purple-500/50'
                        }`}
                        title="View Product Images & Videos"
                      >
                        <ImageIcon className="w-3.5 h-3.5" />
                        {expandedGalleryId === product.id ? 'Close Media' : 'Media & Video'}
                      </button>

                      <button
                        onClick={() => onSelectForPost(product)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 hover:bg-amber-500 hover:text-zinc-950 border border-amber-500/40 transition-all"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        Use for Post
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* CSV Bulk Import Modal */}
      {isCsvModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#18191e] border-2 border-dashed border-emerald-500/50 rounded-xl w-full max-w-3xl overflow-hidden shadow-2xl space-y-4 p-6 max-h-[90vh] flex flex-col">
            
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
              <h3 className="font-mono font-bold text-lg text-zinc-900 dark:text-zinc-100 uppercase flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                CSV Bulk Import Products
              </h3>
              <button 
                onClick={() => setIsCsvModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-100 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {csvError && (
              <div className="p-3 rounded bg-rose-500/15 border border-rose-500/40 text-rose-500 text-xs font-mono">
                ⚠️ {csvError}
              </div>
            )}

            <div className="space-y-3 overflow-y-auto pr-1">
              {/* Upload or Paste */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <label className="p-4 rounded-lg border-2 border-dashed border-zinc-300 dark:border-zinc-700 hover:border-emerald-500 flex flex-col items-center justify-center gap-2 cursor-pointer bg-zinc-50 dark:bg-zinc-900">
                  <Upload className="w-6 h-6 text-emerald-400" />
                  <span className="text-xs font-mono font-bold text-zinc-700 dark:text-zinc-300">Choose CSV File</span>
                  <span className="text-[10px] font-mono text-zinc-400">Columns: title, amazon_link, price_discount, features, image_url</span>
                  <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
                </label>

                <div>
                  <label className="block text-xs font-mono text-zinc-400 mb-1">Or Paste CSV Text directly</label>
                  <textarea
                    rows={4}
                    placeholder="title,amazon_link,price_discount,features,image_url&#10;Headphones,https://amazon.com/dp/123,$50,Noise canceling,https://img.com/a.jpg"
                    value={csvText}
                    onChange={(e) => {
                      setCsvText(e.target.value);
                      parseCsvData(e.target.value);
                    }}
                    className="w-full p-2 rounded bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-xs font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Preview Table */}
              {csvRows.length > 0 && (
                <div className="space-y-2 pt-3 border-t border-dashed border-zinc-200 dark:border-zinc-800">
                  <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
                    <span>Parsed {csvRows.length} Rows</span>
                    <button
                      onClick={() => {
                        const allSel = csvRows.every((r) => r.selected);
                        setCsvRows(csvRows.map((r) => ({ ...r, selected: !allSel })));
                      }}
                      className="text-emerald-400 underline"
                    >
                      Toggle Select All
                    </button>
                  </div>

                  <div className="max-h-60 overflow-x-auto overflow-y-auto border border-zinc-200 dark:border-zinc-800 rounded">
                    <table className="w-full text-xs font-mono text-left">
                      <thead className="bg-zinc-100 dark:bg-zinc-900 text-zinc-400 uppercase">
                        <tr>
                          <th className="p-2 border-b">Import</th>
                          <th className="p-2 border-b">Title</th>
                          <th className="p-2 border-b">Amazon Link</th>
                          <th className="p-2 border-b">Price / Discount</th>
                          <th className="p-2 border-b">Features</th>
                        </tr>
                      </thead>
                      <tbody>
                        {csvRows.map((row, idx) => (
                          <tr key={row.id} className="border-b border-zinc-200 dark:border-zinc-800">
                            <td className="p-2 text-center">
                              <input
                                type="checkbox"
                                checked={row.selected}
                                onChange={(e) => {
                                  const updated = [...csvRows];
                                  updated[idx].selected = e.target.checked;
                                  setCsvRows(updated);
                                }}
                                className="rounded border-zinc-700 text-emerald-500 focus:ring-emerald-500"
                              />
                            </td>
                            <td className="p-2">
                              <input
                                type="text"
                                value={row.title}
                                onChange={(e) => {
                                  const updated = [...csvRows];
                                  updated[idx].title = e.target.value;
                                  setCsvRows(updated);
                                }}
                                className="w-full px-1.5 py-0.5 rounded bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-xs"
                              />
                            </td>
                            <td className="p-2">
                              <input
                                type="text"
                                value={row.amazonUrl}
                                onChange={(e) => {
                                  const updated = [...csvRows];
                                  updated[idx].amazonUrl = e.target.value;
                                  setCsvRows(updated);
                                }}
                                className="w-full px-1.5 py-0.5 rounded bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-xs"
                              />
                            </td>
                            <td className="p-2">
                              <input
                                type="text"
                                value={row.priceDiscount}
                                onChange={(e) => {
                                  const updated = [...csvRows];
                                  updated[idx].priceDiscount = e.target.value;
                                  setCsvRows(updated);
                                }}
                                className="w-full px-1.5 py-0.5 rounded bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-xs"
                              />
                            </td>
                            <td className="p-2">
                              <input
                                type="text"
                                value={row.features}
                                onChange={(e) => {
                                  const updated = [...csvRows];
                                  updated[idx].features = e.target.value;
                                  setCsvRows(updated);
                                }}
                                className="w-full px-1.5 py-0.5 rounded bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-xs"
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-200 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setIsCsvModalOpen(false)}
                className="px-4 py-2 rounded-md border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-mono"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmCsvImport}
                disabled={csvRows.filter((r) => r.selected).length === 0}
                className="px-5 py-2 rounded-md bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold font-mono text-xs shadow-md disabled:opacity-50"
              >
                Import Selected ({csvRows.filter((r) => r.selected).length})
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#18191e] border-2 border-dashed border-amber-500/50 rounded-xl w-full max-w-lg overflow-hidden shadow-2xl space-y-4 p-6">
            
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
              <h3 className="font-mono font-bold text-lg text-zinc-900 dark:text-zinc-100 uppercase flex items-center gap-2">
                <Package className="w-5 h-5 text-amber-500" />
                {editingProduct ? 'Edit Product' : 'Add Amazon Product'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-100 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {error && (
              <div className="p-3 rounded bg-rose-500/15 border border-rose-500/40 text-rose-600 dark:text-rose-400 text-xs font-mono">
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div>
                <label className="block text-xs font-mono font-bold uppercase text-zinc-700 dark:text-zinc-300 mb-1">
                  Amazon Affiliate Link *
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://www.amazon.com/dp/B08N5WRWNW?tag=yourtag-20"
                  value={amazonUrl}
                  onChange={(e) => setAmazonUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-md bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold uppercase text-zinc-700 dark:text-zinc-300 mb-1">
                  Product Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sony WH-1000XM5 Wireless Headphones"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-md bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold uppercase text-zinc-700 dark:text-zinc-300 mb-1">
                  Price / Discount Text (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. $49.99 — 25% OFF or Flash Deal $19.99"
                  value={priceDiscount}
                  onChange={(e) => setPriceDiscount(e.target.value)}
                  className="w-full px-3 py-2 rounded-md bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold uppercase text-zinc-700 dark:text-zinc-300 mb-1">
                  Key Features & Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Paste main features, specifications, pain points solved, battery life, materials..."
                  value={features}
                  onChange={(e) => setFeatures(e.target.value)}
                  className="w-full px-3 py-2 rounded-md bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold uppercase text-zinc-700 dark:text-zinc-300 mb-1">
                  Direct Image URL (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-md bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-md border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 font-mono"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-md bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold font-mono text-sm shadow-md"
                >
                  {editingProduct ? 'Save Changes' : 'Add to Library'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {qrModalData && (
        <QrCodeModal
          url={qrModalData.url}
          title={qrModalData.title}
          onClose={() => setQrModalData(null)}
        />
      )}

    </div>
  );
};

