import React, { useState, useMemo } from 'react';
import { PostResult } from '../types';
import { PLATFORM_NAMES } from '../utils/ai';
import { getAmazonProductImageUrl, extractAsinFromUrl, getAmazonAsinDirectImage } from '../utils/amazon';
import { logAnalyticsEvent } from '../utils/storage';
import { QrCodeModal } from './QrCodeModal';
import { ScheduleModal } from './ScheduleModal';
import { SocialShareBar } from './SocialShareBar';
import { Search, Download, Trash2, Copy, Check, Filter, ExternalLink, Calendar, FileText, QrCode, Package } from 'lucide-react';

interface HistoryViewProps {
  history: PostResult[];
  onDeleteHistoryItem: (id: string) => void;
  onClearAllHistory: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  history,
  onDeleteHistoryItem,
  onClearAllHistory,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modals state
  const [qrModalData, setQrModalData] = useState<{ url: string; title: string } | null>(null);
  const [scheduleModalPost, setScheduleModalPost] = useState<PostResult | null>(null);

  // Extract unique languages present in history
  const availableLanguages = useMemo(() => {
    const set = new Set(history.map((h) => h.language));
    return Array.from(set);
  }, [history]);

  // Filtered list
  const filteredHistory = useMemo(() => {
    return history.filter((item) => {
      const matchesSearch = 
        item.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.productTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.platform.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.language.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesPlatform = selectedPlatform === 'all' || item.platform === selectedPlatform;
      const matchesLanguage = selectedLanguage === 'all' || item.language === selectedLanguage;

      return matchesSearch && matchesPlatform && matchesLanguage;
    });
  }, [history, searchQuery, selectedPlatform, selectedLanguage]);

  const toggleSelectAll = () => {
    if (selectedItems.length === filteredHistory.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredHistory.map((h) => h.id));
    }
  };

  const toggleSelectItem = (id: string) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleCopy = (item: PostResult) => {
    navigator.clipboard.writeText(item.text);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);

    logAnalyticsEvent({
      postId: item.id,
      productId: item.productId,
      productTitle: item.productTitle,
      platform: item.platform,
      language: item.language,
      action: 'copied',
    });
  };

  // Export as CSV
  const exportAsCsv = () => {
    const itemsToExport = history.filter((h) => 
      selectedItems.length > 0 ? selectedItems.includes(h.id) : filteredHistory.includes(h)
    );

    if (itemsToExport.length === 0) return;

    const headers = ['ID', 'Date', 'Product Title', 'Amazon Link', 'Platform', 'Language', 'Content Type', 'Tone', 'Generated Post Text', 'Hashtags'];
    const rows = itemsToExport.map((item) => [
      `"${item.id}"`,
      `"${new Date(item.createdAt).toLocaleString()}"`,
      `"${item.productTitle.replace(/"/g, '""')}"`,
      `"${item.productUrl}"`,
      `"${PLATFORM_NAMES[item.platform]}"`,
      `"${item.language}"`,
      `"${item.contentType}"`,
      `"${item.tone}"`,
      `"${item.text.replace(/"/g, '""')}"`,
      `"${item.hashtags.join(' ')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `affiliate-posts-export-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export as TXT
  const exportAsTxt = () => {
    const itemsToExport = history.filter((h) => 
      selectedItems.length > 0 ? selectedItems.includes(h.id) : filteredHistory.includes(h)
    );

    if (itemsToExport.length === 0) return;

    const txtContent = itemsToExport.map((item, idx) => `========================================
POST #${idx + 1} | ${PLATFORM_NAMES[item.platform]} (${item.language})
Product: ${item.productTitle}
Link: ${item.productUrl}
Date: ${new Date(item.createdAt).toLocaleString()}
Provider: ${item.providerUsed}
========================================
${item.text}
\n`).join('\n\n');

    const blob = new Blob([txtContent], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `affiliate-posts-${Date.now()}.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      
      {/* Header Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-lg bg-zinc-900 text-zinc-100 border-2 border-dashed border-purple-500/40">
        <div>
          <h2 className="text-xl font-mono font-bold uppercase tracking-tight text-zinc-100 flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-400" />
            Generation History Log
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Browse, search, and export previously generated social posts. Auto-saved in browser.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={exportAsCsv}
            disabled={filteredHistory.length === 0}
            className="flex items-center gap-1.5 px-3 py-2 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-mono font-bold border border-zinc-700 transition-colors disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            Export CSV ({selectedItems.length > 0 ? selectedItems.length : filteredHistory.length})
          </button>

          <button
            onClick={exportAsTxt}
            disabled={filteredHistory.length === 0}
            className="flex items-center gap-1.5 px-3 py-2 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-mono font-bold border border-zinc-700 transition-colors disabled:opacity-50"
          >
            <FileText className="w-3.5 h-3.5 text-amber-400" />
            Export TXT
          </button>

          {history.length > 0 && (
            <button
              onClick={onClearAllHistory}
              className="flex items-center gap-1.5 px-3 py-2 rounded-md bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-zinc-950 text-xs font-mono font-bold border border-rose-500/40 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Search & Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-white dark:bg-[#18191e] p-4 rounded-lg border-2 border-dashed border-zinc-200 dark:border-zinc-800">
        
        {/* Search Input */}
        <div className="relative md:col-span-2">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search post text, product title, platform..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-md bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* Platform Filter */}
        <div>
          <select
            value={selectedPlatform}
            onChange={(e) => setSelectedPlatform(e.target.value)}
            className="w-full px-3 py-2 rounded-md bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-amber-500 font-mono"
          >
            <option value="all">All Platforms</option>
            {Object.entries(PLATFORM_NAMES).map(([id, name]) => (
              <option key={id} value={id}>{name}</option>
            ))}
          </select>
        </div>

        {/* Language Filter */}
        <div>
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="w-full px-3 py-2 rounded-md bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-amber-500 font-mono"
          >
            <option value="all">All Languages</option>
            {availableLanguages.map((lang) => (
              <option key={lang} value={lang}>{lang}</option>
            ))}
          </select>
        </div>

      </div>

      {/* History Items List */}
      {filteredHistory.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-xl border-2 border-dashed border-zinc-300 dark:border-zinc-800 bg-zinc-100/50 dark:bg-zinc-900/40">
          <p className="text-sm font-mono text-zinc-500 dark:text-zinc-400">
            {history.length === 0 ? 'No post history available yet. Generate your first post!' : 'No matching history items found.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          
          {/* Select All Row */}
          <div className="flex items-center justify-between px-2 text-xs font-mono text-zinc-500 dark:text-zinc-400">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedItems.length === filteredHistory.length && filteredHistory.length > 0}
                onChange={toggleSelectAll}
                className="rounded border-zinc-700 text-amber-500 focus:ring-amber-500"
              />
              Select All ({filteredHistory.length})
            </label>
            <span>Showing {filteredHistory.length} of {history.length} items</span>
          </div>

          <div className="space-y-3">
            {filteredHistory.map((item) => (
              <div
                key={item.id}
                className={`p-4 rounded-lg bg-white dark:bg-[#18191e] border-2 border-dashed transition-all ${
                  selectedItems.includes(item.id) 
                    ? 'border-amber-500 bg-amber-500/5 dark:bg-amber-500/10' 
                    : 'border-zinc-300 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-700'
                }`}
              >
                
                {/* Meta Header */}
                <div className="flex items-center justify-between flex-wrap gap-2 pb-2 mb-3 border-b border-zinc-200 dark:border-zinc-800">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(item.id)}
                      onChange={() => toggleSelectItem(item.id)}
                      className="rounded border-zinc-700 text-amber-500 focus:ring-amber-500"
                    />
                    
                    <span className="text-xs font-mono font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded border border-amber-500/30">
                      {PLATFORM_NAMES[item.platform]}
                    </span>

                    <span className="text-xs font-mono bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 px-2 py-0.5 rounded">
                      🌐 {item.language}
                    </span>

                    <span className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
                      {new Date(item.createdAt).toLocaleDateString()} {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setQrModalData({ url: item.productUrl, title: item.productTitle })}
                      className="px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-mono text-[11px] hover:bg-zinc-200 dark:hover:bg-zinc-700 flex items-center gap-1 border border-zinc-300 dark:border-zinc-700"
                      title="QR Code"
                    >
                      <QrCode className="w-3.5 h-3.5 text-purple-400" /> QR
                    </button>

                    <button
                      onClick={() => setScheduleModalPost(item)}
                      className="px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-mono text-[11px] hover:bg-zinc-200 dark:hover:bg-zinc-700 flex items-center gap-1 border border-zinc-300 dark:border-zinc-700"
                      title="Schedule"
                    >
                      <Calendar className="w-3.5 h-3.5 text-amber-400" /> Schedule
                    </button>

                    <button
                      onClick={() => handleCopy(item)}
                      className="flex items-center gap-1 text-xs font-mono px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500 text-amber-600 dark:text-amber-400 hover:text-zinc-950 transition-colors font-bold"
                    >
                      {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedId === item.id ? 'Copied!' : 'Copy'}
                    </button>

                    <button
                      onClick={() => onDeleteHistoryItem(item.id)}
                      className="p-1 rounded text-zinc-400 hover:text-rose-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Product Reference */}
                <div className="text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-2 flex items-center gap-1.5">
                  <span className="font-mono text-amber-500">PRODUCT:</span>
                  <span className="font-bold">{item.productTitle}</span>
                  <a href={item.productUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline inline-flex items-center">
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </a>
                </div>

                {/* Generated Text */}
                <div className="bg-zinc-50 dark:bg-zinc-900/80 p-3 rounded border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-800 dark:text-zinc-200 whitespace-pre-line font-sans leading-relaxed mb-3">
                  {item.text}
                </div>

                {/* Original Amazon Product Photo */}
                {(() => {
                  const realImgUrl = item.productImageUrl || getAmazonProductImageUrl(item.productUrl);
                  const asin = extractAsinFromUrl(item.productUrl);
                  const displayImg = realImgUrl || (asin ? getAmazonAsinDirectImage(asin) : '');

                  if (!displayImg) return null;

                  return (
                    <div className="mb-3 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 space-y-2">
                      <div className="font-mono font-bold text-[11px] text-amber-500 flex items-center justify-between">
                        <span className="flex items-center gap-1.5"><Package className="w-3.5 h-3.5" /> Amazon Product Photo</span>
                        <a href={displayImg} target="_blank" rel="noreferrer" className="text-[10px] text-zinc-400 hover:text-amber-400 underline">View High-Res</a>
                      </div>
                      <div className="flex items-center justify-center p-2 bg-white dark:bg-zinc-950 rounded border border-zinc-200 dark:border-zinc-800 max-h-[220px] overflow-hidden">
                        <img
                          src={displayImg}
                          alt={item.productTitle}
                          onError={(e) => {
                            if (asin && (e.target as HTMLImageElement).src !== getAmazonAsinDirectImage(asin)) {
                              (e.target as HTMLImageElement).src = getAmazonAsinDirectImage(asin);
                            }
                          }}
                          className="max-h-[200px] w-auto object-contain rounded"
                        />
                      </div>
                    </div>
                  );
                })()}

                {/* 1-Click Multi-Platform Social Share Bar */}
                <div className="mb-2">
                  <SocialShareBar post={item} />
                </div>

                {/* Image Prompt / Hashtags */}
                {item.imagePrompt && (
                  <div className="mt-2 text-[11px] font-mono text-purple-600 dark:text-purple-400 bg-purple-500/10 p-2 rounded border border-purple-500/20">
                    🖼️ <strong>IMAGE PROMPT:</strong> {item.imagePrompt}
                  </div>
                )}

              </div>
            ))}
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
