import { PostResult } from '../types';
import { extractAsinFromUrl, getAmazonProductImageUrl, sanitizeAmazonUrl } from './amazon';

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
  const rawProductUrl = post.productUrl || '';
  const cleanUrl = sanitizeAmazonUrl(rawProductUrl, 'yourtag-20') || rawProductUrl;
  const realImageUrl = post.productImageUrl || getAmazonProductImageUrl(cleanUrl);

  // Always copy post text to user's clipboard first
  try {
    navigator.clipboard.writeText(textToShare);
  } catch (e) {
    console.warn('Clipboard write failed:', e);
  }

  const encodedUrl = encodeURIComponent(cleanUrl);
  const encodedText = encodeURIComponent(textToShare);

  switch (platformKey) {
    case 'facebook': {
      // Facebook Sharer - Copy full text to clipboard & open composer
      const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
      window.open(fbUrl, '_blank', 'width=650,height=550,scrollbars=yes');
      return {
        message: 'ক্যাপশন কপি হয়েছে! ফেসবুক "What\'s on your mind?" বক্সে Ctrl+V দিয়ে পেস্ট করুন।',
        type: 'success',
      };
    }

    case 'whatsapp': {
      // WhatsApp Direct Message / Group Share
      const waUrl = `https://api.whatsapp.com/send?text=${encodedText}`;
      window.open(waUrl, '_blank');
      return {
        message: 'WhatsApp খোলানো হচ্ছে, পোস্ট টেক্সট প্রি-ফিল করা আছে!',
        type: 'success',
      };
    }

    case 'x_twitter': {
      // X / Twitter Tweet Intent
      const tweetText = textToShare.length > 270 ? textToShare.slice(0, 270) + '...' : textToShare;
      const twUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
      window.open(twUrl, '_blank', 'width=600,height=400');
      return {
        message: 'টুইট টেক্সট কপি হয়েছে! Twitter (X) কম্পোজার ওপেন হচ্ছে...',
        type: 'success',
      };
    }

    case 'telegram': {
      // Telegram Share
      const tgUrl = `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`;
      window.open(tgUrl, '_blank');
      return {
        message: 'Telegram শেয়ার ডায়ালগ ওপেন হচ্ছে...',
        type: 'success',
      };
    }

    case 'pinterest': {
      // Pinterest Pin Creator
      const pinImage = encodeURIComponent(realImageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30');
      const pinUrl = `https://pinterest.com/pin/create/button/?url=${encodedUrl}&media=${pinImage}&description=${encodeURIComponent(textToShare.slice(0, 450))}`;
      window.open(pinUrl, '_blank', 'width=750,height=600');
      return {
        message: 'পিন ডেটা কপি হয়েছে! Pinterest উইন্ডো ওপেন হচ্ছে...',
        type: 'success',
      };
    }

    case 'instagram': {
      // Instagram: Copy caption & open instagram
      window.open('https://www.instagram.com/', '_blank');
      return {
        message: 'ইনস্টাগ্রাম ক্যাপশন কপি হয়েছে! Instagram-এ পোস্ট তৈরি করার সময় পেস্ট করুন।',
        type: 'info',
      };
    }

    case 'tiktok': {
      // TikTok: Copy script/caption & open tiktok
      window.open('https://www.tiktok.com/upload', '_blank');
      return {
        message: 'টিকটক ক্যাপশন কপি হয়েছে! TikTok Upload-এ পেস্ট করুন।',
        type: 'info',
      };
    }

    case 'youtube': {
      // YouTube Studio: Copy text & open studio
      window.open('https://studio.youtube.com/', '_blank');
      return {
        message: 'ভিডিও ডেসক্রিপশন কপি হয়েছে! YouTube Studio-তে পেস্ট করুন।',
        type: 'info',
      };
    }

    default: {
      return {
        message: 'পোস্টের টেক্সট ক্লিপবোর্ডে কপি করা হয়েছে!',
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
