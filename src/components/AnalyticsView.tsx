import React, { useMemo } from 'react';
import { AnalyticsEvent, PostResult, Product } from '../types';
import { PLATFORM_NAMES } from '../utils/ai';
import { Barcode } from './Barcode';
import { 
  BarChart3, 
  TrendingUp, 
  Copy, 
  Sparkles, 
  QrCode, 
  Calendar, 
  Package, 
  Layers, 
  Activity 
} from 'lucide-react';

interface AnalyticsViewProps {
  analytics: AnalyticsEvent[];
  history: PostResult[];
  products: Product[];
  onClearAnalytics: () => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  analytics,
  history,
  products,
  onClearAnalytics,
}) => {
  // Aggregate KPI stats
  const totalGenerations = history.length;
  const totalCopies = analytics.filter((a) => a.action === 'copied').length;
  const totalQrDownloads = analytics.filter((a) => a.action === 'qr_download').length;
  const totalScheduled = analytics.filter((a) => a.action === 'scheduled').length;

  // Platform Breakdown Count
  const platformStats = useMemo(() => {
    const counts: Record<string, number> = {};
    history.forEach((h) => {
      counts[h.platform] = (counts[h.platform] || 0) + 1;
    });
    return counts;
  }, [history]);

  const maxPlatformCount = Math.max(1, ...(Object.values(platformStats) as number[]));

  // Product Popularity Breakdown
  const productStats = useMemo(() => {
    const counts: Record<string, { title: string; count: number }> = {};
    history.forEach((h) => {
      if (!counts[h.productId]) {
        counts[h.productId] = { title: h.productTitle, count: 0 };
      }
      counts[h.productId].count += 1;
    });
    return Object.values(counts).sort((a, b) => b.count - a.count);
  }, [history]);

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      
      {/* Analytics Studio Header */}
      <div className="bg-white dark:bg-[#18191e] border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl p-5 md:p-6 shadow-sm flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-emerald-500 text-zinc-950 font-bold shadow-sm">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-mono font-bold text-lg text-zinc-900 dark:text-zinc-100 uppercase tracking-tight flex items-center gap-2">
              Performance & ROI Analytics
              <span className="text-[10px] bg-emerald-500/20 text-emerald-500 px-2 py-0.5 rounded border border-emerald-500/30 font-bold">
                REAL-TIME AUDIT
              </span>
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Track generated dispatch metrics, copy counters, social platform reach, and top converting products.
            </p>
          </div>
        </div>

        <Barcode code="METRICS-AUDIT-2026" height={18} className="hidden sm:flex text-emerald-500" />
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="p-4 rounded-xl bg-white dark:bg-[#18191e] border border-dashed border-zinc-300 dark:border-zinc-800 space-y-1">
          <div className="text-xs font-mono text-zinc-500 flex items-center justify-between">
            <span>TOTAL DISPATCHED</span>
            <Sparkles className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-mono font-bold text-zinc-900 dark:text-zinc-100">
            {totalGenerations}
          </div>
          <div className="text-[11px] font-mono text-amber-500 font-bold">
            Generated AI Posts
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-[#18191e] border border-dashed border-zinc-300 dark:border-zinc-800 space-y-1">
          <div className="text-xs font-mono text-zinc-500 flex items-center justify-between">
            <span>COPY ENGAGEMENT</span>
            <Copy className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-mono font-bold text-zinc-900 dark:text-zinc-100">
            {totalCopies}
          </div>
          <div className="text-[11px] font-mono text-blue-500 font-bold">
            Copied to Clipboard
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-[#18191e] border border-dashed border-zinc-300 dark:border-zinc-800 space-y-1">
          <div className="text-xs font-mono text-zinc-500 flex items-center justify-between">
            <span>QR CODE DISPATCH</span>
            <QrCode className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-mono font-bold text-zinc-900 dark:text-zinc-100">
            {totalQrDownloads}
          </div>
          <div className="text-[11px] font-mono text-purple-500 font-bold">
            QR Scans / Downloads
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-[#18191e] border border-dashed border-zinc-300 dark:border-zinc-800 space-y-1">
          <div className="text-xs font-mono text-zinc-500 flex items-center justify-between">
            <span>SCHEDULED EVENTS</span>
            <Calendar className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-mono font-bold text-zinc-900 dark:text-zinc-100">
            {totalScheduled}
          </div>
          <div className="text-[11px] font-mono text-emerald-500 font-bold">
            iCal Calendar Reminders
          </div>
        </div>

      </div>

      {/* Visual Charts & Breakdown Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Platform Share Chart */}
        <div className="bg-white dark:bg-[#18191e] border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-dashed border-zinc-200 dark:border-zinc-800 pb-3">
            <h3 className="font-mono font-bold text-sm uppercase text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-500" />
              Platform Content Share
            </h3>
            <span className="text-xs font-mono text-zinc-400">by Volume</span>
          </div>

          <div className="space-y-3">
            {Object.keys(PLATFORM_NAMES).map((platId) => {
              const count = platformStats[platId] || 0;
              const percentage = Math.round((count / (totalGenerations || 1)) * 100);

              return (
                <div key={platId} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-zinc-700 dark:text-zinc-300 font-bold">
                      {PLATFORM_NAMES[platId as keyof typeof PLATFORM_NAMES]}
                    </span>
                    <span className="text-zinc-500">
                      {count} posts ({percentage}%)
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full transition-all duration-500"
                      style={{ width: `${(count / maxPlatformCount) * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Product Leaderboard */}
        <div className="bg-white dark:bg-[#18191e] border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-dashed border-zinc-200 dark:border-zinc-800 pb-3">
            <h3 className="font-mono font-bold text-sm uppercase text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Package className="w-4 h-4 text-purple-500" />
              Top Promoted Products
            </h3>
            <span className="text-xs font-mono text-zinc-400">Leaderboard</span>
          </div>

          <div className="space-y-3">
            {productStats.length === 0 ? (
              <p className="text-xs font-mono text-zinc-500 text-center py-8">
                No products promoted yet. Generate posts to view top performers.
              </p>
            ) : (
              productStats.slice(0, 5).map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs font-mono"
                >
                  <div className="flex items-center gap-2 truncate max-w-[80%]">
                    <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center font-bold text-[10px]">
                      #{idx + 1}
                    </span>
                    <span className="truncate text-zinc-800 dark:text-zinc-200">{item.title}</span>
                  </div>
                  <span className="font-bold text-amber-500 shrink-0">
                    {item.count} posts
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Activity Event Stream */}
      <div className="bg-white dark:bg-[#18191e] border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl p-5 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-dashed border-zinc-200 dark:border-zinc-800 pb-3">
          <h3 className="font-mono font-bold text-sm uppercase text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-500" />
            Live System Activity Audit Log
          </h3>

          {analytics.length > 0 && (
            <button
              onClick={onClearAnalytics}
              className="text-xs font-mono text-zinc-400 hover:text-zinc-200"
            >
              Clear Logs
            </button>
          )}
        </div>

        {analytics.length === 0 ? (
          <p className="text-xs font-mono text-zinc-500 text-center py-6">
            No activity logged yet. Action events (Copies, QR downloads, Schedule exports) will record here.
          </p>
        ) : (
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {analytics.slice(0, 20).map((ev) => (
              <div
                key={ev.id}
                className="p-2.5 rounded bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-mono flex items-center justify-between"
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded font-bold uppercase">
                    {ev.action}
                  </span>
                  <span className="truncate text-zinc-700 dark:text-zinc-300">
                    {ev.productTitle} ({PLATFORM_NAMES[ev.platform]})
                  </span>
                </div>
                <span className="text-[10px] text-zinc-400 shrink-0 ml-2">
                  {new Date(ev.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
