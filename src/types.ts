export type PlatformId = 
  | 'facebook' 
  | 'instagram_post' 
  | 'instagram_reels' 
  | 'whatsapp' 
  | 'x_twitter' 
  | 'pinterest' 
  | 'tiktok';

export type ContentTypeId = 
  | 'promotional' 
  | 'honest_review' 
  | 'comparison' 
  | 'flash_sale' 
  | 'unboxing' 
  | 'listicle';

export type ToneId = 
  | 'friendly' 
  | 'professional' 
  | 'funny' 
  | 'urgent' 
  | 'storytelling';

export interface Product {
  id: string;
  title: string;
  amazonUrl: string;
  features: string;
  priceDiscount: string;
  imageUrl?: string;
  createdAt: number;
  lastVerifiedAt?: number;
}

export interface ApiKeyItem {
  id: string;
  key: string;
  label: string;
  lastUsed?: number;
  errorCount?: number;
  status?: 'active' | 'rate_limited' | 'invalid';
}

export interface Marketplace {
  id: string;
  domain: string;
  tag: string;
}

export interface Settings {
  provider: 'gemini' | 'openrouter';
  geminiKeys: ApiKeyItem[];
  openRouterKeys: ApiKeyItem[];
  geminiModel: string;
  openRouterModel: string;
  imageModel: string;
  defaultPlatforms: PlatformId[];
  defaultLanguages: string[];
  defaultAffiliateTag?: string;
  marketplaces?: Marketplace[];
  amazonAssociateDisclosure?: boolean;
  masterPasswordEncrypted?: string;
  isSecurityLocked?: boolean;
}

export interface GenerationOptions {
  products: Product[]; // 1 for single product, 2-5 for listicle
  platforms: PlatformId[];
  languages: string[];
  contentType: ContentTypeId;
  tone: ToneId;
  targetAudience?: string;
  ctaType?: string;
  includeCta: boolean;
  includeHashtags: boolean;
  includeEmoji: boolean;
  includeDisclosure: boolean;
  generateImagePrompt: boolean;
  generateVideoHook: boolean;
  generateActualImage?: boolean;
  generateHookVariants?: boolean;
  customInstructions?: string;
  inspirationPost?: string;
}

export interface AnalyticsEvent {
  id: string;
  postId: string;
  productId: string;
  productTitle: string;
  platform: PlatformId;
  language: string;
  action: 'generated' | 'copied' | 'qr_download' | 'scheduled';
  timestamp: number;
  contentType?: ContentTypeId | 'inspired';
  tone?: ToneId;
  variantUsed?: 'A' | 'B';
}

export interface PostResult {
  id: string;
  productId: string;
  productTitle: string;
  productUrl: string;
  productImageUrl?: string;
  platform: PlatformId;
  language: string;
  contentType: ContentTypeId | 'inspired';
  tone: ToneId;
  text: string;
  variantAText?: string;
  variantBText?: string;
  variantUsed?: 'A' | 'B' | 'single';
  hashtags: string[];
  imagePrompt?: string;
  generatedImageUrl?: string;
  videoHookScript?: string;
  createdAt: number;
  providerUsed: string;
  keyLabelUsed: string;
}

export interface GenerationCardState {
  id: string; // unique key for platform x language x product
  platform: PlatformId;
  language: string;
  product: Product;
  status: 'idle' | 'loading' | 'success' | 'error';
  result?: PostResult;
  error?: string;
}

export type AdPlacement = 'top_banner' | 'footer_banner' | 'interstitial_popup' | 'results_banner';
export type AdType = 'script' | 'link_banner';

export interface AdSlot {
  id: string;
  name: string;
  placement: AdPlacement;
  ad_type: AdType;
  ad_code?: string;
  link_url?: string;
  banner_image_url?: string;
  display_interval_seconds?: number;
  is_active: boolean;
  created_at?: string;
}

