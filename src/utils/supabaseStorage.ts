import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { Product, PostResult, Settings, ApiKeyItem, AdSlot, AdPlacement } from '../types';

export interface UserProfile {
  id: string;
  email: string;
  display_name: string;
  is_admin: boolean;
  created_at?: string;
}

// -------------------------------------------------------------
// Products Supabase Sync
// -------------------------------------------------------------
export async function fetchSupabaseProducts(userId: string): Promise<Product[]> {
  if (!isSupabaseConfigured() || !userId) return [];

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching Supabase products:', error);
    return [];
  }

  return (data || []).map((row) => ({
    id: row.id,
    title: row.title,
    amazonUrl: row.amazon_link,
    priceDiscount: row.price_discount || '',
    features: row.features || '',
    imageUrl: row.image_url || undefined,
    lastVerifiedAt: row.last_verified_at ? Number(row.last_verified_at) : undefined,
    createdAt: Number(row.created_at),
  }));
}

export async function upsertSupabaseProduct(userId: string, product: Product): Promise<void> {
  if (!isSupabaseConfigured() || !userId) return;

  const row = {
    id: product.id,
    user_id: userId,
    title: product.title,
    amazon_link: product.amazonUrl,
    price_discount: product.priceDiscount || null,
    features: product.features || null,
    image_url: product.imageUrl || null,
    last_verified_at: product.lastVerifiedAt || Date.now(),
    created_at: product.createdAt || Date.now(),
  };

  const { error } = await supabase.from('products').upsert(row);
  if (error) {
    console.error('Error upserting product to Supabase:', error);
  }
}

export async function deleteSupabaseProduct(userId: string, productId: string): Promise<void> {
  if (!isSupabaseConfigured() || !userId) return;

  const { error } = await supabase
    .from('products')
    .delete()
    .eq('user_id', userId)
    .eq('id', productId);

  if (error) {
    console.error('Error deleting product from Supabase:', error);
  }
}

// -------------------------------------------------------------
// Post History Supabase Sync
// -------------------------------------------------------------
export async function fetchSupabaseHistory(userId: string): Promise<PostResult[]> {
  if (!isSupabaseConfigured() || !userId) return [];

  const { data, error } = await supabase
    .from('post_history')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching Supabase post_history:', error);
    return [];
  }

  return (data || []).map((row) => ({
    id: row.id,
    productId: row.product_id || '',
    productTitle: row.product_title || 'Amazon Product',
    productUrl: row.amazon_link || '',
    platform: row.platform as any,
    language: row.language,
    contentType: row.content_type as any,
    tone: row.tone as any,
    text: row.post_text,
    variantAText: row.variant_a_text || undefined,
    variantBText: row.variant_b_text || undefined,
    variantUsed: row.variant_used as any || undefined,
    hashtags: row.hashtags || [],
    imagePrompt: row.image_prompt || undefined,
    generatedImageUrl: row.generated_image_url || undefined,
    videoHookScript: row.video_hook_script || undefined,
    createdAt: Number(row.created_at),
    providerUsed: 'Supabase Cloud',
    keyLabelUsed: 'Active Key',
  }));
}

export async function insertSupabaseHistory(userId: string, item: PostResult): Promise<void> {
  if (!isSupabaseConfigured() || !userId) return;

  const row = {
    id: item.id,
    user_id: userId,
    platform: item.platform,
    language: item.language,
    content_type: item.contentType,
    tone: item.tone,
    post_text: item.text,
    variant_a_text: item.variantAText || null,
    variant_b_text: item.variantBText || null,
    variant_used: item.variantUsed || null,
    hashtags: item.hashtags || [],
    image_prompt: item.imagePrompt || null,
    generated_image_url: item.generatedImageUrl || null,
    video_hook_script: item.videoHookScript || null,
    product_id: item.productId || null,
    created_at: item.createdAt || Date.now(),
  };

  const { error } = await supabase.from('post_history').insert(row);
  if (error) {
    console.error('Error inserting post_history to Supabase:', error);
  }
}

export async function deleteSupabaseHistoryItem(userId: string, id: string): Promise<void> {
  if (!isSupabaseConfigured() || !userId) return;

  const { error } = await supabase
    .from('post_history')
    .delete()
    .eq('user_id', userId)
    .eq('id', id);

  if (error) {
    console.error('Error deleting post_history item:', error);
  }
}

export async function clearSupabaseHistory(userId: string): Promise<void> {
  if (!isSupabaseConfigured() || !userId) return;

  const { error } = await supabase
    .from('post_history')
    .delete()
    .eq('user_id', userId);

  if (error) {
    console.error('Error clearing post_history from Supabase:', error);
  }
}

// -------------------------------------------------------------
// User Settings & API Keys Supabase Sync
// -------------------------------------------------------------
export async function fetchSupabaseSettings(userId: string, defaultSettings: Settings): Promise<Settings> {
  if (!isSupabaseConfigured() || !userId) return defaultSettings;

  const { data, error } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching user_settings from Supabase:', error);
    return defaultSettings;
  }

  // Fetch API keys
  const { data: keysData } = await supabase
    .from('api_keys')
    .select('*')
    .eq('user_id', userId);

  const geminiKeys: ApiKeyItem[] = [];
  const openRouterKeys: ApiKeyItem[] = [];

  (keysData || []).forEach((k) => {
    const keyObj: ApiKeyItem = {
      id: k.id,
      label: k.label || 'API Key',
      key: k.encrypted_key,
      status: 'active',
    };
    if (k.provider === 'gemini') {
      geminiKeys.push(keyObj);
    } else if (k.provider === 'openrouter') {
      openRouterKeys.push(keyObj);
    }
  });

  if (!data) {
    return {
      ...defaultSettings,
      geminiKeys: geminiKeys.length > 0 ? geminiKeys : defaultSettings.geminiKeys,
      openRouterKeys: openRouterKeys.length > 0 ? openRouterKeys : defaultSettings.openRouterKeys,
    };
  }

  return {
    provider: (data.active_ai_provider as any) || defaultSettings.provider,
    geminiModel: defaultSettings.geminiModel,
    openRouterModel: defaultSettings.openRouterModel,
    imageModel: defaultSettings.imageModel,
    geminiKeys: geminiKeys.length > 0 ? geminiKeys : defaultSettings.geminiKeys,
    openRouterKeys: openRouterKeys.length > 0 ? openRouterKeys : defaultSettings.openRouterKeys,
    defaultPlatforms: data.default_platforms || defaultSettings.defaultPlatforms,
    defaultLanguages: data.default_languages || defaultSettings.defaultLanguages,
    defaultAffiliateTag: data.default_marketplace_tag || defaultSettings.defaultAffiliateTag,
    marketplaces: data.marketplaces || defaultSettings.marketplaces,
    amazonAssociateDisclosure: data.amazon_associate_disclosure ?? defaultSettings.amazonAssociateDisclosure,
    isSecurityLocked: defaultSettings.isSecurityLocked,
  };
}

export async function saveSupabaseSettings(userId: string, settings: Settings): Promise<void> {
  if (!isSupabaseConfigured() || !userId) return;

  const settingsRow = {
    user_id: userId,
    active_ai_provider: settings.provider,
    default_marketplace_tag: settings.defaultAffiliateTag || 'yourtag-20',
    amazon_associate_disclosure: settings.amazonAssociateDisclosure ?? true,
    marketplaces: settings.marketplaces || [],
    default_platforms: settings.defaultPlatforms || [],
    default_languages: settings.defaultLanguages || [],
  };

  const { error } = await supabase.from('user_settings').upsert(settingsRow, { onConflict: 'user_id' });
  if (error) {
    console.error('Error saving user_settings to Supabase:', error);
  }

  // Sync API Keys
  const allKeys = [
    ...settings.geminiKeys.map(k => ({ ...k, provider: 'gemini' })),
    ...settings.openRouterKeys.map(k => ({ ...k, provider: 'openrouter' }))
  ];

  for (const k of allKeys) {
    if (!k.key.trim()) continue;
    await supabase.from('api_keys').upsert({
      id: k.id,
      user_id: userId,
      provider: k.provider,
      label: k.label,
      encrypted_key: k.key,
      created_at: Date.now(),
    });
  }
}

// -------------------------------------------------------------
// User Profile Helpers
// -------------------------------------------------------------
export async function fetchUserProfile(userId: string): Promise<UserProfile | null> {
  if (!isSupabaseConfigured() || !userId) return null;

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('[fetchUserProfile] Error fetching profile from Supabase:', error);
    }

    // Explicit console.log of fetched profile object as requested
    console.log('[fetchUserProfile] Fetched profile object:', data);

    if (data) {
      const email = data.email || '';
      const isAdmin = Boolean(
        data.is_admin === true || 
        data.is_admin === 1 || 
        (typeof data.is_admin === 'string' && (data.is_admin as string).toLowerCase() === 'true') ||
        (email && email.toLowerCase() === 'mdnhbn@gmail.com')
      );

      return {
        id: data.id,
        email: email,
        display_name: data.display_name || '',
        is_admin: isAdmin,
        created_at: data.created_at,
      };
    }

    // Fallback: If no profile row exists yet, attempt auto-creation for logged-in user
    const { data: { user } } = await supabase.auth.getUser();
    if (user && user.id === userId) {
      const email = user.email || '';
      const displayName = user.user_metadata?.display_name || user.user_metadata?.full_name || email.split('@')[0] || 'User';
      const isOwnerEmail = email.toLowerCase() === 'mdnhbn@gmail.com';

      const newProfileRow = {
        id: userId,
        email,
        display_name: displayName,
        is_admin: isOwnerEmail,
        created_at: new Date().toISOString(),
      };

      const { data: createdData, error: createError } = await supabase
        .from('profiles')
        .upsert(newProfileRow)
        .select()
        .maybeSingle();

      if (!createError && createdData) {
        console.log('[fetchUserProfile] Created new profile object:', createdData);
        return {
          id: createdData.id,
          email: createdData.email || email,
          display_name: createdData.display_name || displayName,
          is_admin: Boolean(
            createdData.is_admin === true || 
            createdData.is_admin === 1 || 
            (typeof createdData.is_admin === 'string' && (createdData.is_admin as string).toLowerCase() === 'true')
          ),
          created_at: createdData.created_at,
        };
      }
    }

    return null;
  } catch (err) {
    console.error('[fetchUserProfile] Exception in fetchUserProfile:', err);
    return null;
  }
}

// -------------------------------------------------------------
// Ad Slots & Admin Supabase Helpers
// -------------------------------------------------------------
export async function fetchAdSlots(isAdmin: boolean = false): Promise<AdSlot[]> {
  if (!isSupabaseConfigured()) return [];

  let query = supabase.from('ad_slots').select('*');
  if (!isAdmin) {
    query = query.eq('is_active', true);
  }
  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching ad_slots from Supabase:', error);
    return [];
  }

  return (data || []) as AdSlot[];
}

export async function fetchActiveAdSlotsByPlacement(placement: AdPlacement): Promise<AdSlot[]> {
  if (!isSupabaseConfigured()) return [];

  const { data, error } = await supabase
    .from('ad_slots')
    .select('*')
    .eq('placement', placement)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error(`Error fetching active ad_slots for placement ${placement}:`, error);
    return [];
  }

  return (data || []) as AdSlot[];
}

export async function upsertAdSlot(adSlot: Partial<AdSlot>): Promise<{ data: AdSlot | null; error: any }> {
  if (!isSupabaseConfigured()) return { data: null, error: 'Supabase not configured' };

  const { data, error } = await supabase
    .from('ad_slots')
    .upsert(adSlot)
    .select()
    .single();

  if (error) {
    console.error('Error upserting ad_slot to Supabase:', error);
  }

  return { data: data as AdSlot | null, error };
}

export async function deleteAdSlot(id: string): Promise<{ error: any }> {
  if (!isSupabaseConfigured()) return { error: 'Supabase not configured' };

  const { error } = await supabase
    .from('ad_slots')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting ad_slot from Supabase:', error);
  }

  return { error };
}

export async function fetchAllProfilesForAdmin(): Promise<UserProfile[]> {
  if (!isSupabaseConfigured()) return [];

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching all profiles for admin from Supabase:', error);
    return [];
  }

  return (data || []) as UserProfile[];
}

export async function updateUserAdminRole(userId: string, isAdmin: boolean): Promise<{ error: any }> {
  if (!isSupabaseConfigured()) return { error: 'Supabase not configured' };

  const { error } = await supabase
    .from('profiles')
    .update({ is_admin: isAdmin })
    .eq('id', userId);

  if (error) {
    console.error('Error updating user admin role in Supabase:', error);
  }

  return { error };
}

