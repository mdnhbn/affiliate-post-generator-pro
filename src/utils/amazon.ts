import { Settings, Marketplace } from '../types';

/**
 * Extract ASIN from any standard Amazon URL format
 */
export function extractAsinFromUrl(url: string): string | null {
  if (!url) return null;
  const match = url.match(/(?:dp|gp\/product|ASIN)\/([A-Z0-9]{10})/i);
  return match ? match[1].toUpperCase() : null;
}

/**
 * Detect matching affiliate tag from marketplace list or fallback to default
 */
export function getTagForUrl(rawUrl: string, defaultTag: string = 'yourtag-20', marketplaces?: Marketplace[]): string {
  if (!rawUrl) return defaultTag.trim() || 'yourtag-20';
  let validUrlStr = rawUrl.trim();
  if (!validUrlStr.startsWith('http://') && !validUrlStr.startsWith('https://')) {
    validUrlStr = 'https://' + validUrlStr;
  }

  try {
    const urlObj = new URL(validUrlStr);
    const host = urlObj.hostname.toLowerCase().replace(/^www\./, '');

    if (marketplaces && marketplaces.length > 0) {
      const match = marketplaces.find((m) => {
        const cleanMDomain = m.domain.toLowerCase().replace(/^www\./, '').trim();
        return cleanMDomain && (host === cleanMDomain || host.endsWith('.' + cleanMDomain));
      });
      if (match && match.tag.trim()) {
        return match.tag.trim();
      }
    }
  } catch (e) {
    // ignore URL parse errors
  }

  return defaultTag.trim() || 'yourtag-20';
}

/**
 * Clean and sanitize Amazon URL, removing tracking clutter and replacing with domain-matched tag
 */
export function sanitizeAmazonUrl(rawUrl: string, defaultTag: string = 'yourtag-20', marketplaces?: Marketplace[]): string {
  if (!rawUrl || !rawUrl.trim()) return '';

  const tagToUse = getTagForUrl(rawUrl, defaultTag, marketplaces);
  const trimmed = rawUrl.trim();

  // If not a valid URL or missing http, try prepending https://
  let validUrlStr = trimmed;
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    validUrlStr = 'https://' + trimmed;
  }

  try {
    const urlObj = new URL(validUrlStr);
    const asin = extractAsinFromUrl(validUrlStr);

    if (asin) {
      // Return clean canonical Amazon URL format
      const domain = urlObj.hostname.includes('amazon') ? urlObj.hostname : 'www.amazon.com';
      return `https://${domain}/dp/${asin}?tag=${encodeURIComponent(tagToUse)}`;
    }

    // Fallback: If ASIN couldn't be regex matched, update query params
    urlObj.searchParams.set('tag', tagToUse);
    // Remove typical clutter params
    ['ref', 'ref_', 'pf_rd_r', 'pf_rd_p', 'pd_rd_r', 'pd_rd_w', 'qid', 'sr'].forEach((param) => {
      urlObj.searchParams.delete(param);
    });

    return urlObj.toString();
  } catch (e) {
    // Return original with tag appended if URL object parsing fails
    if (trimmed.includes('tag=')) {
      return trimmed.replace(/tag=[^&]+/, `tag=${encodeURIComponent(tagToUse)}`);
    }
    const separator = trimmed.includes('?') ? '&' : '?';
    return `${trimmed}${separator}tag=${encodeURIComponent(tagToUse)}`;
  }
}

/**
 * Get Amazon Product Image URL using ASIN CDN or explicit URL
 */
export function getAmazonProductImageUrl(rawUrl: string, explicitImageUrl?: string): string {
  if (explicitImageUrl && explicitImageUrl.trim() && explicitImageUrl.startsWith('http')) {
    return explicitImageUrl.trim();
  }

  const asin = extractAsinFromUrl(rawUrl);
  if (asin) {
    // Amazon Official WS Product Image CDN endpoint
    return `https://ws-na.amazon-adsystem.com/widgets/q?_encoding=UTF-8&ASIN=${asin}&Format=_SL600_&ID=AsinImage&WS=1`;
  }

  return '';
}

/**
 * Fallback direct image URL for Amazon ASIN
 */
export function getAmazonAsinDirectImage(asin: string): string {
  if (!asin) return '';
  return `https://images-na.ssl-images-amazon.com/images/P/${asin.toUpperCase()}.01._SCLZZZZZZZ_.jpg`;
}

/**
 * Get Amazon Product Image Gallery (Multiple HD Photos)
 */
export function getAmazonProductGalleryImages(rawUrl: string, explicitMainImg?: string): string[] {
  const list: string[] = [];
  if (explicitMainImg && explicitMainImg.trim() && explicitMainImg.startsWith('http')) {
    list.push(explicitMainImg.trim());
  }

  const asin = extractAsinFromUrl(rawUrl);
  if (asin) {
    const wsImg = `https://ws-na.amazon-adsystem.com/widgets/q?_encoding=UTF-8&ASIN=${asin}&Format=_SL600_&ID=AsinImage&WS=1`;
    if (!list.includes(wsImg)) list.push(wsImg);

    const direct1 = `https://images-na.ssl-images-amazon.com/images/P/${asin}.01._SCLZZZZZZZ_.jpg`;
    if (!list.includes(direct1)) list.push(direct1);

    const direct2 = `https://images-na.ssl-images-amazon.com/images/P/${asin}.02._SCLZZZZZZZ_.jpg`;
    if (!list.includes(direct2)) list.push(direct2);

    const direct3 = `https://images-na.ssl-images-amazon.com/images/P/${asin}.03._SCLZZZZZZZ_.jpg`;
    if (!list.includes(direct3)) list.push(direct3);

    const sl1000 = `https://images-na.ssl-images-amazon.com/images/P/${asin}.01._SL1000_.jpg`;
    if (!list.includes(sl1000)) list.push(sl1000);
  }

  return list.length > 0 ? list : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80'];
}

/**
 * Get Amazon Video & Media Resources links for ASIN
 */
export function getAmazonProductVideoResources(rawUrl: string): { title: string; videoPageUrl: string; isOfficialVideo: boolean }[] {
  const asin = extractAsinFromUrl(rawUrl);
  if (!asin) return [];

  return [
    {
      title: `Official Amazon Seller Video & Customer Video Reviews (ASIN: ${asin})`,
      videoPageUrl: `https://www.amazon.com/vdp/${asin}`,
      isOfficialVideo: true,
    },
    {
      title: `Amazon Live Stream Product Demo Video`,
      videoPageUrl: `https://www.amazon.com/live/video/ASIN/${asin}`,
      isOfficialVideo: true,
    },
    {
      title: `Amazon Video Gallery Hub`,
      videoPageUrl: `https://www.amazon.com/dp/${asin}#video-gallery`,
      isOfficialVideo: false,
    }
  ];
}

/**
 * Auto-recommend Content Angle, Tone, Audience, and CTA style based on product details
 */
export function getRecommendedPresetsForProduct(product: { title?: string; features?: string; priceDiscount?: string }): {
  contentType: 'promotional' | 'honest_review' | 'comparison' | 'flash_sale' | 'unboxing' | 'listicle';
  tone: 'friendly' | 'professional' | 'funny' | 'urgent' | 'storytelling';
  targetAudience: string;
  ctaType: string;
  recommendationReason: string;
} {
  const text = `${product.title || ''} ${product.features || ''} ${product.priceDiscount || ''}`.toLowerCase();

  // Deal / Discount focus
  if (text.includes('% off') || text.includes('sale') || text.includes('deal') || text.includes('discount') || text.includes('limited time')) {
    return {
      contentType: 'flash_sale',
      tone: 'urgent',
      targetAudience: 'Bargain & Discount Hunters',
      ctaType: 'Direct Affiliate Link in Post',
      recommendationReason: 'Detected price drop & deal keywords. Urgency angle maximizes conversion.'
    };
  }

  // Tech / Gadgets focus
  if (text.includes('pro') || text.includes('wireless') || text.includes('bluetooth') || text.includes('battery') || text.includes('charger') || text.includes('phone') || text.includes('camera') || text.includes('usb') || text.includes('laptop') || text.includes('magnetic') || text.includes('display')) {
    return {
      contentType: 'honest_review',
      tone: 'professional',
      targetAudience: 'Gen Z & Tech Enthusiasts',
      ctaType: 'Direct Affiliate Link in Post',
      recommendationReason: 'Tech gadget features identified. Hands-on review tone builds high buyer trust.'
    };
  }

  // Home / Kitchen / Living
  if (text.includes('bottle') || text.includes('water') || text.includes('kitchen') || text.includes('home') || text.includes('light') || text.includes('lamp') || text.includes('cleaner') || text.includes('pillow') || text.includes('organizer') || text.includes('cup') || text.includes('straw') || text.includes('tumbler')) {
    return {
      contentType: 'promotional',
      tone: 'friendly',
      targetAudience: 'Busy Parents & Home Makers',
      ctaType: 'Direct Affiliate Link in Post',
      recommendationReason: 'Home & lifestyle item recognized. Friendly aesthetic style works best.'
    };
  }

  // Fitness / Outdoor
  if (text.includes('fitness') || text.includes('gym') || text.includes('sports') || text.includes('shoes') || text.includes('workout') || text.includes('protein') || text.includes('hiking')) {
    return {
      contentType: 'unboxing',
      tone: 'friendly',
      targetAudience: 'Fitness & Wellness Enthusiasts',
      ctaType: 'Link in Bio / Profile',
      recommendationReason: 'Sports & fitness item. Dynamic unboxing vibe triggers high viral engagement.'
    };
  }

  // Default fallback
  return {
    contentType: 'promotional',
    tone: 'friendly',
    targetAudience: 'General Online Shoppers',
    ctaType: 'Direct Affiliate Link in Post',
    recommendationReason: 'General Amazon bestseller setup optimized for high organic engagement.'
  };
}

/**
 * Auto-extract title & features from URL slug or ASIN
 */
export function extractInfoFromAmazonUrlSlug(rawUrl: string): { title: string; priceDiscount: string; features: string } {
  const asin = extractAsinFromUrl(rawUrl);
  
  try {
    const urlObj = new URL(rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`);
    const pathnameParts = urlObj.pathname.split('/').filter(Boolean);
    
    let slugTitle = '';
    const dpIndex = pathnameParts.findIndex(p => p === 'dp' || p === 'gp');
    if (dpIndex > 0) {
      slugTitle = pathnameParts[dpIndex - 1].replace(/-/g, ' ');
    } else if (pathnameParts.length > 0 && pathnameParts[0] !== 'dp' && pathnameParts[0] !== 'gp') {
      slugTitle = pathnameParts[0].replace(/-/g, ' ');
    }

    if (slugTitle && slugTitle.length > 3) {
      const formattedTitle = slugTitle
        .split(' ')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
      
      return {
        title: formattedTitle,
        priceDiscount: 'Special Amazon Deal',
        features: `Top rated Amazon product (ASIN: ${asin || 'N/A'}). High durability, premium performance, lightweight design, and great customer reviews.`
      };
    }
  } catch (e) {
    // Ignore error
  }

  return {
    title: asin ? `Amazon Prime Deal Item (${asin})` : 'Amazon Best Selling Product',
    priceDiscount: 'Check Amazon for Today\'s Best Price',
    features: 'High rating, fast Prime shipping, durable build quality, and excellent value for money.'
  };
}

