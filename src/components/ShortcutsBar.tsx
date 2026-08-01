import React from 'react';
import { TabType } from './Sidebar';
import { Zap, Flame, Sparkles, PackageCheck, BarChart3, Settings, Bookmark } from 'lucide-react';

interface ShortcutsBarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

export const ShortcutsBar: React.FC<ShortcutsBarProps> = ({ activeTab, setActiveTab }) => {
  const shortcuts = [
    {
      id: 'url_fetcher' as TabType,
      label: '1-Click URL Generator',
      subtitle: 'Paste Link → Post',
      icon: Zap,
      badge: 'POPULAR',
      color: 'hover:border-amber-500 hover:text-amber-500',
      activeColor: 'bg-amber-500/15 border-amber-500 text-amber-500 font-bold',
    },
    {
      id: 'fire_deals' as TabType,
      label: 'Fire Deals & Best Sellers',
      subtitle: 'Hot Amazon Products',
      icon: Flame,
      badge: 'TRENDING',
      color: 'hover:border-rose-500 hover:text-rose-500',
      activeColor: 'bg-rose-500/15 border-rose-500 text-rose-500 font-bold',
    },
    {
      id: 'generate' as TabType,
      label: 'Generate Studio',
      subtitle: 'AI Post Builder',
      icon: Sparkles,
      color: 'hover:border-purple-500 hover:text-purple-500',
      activeColor: 'bg-purple-500/15 border-purple-500 text-purple-500 font-bold',
    },
    {
      id: 'products' as TabType,
      label: 'Products Library',
      subtitle: 'Saved Items',
      icon: PackageCheck,
      color: 'hover:border-blue-500 hover:text-blue-500',
      activeColor: 'bg-blue-500/15 border-blue-500 text-blue-500 font-bold',
    },
    {
      id: 'analytics' as TabType,
      label: 'Analytics & ROI',
      subtitle: 'Performance Log',
      icon: BarChart3,
      color: 'hover:border-emerald-500 hover:text-emerald-500',
      activeColor: 'bg-emerald-500/15 border-emerald-500 text-emerald-500 font-bold',
    },
  ];

  return (
    <div className="bg-white dark:bg-[#18191e] border-b-2 border-dashed border-zinc-200 dark:border-zinc-800 p-3 px-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 overflow-x-auto scrollbar-none">
        
        {/* Hub Title Label */}
        <div className="flex items-center gap-2 text-xs font-mono font-bold text-zinc-500 shrink-0 uppercase tracking-wider pr-2 border-r border-zinc-300 dark:border-zinc-800">
          <Bookmark className="w-3.5 h-3.5 text-amber-500" />
          <span>FAST SHORTCUTS:</span>
        </div>

        {/* Shortcuts Buttons List */}
        <div className="flex items-center gap-2 shrink-0">
          {shortcuts.map((sc) => {
            const Icon = sc.icon;
            const isActive = activeTab === sc.id;
            return (
              <button
                key={sc.id}
                onClick={() => setActiveTab(sc.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-mono border transition-all ${
                  isActive
                    ? sc.activeColor
                    : `bg-zinc-50 dark:bg-zinc-900 border-zinc-300 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 ${sc.color}`
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span className="whitespace-nowrap font-semibold">{sc.label}</span>
                {sc.badge && (
                  <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-400 border border-amber-500/40">
                    {sc.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

      </div>
    </div>
  );
};
