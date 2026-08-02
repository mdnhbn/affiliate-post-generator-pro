import React from 'react';
import { Sparkles, PackageCheck, History, Settings as SettingsIcon, Stamp, BarChart3, Zap, Flame, Shield } from 'lucide-react';

export type TabType = 'url_fetcher' | 'fire_deals' | 'generate' | 'products' | 'history' | 'analytics' | 'settings' | 'admin';

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  productsCount: number;
  historyCount: number;
  analyticsCount?: number;
  isAdmin?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  setActiveTab, 
  productsCount,
  historyCount,
  analyticsCount = 0,
  isAdmin = false,
}) => {
  const navItems = [
    {
      id: 'url_fetcher' as TabType,
      label: '1-Click URL Generator',
      subtitle: 'Paste Link → Post',
      icon: Zap,
      badge: 'AUTO',
      badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
    },
    {
      id: 'fire_deals' as TabType,
      label: 'Fire Deals & Best Sellers',
      subtitle: 'Trending Products',
      icon: Flame,
      badge: 'HOT',
      badgeColor: 'bg-rose-500/20 text-rose-400 border-rose-500/40',
    },
    {
      id: 'generate' as TabType,
      label: 'Generate Studio',
      subtitle: 'Create Viral Content',
      icon: Sparkles,
      badge: 'STUDIO',
      badgeColor: 'bg-purple-500/20 text-purple-400 border-purple-500/40',
    },
    {
      id: 'products' as TabType,
      label: 'Products Library',
      subtitle: 'Saved Amazon Items',
      icon: PackageCheck,
      count: productsCount,
      badgeColor: 'bg-blue-500/20 text-blue-400 border-blue-500/40',
    },
    {
      id: 'history' as TabType,
      label: 'Post History',
      subtitle: 'Copied & Generated Posts',
      icon: History,
      count: historyCount,
      badgeColor: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/40',
    },
    {
      id: 'analytics' as TabType,
      label: 'Analytics & ROI',
      subtitle: 'Perform & Metrics Audit',
      icon: BarChart3,
      count: analyticsCount,
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
    },
    {
      id: 'settings' as TabType,
      label: 'Settings & Keys',
      subtitle: 'API Keys & Vault Security',
      icon: SettingsIcon,
      badge: 'CONFIG',
      badgeColor: 'bg-zinc-500/20 text-zinc-400 border-zinc-500/40',
    },
    ...(isAdmin ? [{
      id: 'admin' as TabType,
      label: 'Admin Panel',
      subtitle: 'Ads & User Management',
      icon: Shield,
      badge: 'ADMIN',
      badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
    }] : []),
  ];


  return (
    <>
      {/* Desktop Left Sidebar */}
      <aside className="w-64 shrink-0 hidden md:block border-r-2 border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#15161a] p-4 min-h-[calc(100vh-65px)]">
        
        {/* Shipping Label Header Stamp */}
        <div className="mb-6 p-3 rounded bg-zinc-900 text-zinc-100 dark:bg-zinc-900/80 border-2 border-dashed border-amber-500/40 font-mono text-xs">
          <div className="flex items-center justify-between text-amber-400 font-bold mb-1">
            <span className="flex items-center gap-1">
              <Stamp className="w-3.5 h-3.5" /> AMZ-STUDIO
            </span>
            <span className="text-[10px] bg-amber-500/20 px-1 py-0.2 rounded border border-amber-500/30">
              FAST-TRACK
            </span>
          </div>
          <div className="text-[10px] text-zinc-400 space-y-0.5">
            <div>DESTINATION: <span className="text-zinc-200">SOCIAL MEDIA</span></div>
            <div>STORAGE: <span className="text-zinc-200">LOCAL (OFFLINE)</span></div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between p-2.5 rounded-lg text-left transition-all border ${
                  isActive
                    ? 'bg-amber-500/15 dark:bg-amber-500/10 border-amber-500/60 text-amber-600 dark:text-amber-400 font-semibold shadow-sm'
                    : 'border-transparent text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/60 dark:hover:bg-zinc-800/60 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`p-1.5 rounded-md shrink-0 ${
                    isActive 
                      ? 'bg-amber-500 text-zinc-950 font-bold' 
                      : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <div className="text-xs font-medium leading-tight truncate">
                      {item.label}
                    </div>
                    <div className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate">
                      {item.subtitle}
                    </div>
                  </div>
                </div>

                {/* Counter or Badge */}
                {item.count !== undefined ? (
                  <span className={`text-[11px] font-mono font-bold px-1.5 py-0.2 rounded-full border ${item.badgeColor}`}>
                    {item.count}
                  </span>
                ) : item.badge ? (
                  <span className={`text-[9px] font-mono font-bold px-1 py-0.2 rounded border ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>

        {/* Parcel Footer Note */}
        <div className="mt-8 pt-4 border-t border-dashed border-zinc-300 dark:border-zinc-800 text-center">
          <p className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
            PARCEL LOG #88-AFFILIATE
          </p>
          <p className="text-[10px] text-zinc-400 dark:text-zinc-400 mt-1">
            Client-side execution only. Your keys are stored in your browser.
          </p>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-zinc-900/95 backdrop-blur-md border-t-2 border-dashed border-amber-500/40 p-1.5 flex items-center justify-around overflow-x-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center p-1.5 rounded-md transition-all shrink-0 ${
                isActive ? 'text-amber-400 font-bold' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Icon className="w-4 h-4 mb-0.5" />
              <span className="text-[9px] font-medium leading-none">{item.label.split(' ')[0]}</span>
            </button>
          );
        })}
      </div>
    </>
  );
};
