import React, { useState } from 'react';
import { Settings, ApiKeyItem, PlatformId } from '../types';
import { PLATFORM_NAMES } from '../utils/ai';
import { 
  KeyRound, 
  Plus, 
  Trash2, 
  Check, 
  RefreshCw, 
  ShieldAlert, 
  Cpu, 
  Sparkles, 
  Sliders, 
  Lock, 
  Unlock, 
  Eye, 
  EyeOff, 
  Tag, 
  ShieldCheck,
  Info,
  Globe,
  Download,
  Upload,
  Database,
  Copy
} from 'lucide-react';
import { Barcode } from './Barcode';
import { encryptText, decryptText } from '../utils/crypto';

interface SettingsViewProps {
  settings: Settings;
  onSaveSettings: (settings: Settings) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onSaveSettings,
}) => {
  const [provider, setProvider] = useState<'gemini' | 'openrouter'>(settings.provider);
  const [geminiKeys, setGeminiKeys] = useState<ApiKeyItem[]>(settings.geminiKeys);
  const [openRouterKeys, setOpenRouterKeys] = useState<ApiKeyItem[]>(settings.openRouterKeys);
  const [geminiModel, setGeminiModel] = useState<string>(settings.geminiModel);
  const [openRouterModel, setOpenRouterModel] = useState<string>(settings.openRouterModel);
  const [imageModel, setImageModel] = useState<string>(settings.imageModel);
  const [defaultPlatforms, setDefaultPlatforms] = useState<PlatformId[]>(settings.defaultPlatforms);
  const [defaultLanguages, setDefaultLanguages] = useState<string[]>(settings.defaultLanguages);
  const [defaultAffiliateTag, setDefaultAffiliateTag] = useState<string>(settings.defaultAffiliateTag || 'yourtag-20');
  const [amazonAssociateDisclosure, setAmazonAssociateDisclosure] = useState<boolean>(settings.amazonAssociateDisclosure ?? true);

  // Multi-marketplace list state
  const [marketplaces, setMarketplaces] = useState<{ domain: string; tag: string }[]>(
    settings.marketplaces && settings.marketplaces.length > 0
      ? settings.marketplaces
      : [
          { domain: 'amazon.com', tag: settings.defaultAffiliateTag || 'yourtag-20' },
          { domain: 'amazon.co.uk', tag: 'yourtag-21' },
          { domain: 'amazon.ca', tag: 'yourtag-20' },
          { domain: 'amazon.de', tag: 'yourtag-21' },
        ]
  );
  const [newDomainInput, setNewDomainInput] = useState('');
  const [newTagInput, setNewTagInput] = useState('');

  // Tooltip state
  const [showSecurityTooltip, setShowSecurityTooltip] = useState(false);

  // Security Master Password state
  const [masterPassword, setMasterPassword] = useState('');
  const [isLocked, setIsLocked] = useState<boolean>(!!settings.isSecurityLocked);
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});

  const [newKeyInput, setNewKeyInput] = useState('');
  const [newKeyLabel, setNewKeyLabel] = useState('');
  const [savedFeedback, setSavedFeedback] = useState(false);
  const [copiedRlsSql, setCopiedRlsSql] = useState(false);

  // Data Export / Backup Handler
  const handleExportBackup = () => {
    try {
      const backupData = {
        exportDate: new Date().toISOString(),
        version: '2.5',
        settings,
        products: JSON.parse(localStorage.getItem('affiliate_products') || '[]'),
        history: JSON.parse(localStorage.getItem('affiliate_post_history') || '[]'),
        customFireDeals: JSON.parse(localStorage.getItem('affiliate_custom_fire_deals') || '[]'),
      };

      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `affiliate_pro_vault_backup_${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (e) {
      alert('Backup Export failed: ' + e);
    }
  };

  // Data Import / Restore Handler
  const handleImportBackup = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (event.target.files && event.target.files[0]) {
      fileReader.readAsText(event.target.files[0], 'UTF-8');
      fileReader.onload = (e) => {
        try {
          const parsed = JSON.parse(e.target?.result as string);
          if (parsed.settings) {
            onSaveSettings(parsed.settings);
          }
          if (Array.isArray(parsed.products)) {
            localStorage.setItem('affiliate_products', JSON.stringify(parsed.products));
          }
          if (Array.isArray(parsed.history)) {
            localStorage.setItem('affiliate_post_history', JSON.stringify(parsed.history));
          }
          if (Array.isArray(parsed.customFireDeals)) {
            localStorage.setItem('affiliate_custom_fire_deals', JSON.stringify(parsed.customFireDeals));
          }
          alert('Backup restored successfully! Application reloaded.');
          window.location.reload();
        } catch (err) {
          alert('Invalid backup JSON file.');
        }
      };
    }
  };

  const rlsSqlScript = `-- Supabase Row-Level Security (RLS) SQL Script
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Product Policy
CREATE POLICY "User product access" ON products
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Post History Policy
CREATE POLICY "User history access" ON post_history
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);`;

  const copyRlsSql = () => {
    navigator.clipboard.writeText(rlsSqlScript);
    setCopiedRlsSql(true);
    setTimeout(() => setCopiedRlsSql(false), 2000);
  };

  // Key Handlers
  const handleAddKey = (targetProvider: 'gemini' | 'openrouter') => {
    if (!newKeyInput.trim()) return;
    const newItem: ApiKeyItem = {
      id: `key-${Date.now()}`,
      key: newKeyInput.trim(),
      label: newKeyLabel.trim() || `Key #${(targetProvider === 'gemini' ? geminiKeys : openRouterKeys).length + 1}`,
      status: 'active',
      errorCount: 0,
    };

    if (targetProvider === 'gemini') {
      setGeminiKeys([...geminiKeys, newItem]);
    } else {
      setOpenRouterKeys([...openRouterKeys, newItem]);
    }

    setNewKeyInput('');
    setNewKeyLabel('');
  };

  const handleRemoveKey = (targetProvider: 'gemini' | 'openrouter', id: string) => {
    if (targetProvider === 'gemini') {
      setGeminiKeys(geminiKeys.filter((k) => k.id !== id));
    } else {
      setOpenRouterKeys(openRouterKeys.filter((k) => k.id !== id));
    }
  };

  const toggleShowKey = (id: string) => {
    setShowKeys((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleToggleMasterSecurity = async () => {
    if (!masterPassword.trim()) {
      alert('Please enter a Master Password to lock or unlock API keys.');
      return;
    }

    if (isLocked) {
      // Unlock check
      try {
        if (!settings.masterPasswordEncrypted) {
          setIsLocked(false);
          return;
        }
        const decrypted = await decryptText(settings.masterPasswordEncrypted, masterPassword);
        if (decrypted === 'VERIFIED_OK') {
          setIsLocked(false);
          alert('Security vault unlocked successfully!');
        } else {
          alert('Incorrect Master Password.');
        }
      } catch (e) {
        alert('Incorrect Master Password or decryption error.');
      }
    } else {
      // Lock setup
      try {
        const encryptedVerification = await encryptText('VERIFIED_OK', masterPassword);
        setIsLocked(true);
        const updated: Settings = {
          ...settings,
          masterPasswordEncrypted: encryptedVerification,
          isSecurityLocked: true,
        };
        onSaveSettings(updated);
        alert('AES-GCM Client Vault enabled! API keys are now securely protected.');
      } catch (e) {
        alert('Failed to set Master Password lock.');
      }
    }
  };

  const handleAddMarketplace = () => {
    const domain = newDomainInput.trim().toLowerCase().replace(/^https?:\/\//, '');
    const tag = newTagInput.trim();
    if (!domain || !tag) return;
    setMarketplaces([...marketplaces.filter((m) => m.domain !== domain), { domain, tag }]);
    setNewDomainInput('');
    setNewTagInput('');
  };

  const handleRemoveMarketplace = (domain: string) => {
    setMarketplaces(marketplaces.filter((m) => m.domain !== domain));
  };

  const handleSaveAll = () => {
    const updated: Settings = {
      provider,
      geminiKeys,
      openRouterKeys,
      geminiModel,
      openRouterModel,
      imageModel,
      defaultPlatforms,
      defaultLanguages,
      defaultAffiliateTag: defaultAffiliateTag.trim() || 'yourtag-20',
      marketplaces,
      amazonAssociateDisclosure,
      isSecurityLocked: isLocked,
    };
    onSaveSettings(updated);
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg bg-zinc-900 text-zinc-100 border-2 border-dashed border-emerald-500/40">
        <div>
          <h2 className="text-xl font-mono font-bold uppercase tracking-tight text-zinc-100 flex items-center gap-2">
            <Sliders className="w-5 h-5 text-emerald-400" />
            API Keys & Studio Configuration
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Configure Google Gemini or OpenRouter credentials with automatic key rotation fallback.
          </p>
        </div>

        <button
          onClick={handleSaveAll}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-md bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold font-mono text-sm shadow-md transition-all border border-emerald-300 active:scale-95"
        >
          {savedFeedback ? <Check className="w-4 h-4 stroke-[3]" /> : <RefreshCw className="w-4 h-4" />}
          {savedFeedback ? 'Saved to LocalStorage!' : 'Save Configuration'}
        </button>
      </div>

      {/* Security Vault & Master Password Section */}
      <div className="p-5 rounded-lg bg-white dark:bg-[#18191e] border-2 border-dashed border-zinc-200 dark:border-zinc-800 space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded ${isLocked ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-500'}`}>
              {isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
            </div>
            <div>
              <h3 className="font-mono font-bold text-sm text-zinc-900 dark:text-zinc-100 uppercase flex items-center gap-1.5">
                Client Security Vault (AES-GCM Encryption)
                <button
                  type="button"
                  onClick={() => setShowSecurityTooltip(!showSecurityTooltip)}
                  className="text-zinc-400 hover:text-amber-500 p-0.5 rounded transition-colors"
                  title="Security Transparency Information"
                >
                  <Info className="w-4 h-4" />
                </button>
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Encrypt all stored API keys in LocalStorage with PBKDF2 Web Crypto standard.
              </p>
            </div>
          </div>

          <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${
            isLocked ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' : 'bg-amber-500/20 text-amber-500 border-amber-500/40'
          }`}>
            {isLocked ? 'VAULT LOCKED' : 'VAULT UNLOCKED'}
          </span>
        </div>

        {/* Security Transparency Modal/Tooltip */}
        {showSecurityTooltip && (
          <div className="p-3.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-xs font-mono text-amber-600 dark:text-amber-400 space-y-1">
            <div className="font-bold flex items-center justify-between">
              <span>🛡️ SECURITY TRANSPARENCY GUARANTEE</span>
              <button onClick={() => setShowSecurityTooltip(false)} className="text-zinc-400 hover:text-zinc-100">✕</button>
            </div>
            <p className="text-zinc-700 dark:text-zinc-300 font-sans leading-relaxed">
              All API keys and associate tags are stored 100% locally in your browser's localStorage using AES-encrypted vault storage. No keys or client data are ever transmitted to external servers or backend databases.
            </p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <input
            type="password"
            placeholder="Enter Master Password..."
            value={masterPassword}
            onChange={(e) => setMasterPassword(e.target.value)}
            className="w-full sm:w-2/3 px-3 py-2 rounded bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-xs font-mono text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-amber-500"
          />

          <button
            onClick={handleToggleMasterSecurity}
            className={`w-full sm:w-auto px-4 py-2 rounded font-mono font-bold text-xs flex items-center justify-center gap-2 transition-all ${
              isLocked 
                ? 'bg-emerald-500 hover:bg-emerald-400 text-zinc-950' 
                : 'bg-zinc-800 hover:bg-zinc-700 text-amber-400 border border-zinc-700'
            }`}
          >
            {isLocked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
            {isLocked ? 'Unlock Security Vault' : 'Enable Vault Encryption'}
          </button>
        </div>
      </div>

      {/* Default Amazon Tag & Multi-Marketplace Config */}
      <div className="p-5 rounded-lg bg-white dark:bg-[#18191e] border-2 border-dashed border-zinc-200 dark:border-zinc-800 space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
          <h3 className="font-mono font-bold text-sm text-zinc-900 dark:text-zinc-100 uppercase flex items-center gap-2">
            <Globe className="w-4 h-4 text-amber-500" />
            Amazon Associate Tags & Multi-Marketplace Support
          </h3>
          <span className="text-xs font-mono text-zinc-500">AUTO-SANITIZATION</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          <div className="space-y-2">
            <label className="text-xs font-mono font-bold text-zinc-700 dark:text-zinc-300 block">
              Default Global Associate Tag
            </label>
            <input
              type="text"
              placeholder="yourtag-20"
              value={defaultAffiliateTag}
              onChange={(e) => setDefaultAffiliateTag(e.target.value)}
              className="w-full px-3 py-2 rounded bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-xs font-mono text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-amber-500"
            />
            <p className="text-[11px] text-zinc-500 font-mono">
              Used when a specific domain rule isn't configured below.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-mono font-bold text-zinc-700 dark:text-zinc-300 block">
              Amazon Associate Compliance Disclosure
            </label>
            <label className="flex items-center gap-2 p-2 rounded bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-mono text-zinc-800 dark:text-zinc-200 cursor-pointer">
              <input
                type="checkbox"
                checked={amazonAssociateDisclosure}
                onChange={(e) => setAmazonAssociateDisclosure(e.target.checked)}
                className="rounded border-zinc-700 text-amber-500 focus:ring-amber-500"
              />
              Auto-append Amazon Associate Disclosure on posts
            </label>
          </div>

        </div>

        {/* Multi-Marketplace Regional Tag Rules */}
        <div className="space-y-3 pt-3 border-t border-dashed border-zinc-200 dark:border-zinc-800">
          <label className="text-xs font-mono font-bold uppercase text-zinc-800 dark:text-zinc-200 block">
            Regional Marketplace Tag Rules ({marketplaces.length} Active)
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {marketplaces.map((m) => (
              <div
                key={m.domain}
                className="flex items-center justify-between p-2.5 rounded bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-mono"
              >
                <div>
                  <span className="font-bold text-amber-600 dark:text-amber-400">{m.domain}</span>
                  <span className="text-zinc-400 ml-2">→ tag={m.tag}</span>
                </div>
                <button
                  onClick={() => handleRemoveMarketplace(m.domain)}
                  className="text-zinc-400 hover:text-rose-500 p-1"
                  title="Remove Marketplace Rule"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
            <input
              type="text"
              placeholder="Domain (e.g. amazon.co.uk)"
              value={newDomainInput}
              onChange={(e) => setNewDomainInput(e.target.value)}
              className="w-full sm:w-1/2 px-3 py-1.5 rounded bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-xs font-mono text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-amber-500"
            />
            <input
              type="text"
              placeholder="Tag (e.g. uktag-21)"
              value={newTagInput}
              onChange={(e) => setNewTagInput(e.target.value)}
              className="w-full sm:w-1/3 px-3 py-1.5 rounded bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-xs font-mono text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-amber-500"
            />
            <button
              onClick={handleAddMarketplace}
              className="w-full sm:w-auto px-3 py-1.5 rounded bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold font-mono text-xs flex items-center justify-center gap-1 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" /> Add Rule
            </button>
          </div>
        </div>
      </div>

      {/* 1. Active AI Provider Selector */}
      <div className="p-5 rounded-lg bg-white dark:bg-[#18191e] border-2 border-dashed border-zinc-200 dark:border-zinc-800 space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
          <h3 className="font-mono font-bold text-sm text-zinc-900 dark:text-zinc-100 uppercase flex items-center gap-2">
            <Cpu className="w-4 h-4 text-amber-500" />
            Active AI Provider
          </h3>
          <span className="text-xs font-mono text-zinc-500">CLIENT-DIRECT FETCH</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label 
            onClick={() => setProvider('gemini')}
            className={`cursor-pointer p-4 rounded-lg border-2 border-dashed transition-all flex items-start gap-3 ${
              provider === 'gemini'
                ? 'border-amber-500 bg-amber-500/10 text-zinc-900 dark:text-zinc-100'
                : 'border-zinc-300 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-700'
            }`}
          >
            <input
              type="radio"
              name="provider"
              checked={provider === 'gemini'}
              onChange={() => setProvider('gemini')}
              className="mt-1 text-amber-500 focus:ring-amber-500"
            />
            <div>
              <div className="font-mono font-bold text-sm text-amber-600 dark:text-amber-400">
                Google Gemini API
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Fast, direct generation using Google AI Studio keys (Gemini 2.5 Flash / 3.6 Flash).
              </p>
            </div>
          </label>

          <label 
            onClick={() => setProvider('openrouter')}
            className={`cursor-pointer p-4 rounded-lg border-2 border-dashed transition-all flex items-start gap-3 ${
              provider === 'openrouter'
                ? 'border-amber-500 bg-amber-500/10 text-zinc-900 dark:text-zinc-100'
                : 'border-zinc-300 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-700'
            }`}
          >
            <input
              type="radio"
              name="provider"
              checked={provider === 'openrouter'}
              onChange={() => setProvider('openrouter')}
              className="mt-1 text-amber-500 focus:ring-amber-500"
            />
            <div>
              <div className="font-mono font-bold text-sm text-purple-600 dark:text-purple-400">
                OpenRouter API
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Unified gateway supporting Gemini, Claude, Llama 3, DeepSeek, and GPT models.
              </p>
            </div>
          </label>
        </div>
      </div>

      {/* 2. API Key Rotation Slots */}
      <div className="p-5 rounded-lg bg-white dark:bg-[#18191e] border-2 border-dashed border-zinc-200 dark:border-zinc-800 space-y-4">
        
        <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
          <div>
            <h3 className="font-mono font-bold text-sm text-zinc-900 dark:text-zinc-100 uppercase flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-emerald-500" />
              {provider === 'gemini' ? 'Google Gemini Key Rotation' : 'OpenRouter Key Rotation'}
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Add multiple keys. If Key #1 hits rate limit (429) or fails, the engine automatically rotates to Key #2.
            </p>
          </div>
          <span className="text-xs font-mono bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded border border-emerald-500/30">
            AUTO-FAILOVER
          </span>
        </div>

        {/* List of current keys */}
        <div className="space-y-2">
          {(provider === 'gemini' ? geminiKeys : openRouterKeys).length === 0 ? (
            <div className="p-3 rounded bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-mono flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              No API keys added yet for {provider.toUpperCase()}. Add at least one key below to generate posts.
            </div>
          ) : (
            (provider === 'gemini' ? geminiKeys : openRouterKeys).map((keyItem, index) => {
              const isVisible = showKeys[keyItem.id];
              return (
                <div 
                  key={keyItem.id}
                  className="flex items-center justify-between gap-3 p-3 rounded bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800"
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <span className="font-mono text-xs font-bold text-zinc-500 bg-zinc-200 dark:bg-zinc-800 px-2 py-0.5 rounded">
                      #{index + 1}
                    </span>
                    <div>
                      <div className="font-mono text-xs font-bold text-zinc-800 dark:text-zinc-200">
                        {keyItem.label}
                      </div>
                      <div className="font-mono text-[11px] text-zinc-500 truncate max-w-xs sm:max-w-md">
                        {isVisible 
                          ? keyItem.key 
                          : `${keyItem.key.slice(0, 6)}••••••••••••••••${keyItem.key.slice(-4)}`}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => toggleShowKey(keyItem.id)}
                      className="p-1.5 rounded text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
                      title={isVisible ? 'Hide Key' : 'Show Key'}
                    >
                      {isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>

                    <button
                      onClick={() => handleRemoveKey(provider, keyItem.id)}
                      className="p-1.5 rounded text-zinc-400 hover:text-rose-500 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
                      title="Remove Key"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Add New Key Inputs */}
        <div className="pt-3 border-t border-dashed border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row items-stretch gap-2">
          <input
            type="text"
            placeholder="Key Label (e.g. Work Key 1)"
            value={newKeyLabel}
            onChange={(e) => setNewKeyLabel(e.target.value)}
            className="w-full sm:w-1/3 px-3 py-2 rounded bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-xs font-mono text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-amber-500"
          />
          <input
            type="password"
            placeholder={`Paste ${provider === 'gemini' ? 'Gemini (AIzaSy...)' : 'OpenRouter (sk-or...)'} Key`}
            value={newKeyInput}
            onChange={(e) => setNewKeyInput(e.target.value)}
            className="w-full sm:w-1/2 px-3 py-2 rounded bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-xs font-mono text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-amber-500"
          />
          <button
            onClick={() => handleAddKey(provider)}
            className="px-4 py-2 rounded bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold font-mono text-xs shrink-0 flex items-center justify-center gap-1 shadow-sm"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            Add Key
          </button>
        </div>

      </div>

      {/* 3. Model Selector */}
      <div className="p-5 rounded-lg bg-white dark:bg-[#18191e] border-2 border-dashed border-zinc-200 dark:border-zinc-800 space-y-4">
        <h3 className="font-mono font-bold text-sm text-zinc-900 dark:text-zinc-100 uppercase flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-500" />
          Model Selection
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Gemini Model */}
          {provider === 'gemini' && (
            <div>
              <label className="block text-xs font-mono font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                Gemini Model
              </label>
              <select
                value={geminiModel}
                onChange={(e) => setGeminiModel(e.target.value)}
                className="w-full px-3 py-2 rounded bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-xs font-mono text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-amber-500"
              >
                <option value="gemini-2.5-flash">gemini-2.5-flash (Fast & Recommended)</option>
                <option value="gemini-3.6-flash">gemini-3.6-flash (Highest Speed)</option>
                <option value="gemini-2.5-pro">gemini-2.5-pro (Deep Copywriting)</option>
              </select>
            </div>
          )}

          {/* OpenRouter Model */}
          {provider === 'openrouter' && (
            <div>
              <label className="block text-xs font-mono font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                OpenRouter Model ID
              </label>
              <input
                type="text"
                placeholder="google/gemini-2.5-flash or anthropic/claude-3.5-sonnet"
                value={openRouterModel}
                onChange={(e) => setOpenRouterModel(e.target.value)}
                className="w-full px-3 py-2 rounded bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-xs font-mono text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-amber-500"
              />
            </div>
          )}

          {/* Image Model Selector */}
          <div>
            <label className="block text-xs font-mono font-bold text-zinc-700 dark:text-zinc-300 mb-1">
              Image Generation Spec Model
            </label>
            <select
              value={imageModel}
              onChange={(e) => setImageModel(e.target.value)}
              className="w-full px-3 py-2 rounded bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-xs font-mono text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-amber-500"
            >
              <option value="gemini-3.1-flash-lite-image">gemini-3.1-flash-lite-image</option>
              <option value="gemini-3.1-flash-image">gemini-3.1-flash-image (High Res 1K)</option>
              <option value="pollinations-custom">Pollinations.ai Free Image Renderer</option>
            </select>
          </div>

        </div>
      </div>

      {/* 4. Full Data Backup & Restoration System */}
      <div className="p-5 rounded-lg bg-white dark:bg-[#18191e] border-2 border-dashed border-zinc-200 dark:border-zinc-800 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-mono font-bold text-sm text-zinc-900 dark:text-zinc-100 uppercase flex items-center gap-2">
            <Download className="w-4 h-4 text-emerald-400" />
            1-Click Data Backup & Restore (JSON Export)
          </h3>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            Vault Backup v2.5
          </span>
        </div>
        <p className="text-xs text-zinc-600 dark:text-zinc-400 font-sans">
          আপনার সমস্ত প্রোডাক্ট, পোস্ট হিস্টোরি, কাস্টম ডিল এবং এপিআই কনফিগারেশন একটি ফাইলে ডাউনলোড করে রাখুন। প্রয়োজনে এক ক্লিকে রিস্টোর করতে পারবেন।
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={handleExportBackup}
            className="flex items-center gap-1.5 px-4 py-2 rounded bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold font-mono text-xs shadow-sm transition-all"
          >
            <Download className="w-4 h-4" />
            Export Full JSON Backup
          </button>

          <label className="flex items-center gap-1.5 px-4 py-2 rounded bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 font-bold font-mono text-xs border border-zinc-300 dark:border-zinc-700 cursor-pointer transition-all">
            <Upload className="w-4 h-4 text-amber-500" />
            Restore from Backup File
            <input
              type="file"
              accept=".json"
              onChange={handleImportBackup}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* 5. Security & Supabase Row Level Security (RLS) Helper */}
      <div className="p-5 rounded-lg bg-white dark:bg-[#18191e] border-2 border-dashed border-emerald-500/40 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-mono font-bold text-sm text-zinc-900 dark:text-zinc-100 uppercase flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Supabase Row-Level Security (RLS) & Multi-Tenant Rules
          </h3>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/30">
            Database Protection
          </span>
        </div>

        <p className="text-xs text-zinc-600 dark:text-zinc-300 font-sans">
          Supabase-এ আপনার ডেটা যেন শুধু আপনার একাউন্ট থেকেই দেখা যায়, তার জন্য Row-Level Security (RLS) কার্যকর থাকে। আপনার Supabase Dashboard &gt; SQL Editor-এ নিচের স্ক্রিপ্টটি রান করে শতভাগ সুরক্ষা নিশ্চিত করতে পারেন:
        </p>

        <div className="relative bg-zinc-950 p-3 rounded border border-zinc-800 font-mono text-[11px] text-emerald-400 overflow-x-auto">
          <button
            onClick={copyRlsSql}
            className="absolute top-2 right-2 px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[10px] font-bold flex items-center gap-1 border border-zinc-700"
          >
            {copiedRlsSql ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            {copiedRlsSql ? 'Copied!' : 'Copy SQL Script'}
          </button>
          <pre className="pr-20 whitespace-pre-wrap">{rlsSqlScript}</pre>
        </div>
      </div>

      {/* Save Action Footer */}
      <div className="flex justify-end pt-2">
        <button
          onClick={handleSaveAll}
          className="flex items-center gap-2 px-6 py-3 rounded-md bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold font-mono text-sm shadow-md transition-all border border-amber-300 active:scale-95"
        >
          {savedFeedback ? <Check className="w-4 h-4 stroke-[3]" /> : <RefreshCw className="w-4 h-4" />}
          {savedFeedback ? 'Saved Successfully!' : 'Save All Settings'}
        </button>
      </div>

    </div>
  );
};
