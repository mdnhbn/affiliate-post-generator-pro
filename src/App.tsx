import React, { useState, useEffect } from 'react';
import { 
  getStoredProducts, 
  saveStoredProducts, 
  getStoredHistory, 
  saveStoredHistory, 
  getStoredSettings, 
  saveStoredSettings,
  getStoredAnalytics,
  saveStoredAnalytics
} from './utils/storage';
import { 
  fetchSupabaseProducts, 
  upsertSupabaseProduct, 
  deleteSupabaseProduct,
  fetchSupabaseHistory,
  insertSupabaseHistory,
  deleteSupabaseHistoryItem,
  clearSupabaseHistory,
  fetchSupabaseSettings,
  saveSupabaseSettings,
  fetchUserProfile,
  UserProfile
} from './utils/supabaseStorage';
import { supabase, isSupabaseConfigured } from './lib/supabaseClient';
import { Product, PostResult, Settings, AnalyticsEvent } from './types';
import { Header } from './components/Header';
import { Sidebar, TabType } from './components/Sidebar';
import { ShortcutsBar } from './components/ShortcutsBar';
import { UrlFetcherView } from './components/UrlFetcherView';
import { FireDealsView } from './components/FireDealsView';
import { GenerateView } from './components/GenerateView';
import { ProductsView } from './components/ProductsView';
import { HistoryView } from './components/HistoryView';
import { AnalyticsView } from './components/AnalyticsView';
import { SettingsView } from './components/SettingsView';
import { AuthScreen } from './components/AuthScreen';
import { UserProfileModal } from './components/UserProfileModal';
import { AdminView } from './components/AdminView';
import { AdSlot } from './components/AdSlot';
import { InterstitialAdModal } from './components/InterstitialAdModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('generate');
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('affiliate_pro_theme');
    return saved ? saved === 'dark' : true; // Default dark "AI shipping label" theme
  });

  const [products, setProducts] = useState<Product[]>([]);
  const [history, setHistory] = useState<PostResult[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsEvent[]>([]);
  const [settings, setSettings] = useState<Settings>(getStoredSettings());
  const [selectedProductForPost, setSelectedProductForPost] = useState<Product | null>(null);

  // Supabase Auth State
  const [session, setSession] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [showProfileModal, setShowProfileModal] = useState<boolean>(false);

  const isConfigured = isSupabaseConfigured();

  // Listen to Supabase Auth State Changes
  useEffect(() => {
    if (!isConfigured) {
      setAuthLoading(false);
      // Load local stored user data
      setProducts(getStoredProducts());
      setHistory(getStoredHistory());
      setAnalytics(getStoredAnalytics());
      setSettings(getStoredSettings());
      return;
    }

    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      if (currentSession?.user) {
        loadSupabaseData(currentSession.user.id);
      } else {
        setAuthLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, currentSession) => {
        setSession(currentSession);
        if (currentSession?.user) {
          loadSupabaseData(currentSession.user.id);
        } else {
          setUserProfile(null);
          setAuthLoading(false);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [isConfigured]);

  // Calculate admin state from database record (profiles.is_admin) or site owner email
  const isUserAdmin = Boolean(
    userProfile?.is_admin === true || 
    userProfile?.is_admin === 1 || 
    (typeof userProfile?.is_admin === 'string' && (userProfile?.is_admin as string).toLowerCase() === 'true') ||
    (session?.user?.email && session.user.email.toLowerCase() === 'mdnhbn@gmail.com')
  );

  // Load User Data from Supabase
  const loadSupabaseData = async (userId: string) => {
    setAuthLoading(true);
    try {
      // Safely fetch all data, preventing secondary table errors from breaking profile state
      const profilePromise = fetchUserProfile(userId).catch(err => {
        console.error('[loadSupabaseData] Error fetching user profile:', err);
        return null;
      });
      const prodsPromise = fetchSupabaseProducts(userId).catch(err => {
        console.error('[loadSupabaseData] Error fetching products:', err);
        return [];
      });
      const histPromise = fetchSupabaseHistory(userId).catch(err => {
        console.error('[loadSupabaseData] Error fetching history:', err);
        return [];
      });
      const settPromise = fetchSupabaseSettings(userId, getStoredSettings()).catch(err => {
        console.error('[loadSupabaseData] Error fetching settings:', err);
        return getStoredSettings();
      });

      const [profile, supaProds, supaHist, supaSett] = await Promise.all([
        profilePromise,
        prodsPromise,
        histPromise,
        settPromise,
      ]);

      console.log('[loadSupabaseData] Loaded profile:', profile, '-> isUserAdmin:', Boolean(profile?.is_admin));

      setUserProfile(profile);

      // Clean load without demo fallbacks
      setProducts(supaProds);
      setHistory(supaHist);
      setAnalytics(getStoredAnalytics());
      setSettings(supaSett);
    } catch (err) {
      console.error('Failed to load user data from Supabase:', err);
      setProducts(getStoredProducts());
      setHistory(getStoredHistory());
      setAnalytics(getStoredAnalytics());
      setSettings(getStoredSettings());
    } finally {
      setAuthLoading(false);
    }
  };

  // Sync theme class on HTML document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('affiliate_pro_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('affiliate_pro_theme', 'light');
    }
  }, [darkMode]);

  // Route guard: Redirect non-admins away from admin panel
  useEffect(() => {
    if (activeTab === 'admin' && !isUserAdmin) {
      setActiveTab('generate');
    }
  }, [activeTab, isUserAdmin]);

  // Handlers for Products
  const handleAddProduct = (newProd: Omit<Product, 'id' | 'createdAt'>) => {
    const created: Product = {
      ...newProd,
      id: `prod-${Date.now()}`,
      createdAt: Date.now(),
    };
    const updated = [created, ...products];
    setProducts(updated);
    saveStoredProducts(updated);

    if (session?.user?.id) {
      upsertSupabaseProduct(session.user.id, created);
    }
  };

  const handleEditProduct = (updatedProd: Product) => {
    const updated = products.map((p) => (p.id === updatedProd.id ? updatedProd : p));
    setProducts(updated);
    saveStoredProducts(updated);

    if (session?.user?.id) {
      upsertSupabaseProduct(session.user.id, updatedProd);
    }
  };

  const handleDeleteProduct = (id: string) => {
    const updated = products.filter((p) => p.id !== id);
    setProducts(updated);
    saveStoredProducts(updated);

    if (session?.user?.id) {
      deleteSupabaseProduct(session.user.id, id);
    }
  };

  const handleSelectProductForPost = (product: Product) => {
    setSelectedProductForPost(product);
    setActiveTab('generate');
  };

  // Handlers for History
  const handlePostGenerated = (result: PostResult) => {
    const updated = [result, ...history];
    setHistory(updated);
    saveStoredHistory(updated);
    setAnalytics(getStoredAnalytics());

    if (session?.user?.id) {
      insertSupabaseHistory(session.user.id, result);
    }
  };

  const handleDeleteHistoryItem = (id: string) => {
    const updated = history.filter((h) => h.id !== id);
    setHistory(updated);
    saveStoredHistory(updated);

    if (session?.user?.id) {
      deleteSupabaseHistoryItem(session.user.id, id);
    }
  };

  const handleClearAllHistory = () => {
    if (window.confirm('Are you sure you want to clear all post generation history?')) {
      setHistory([]);
      saveStoredHistory([]);
      if (session?.user?.id) {
        clearSupabaseHistory(session.user.id);
      }
    }
  };

  const handleClearAnalytics = () => {
    if (window.confirm('Clear all analytics activity logs?')) {
      setAnalytics([]);
      saveStoredAnalytics([]);
    }
  };

  // Handlers for Settings
  const handleSaveSettings = (newSettings: Settings) => {
    setSettings(newSettings);
    saveStoredSettings(newSettings);

    if (session?.user?.id) {
      saveSupabaseSettings(session.user.id, newSettings);
    }
  };

  const handleSignOut = async () => {
    if (isConfigured) {
      await supabase.auth.signOut();
      setSession(null);
      setUserProfile(null);
    }
  };

  // Auth Guard: Show AuthScreen if Supabase is configured and no user session exists, or if user clicked Sign In
  if (isConfigured && authLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-amber-500 font-mono flex items-center justify-center p-4">
        <div className="flex items-center gap-3 p-4 rounded-lg bg-zinc-900 border border-zinc-800 shadow-xl">
          <div className="w-4 h-4 rounded-full bg-amber-500 animate-ping" />
          <span>INITIALIZING SUPABASE SESSION...</span>
        </div>
      </div>
    );
  }

  if ((isConfigured && !session) || showAuthModal) {
    return (
      <div className="relative">
        {showAuthModal && session && (
          <div className="absolute top-4 right-4 z-50">
            <button
              onClick={() => setShowAuthModal(false)}
              className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-4 py-2 rounded-md font-mono text-xs border border-zinc-700"
            >
              ← Back to App
            </button>
          </div>
        )}
        <AuthScreen onSuccess={() => setShowAuthModal(false)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-[#111216] text-zinc-900 dark:text-zinc-100 font-sans transition-colors duration-200">
      
      {/* Top Header Navigation */}
      <Header
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        settings={settings}
        onOpenSettings={() => setActiveTab('settings')}
        userEmail={session?.user?.email}
        userDisplayName={userProfile?.display_name}
        onSignOut={handleSignOut}
        onOpenAuth={() => setShowAuthModal(true)}
        onOpenProfile={() => setShowProfileModal(true)}
      />

      {/* Top Banner Ad Slot (Below Main Header) */}
      <AdSlot placement="top_banner" className="max-w-7xl mx-auto px-4 pt-2" />

      {/* User Profile & Database Status Modal */}
      {showProfileModal && (
        <UserProfileModal
          session={session}
          userProfile={userProfile}
          isAdmin={isUserAdmin}
          productsCount={products.length}
          historyCount={history.length}
          onClose={() => setShowProfileModal(false)}
          onSignOut={handleSignOut}
          onProfileUpdated={() => {
            if (session?.user?.id) loadSupabaseData(session.user.id);
          }}
        />
      )}

      {/* Shortcuts Fast Action Bar */}
      <ShortcutsBar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main App Layout */}
      <div className="flex max-w-7xl mx-auto">
        
        {/* Left Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          productsCount={products.length}
          historyCount={history.length}
          analyticsCount={analytics.length}
          isAdmin={isUserAdmin}
        />

        {/* Main Content Workspace */}
        <main className="flex-1 p-4 md:p-6 pb-24 md:pb-12 min-w-0">
          {activeTab === 'url_fetcher' && (
            <UrlFetcherView
              settings={settings}
              onAddProduct={handleAddProduct}
              onSelectForPost={handleSelectProductForPost}
            />
          )}

          {activeTab === 'fire_deals' && (
            <FireDealsView
              settings={settings}
              existingProducts={products}
              onAddProduct={handleAddProduct}
              onSelectForPost={handleSelectProductForPost}
            />
          )}

          {activeTab === 'generate' && (
            <GenerateView
              products={products}
              settings={settings}
              onAddProduct={handleAddProduct}
              onPostGenerated={handlePostGenerated}
              onSettingsUpdated={handleSaveSettings}
              selectedProductForPost={selectedProductForPost}
              onClearSelectedProductForPost={() => setSelectedProductForPost(null)}
            />
          )}

          {activeTab === 'products' && (
            <ProductsView
              products={products}
              settings={settings}
              onAddProduct={handleAddProduct}
              onEditProduct={handleEditProduct}
              onDeleteProduct={handleDeleteProduct}
              onSelectForPost={handleSelectProductForPost}
            />
          )}

          {activeTab === 'history' && (
            <HistoryView
              history={history}
              onDeleteHistoryItem={handleDeleteHistoryItem}
              onClearAllHistory={handleClearAllHistory}
            />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsView
              analytics={analytics}
              history={history}
              products={products}
              onClearAnalytics={handleClearAnalytics}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              settings={settings}
              onSaveSettings={handleSaveSettings}
            />
          )}

          {activeTab === 'admin' && isUserAdmin && (
            <AdminView />
          )}
        </main>

      </div>

      {/* Footer Banner Ad Slot */}
      <AdSlot placement="footer_banner" className="max-w-7xl mx-auto px-4 pb-4" />

      {/* Interstitial Popup Ad Modal */}
      <InterstitialAdModal />

    </div>
  );
}
