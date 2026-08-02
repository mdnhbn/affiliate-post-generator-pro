import { 
  GenerationOptions, 
  Product, 
  PlatformId, 
  PostResult, 
  Settings, 
  ApiKeyItem 
} from '../types';

export const PLATFORM_NAMES: Record<PlatformId, string> = {
  facebook: 'Facebook Post',
  instagram_post: 'Instagram Post',
  instagram_reels: 'Instagram Reels / Story',
  whatsapp: 'WhatsApp Status',
  x_twitter: 'X (Twitter)',
  pinterest: 'Pinterest Pin',
  tiktok: 'TikTok Script & Caption',
};

export const CONTENT_TYPE_NAMES = {
  promotional: 'Promotional Hype',
  honest_review: 'Honest Review',
  comparison: 'Comparison vs Alternatives',
  flash_sale: 'Flash Sale (Urgency)',
  unboxing: 'Unboxing Style',
  listicle: 'Top Picks Roundup (Listicle)',
};

export const TONE_NAMES = {
  friendly: 'Friendly & Casual',
  professional: 'Professional & Authoritative',
  funny: 'Funny & Witty',
  urgent: 'Urgent & Hype',
  storytelling: 'Storytelling & Relatable',
};

// Key Rotation Helper
function getActiveKey(keys: ApiKeyItem[]): ApiKeyItem | null {
  const validKeys = keys.filter(k => k.key && k.key.trim() && k.status !== 'invalid');
  if (validKeys.length > 0) {
    validKeys.sort((a, b) => (a.errorCount || 0) - (b.errorCount || 0) || (a.lastUsed || 0) - (b.lastUsed || 0));
    return validKeys[0];
  }

  // Fallback to environment variable key if present and not placeholder
  let envKey = '';
  try {
    if (typeof process !== 'undefined' && process.env && process.env.GEMINI_API_KEY) {
      envKey = process.env.GEMINI_API_KEY;
    }
  } catch (e) {
    // ignore
  }

  if (envKey && envKey.trim() && !envKey.includes('MY_GEMINI_API_KEY')) {
    return {
      id: 'key-system-env',
      key: envKey.trim(),
      label: 'AI Studio Environment Key',
      status: 'active'
    };
  }

  return null;
}

// Fallback High-Converting Demo Post Generator for Offline/No-Key Preview Mode
export function generateFallbackPost(
  options: GenerationOptions,
  platform: PlatformId,
  language: string,
  targetProduct: Product
): PostResult {
  const isBengali = language.toLowerCase().includes('bengali') || language.toLowerCase().includes('বাংলা');
  const isArabic = language.toLowerCase().includes('arabic') || language.toLowerCase().includes('عربي');
  const isHindi = language.toLowerCase().includes('hindi') || language.toLowerCase().includes('हिंदी');
  const isUrdu = language.toLowerCase().includes('urdu') || language.toLowerCase().includes('اردو');

  const title = targetProduct.title;
  const price = targetProduct.priceDiscount || 'অফারে পাওয়া যাচ্ছে';
  const url = targetProduct.amazonUrl;
  const features = targetProduct.features || '';

  let text = '';
  
  if (isBengali) {
    text = `🔥 দারুণ ভাইরাল ডিল! ${title} এখন সেরা দামে পাওয়া যাচ্ছে!

📌 মূল বৈশিষ্ট্যসমূহ:
• ${features || 'প্রিমিয়াম কোয়ালিটি এবং টেকসই উপাদান'}
• বিশেষ মূল্য / ছাড়: ${price}
• সোশ্যাল মিডিয়ায় ট্রেন্ডিং এবং কাস্টমারদের সেরা পছন্দ

💡 কেন কিনবেন?
যারা বাজেটের মধ্যে অরিজিনাল এবং কোয়ালিটি সম্পন্ন প্রোডাক্ট খুঁজছেন, তাদের জন্য এটি সেরা একটি চয়েস! লিমিটেড স্টক, দ্রুত অর্ডার করুন।

👉 সরাসরি অ্যামাজন অফার লিঙ্ক:
${url}

#AmazonDeals #BengaliViral #SmartShopping #Affiliate #Ad`;
  } else if (isArabic) {
    text = `🔥 عرض استثنائي وفاخر! ${title} متوفر الآن بسعر منافس!

📌 أهم المميزات:
• ${features || 'تصميم عصري وجودة ممتازة'}
• السعر / الخصم الحالي: ${price}
• الأكثر مبيعاً وتقييماً على أمازون

💡 لماذا تطلبه اليوم؟
الخيار الأمثل لكل من يبحث عن الأداء الفائق والقيمة الحقيقية. الكمية محدودة سارع بالشراء!

👉 رابط الشراء المباشر من أمازون:
${url}

#عروض_أمازون #تسوق_ذكيات #أمازون #Ad`;
  } else if (isHindi) {
    text = `🔥 ज़बरदस्त ट्रेंडिंग डील! ${title} अब बेहद ख़ास ऑफर पर उपलब्ध है!

📌 मुख्य विशेषताएं:
• ${features || 'प्रीमियम क्वालिटी और शानदार स्थायित्व'}
• स्पेशल ऑफर: ${price}

💡 क्यों खरीदें?
अगर आप बेस्ट परफॉरमेंस और सही दाम चाहते हैं, तो यह प्रोडक्ट आपके लिए बिल्कुल परफेक्ट है!

👉 डायरेक्ट अमेज़न ऑर्डर लिंक:
${url}

#AmazonDeals #TrendingProducts #SmartShopping #Ad`;
  } else if (isUrdu) {
    text = `🔥 زبردست آفر! ${title} اب بہترین ڈسکاؤنٹ کے ساتھ دستیاب ہے!

📌 اہم خصوصیات:
• ${features || 'پریمیئم کوالٹی اور جدید ڈیزائن'}
• خصوصی ڈسکاؤنٹ: ${price}

💡 کیوں خریدیں؟
بہترین معیار اور مناسب قیمت کا زبردست امتزاج۔ اسٹاک محدود ہے، ابھی آرڈر کریں!

👉 ایمیزون سے براہ راست خریدیں:
${url}

#AmazonDeals #SmartShopping #Ad`;
  } else {
    // English
    text = `🔥 VIRAL HOT DEAL! ${title} is trending right now at a special discounted price!

📌 Key Highlights:
• ${features || 'High-performance build, sleek aesthetic & top customer rating.'}
• Price / Discount: ${price}

💡 Why You Need This:
The ultimate combination of quality and efficiency. Don't miss out on this price drop!

👉 Direct Amazon Order Link:
${url}

#AmazonDeals #ViralFinds #MustHave #SmartShopping #Ad`;
  }

  const promptToUse = `${title} product showcase studio lighting professional photography`;
  const seed = Math.floor(Math.random() * 1000000);
  const generatedImageUrl = options.generateActualImage
    ? `https://image.pollinations.ai/prompt/${encodeURIComponent(promptToUse)}?width=1024&height=1024&nologo=true&seed=${seed}`
    : undefined;

  const hashtagRegex = /#([\w\u0980-\u09FF\u0600-\u06FF\u0900-\u097F]+)/g;
  const hashtags = text.match(hashtagRegex) || ['#AmazonDeals', '#Ad'];

  return {
    id: `post-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    productId: targetProduct.id,
    productTitle: options.contentType === 'listicle' ? `Top ${options.products.length} Picks Roundup` : targetProduct.title,
    productUrl: targetProduct.amazonUrl,
    platform,
    language,
    contentType: options.contentType,
    tone: options.tone,
    text,
    variantUsed: 'single',
    hashtags: Array.from(new Set(hashtags)),
    generatedImageUrl,
    createdAt: Date.now(),
    providerUsed: 'Instant AI Studio Demo Engine',
    keyLabelUsed: 'Studio Demo Key',
  };
}

function updateKeyUsage(keys: ApiKeyItem[], keyId: string, success: boolean): ApiKeyItem[] {
  return keys.map(k => {
    if (k.id === keyId) {
      return {
        ...k,
        lastUsed: Date.now(),
        errorCount: success ? 0 : (k.errorCount || 0) + 1,
        status: !success && (k.errorCount || 0) >= 2 ? 'rate_limited' : k.status || 'active'
      };
    }
    return k;
  });
}

export function buildSystemAndUserPrompt(
  options: GenerationOptions,
  platform: PlatformId,
  language: string,
  targetProduct?: Product
) {
  const isListicle = options.contentType === 'listicle' && options.products.length > 1;

  let productContext = '';
  if (isListicle) {
    productContext = `TOP PICKS ROUNDUP PRODUCTS (${options.products.length} Items):\n` + 
      options.products.map((p, idx) => 
        `#${idx + 1}: ${p.title}\n- Price/Discount: ${p.priceDiscount || 'Standard Price'}\n- Key Features: ${p.features}\n- Link: ${p.amazonUrl}`
      ).join('\n\n');
  } else {
    const p = targetProduct || options.products[0];
    productContext = `PRODUCT DETAILS:
- Title: ${p.title}
- Price/Discount: ${p.priceDiscount || 'N/A'}
- Features/Description: ${p.features}
- Affiliate Link: ${p.amazonUrl}`;
  }

  const platformRules: Record<PlatformId, string> = {
    facebook: 'Platform format: Facebook Post. Use short, punchy paragraphs with clear line breaks. Focus on a relatable pain point or curiosity hook, followed by benefits, social proof, and a clear call to action.',
    instagram_post: 'Platform format: Instagram Post. Open with a compelling visual hook. Use aesthetic spacing, emojis, benefit bullet points, a high-engagement question, and a clear CTA directing readers to click the link.',
    instagram_reels: 'Platform format: Instagram Reels / Story. Provide BOTH a 5-bullet video script outline (Hook, Problem, Solution, Demo, CTA) AND a punchy caption.',
    whatsapp: 'Platform format: WhatsApp Status / Broadcast. Keep it concise, high-energy, friendly, and direct. Ideal for fast reading on mobile with emojis and clear link.',
    x_twitter: 'Platform format: X (Twitter). Ultra-concise, fast-paced. Bold hook line, 2-3 bullet benefits, link, and hashtag.',
    pinterest: 'Platform format: Pinterest Pin. Format as: Title (catchy & SEO-rich) followed by Description (keyword-rich, descriptive, problem-solving, with strong CTA).',
    tiktok: 'Platform format: TikTok. Provide a 5-bullet viral video script outline (Hook 0-3s, Problem, Demo/Features, Twist/Urgency, CTA) followed by caption.',
  };

  let toneInstruction = `Tone: ${TONE_NAMES[options.tone] || options.tone}.`;
  let contentTypeInstruction = `Content Angle: ${CONTENT_TYPE_NAMES[options.contentType] || options.contentType}.`;

  if (options.inspirationPost && options.inspirationPost.trim()) {
    contentTypeInstruction = `INSPIRATION MIMICRY MODE: 
Analyze the structural rhythm, hook mechanism, line-breaking style, and persuasive pacing of the following reference post. MIMIC its structure and tone EXACTLY for this product, but NEVER copy its literal text:
"${options.inspirationPost.trim()}"`;
    toneInstruction = '';
  }

  const systemPrompt = `You are a world-class viral affiliate marketer specializing in Amazon products. 
Your goal is to write a high-converting, viral social media post promoting Amazon products.

CRITICAL RULES YOU MUST FOLLOW:
1. HOOK FIRST LINE: The very first line MUST be a bold, curiosity-inducing hook, relatable pain point, or unexpected statement. NEVER open with generic phrases like "Check out this product", "Looking for...", or "Introducing...".
2. BENEFIT-FIRST: Focus on how this product transforms the user's life, saves time, saves money, or solves a frustrating problem.
3. ACCURATE PRICE & DISCOUNT: Only reference the exact price and discount percentage provided in the product data. Never invent, round up, or exaggerate a discount that wasn't given.
4. CULTURAL & LANGUAGE FLUENCY: Write in natural, native, culturally fluent ${language}. Do NOT perform literal word-for-word translation from English. Use natural colloquialisms appropriate for ${language} social media.
5. HONEST URGENCY: Only mention price drops, discounts, or flash sales if actual discount data is present in the product details. Never invent fake discounts or fake scarcity.
6. DISCLOSURE: ${options.includeDisclosure ? 'Include an Amazon affiliate disclosure line (e.g., "#ad As an Amazon Associate I earn from qualifying purchases" or target language equivalent).' : 'Do not include affiliate disclosure.'}
7. CTA & LINK: ${options.includeCta ? 'End with one clear, action-oriented call to action followed by the Amazon affiliate link.' : 'Do not include a hard CTA link.'}
8. HASHTAGS: ${options.includeHashtags ? 'Include 5-15 highly relevant, high-traffic hashtags at the bottom.' : 'Do NOT include any hashtags.'}
9. EMOJIS: ${options.includeEmoji ? 'Use emojis strategically for visual hierarchy and emphasis.' : 'Do NOT use emojis.'}
10. SHORT VIDEO HOOK: ${options.generateVideoHook ? 'Include a dedicated 5-bullet short-video script outline (0-3s Hook, 3-10s Setup, 10-20s Wow Factor, 20-30s CTA) clearly labeled above the caption.' : ''}
11. MATCHING IMAGE PROMPT: ${options.generateImagePrompt || options.generateActualImage ? 'At the very end of your response, output a section strictly labeled "IMAGE_PROMPT: <short description of clean product showcase visual for AI image generator>".' : ''}
12. A/B HOOK VARIANTS: ${options.generateHookVariants ? 'Output TWO complete post variants with identical facts but completely different opening hook styles. Format Variant A first, then a line containing strictly "===VARIANT_SPLIT===", followed by Variant B.' : ''}`;

  const userPrompt = `Target Language: ${language}
${platformRules[platform]}
${contentTypeInstruction}
${toneInstruction}
${options.customInstructions ? `Custom Instructions: ${options.customInstructions}` : ''}

${productContext}

Generate the complete post now:`;

  return { systemPrompt, userPrompt };
}

// Single card generator with key rotation
export async function generateSinglePost(
  options: GenerationOptions,
  platform: PlatformId,
  language: string,
  settings: Settings,
  onKeysUpdated?: (updatedSettings: Settings) => void
): Promise<PostResult> {
  const targetProduct = options.products[0];
  const { systemPrompt, userPrompt } = buildSystemAndUserPrompt(options, platform, language, targetProduct);

  const provider = settings.provider;
  let currentKeys = provider === 'gemini' ? [...settings.geminiKeys] : [...settings.openRouterKeys];

  let lastError = 'No valid API keys configured.';
  let attempts = 0;
  const maxAttempts = Math.max(1, currentKeys.length);

  while (attempts < maxAttempts) {
    attempts++;
    const activeKeyItem = getActiveKey(currentKeys);
    if (!activeKeyItem || !activeKeyItem.key.trim()) {
      // Fallback to Instant Studio Post Generator if no API key is provided
      console.log('No active API key found, generating instant studio demo post fallback.');
      return generateFallbackPost(options, platform, language, targetProduct);
    }

    try {
      let generatedText = '';

      if (provider === 'gemini') {
        const modelName = settings.geminiModel || 'gemini-2.5-flash';
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${encodeURIComponent(activeKeyItem.key.trim())}`;
        
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }]
              }
            ],
            generationConfig: {
              temperature: 0.75,
              maxOutputTokens: 2500,
            }
          })
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          const errMsg = errData.error?.message || `HTTP ${response.status} ${response.statusText}`;
          if (response.status === 429 || response.status === 403 || response.status === 401) {
            currentKeys = updateKeyUsage(currentKeys, activeKeyItem.id, false);
            lastError = `Key "${activeKeyItem.label}": ${errMsg}`;
            continue; // Retry with next key
          }
          throw new Error(`Gemini API Error: ${errMsg}`);
        }

        const data = await response.json();
        const candidate = data.candidates?.[0];
        if (!candidate) {
          throw new Error('No content returned from Gemini API.');
        }
        generatedText = candidate.content?.parts?.map((p: { text?: string }) => p.text || '').join('') || '';

      } else {
        // OpenRouter
        const modelName = settings.openRouterModel || 'google/gemini-2.5-flash';
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${activeKeyItem.key.trim()}`,
            'HTTP-Referer': window.location.href,
            'X-Title': 'Affiliate Post Generator Pro',
          },
          body: JSON.stringify({
            model: modelName,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt }
            ],
            temperature: 0.75,
            max_tokens: 2500,
          })
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          const errMsg = errData.error?.message || `HTTP ${response.status} ${response.statusText}`;
          if (response.status === 429 || response.status === 401 || response.status === 402) {
            currentKeys = updateKeyUsage(currentKeys, activeKeyItem.id, false);
            lastError = `Key "${activeKeyItem.label}": ${errMsg}`;
            continue; // Retry with next key
          }
          throw new Error(`OpenRouter API Error: ${errMsg}`);
        }

        const data = await response.json();
        generatedText = data.choices?.[0]?.message?.content || '';
      }

      // Successful request!
      currentKeys = updateKeyUsage(currentKeys, activeKeyItem.id, true);
      if (onKeysUpdated) {
        const updatedSettings = {
          ...settings,
          geminiKeys: provider === 'gemini' ? currentKeys : settings.geminiKeys,
          openRouterKeys: provider === 'openrouter' ? currentKeys : settings.openRouterKeys,
        };
        onKeysUpdated(updatedSettings);
      }

      // Parse output for tags, hashtags, image prompt, video script
      let imagePrompt: string | undefined = undefined;
      let videoHookScript: string | undefined = undefined;

      if (generatedText.includes('IMAGE_PROMPT:')) {
        const parts = generatedText.split('IMAGE_PROMPT:');
        generatedText = parts[0].trim();
        imagePrompt = parts[1].trim();
      }

      // Handle A/B Hook Variants
      let variantAText: string | undefined = undefined;
      let variantBText: string | undefined = undefined;
      if (options.generateHookVariants && generatedText.includes('===VARIANT_SPLIT===')) {
        const splitParts = generatedText.split('===VARIANT_SPLIT===');
        variantAText = splitParts[0].replace(/^Variant\s*A:?\s*/i, '').trim();
        variantBText = splitParts[1].replace(/^Variant\s*B:?\s*/i, '').trim();
        generatedText = variantAText;
      }

      // Handle Real Image Generation
      let generatedImageUrl: string | undefined = undefined;
      if (options.generateActualImage) {
        const promptToUse = imagePrompt || `${targetProduct.title} product showcase studio lighting professional photography`;
        const seed = Math.floor(Math.random() * 1000000);
        generatedImageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(promptToUse)}?width=1024&height=1024&nologo=true&seed=${seed}`;
      }

      // Extract hashtags if present
      const hashtagRegex = /#([\w\u0980-\u09FF\u0600-\u06FF\u0900-\u097F]+)/g;
      const hashtagMatches = generatedText.match(hashtagRegex) || [];
      const hashtags = Array.from(new Set(hashtagMatches));

      const result: PostResult = {
        id: `post-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        productId: targetProduct.id,
        productTitle: options.contentType === 'listicle' ? `Top ${options.products.length} Picks Roundup` : targetProduct.title,
        productUrl: targetProduct.amazonUrl,
        platform,
        language,
        contentType: options.inspirationPost ? 'inspired' : options.contentType,
        tone: options.tone,
        text: generatedText,
        variantAText,
        variantBText,
        variantUsed: options.generateHookVariants && variantBText ? 'A' : 'single',
        hashtags,
        imagePrompt,
        generatedImageUrl,
        videoHookScript,
        createdAt: Date.now(),
        providerUsed: provider === 'gemini' ? `Gemini (${settings.geminiModel})` : `OpenRouter (${settings.openRouterModel})`,
        keyLabelUsed: activeKeyItem.label,
      };

      return result;

    } catch (err: unknown) {
      const errorStr = err instanceof Error ? err.message : String(err);
      console.error(`Attempt ${attempts} failed:`, errorStr);
      lastError = errorStr;
    }
  }

  console.warn('API generation failed, serving fallback post:', lastError);
  return generateFallbackPost(options, platform, language, targetProduct);
}
