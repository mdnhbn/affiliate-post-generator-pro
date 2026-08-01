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
 * Auto-extract title & features from URL slug or ASIN
 */
export function extractInfoFromAmazonUrlSlug(rawUrl: string): { title: string; priceDiscount: string; features: string } {
  const asin = extractAsinFromUrl(rawUrl);
  
  // Try to parse product title slug from Amazon URL e.g. amazon.com/Anker-Magnetic-Power-Bank/dp/B0C9RNDWMB
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

    // Clean up title
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
