import React, { useState, useEffect, useMemo } from 'react';
import { 
  Shield, 
  Plus, 
  Edit3, 
  Trash2, 
  Check, 
  X, 
  Users, 
  Layers, 
  Code, 
  Image as ImageIcon, 
  Clock, 
  ToggleLeft, 
  ToggleRight, 
  ExternalLink,
  Sparkles,
  RefreshCw,
  AlertTriangle,
  UserCheck,
  Megaphone,
  Search,
  Download,
  Activity,
  Server,
  Zap,
  Save
} from 'lucide-react';
import { AdSlot, AdPlacement, AdType } from '../types';
import { 
  fetchAdSlots, 
  upsertAdSlot, 
  deleteAdSlot, 
  fetchAllProfilesForAdmin, 
  updateUserAdminRole,
  UserProfile 
} from '../utils/supabaseStorage';
import { getStoredAnnouncement, saveStoredAnnouncement, AnnouncementConfig } from '../utils/storage';
import { Barcode } from './Barcode';

export const AdminView: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'ads' | 'users' | 'announcement'>('ads');
  const [adSlots, setAdSlots] = useState<AdSlot[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionError, setActionError] = useState<string | null>(null);

  // Announcement State
  const [announcement, setAnnouncement] = useState<AnnouncementConfig>(getStoredAnnouncement());
  const [announcementSaved, setAnnouncementSaved] = useState(false);

  // User Search & Role Filter State
  const [userSearch, setUserSearch] = useState('');
  const [roleUpdatingId, setRoleUpdatingId] = useState<string | null>(null);

  // Modal State for Add / Edit Ad Slot
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingSlot, setEditingSlot] = useState<AdSlot | null>(null);

  // Form Fields
  const [formData, setFormData] = useState<{
    name: string;
    placement: AdPlacement;
    ad_type: AdType;
    ad_code: string;
    link_url: string;
    banner_image_url: string;
    display_interval_seconds: number;
    is_active: boolean;
  }>({
    name: '',
    placement: 'top_banner',
    ad_type: 'script',
    ad_code: '',
    link_url: '',
    banner_image_url: '',
    display_interval_seconds: 60,
    is_active: false,
  });

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    setLoading(true);
    setActionError(null);
    try {
      const [slotsData, usersData] = await Promise.all([
        fetchAdSlots(true),
        fetchAllProfilesForAdmin(),
      ]);
      setAdSlots(slotsData);
      setUsers(usersData);
    } catch (err: any) {
      console.error('Error loading admin panel data:', err);
      setActionError(err.message || 'Failed to fetch admin data from Supabase');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    saveStoredAnnouncement(announcement);
    setAnnouncementSaved(true);
    setTimeout(() => setAnnouncementSaved(false), 2500);
  };

  const handleToggleUserAdmin = async (user: UserProfile) => {
    const newRole = !user.is_admin;
    const confirmText = newRole
      ? `Promote "${user.display_name || user.email}" to Admin?`
      : `Revoke Admin privileges from "${user.display_name || user.email}"?`;

    if (!window.confirm(confirmText)) return;

    setRoleUpdatingId(user.id);
    const { error } = await updateUserAdminRole(user.id, newRole);
    setRoleUpdatingId(null);

    if (!error) {
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, is_admin: newRole } : u))
      );
    } else {
      alert('Failed to update user role: ' + (error.message || 'Unknown error'));
    }
  };

  const filteredUsers = useMemo(() => {
    if (!userSearch.trim()) return users;
    const query = userSearch.toLowerCase();
    return users.filter(
      (u) =>
        (u.display_name && u.display_name.toLowerCase().includes(query)) ||
        (u.email && u.email.toLowerCase().includes(query)) ||
        u.id.toLowerCase().includes(query)
    );
  }, [users, userSearch]);

  const handleExportUsersCsv = () => {
    if (users.length === 0) return;
    const headers = ['User ID', 'Display Name', 'Email Address', 'Role', 'Joined Date'];
    const rows = users.map((u) => [
      u.id,
      u.display_name || 'N/A',
      u.email || 'N/A',
      u.is_admin ? 'Admin' : 'User',
      u.created_at ? new Date(u.created_at).toISOString() : 'N/A'
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.map((cell) => `"${cell}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `amz_affiliate_users_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleOpenAddModal = () => {
    setEditingSlot(null);
    setFormData({
      name: '',
      placement: 'top_banner',
      ad_type: 'script',
      ad_code: '',
      link_url: '',
      banner_image_url: '',
      display_interval_seconds: 60,
      is_active: false,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (slot: AdSlot) => {
    setEditingSlot(slot);
    setFormData({
      name: slot.name || '',
      placement: slot.placement || 'top_banner',
      ad_type: slot.ad_type || 'script',
      ad_code: slot.ad_code || '',
      link_url: slot.link_url || '',
      banner_image_url: slot.banner_image_url || '',
      display_interval_seconds: slot.display_interval_seconds ?? 60,
      is_active: slot.is_active ?? false,
    });
    setIsModalOpen(true);
  };

  const handleToggleActive = async (slot: AdSlot) => {
    const updatedStatus = !slot.is_active;
    const { error } = await upsertAdSlot({ id: slot.id, is_active: updatedStatus });
    if (!error) {
      setAdSlots((prev) =>
        prev.map((s) => (s.id === slot.id ? { ...s, is_active: updatedStatus } : s))
      );
    } else {
      alert('Failed to update active status in database.');
    }
  };

  const handleDeleteSlot = async (slotId: string) => {
    if (window.confirm('Are you sure you want to delete this ad slot?')) {
      const { error } = await deleteAdSlot(slotId);
      if (!error) {
        setAdSlots((prev) => prev.filter((s) => s.id !== slotId));
      } else {
        alert('Failed to delete ad slot from database.');
      }
    }
  };

  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Please enter a name for the ad slot.');
      return;
    }

    const payload: Partial<AdSlot> = {
      name: formData.name.trim(),
      placement: formData.placement,
      ad_type: formData.ad_type,
      ad_code: formData.ad_type === 'script' ? formData.ad_code : undefined,
      link_url: formData.ad_type === 'link_banner' ? formData.link_url.trim() : undefined,
      banner_image_url: formData.ad_type === 'link_banner' ? formData.banner_image_url.trim() : undefined,
      display_interval_seconds: formData.placement === 'interstitial_popup' ? Number(formData.display_interval_seconds) || 0 : 0,
      is_active: formData.is_active,
    };

    if (editingSlot) {
      payload.id = editingSlot.id;
    }

    const { error } = await upsertAdSlot(payload);
    if (error) {
      alert('Error saving ad slot: ' + (error.message || 'Unknown error'));
      return;
    }

    setIsModalOpen(false);
    loadAdminData();
  };

  const getPlacementLabel = (p: AdPlacement) => {
    switch (p) {
      case 'top_banner':
        return 'Top Banner';
      case 'footer_banner':
        return 'Footer Banner';
      case 'interstitial_popup':
        return 'Interstitial Popup';
      case 'results_banner':
        return 'Results Banner';
      default:
        return p;
    }
  };

  const activeAdsCount = adSlots.filter((s) => s.is_active).length;

  return (
    <div className="space-y-5">
      
      {/* Admin Shipping Label Banner Header */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-zinc-900 via-amber-950/40 to-zinc-900 border-2 border-dashed border-amber-500/50 shadow-xl text-zinc-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-amber-500 text-zinc-950 font-bold border border-amber-400 shrink-0">
            <Shield className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg sm:text-xl font-mono font-bold uppercase tracking-tight text-amber-400">
                Admin Control & System Studio
              </h2>
              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/40 text-[10px] font-mono font-bold">
                PRO-ADMIN
              </span>
            </div>
            <p className="text-xs text-zinc-400 font-sans mt-0.5">
              Monetization ad slots, broadcast announcement banner, user account moderation & system health.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={loadAdminData}
            className="p-2 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Refresh Admin Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-amber-400' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Overview Analytics Dashboard Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono">
        <div className="p-3.5 rounded-xl bg-zinc-900/90 border border-amber-500/30 text-zinc-100 space-y-1">
          <div className="flex items-center justify-between text-zinc-400">
            <span>ACTIVE AD CAMPAIGNS</span>
            <Layers className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-amber-400">
            {activeAdsCount} <span className="text-xs text-zinc-500 font-normal">/ {adSlots.length} Total</span>
          </div>
          <p className="text-[10px] text-emerald-400">Monetization Active</p>
        </div>

        <div className="p-3.5 rounded-xl bg-zinc-900/90 border border-amber-500/30 text-zinc-100 space-y-1">
          <div className="flex items-center justify-between text-zinc-400">
            <span>REGISTERED USERS</span>
            <Users className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-amber-400">
            {users.length} <span className="text-xs text-zinc-500 font-normal">Profiles</span>
          </div>
          <p className="text-[10px] text-amber-400">Supabase Auth Connected</p>
        </div>

        <div className="p-3.5 rounded-xl bg-zinc-900/90 border border-amber-500/30 text-zinc-100 space-y-1">
          <div className="flex items-center justify-between text-zinc-400">
            <span>SITE ANNOUNCEMENT</span>
            <Megaphone className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-base font-bold truncate text-amber-400">
            {announcement.enabled ? 'BROADCASTING' : 'OFFLINE'}
          </div>
          <p className="text-[10px] text-zinc-400 truncate">{announcement.message || 'No broadcast set'}</p>
        </div>

        <div className="p-3.5 rounded-xl bg-zinc-900/90 border border-amber-500/30 text-zinc-100 space-y-1">
          <div className="flex items-center justify-between text-zinc-400">
            <span>DATABASE HEALTH</span>
            <Server className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            100% OK
          </div>
          <p className="text-[10px] text-emerald-400">RLS Policies & Sync Active</p>
        </div>
      </div>

      {/* Admin Sub-Tab Navigation Selectors */}
      <div className="flex items-center gap-2 border-b border-zinc-800 pb-3 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveSubTab('ads')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-mono text-xs font-bold shrink-0 transition-all cursor-pointer ${
            activeSubTab === 'ads'
              ? 'bg-amber-500 text-zinc-950 shadow-md border border-amber-400'
              : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Ad Slots ({adSlots.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('users')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-mono text-xs font-bold shrink-0 transition-all cursor-pointer ${
            activeSubTab === 'users'
              ? 'bg-amber-500 text-zinc-950 shadow-md border border-amber-400'
              : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>User Accounts ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('announcement')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-mono text-xs font-bold shrink-0 transition-all cursor-pointer ${
            activeSubTab === 'announcement'
              ? 'bg-amber-500 text-zinc-950 shadow-md border border-amber-400'
              : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
          }`}
        >
          <Megaphone className="w-4 h-4" />
          <span>Site Broadcast Alert Bar</span>
        </button>
      </div>

      {actionError && (
        <div className="p-4 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* SUB-TAB 1: AD MANAGEMENT */}
      {activeSubTab === 'ads' && (
        <div className="space-y-4">
          
          {/* Action Header */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <h3 className="font-mono text-xs font-bold uppercase text-zinc-400 flex items-center gap-2">
              <span>ACTIVE & CONFIGURED MONETIZATION SLOTS</span>
            </h3>
            <button
              onClick={handleOpenAddModal}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold font-mono text-xs border border-amber-400 shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>+ Add Ad Slot</span>
            </button>
          </div>

          {/* Ad Cards Grid */}
          {loading ? (
            <div className="p-8 text-center text-amber-500 font-mono text-xs animate-pulse">
              LOADING MONETIZATION SLOTS FROM SUPABASE...
            </div>
          ) : adSlots.length === 0 ? (
            <div className="p-12 text-center rounded-xl bg-zinc-900/60 border-2 border-dashed border-zinc-800 text-zinc-400 space-y-3">
              <Layers className="w-8 h-8 mx-auto text-zinc-600" />
              <p className="font-mono text-xs text-zinc-300">No ad slots found in database yet.</p>
              <button
                onClick={handleOpenAddModal}
                className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-mono font-bold text-xs inline-flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Create First Ad Slot
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {adSlots.map((slot) => (
                <div
                  key={slot.id}
                  className={`p-4 rounded-xl border-2 border-dashed transition-all space-y-3 ${
                    slot.is_active
                      ? 'bg-zinc-900 border-amber-500/40 shadow-lg'
                      : 'bg-zinc-950/60 border-zinc-800 opacity-75'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-mono font-bold text-sm text-zinc-100 flex items-center gap-2">
                        {slot.name}
                      </h4>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        {/* Placement badge */}
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40">
                          {getPlacementLabel(slot.placement)}
                        </span>
                        {/* Type badge */}
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-800 text-zinc-300 border border-zinc-700 flex items-center gap-1">
                          {slot.ad_type === 'script' ? (
                            <>
                              <Code className="w-3 h-3 text-sky-400" /> Script / Embed
                            </>
                          ) : (
                            <>
                              <ImageIcon className="w-3 h-3 text-emerald-400" /> Direct Link + Banner
                            </>
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Active toggle badge button */}
                    <button
                      onClick={() => handleToggleActive(slot)}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-mono font-bold border transition-all cursor-pointer ${
                        slot.is_active
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 hover:bg-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-400 border-rose-500/40 hover:bg-rose-500/30'
                      }`}
                      title="Click to toggle active status"
                    >
                      {slot.is_active ? <ToggleRight className="w-4 h-4 text-emerald-400" /> : <ToggleLeft className="w-4 h-4 text-rose-400" />}
                      <span>{slot.is_active ? 'ACTIVE' : 'INACTIVE'}</span>
                    </button>
                  </div>

                  {/* Slot details preview */}
                  <div className="p-2.5 rounded bg-zinc-950 border border-zinc-800/80 font-mono text-[11px] text-zinc-400 space-y-1">
                    {slot.placement === 'interstitial_popup' && (
                      <div className="flex items-center gap-1.5 text-amber-400">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Display Interval: {slot.display_interval_seconds || 0} seconds</span>
                      </div>
                    )}

                    {slot.ad_type === 'script' ? (
                      <div className="truncate text-zinc-500">
                        Code Snippet: <span className="text-zinc-300 font-sans">{slot.ad_code?.slice(0, 60)}...</span>
                      </div>
                    ) : (
                      <div className="space-y-0.5 truncate">
                        {slot.link_url && (
                          <div className="truncate text-sky-400 flex items-center gap-1">
                            <ExternalLink className="w-3 h-3 shrink-0" />
                            <span className="truncate">{slot.link_url}</span>
                          </div>
                        )}
                        {slot.banner_image_url && (
                          <div className="truncate text-zinc-500">
                            Image: <span className="text-zinc-400">{slot.banner_image_url}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Card Actions */}
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      onClick={() => handleOpenEditModal(slot)}
                      className="px-2.5 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-mono font-bold flex items-center gap-1 border border-zinc-700 transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-amber-400" /> Edit
                    </button>

                    <button
                      onClick={() => handleDeleteSlot(slot.id)}
                      className="px-2.5 py-1.5 rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-mono font-bold flex items-center gap-1 border border-rose-500/40 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-400" /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 2: REGISTERED USERS & MODERATION */}
      {activeSubTab === 'users' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <h3 className="font-mono text-xs font-bold uppercase text-zinc-400">
              REGISTERED APP ACCOUNTS ({filteredUsers.length} of {users.length})
            </h3>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              {/* Search user */}
              <div className="relative flex-1 sm:w-64">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Search user email / name..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded bg-zinc-950 border border-zinc-800 text-zinc-200 font-mono text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Export CSV */}
              <button
                onClick={handleExportUsersCsv}
                className="px-3 py-1.5 rounded bg-amber-500 hover:bg-amber-400 text-zinc-950 font-mono font-bold text-xs flex items-center gap-1 shrink-0 transition-all cursor-pointer"
                title="Export Users list to CSV"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {loading ? (
            <div className="p-8 text-center text-amber-500 font-mono text-xs animate-pulse">
              LOADING USERS FROM SUPABASE PROFILES...
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-8 text-center rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 font-mono text-xs">
              No matching user profiles found in database.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-900 shadow-xl">
              <table className="w-full text-left font-mono text-xs text-zinc-300 min-w-[600px]">
                <thead className="bg-zinc-950 text-amber-400 border-b border-zinc-800">
                  <tr>
                    <th className="p-3 font-bold">Display Name</th>
                    <th className="p-3 font-bold">Email Address</th>
                    <th className="p-3 font-bold">Joined Date</th>
                    <th className="p-3 font-bold text-center">Current Role</th>
                    <th className="p-3 font-bold text-right">Moderation Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-zinc-800/50 transition-colors">
                      <td className="p-3 font-bold text-zinc-100">
                        {u.display_name || 'User'}
                      </td>
                      <td className="p-3 text-zinc-300">
                        {u.email || u.id}
                      </td>
                      <td className="p-3 text-zinc-500">
                        {u.created_at ? new Date(u.created_at).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="p-3 text-center">
                        {u.is_admin ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/40 text-[10px] font-bold">
                            <Shield className="w-3 h-3 text-amber-400" /> Admin
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700 text-[10px]">
                            <UserCheck className="w-3 h-3" /> Standard User
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => handleToggleUserAdmin(u)}
                          disabled={roleUpdatingId === u.id}
                          className={`px-2.5 py-1 rounded text-[11px] font-mono font-bold border transition-all cursor-pointer ${
                            u.is_admin
                              ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-rose-500/30'
                              : 'bg-amber-500/20 text-amber-400 border-amber-500/40 hover:bg-amber-500/30'
                          }`}
                        >
                          {roleUpdatingId === u.id ? 'Updating...' : u.is_admin ? 'Revoke Admin' : 'Make Admin'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 3: SITE ANNOUNCEMENT ALERT BAR CONFIGURATOR */}
      {activeSubTab === 'announcement' && (
        <div className="p-5 rounded-xl bg-zinc-900 border-2 border-dashed border-amber-500/40 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div>
              <h3 className="font-mono text-sm font-bold text-amber-400 uppercase flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-amber-500" />
                Site-Wide Broadcast Announcement Bar
              </h3>
              <p className="text-xs text-zinc-400 font-sans mt-0.5">
                Broadcast live deals, promo codes, maintenance alerts, or affiliate updates to all app visitors at the top of the screen.
              </p>
            </div>

            {announcementSaved && (
              <span className="px-3 py-1 rounded bg-emerald-500/20 text-emerald-400 font-mono text-xs border border-emerald-500/40 flex items-center gap-1 animate-fade-in">
                <Check className="w-3.5 h-3.5" /> Broadcast Saved!
              </span>
            )}
          </div>

          <form onSubmit={handleSaveAnnouncement} className="space-y-4 font-mono text-xs">
            
            {/* Enable Toggle */}
            <div className="flex items-center gap-3">
              <label className="text-zinc-200 font-bold">Enable Site Announcement Bar:</label>
              <button
                type="button"
                onClick={() => setAnnouncement({ ...announcement, enabled: !announcement.enabled })}
                className={`px-3 py-1.5 rounded font-bold border flex items-center gap-1.5 transition-all ${
                  announcement.enabled
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                    : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                }`}
              >
                {announcement.enabled ? <ToggleRight className="w-4 h-4 text-emerald-400" /> : <ToggleLeft className="w-4 h-4" />}
                {announcement.enabled ? 'ACTIVE (SHOWING TO ALL USERS)' : 'DISABLED'}
              </button>
            </div>

            {/* Announcement Message */}
            <div className="space-y-1">
              <label className="block text-zinc-300 font-bold">
                Broadcast Message Text <span className="text-rose-400">*</span>
              </label>
              <textarea
                rows={2}
                required
                placeholder="e.g. ⚡ FLASH SALE: Prime Deals are active! Generate viral posts now."
                value={announcement.message}
                onChange={(e) => setAnnouncement({ ...announcement, message: e.target.value })}
                className="w-full p-2.5 rounded bg-zinc-950 border border-zinc-700 text-zinc-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Link URL & Theme Type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-zinc-300 font-bold">CTA Button / Link URL (Optional)</label>
                <input
                  type="text"
                  placeholder="https://amazon.com/deals"
                  value={announcement.linkUrl || ''}
                  onChange={(e) => setAnnouncement({ ...announcement, linkUrl: e.target.value })}
                  className="w-full p-2.5 rounded bg-zinc-950 border border-zinc-700 text-zinc-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-zinc-300 font-bold">Banner Color Theme</label>
                <select
                  value={announcement.type}
                  onChange={(e) => setAnnouncement({ ...announcement, type: e.target.value as any })}
                  className="w-full p-2.5 rounded bg-zinc-950 border border-zinc-700 text-zinc-100 focus:outline-none focus:border-amber-500"
                >
                  <option value="amber">Amber Gold (Deal Warning / Promo)</option>
                  <option value="emerald">Emerald Green (Success / New Feature)</option>
                  <option value="rose">Rose Red (Urgent Sale / Limited Time)</option>
                  <option value="indigo">Indigo Blue (Info / System Update)</option>
                </select>
              </div>
            </div>

            {/* Preview Box */}
            <div className="space-y-1 pt-2">
              <label className="block text-zinc-400 font-bold text-[11px]">LIVE BROADCAST PREVIEW:</label>
              <div className={`p-3 rounded-lg border flex items-center justify-between gap-2 text-xs font-mono font-bold ${
                announcement.type === 'emerald'
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
                  : announcement.type === 'rose'
                  ? 'bg-rose-500/15 border-rose-500/40 text-rose-400'
                  : announcement.type === 'indigo'
                  ? 'bg-indigo-500/15 border-indigo-500/40 text-indigo-400'
                  : 'bg-amber-500/15 border-amber-500/40 text-amber-400'
              }`}>
                <span className="truncate">{announcement.message || 'Sample announcement message...'}</span>
                {announcement.linkUrl && (
                  <span className="px-2 py-0.5 rounded bg-zinc-950 text-white text-[10px] shrink-0 border border-current">
                    Action Link
                  </span>
                )}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold font-mono text-xs flex items-center gap-1.5 shadow-md transition-all active:scale-95 cursor-pointer"
              >
                <Save className="w-4 h-4" /> Save & Publish Broadcast
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL FORM FOR ADD / EDIT AD SLOT */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-xl bg-zinc-900 border-2 border-dashed border-amber-500/50 rounded-xl p-6 shadow-2xl text-zinc-100 max-h-[90vh] overflow-y-auto">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4">
              <h3 className="text-lg font-mono font-bold text-amber-400 uppercase flex items-center gap-2">
                <Layers className="w-5 h-5" />
                <span>{editingSlot ? 'Edit Ad Slot' : 'Create New Ad Slot'}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-amber-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="space-y-4 font-mono text-xs">
              
              {/* Slot Name */}
              <div className="space-y-1">
                <label className="block text-zinc-300 font-bold">
                  Ad Slot Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Header Amazon Affiliate Banner"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2.5 rounded bg-zinc-950 border border-zinc-700 text-zinc-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Placement Select */}
              <div className="space-y-1">
                <label className="block text-zinc-300 font-bold">Ad Placement Position</label>
                <select
                  value={formData.placement}
                  onChange={(e) => setFormData({ ...formData, placement: e.target.value as AdPlacement })}
                  className="w-full p-2.5 rounded bg-zinc-950 border border-zinc-700 text-zinc-100 focus:outline-none focus:border-amber-500"
                >
                  <option value="top_banner">Top Banner (Below Header)</option>
                  <option value="footer_banner">Footer Banner (Bottom of Page)</option>
                  <option value="results_banner">Results Banner (After Generated Post Cards)</option>
                  <option value="interstitial_popup">Interstitial Popup (Modal Announcement)</option>
                </select>
              </div>

              {/* Ad Type */}
              <div className="space-y-1">
                <label className="block text-zinc-300 font-bold">Ad Format Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, ad_type: 'script' })}
                    className={`p-2.5 rounded border text-center transition-all ${
                      formData.ad_type === 'script'
                        ? 'bg-amber-500/20 text-amber-400 border-amber-500/60 font-bold'
                        : 'bg-zinc-950 text-zinc-400 border-zinc-800'
                    }`}
                  >
                    Script / Network Embed
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, ad_type: 'link_banner' })}
                    className={`p-2.5 rounded border text-center transition-all ${
                      formData.ad_type === 'link_banner'
                        ? 'bg-amber-500/20 text-amber-400 border-amber-500/60 font-bold'
                        : 'bg-zinc-950 text-zinc-400 border-zinc-800'
                    }`}
                  >
                    Direct Link + Image Banner
                  </button>
                </div>
              </div>

              {/* Script code input */}
              {formData.ad_type === 'script' ? (
                <div className="space-y-1">
                  <label className="block text-zinc-300 font-bold">HTML / JavaScript Code Snippet</label>
                  <textarea
                    rows={4}
                    placeholder="<script src='https://ad-network.com/banner.js'></script>"
                    value={formData.ad_code}
                    onChange={(e) => setFormData({ ...formData, ad_code: e.target.value })}
                    className="w-full p-2.5 rounded bg-zinc-950 border border-zinc-700 text-zinc-100 font-mono text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
              ) : (
                <>
                  <div className="space-y-1">
                    <label className="block text-zinc-300 font-bold">Target Affiliate / Click URL</label>
                    <input
                      type="text"
                      placeholder="https://amazon.com/dp/B0C9RNDWMB?tag=yourtag-20"
                      value={formData.link_url}
                      onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                      className="w-full p-2.5 rounded bg-zinc-950 border border-zinc-700 text-zinc-100 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-zinc-300 font-bold">Banner Image Image URL</label>
                    <input
                      type="text"
                      placeholder="https://images-na.ssl-images-amazon.com/images/P/B0C9RNDWMB.01.jpg"
                      value={formData.banner_image_url}
                      onChange={(e) => setFormData({ ...formData, banner_image_url: e.target.value })}
                      className="w-full p-2.5 rounded bg-zinc-950 border border-zinc-700 text-zinc-100 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </>
              )}

              {/* Popup Interval Seconds if Interstitial */}
              {formData.placement === 'interstitial_popup' && (
                <div className="space-y-1">
                  <label className="block text-zinc-300 font-bold">Auto Popup Interval (Seconds)</label>
                  <input
                    type="number"
                    min={10}
                    max={3600}
                    value={formData.display_interval_seconds}
                    onChange={(e) => setFormData({ ...formData, display_interval_seconds: Number(e.target.value) })}
                    className="w-full p-2.5 rounded bg-zinc-950 border border-zinc-700 text-zinc-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
              )}

              {/* Is Active */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="is_active_check"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 rounded text-amber-500 bg-zinc-950 border-zinc-700 focus:ring-amber-500"
                />
                <label htmlFor="is_active_check" className="text-zinc-200 font-bold cursor-pointer">
                  Enable and activate this ad slot immediately
                </label>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold flex items-center gap-1.5 shadow-md"
                >
                  <Check className="w-4 h-4" /> Save Ad Slot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
