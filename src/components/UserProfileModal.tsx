import React, { useState } from 'react';
import { UserCheck, Shield, Database, KeyRound, LogOut, Package, History, Mail, User, X, Check, Cloud } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

interface UserProfileModalProps {
  session: any;
  userProfile: { display_name?: string; is_admin?: boolean } | null;
  isAdmin?: boolean;
  productsCount: number;
  historyCount: number;
  onClose: () => void;
  onSignOut: () => void;
  onProfileUpdated?: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  session,
  userProfile,
  isAdmin = false,
  productsCount,
  historyCount,
  onClose,
  onSignOut,
  onProfileUpdated,
}) => {
  const user = session?.user;
  const email = user?.email || 'user@example.com';
  const initialName = userProfile?.display_name || email.split('@')[0];

  const [displayName, setDisplayName] = useState(initialName);
  const [saving, setSaving] = useState(false);
  const [savedFeedback, setSavedFeedback] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          email: email,
          display_name: displayName.trim(),
          updated_at: new Date().toISOString(),
        });

      if (error) {
        alert(`Failed to update profile: ${error.message}`);
      } else {
        setSavedFeedback(true);
        if (onProfileUpdated) onProfileUpdated();
        setTimeout(() => setSavedFeedback(false), 2000);
      }
    } catch (err: any) {
      alert(`Error updating profile: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white dark:bg-[#18191e] border-2 border-dashed border-emerald-500/50 rounded-xl w-full max-w-lg overflow-hidden shadow-2xl space-y-4 p-6 text-zinc-900 dark:text-zinc-100">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-mono font-bold text-base uppercase tracking-tight text-zinc-900 dark:text-zinc-100">
                User Account & Cloud Vault
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">
                Supabase Row-Level Security (RLS) Active
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-100 p-1 rounded-md text-lg font-bold"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Card Overview */}
        <div className="p-4 rounded-lg bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-500 border border-amber-500/40 flex items-center justify-center font-mono font-bold text-lg shrink-0">
                {initialName.slice(0, 2).toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <h4 className="font-bold font-mono text-sm text-zinc-900 dark:text-zinc-100 truncate">
                  {displayName}
                </h4>
                <p className="text-xs font-mono text-zinc-500 flex items-center gap-1 truncate">
                  <Mail className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  {email}
                </p>
              </div>
            </div>

            {/* Admin Badge */}
            <div className={`px-2.5 py-1 rounded-md text-xs font-mono font-bold border flex items-center gap-1 shrink-0 ${
              isAdmin 
                ? 'bg-amber-500/20 text-amber-400 border-amber-500/50' 
                : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-500 border-zinc-300 dark:border-zinc-700'
            }`}>
              <Shield className="w-3.5 h-3.5" />
              <span>{isAdmin ? 'ADMIN' : 'USER'}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-200 dark:border-zinc-800 text-xs font-mono">
            <div className="p-2 rounded bg-white dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 flex items-center gap-2">
              <Package className="w-4 h-4 text-amber-500" />
              <div>
                <div className="text-[10px] text-zinc-400 uppercase">Saved Products</div>
                <div className="font-bold text-zinc-800 dark:text-zinc-200">{productsCount} Items</div>
              </div>
            </div>

            <div className="p-2 rounded bg-white dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 flex items-center gap-2">
              <History className="w-4 h-4 text-emerald-400" />
              <div>
                <div className="text-[10px] text-zinc-400 uppercase">Post History</div>
                <div className="font-bold text-zinc-800 dark:text-zinc-200">{historyCount} Posts</div>
              </div>
            </div>
          </div>
        </div>

        {/* Display Name Edit Form */}
        <form onSubmit={handleUpdateProfile} className="space-y-3 pt-1">
          <div>
            <label className="block text-xs font-mono font-bold uppercase text-zinc-700 dark:text-zinc-300 mb-1">
              Display Name
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-3 py-2 rounded-md bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-xs font-mono text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-amber-500"
              />
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 rounded-md bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold font-mono text-xs whitespace-nowrap shadow-sm disabled:opacity-50"
              >
                {savedFeedback ? <Check className="w-4 h-4 text-zinc-950" /> : saving ? 'Saving...' : 'Update Name'}
              </button>
            </div>
          </div>
        </form>

        {/* Data Location & Privacy Notice */}
        <div className="p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs font-sans text-zinc-800 dark:text-zinc-200 space-y-2">
          <div className="font-bold font-mono text-emerald-400 flex items-center gap-1.5">
            <Cloud className="w-4 h-4" />
            আপনার ডেটা কোথায় কীভাবে সংরক্ষিত থাকে?
          </div>
          <p className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-300">
            ১. <b>পোস্ট ও প্রোডাক্ট:</b> আপনার তৈরি করা সমস্ত Amazon প্রোডাক্ট এবং Post History সরাসরি <b>Supabase Cloud PostgreSQL Database</b>-এ সম্পূর্ণ এনক্রিপ্টেড এবং ইউজার আইডি দিয়ে আলাদা সংরক্ষিত থাকে।
          </p>
          <p className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-300">
            ২. <b>API Keys:</b> আপনার দেওয়া Gemini বা OpenRouter API Key গুলি আপনার নিজস্বSupabase Vault-এ সেভ থাকে, যা অন্য কোনো ব্যবহারকারী দেখতে পাবে না (Row-Level Security Enabled)।
          </p>
        </div>

        {/* Account Details & Sign Out */}
        <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <div className="text-[10px] font-mono text-zinc-500 truncate max-w-[200px]" title={user?.id}>
            UID: {user?.id?.slice(0, 16)}...
          </div>

          <button
            onClick={() => {
              onClose();
              onSignOut();
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-md bg-rose-500/15 text-rose-500 hover:bg-rose-500 hover:text-white border border-rose-500/30 font-bold font-mono text-xs transition-all"
          >
            <LogOut className="w-4 h-4" />
            Sign Out Account
          </button>
        </div>

      </div>
    </div>
  );
};
