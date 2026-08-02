import React, { useEffect, useState, useRef } from 'react';
import { AdSlot as AdSlotType } from '../types';
import { fetchActiveAdSlotsByPlacement } from '../utils/supabaseStorage';
import { X, ExternalLink, Megaphone } from 'lucide-react';

export const InterstitialAdModal: React.FC = () => {
  const [ad, setAd] = useState<AdSlotType | null>(null);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;
    fetchActiveAdSlotsByPlacement('interstitial_popup').then((slots) => {
      if (!isMounted || !slots || slots.length === 0) return;

      const activeAd = slots[0];
      const intervalSeconds = activeAd.display_interval_seconds || 0;
      const lastShown = localStorage.getItem('affiliate_pro_interstitial_last_shown');

      let shouldShow = false;
      if (!lastShown) {
        shouldShow = true;
      } else {
        const elapsedSeconds = (Date.now() - Number(lastShown)) / 1000;
        if (elapsedSeconds >= intervalSeconds) {
          shouldShow = true;
        }
      }

      if (shouldShow) {
        setAd(activeAd);
        setIsOpen(true);
        localStorage.setItem('affiliate_pro_interstitial_last_shown', String(Date.now()));
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isOpen || !ad || ad.ad_type !== 'script' || !ad.ad_code || !containerRef.current) return;

    const container = containerRef.current;
    container.innerHTML = '';

    const parser = new DOMParser();
    const doc = parser.parseFromString(ad.ad_code, 'text/html');

    Array.from(doc.body.childNodes).forEach((node) => {
      if (node.nodeName.toLowerCase() !== 'script') {
        container.appendChild(node.cloneNode(true));
      }
    });

    const scripts = doc.querySelectorAll('script');
    scripts.forEach((oldScript) => {
      const newScript = document.createElement('script');
      Array.from(oldScript.attributes).forEach((attr) => {
        newScript.setAttribute(attr.name, attr.value);
      });
      if (oldScript.src) {
        newScript.src = oldScript.src;
      } else {
        newScript.textContent = oldScript.textContent;
      }
      container.appendChild(newScript);
    });

    return () => {
      container.innerHTML = '';
    };
  }, [isOpen, ad]);

  if (!isOpen || !ad) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
      onClick={() => setIsOpen(false)}
    >
      <div
        className="relative w-full max-w-lg bg-zinc-900 border-2 border-dashed border-amber-500/50 rounded-xl p-5 shadow-2xl text-zinc-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-3 right-3 p-1.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-amber-400 border border-zinc-700 transition-colors cursor-pointer"
          title="Close announcement"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header Badge */}
        <div className="flex items-center gap-2 mb-4 font-mono text-xs text-amber-400 font-bold border-b border-zinc-800 pb-2">
          <Megaphone className="w-4 h-4" />
          <span>SPECIAL SPONSORED ANNOUNCEMENT</span>
        </div>

        {/* Content Body */}
        {ad.ad_type === 'script' ? (
          <div ref={containerRef} className="w-full overflow-x-auto flex justify-center items-center min-h-[120px]" />
        ) : (
          <div className="space-y-4 text-center">
            {ad.banner_image_url ? (
              <img
                src={ad.banner_image_url}
                alt={ad.name}
                className="max-h-64 mx-auto rounded-lg object-contain border border-zinc-800"
              />
            ) : null}
            <div>
              <h3 className="text-lg font-bold font-mono text-zinc-100 mb-1">{ad.name}</h3>
            </div>
            {ad.link_url && (
              <a
                href={ad.link_url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsOpen(false)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold font-mono text-sm shadow-lg transition-transform active:scale-95"
              >
                <span>Check Special Offer</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
        )}

        {/* Footer info */}
        <div className="mt-4 pt-2 border-t border-zinc-800 text-right">
          <button
            onClick={() => setIsOpen(false)}
            className="text-xs font-mono text-zinc-400 hover:text-zinc-200 underline"
          >
            Skip and continue to app
          </button>
        </div>
      </div>
    </div>
  );
};
