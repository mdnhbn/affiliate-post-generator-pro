import React from 'react';
import { Package, Sun, Moon, Sparkles, KeyRound, LogOut, UserCheck } from 'lucide-react';
import { Settings } from '../types';
import { Barcode } from './Barcode';

interface HeaderProps {
  darkMode: boolean;
  setDarkMode: (val: boolean | ((prev: boolean) => boolean)) => void;
  settings: Settings;
  onOpenSettings: () => void;
  userEmail?: string;
  userDisplayName?: string;
  onSignOut?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  darkMode, 
  setDarkMode, 
  settings,
  onOpenSettings,
  userEmail,
  userDisplayName,
  onSignOut,
}) => {
  const activeKeys = settings.provider === 'gemini' 
    ? settings.geminiKeys.filter(k => k.key.trim())
    : settings.openRouterKeys.filter(k => k.key.trim());

  const hasKey = activeKeys.length > 0;

  return (
    <header className="sticky top-0 z-30 bg-zinc-900/90 dark:bg-[#121317]/95 backdrop-blur-md border-b-2 border-dashed border-amber-500/30 text-zinc-100 px-4 py-3 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Logo & Parcel Title */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-md bg-amber-500 text-zinc-950 font-bold shadow-md shadow-amber-500/20 border border-amber-400">
            <Package className="w-6 h-6 stroke-[2.2]" />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold tracking-tight text-lg text-zinc-100 font-mono uppercase flex items-center gap-2">
                Affiliate Post Generator
                <span className="bg-amber-500/20 text-amber-400 text-[10px] font-mono tracking-wider px-1.5 py-0.5 rounded border border-amber-500/40 font-bold uppercase">
                  PRO v2.5
                </span>
              </h1>
            </div>
            <p className="text-xs text-zinc-400 hidden sm:block font-sans">
              AI Content Studio for Amazon Marketers • Supabase Sync Enabled
            </p>
          </div>
        </div>

        {/* Center Shipping Barcode (Desktop) */}
        <div className="hidden lg:flex items-center gap-3 px-3 py-1 bg-zinc-800/60 dark:bg-zinc-900/80 rounded border border-dashed border-zinc-700">
          <Barcode code="AMZ-VIRAL-HUB" height={18} className="text-amber-500" />
          <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider border-l border-zinc-700 pl-3">
            <div>STATUS: <span className="text-emerald-400 font-bold">DISPATCH CONNECTED</span></div>
            <div>STAMP: <span className="text-amber-400 font-bold">SUPABASE RLS ACTIVE</span></div>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2.5">
          
          {/* User Account Badge & Sign Out */}
          {userEmail && (
            <div className="flex items-center gap-1.5 bg-zinc-800/80 px-2.5 py-1 rounded-md border border-zinc-700 text-xs font-mono">
              <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-bold text-zinc-200 hidden md:inline truncate max-w-[120px]">
                {userDisplayName || userEmail.split('@')[0]}
              </span>
              {onSignOut && (
                <button
                  onClick={onSignOut}
                  className="ml-1 p-1 rounded text-zinc-400 hover:text-rose-400 hover:bg-zinc-700/50 transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}

          {/* Active Key Status Badge */}
          <button 
            onClick={onOpenSettings}
            className={`flex items-center gap-1.5 text-xs font-mono px-2.5 py-1.5 rounded-md border transition-all ${
              hasKey 
                ? 'bg-zinc-800/80 border-zinc-700 text-zinc-300 hover:border-amber-500/50 hover:text-amber-400' 
                : 'bg-amber-500/15 border-amber-500/60 text-amber-400 animate-pulse hover:bg-amber-500/25'
            }`}
            title="Configure API Keys"
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {settings.provider.toUpperCase()}:
            </span>
            <span className="font-semibold">
              {hasKey ? `${activeKeys.length} Key(s)` : 'Key Required'}
            </span>
          </button>

          {/* Theme Toggle Button */}
          <button
            onClick={() => setDarkMode(prev => !prev)}
            className="p-2 rounded-md bg-zinc-800 dark:bg-zinc-800/90 text-zinc-300 hover:text-amber-400 hover:bg-zinc-700 border border-zinc-700 transition-colors"
            title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            aria-label="Toggle Theme"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
          </button>

        </div>

      </div>
    </header>
  );
};

