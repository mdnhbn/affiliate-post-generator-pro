import { Product, PostResult, Settings, AnalyticsEvent } from '../types';

const PRODUCTS_KEY = 'affiliate_pro_products_v1';
const HISTORY_KEY = 'affiliate_pro_history_v1';
const SETTINGS_KEY = 'affiliate_pro_settings_v1';
const ANALYTICS_KEY = 'affiliate_pro_analytics_v1';

export const INITIAL_PRODUCTS: Product[] = [];

export const INITIAL_SETTINGS: Settings = {
  provider: 'gemini',
  geminiKeys: [
    {
      id: 'key-default-gemini',
      key: '',
      label: 'Primary Gemini Key',
    }
  ],
  openRouterKeys: [],
  geminiModel: 'gemini-2.5-flash',
  openRouterModel: 'google/gemini-2.5-flash',
  imageModel: 'gemini-3.1-flash-lite-image',
  defaultPlatforms: ['facebook', 'instagram_post'],
  defaultLanguages: ['English', 'Arabic'],
  defaultAffiliateTag: 'yourtag-20',
  marketplaces: [
    { id: 'm-1', domain: 'amazon.com', tag: '' },
    { id: 'm-2', domain: 'amazon.sa', tag: '' },
    { id: 'm-3', domain: 'amazon.ae', tag: '' },
    { id: 'm-4', domain: 'amazon.in', tag: '' },
  ],
};

// Storage Helpers
export function getStoredProducts(): Product[] {
  try {
    const raw = localStorage.getItem(PRODUCTS_KEY);
    if (!raw) {
      localStorage.setItem(PRODUCTS_KEY, JSON.stringify(INITIAL_PRODUCTS));
      return INITIAL_PRODUCTS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load products from localStorage', e);
    return INITIAL_PRODUCTS;
  }
}

export function saveStoredProducts(products: Product[]): void {
  try {
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
  } catch (e) {
    console.error('Failed to save products', e);
  }
}

export function getStoredHistory(): PostResult[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Failed to load history', e);
    return [];
  }
}

export function saveStoredHistory(history: PostResult[]): void {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch (e) {
    console.error('Failed to save history', e);
  }
}

export function getStoredSettings(): Settings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(INITIAL_SETTINGS));
      return INITIAL_SETTINGS;
    }
    const parsed = JSON.parse(raw);
    return { ...INITIAL_SETTINGS, ...parsed };
  } catch (e) {
    console.error('Failed to load settings', e);
    return INITIAL_SETTINGS;
  }
}

export function saveStoredSettings(settings: Settings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings', e);
  }
}

export function getStoredAnalytics(): AnalyticsEvent[] {
  try {
    const raw = localStorage.getItem(ANALYTICS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Failed to load analytics', e);
    return [];
  }
}

export function saveStoredAnalytics(events: AnalyticsEvent[]): void {
  try {
    localStorage.setItem(ANALYTICS_KEY, JSON.stringify(events));
  } catch (e) {
    console.error('Failed to save analytics', e);
  }
}

export function logAnalyticsEvent(event: Omit<AnalyticsEvent, 'id' | 'timestamp'>): void {
  const current = getStoredAnalytics();
  const newEvent: AnalyticsEvent = {
    ...event,
    id: `event-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: Date.now(),
  };
  saveStoredAnalytics([newEvent, ...current]);
}
