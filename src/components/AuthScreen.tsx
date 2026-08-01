import React, { useState } from 'react';
import { Package, Lock, Mail, User, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

interface AuthScreenProps {
  onSuccess?: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onSuccess }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const isConfigured = isSupabaseConfigured();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!isConfigured) {
      setErrorMsg('Supabase credentials (VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY) are missing in environment configuration.');
      return;
    }

    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please enter a valid email and password.');
      return;
    }

    if (isSignUp && !displayName.trim()) {
      setErrorMsg('Please enter your display name.');
      return;
    }

    setLoading(true);

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password: password.trim(),
          options: {
            data: {
              display_name: displayName.trim(),
            },
          },
        });

        if (error) {
          if (error.message.toLowerCase().includes('failed to fetch')) {
            setErrorMsg('Connection Failed (Failed to fetch): Unable to reach Supabase server. Please verify your VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your Vercel/Environment Variables, and check your internet connection.');
          } else {
            setErrorMsg(error.message);
          }
        } else if (data.user) {
          setSuccessMsg('Account created successfully! You are now logged in.');
          if (onSuccess) onSuccess();
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password.trim(),
        });

        if (error) {
          if (error.message.toLowerCase().includes('failed to fetch')) {
            setErrorMsg('Connection Failed (Failed to fetch): Unable to reach Supabase server. Please verify your VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your Vercel/Environment Variables, and check your internet connection.');
          } else {
            setErrorMsg(error.message);
          }
        } else if (data.session) {
          setSuccessMsg('Signed in successfully!');
          if (onSuccess) onSuccess();
        }
      }
    } catch (err: any) {
      const msg = err.message || 'Authentication error occurred.';
      if (msg.toLowerCase().includes('failed to fetch')) {
        setErrorMsg('Connection Failed (Failed to fetch): Unable to reach Supabase server. Please verify your VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your Vercel/Environment Variables.');
      } else {
        setErrorMsg(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-4 relative font-sans">
      
      {/* Background Decorative Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f202815_1px,transparent_1px),linear-gradient(to_bottom,#1f202815_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10 space-y-6">
        
        {/* Top Header Stamp */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-amber-500 text-zinc-950 font-bold shadow-lg shadow-amber-500/20 border border-amber-400 mb-2">
            <Package className="w-8 h-8 stroke-[2.2]" />
          </div>

          <h1 className="text-2xl font-bold font-mono tracking-tight text-zinc-100 uppercase flex items-center justify-center gap-2">
            Affiliate Pro <span className="text-amber-400">Vault</span>
          </h1>

          <p className="text-xs text-zinc-400 font-sans">
            Secure Supabase Authentication • Multi-User & Cloud Database Sync
          </p>

          {!isConfigured && (
            <div className="mt-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono text-left space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <span>⚠️ SUPABASE CONFIGURATION NOTICE</span>
              </div>
              <p className="font-sans text-[11px] text-zinc-300">
                Supabase URL & Anon Key are not set in environment variables yet. You can paste your credentials in <code className="text-amber-400">.env</code> to connect real authentication.
              </p>
            </div>
          )}
        </div>

        {/* Auth Parcel Card */}
        <div className="bg-[#18191e] border-2 border-dashed border-zinc-800 hover:border-amber-500/40 rounded-xl p-6 shadow-2xl space-y-5 transition-all">
          
          {/* Tab Switcher */}
          <div className="flex rounded-lg bg-zinc-900/90 p-1 border border-zinc-800 text-xs font-mono">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(false);
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 py-2 rounded-md font-bold transition-all ${
                !isSignUp
                  ? 'bg-amber-500 text-zinc-950 shadow'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              SIGN IN
            </button>

            <button
              type="button"
              onClick={() => {
                setIsSignUp(true);
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 py-2 rounded-md font-bold transition-all ${
                isSignUp
                  ? 'bg-amber-500 text-zinc-950 shadow'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              CREATE ACCOUNT
            </button>
          </div>

          {/* Alert Messages */}
          {errorMsg && (
            <div className="p-4 rounded-lg bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs font-mono leading-relaxed space-y-2">
              <div className="font-bold flex items-center gap-1.5 text-rose-400">
                <span>⚠️ {errorMsg}</span>
              </div>
              {errorMsg.includes('Failed to fetch') && (
                <div className="mt-2 pt-2 border-t border-rose-500/20 text-[11px] font-sans text-zinc-300 space-y-1">
                  <p className="font-bold font-mono text-amber-400">কীভাবে এটি ঠিক (Solve) করবেন:</p>
                  <ol className="list-decimal list-inside space-y-1 pl-1">
                    <li><b>Vercel Environment Variables:</b> Vercel Dashboard &gt; Project Settings &gt; Environment Variables-এ গিয়ে <code className="text-amber-300 font-mono">VITE_SUPABASE_URL</code> এবং <code className="text-amber-300 font-mono">VITE_SUPABASE_ANON_KEY</code> যোগ করে App টি <b>Redeploy</b> করুন।</li>
                    <li><b>Supabase Site URL:</b> Supabase Dashboard &gt; Authentication &gt; URL Configuration &gt; <b>Site URL</b> তে <code className="text-amber-300 font-mono">https://affiliate-post-generator-pro.vercel.app</code> দিন।</li>
                    <li><b>Browser AdBlocker / VPN:</b> আপনার ব্রাউজারের AdBlocker বা VPN বা Brave Shields ব্লক করছে কিনা চেক করুন।</li>
                  </ol>
                </div>
              )}
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-md bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 text-xs font-mono flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-4">
            
            {/* Display Name (Only on Sign Up) */}
            {isSignUp && (
              <div>
                <label className="block text-xs font-mono font-bold uppercase text-zinc-300 mb-1">
                  Full Display Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required={isSignUp}
                    placeholder="e.g. Alex Marketer"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-md bg-zinc-900 border border-zinc-700 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500 font-sans"
                  />
                </div>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label className="block text-xs font-mono font-bold uppercase text-zinc-300 mb-1">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-md bg-zinc-900 border border-zinc-700 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500 font-sans"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-mono font-bold uppercase text-zinc-300 mb-1">
                Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-md bg-zinc-900 border border-zinc-700 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500 font-sans"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-md bg-amber-500 hover:bg-amber-400 active:scale-[0.99] text-zinc-950 font-bold font-mono text-sm shadow-md transition-all flex items-center justify-center gap-2 border border-amber-300 disabled:opacity-50"
            >
              {loading ? (
                <span>Processing...</span>
              ) : (
                <>
                  <span>{isSignUp ? 'REGISTER & ENTER APP' : 'SIGN IN TO DISPATCH'}</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </>
              )}
            </button>
          </form>

          {/* Footer Security Note */}
          <div className="pt-3 border-t border-dashed border-zinc-800 flex items-center justify-between text-[11px] font-mono text-zinc-500">
            <span className="flex items-center gap-1 text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" /> Row-Level Security Enabled
            </span>
            <span>Supabase Auth</span>
          </div>

        </div>

      </div>
    </div>
  );
};
