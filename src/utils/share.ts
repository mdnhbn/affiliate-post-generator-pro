import { PostResult } from '../types';
import { extractAsinFromUrl, getAmazonProductImageUrl } from './amazon';

export interface ShareNotice {
  message: string;
  type: 'success' | 'info';
}

/**
 * Handle 1-Click Sharing for any Social Media Platform
 */
export function sharePostToSocialPlatform(
  post: PostResult,
  platformKey: string,
  activeText?: string
): ShareNotice {
  const textToShare = activeText || post.text;
  const productUrl = post.productUrl;
  const realImageUrl = post.productImageUrl || getAmazonProductImageUrl(productUrl);

  // Always copy post text to user's clipboard first
  try {
    navigator.clipboard.writeText(textToShare);
  } catch (e) {
    console.warn('Clipboard write failed:', e);
  }

  const encodedUrl = encodeURIComponent(productUrl);
  const encodedText = encodeURIComponent(textToShare);

  switch (platformKey) {
    case 'facebook': {
      // Facebook Sharer
      const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`;
      window.open(fbUrl, '_blank', 'width=600,height=500,scrollbars=yes');
      return {
        message: 'Post text copied! Opening Facebook share window...',
        type: 'success',
      };
    }

    case 'whatsapp': {
      // WhatsApp Direct Message / Group Share
      const waUrl = `https://api.whatsapp.com/send?text=${encodedText}`;
      window.open(waUrl, '_blank');
      return {
        message: 'Opening WhatsApp with pre-filled post text...',
        type: 'success',
      };
    }

    case 'x_twitter': {
      // X / Twitter Tweet Intent
      // Truncate to avoid Twitter length limits if necessary
      const tweetText = textToShare.length > 270 ? textToShare.slice(0, 270) + '...' : textToShare;
      const twUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
      window.open(twUrl, '_blank', 'width=600,height=400');
      return {
        message: 'Tweet text copied! Opening X (Twitter) composer...',
        type: 'success',
      };
    }

    case 'telegram': {
      // Telegram Share
      const tgUrl = `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`;
      window.open(tgUrl, '_blank');
      return {
        message: 'Opening Telegram share composer...',
        type: 'success',
      };
    }

    case 'pinterest': {
      // Pinterest Pin Creator
      const pinImage = encodeURIComponent(realImageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30');
      const pinUrl = `https://pinterest.com/pin/create/button/?url=${encodedUrl}&media=${pinImage}&description=${encodeURIComponent(textToShare.slice(0, 450))}`;
      window.open(pinUrl, '_blank', 'width=750,height=600');
      return {
        message: 'Pin data copied! Opening Pinterest pin creation window...',
        type: 'success',
      };
    }

    case 'instagram': {
      // Instagram: Copy caption & open instagram
      window.open('https://www.instagram.com/', '_blank');
      return {
        message: 'Instagram caption copied to clipboard! Paste on Instagram.',
        type: 'info',
      };
    }

    case 'tiktok': {
      // TikTok: Copy script/caption & open tiktok
      window.open('https://www.tiktok.com/upload', '_blank');
      return {
        message: 'TikTok script & caption copied to clipboard! Paste on TikTok.',
        type: 'info',
      };
    }

    case 'youtube': {
      // YouTube Studio: Copy text & open studio
      window.open('https://studio.youtube.com/', '_blank');
      return {
        message: 'Video script copied to clipboard! Paste in YouTube Studio.',
        type: 'info',
      };
    }

    default: {
      return {
        message: 'Post text copied to clipboard!',
        type: 'success',
      };
    }
  }
}

/**
 * Trigger Native Web Share API if supported
 */
export async function triggerNativeDeviceShare(post: PostResult, activeText?: string): Promise<boolean> {
  const textToShare = activeText || post.text;
  if (navigator.share) {
    try {
      await navigator.share({
        title: post.productTitle,
        text: textToShare,
        url: post.productUrl,
      });
      return true;
    } catch (err) {
      console.log('Native share canceled or failed:', err);
      return false;
    }
  }
  return false;
}
