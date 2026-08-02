import React, { useEffect, useRef, useState } from 'react';
import { AdPlacement, AdSlot as AdSlotType } from '../types';
import { fetchActiveAdSlotsByPlacement } from '../utils/supabaseStorage';
import { ExternalLink } from 'lucide-react';

interface AdSlotProps {
  placement: AdPlacement;
  className?: string;
}

export const AdSlot: React.FC<AdSlotProps> = ({ placement, className = '' }) => {
  const [ad, setAd] = useState<AdSlotType | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;
    fetchActiveAdSlotsByPlacement(placement).then((slots) => {
      if (isMounted) {
        if (slots && slots.length > 0) {
          setAd(slots[0]);
        } else {
          setAd(null);
        }
      }
    });
    return () => {
      isMounted = false;
    };
  }, [placement]);

  useEffect(() => {
    if (!ad || ad.ad_type !== 'script' || !ad.ad_code || !containerRef.current) return;

    const container = containerRef.current;
    container.innerHTML = '';

    const parser = new DOMParser();
    const doc = parser.parseFromString(ad.ad_code, 'text/html');

    // Copy non-script nodes first
    Array.from(doc.body.childNodes).forEach((node) => {
      if (node.nodeName.toLowerCase() !== 'script') {
        container.appendChild(node.cloneNode(true));
      }
    });

    // Create and execute script tags
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
  }, [ad]);

  if (!ad) return null;

  if (ad.ad_type === 'script') {
    return (
      <div className={`my-4 p-2 rounded-lg bg-zinc-900/60 border border-dashed border-zinc-800 text-center overflow-hidden ${className}`}>
        <div ref={containerRef} className="w-full overflow-x-auto flex justify-center items-center min-h-[50px]" />
      </div>
    );
  }

  if (ad.ad_type === 'link_banner' && ad.link_url) {
    return (
      <div className={`my-4 ${className}`}>
        <a
          href={ad.link_url}
          target="_blank"
          rel="noopener noreferrer"
          className="group block rounded-lg overflow-hidden border border-amber-500/40 hover:border-amber-400 bg-gradient-to-r from-zinc-900 via-amber-950/30 to-zinc-900 p-3 shadow-lg transition-all"
        >
          {ad.banner_image_url ? (
            <div className="relative w-full overflow-hidden rounded-md max-h-48 flex justify-center items-center bg-zinc-950">
              <img
                src={ad.banner_image_url}
                alt={ad.name}
                className="max-h-48 object-contain transition-transform group-hover:scale-[1.01]"
              />
              <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-zinc-950/80 text-[9px] font-mono text-amber-400 border border-amber-500/40 uppercase font-bold">
                SPONSORED
              </span>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-4 p-2">
              <div className="flex items-center gap-2.5">
                <span className="px-2 py-0.5 rounded bg-amber-500 text-zinc-950 text-[10px] font-mono font-bold uppercase">
                  SPONSORED
                </span>
                <span className="font-mono text-sm font-bold text-amber-400 group-hover:underline">
                  {ad.name}
                </span>
              </div>
              <div className="flex items-center gap-1 text-xs font-mono text-zinc-300 group-hover:text-amber-400">
                <span>Visit Offer</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </div>
            </div>
          )}
        </a>
      </div>
    );
  }

  return null;
};
