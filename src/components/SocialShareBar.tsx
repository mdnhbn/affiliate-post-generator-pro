import React, { useState } from 'react';
import { PostResult } from '../types';
import { sharePostToSocialPlatform, triggerNativeDeviceShare } from '../utils/share';
import { Share2, Check, Sparkles, Smartphone } from 'lucide-react';

interface SocialShareBarProps {
  post: PostResult;
  activeText?: string;
}

export const SocialShareBar: React.FC<SocialShareBarProps> = ({ post, activeText }) => {
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleShare = (platformKey: string) => {
    const notice = sharePostToSocialPlatform(post, platformKey, activeText);
    setToastMessage(notice.message);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleNative = async () => {
    const shared = await triggerNativeDeviceShare(post, activeText);
    if (shared) {
      setToastMessage('Shared via device app!');
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  return (
    <div className="p-3.5 rounded-lg bg-amber-500/10 border border-amber-500/30 space-y-2.5">
      <div className="flex items-center justify-between text-xs font-mono font-bold text-amber-600 dark:text-amber-400">
        <span className="flex items-center gap-1.5">
          <Share2 className="w-4 h-4 text-amber-500 shrink-0" />
          ১-ক্লিক সোশ্যাল শেয়ার (1-Click Social Share)
        </span>

        {typeof navigator !== 'undefined' && 'share' in navigator && (
          <button
            onClick={handleNative}
            className="text-[10px] bg-amber-500 hover:bg-amber-400 text-zinc-950 px-2 py-0.5 rounded font-bold transition-all flex items-center gap-1 shrink-0"
            title="Open phone apps share menu"
          >
            <Smartphone className="w-3 h-3" /> Phone Share
          </button>
        )}
      </div>

      {toastMessage && (
        <div className="p-2 rounded bg-emerald-500/20 border border-emerald-500/40 text-emerald-600 dark:text-emerald-300 font-mono text-[11px] font-bold flex items-center gap-1.5 animate-fadeIn">
          <Check className="w-3.5 h-3.5 shrink-0 stroke-[3]" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {/* Facebook */}
        <button
          onClick={() => handleShare('facebook')}
          className="px-2.5 py-2 rounded bg-[#1877F2] hover:bg-[#166fe5] text-white font-mono font-bold text-[11px] flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-95"
        >
          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
          Facebook
        </button>

        {/* WhatsApp */}
        <button
          onClick={() => handleShare('whatsapp')}
          className="px-2.5 py-2 rounded bg-[#25D366] hover:bg-[#20bd5a] text-white font-mono font-bold text-[11px] flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-95"
        >
          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z"/>
          </svg>
          WhatsApp
        </button>

        {/* X / Twitter */}
        <button
          onClick={() => handleShare('x_twitter')}
          className="px-2.5 py-2 rounded bg-black hover:bg-zinc-800 text-white font-mono font-bold text-[11px] flex items-center justify-center gap-1.5 shadow-sm transition-all border border-zinc-700 active:scale-95"
        >
          <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
          Twitter (X)
        </button>

        {/* Telegram */}
        <button
          onClick={() => handleShare('telegram')}
          className="px-2.5 py-2 rounded bg-[#229ED9] hover:bg-[#1d8cb3] text-white font-mono font-bold text-[11px] flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-95"
        >
          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
            <path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm5.56 8.16l-2.02 9.51c-.15.68-.55.85-1.12.53l-3.08-2.27-1.49 1.43c-.16.16-.3.3-.62.3l.22-3.15 5.73-5.18c.25-.22-.05-.34-.39-.12l-7.09 4.46-3.06-.96c-.66-.21-.67-.66.14-.98l11.95-4.61c.55-.2 1.04.14.85.84z"/>
          </svg>
          Telegram
        </button>

        {/* Instagram */}
        <button
          onClick={() => handleShare('instagram')}
          className="px-2.5 py-2 rounded bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#FCB045] hover:opacity-90 text-white font-mono font-bold text-[11px] flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-95"
        >
          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
          </svg>
          Instagram
        </button>

        {/* TikTok */}
        <button
          onClick={() => handleShare('tiktok')}
          className="px-2.5 py-2 rounded bg-zinc-900 hover:bg-zinc-800 text-white font-mono font-bold text-[11px] flex items-center justify-center gap-1.5 shadow-sm transition-all border border-zinc-700 active:scale-95"
        >
          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
            <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.98-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.82.57-1.31 1.56-1.33 2.56-.03 1.01.42 2.02 1.25 2.59.95.66 2.25.75 3.24.23.93-.48 1.57-1.47 1.64-2.52.07-2.37.02-4.75.02-7.12V.02z"/>
          </svg>
          TikTok
        </button>

        {/* Pinterest */}
        <button
          onClick={() => handleShare('pinterest')}
          className="px-2.5 py-2 rounded bg-[#E60023] hover:bg-[#cc001f] text-white font-mono font-bold text-[11px] flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-95"
        >
          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
            <path d="M12 0c-6.627 0-12 5.372-12 12 0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146 1.124.347 2.317.535 3.554.535 6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z"/>
          </svg>
          Pinterest
        </button>

        {/* YouTube */}
        <button
          onClick={() => handleShare('youtube')}
          className="px-2.5 py-2 rounded bg-[#FF0000] hover:bg-[#e60000] text-white font-mono font-bold text-[11px] flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-95"
        >
          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
          </svg>
          YouTube
        </button>
      </div>
    </div>
  );
};
