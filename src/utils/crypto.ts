/**
 * Crypto & Security Utilities for Affiliate Post Generator Pro
 * Provides AES-GCM encryption/decryption for API keys, Amazon link sanitization,
 * tag auto-appending, and key masking.
 */

// AES-GCM Key Derivation via PBKDF2
async function getKeyMaterial(password: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  return crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );
}

async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const keyMaterial = await getKeyMaterial(password);
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypt plain text using Web Crypto AES-GCM
 */
export async function encryptText(plainText: string, masterPassword?: string): Promise<string> {
  if (!plainText || !plainText.trim()) return '';
  if (!masterPassword || !masterPassword.trim()) {
    // Basic obfuscation when master password is not set
    return 'obf:' + btoa(encodeURIComponent(plainText));
  }

  try {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const aesKey = await deriveKey(masterPassword, salt);
    const enc = new TextEncoder();

    const encryptedContent = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      aesKey,
      enc.encode(plainText)
    );

    const combined = new Uint8Array(salt.length + iv.length + encryptedContent.byteLength);
    combined.set(salt, 0);
    combined.set(iv, salt.length);
    combined.set(new Uint8Array(encryptedContent), salt.length + iv.length);

    // Convert to base64
    let binary = '';
    combined.forEach((b) => (binary += String.fromCharCode(b)));
    return 'aes:' + btoa(binary);
  } catch (err) {
    console.error('Encryption error:', err);
    throw new Error('Failed to encrypt data with master password');
  }
}

/**
 * Decrypt cipher text using Web Crypto AES-GCM
 */
export async function decryptText(cipherText: string, masterPassword?: string): Promise<string> {
  if (!cipherText) return '';
  if (cipherText.startsWith('obf:')) {
    try {
      return decodeURIComponent(atob(cipherText.replace('obf:', '')));
    } catch {
      return cipherText;
    }
  }

  if (cipherText.startsWith('aes:')) {
    if (!masterPassword) {
      throw new Error('Master password is required to unlock encrypted keys');
    }
    try {
      const rawBase64 = cipherText.replace('aes:', '');
      const binary = atob(rawBase64);
      const combined = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        combined[i] = binary.charCodeAt(i);
      }

      const salt = combined.slice(0, 16);
      const iv = combined.slice(16, 28);
      const data = combined.slice(28);

      const aesKey = await deriveKey(masterPassword, salt);
      const decryptedContent = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        aesKey,
        data
      );

      const dec = new TextDecoder();
      return dec.decode(decryptedContent);
    } catch (err) {
      throw new Error('Incorrect Master Password or corrupted encryption payload');
    }
  }

  // Plaintext fallback
  return cipherText;
}

/**
 * Mask sensitive API Key for display in UI
 */
export function maskApiKey(key: string): string {
  if (!key || key.length < 8) return '••••••••';
  return `${key.slice(0, 4)}••••••••${key.slice(-4)}`;
}

/**
 * Sanitize error messages to prevent leaking full API keys
 */
export function sanitizeErrorMessage(errorText: string, keysToMask: string[] = []): string {
  let sanitized = errorText;
  keysToMask.forEach((k) => {
    if (k && k.length > 5) {
      sanitized = sanitized.replaceAll(k, maskApiKey(k));
    }
  });
  return sanitized;
}

/**
 * Amazon URL Inspector & Tag Validator
 */
export interface UrlInspectionResult {
  url: string;
  tag: string | null;
  isValidAmazonUrl: boolean;
  warnings: string[];
}

export function sanitizeAmazonUrl(inputUrl: string, defaultTag?: string): UrlInspectionResult {
  let trimmed = inputUrl.trim();
  const warnings: string[] = [];
  let tag: string | null = null;
  let isValid = false;

  if (!trimmed) {
    return { url: '', tag: null, isValidAmazonUrl: false, warnings: ['URL is empty'] };
  }

  // Add protocol if missing
  if (!/^https?:\/\//i.test(trimmed)) {
    trimmed = 'https://' + trimmed;
  }

  try {
    const parsed = new URL(trimmed);
    const host = parsed.hostname.toLowerCase();
    
    isValid = host.includes('amazon.') || host.includes('amzn.to') || host.includes('amzn.asia');
    
    if (!isValid) {
      warnings.push('URL does not appear to be a standard Amazon store domain');
    }

    // Extract existing affiliate tag
    tag = parsed.searchParams.get('tag');

    // Auto-append default tag if missing and provided
    if (!tag && defaultTag && defaultTag.trim()) {
      const cleanTag = defaultTag.trim();
      parsed.searchParams.set('tag', cleanTag);
      tag = cleanTag;
      warnings.push(`Auto-appended default affiliate tag: "${cleanTag}"`);
    }

    if (!tag) {
      warnings.push('No Amazon affiliate tag (?tag=...) detected in link!');
    }

    return {
      url: parsed.toString(),
      tag,
      isValidAmazonUrl: isValid,
      warnings,
    };
  } catch (e) {
    return {
      url: trimmed,
      tag: null,
      isValidAmazonUrl: false,
      warnings: ['Invalid URL syntax'],
    };
  }
}
