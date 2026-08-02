import React, { useState } from 'react';
import { X, Calendar, Clock, Download, Sparkles, Check, Share2, Bell } from 'lucide-react';
import { PlatformId, PostResult } from '../types';
import { PLATFORM_NAMES } from '../utils/ai';
import { logAnalyticsEvent } from '../utils/storage';

interface ScheduleModalProps {
  post: PostResult;
  onClose: () => void;
}

const PEAK_POSTING_TIMES: Record<PlatformId, { bestTime: string; tip: string }> = {
  facebook: { bestTime: '1:00 PM — 4:00 PM', tip: 'Mid-afternoon break hours produce highest click-through rate.' },
  facebook_reels: { bestTime: '6:00 PM — 9:00 PM', tip: 'Evening short video watch hours on Facebook feed.' },
  instagram_post: { bestTime: '11:00 AM — 1:00 PM', tip: 'Lunchtime peak engagement for aesthetic photo grids.' },
  instagram_reels: { bestTime: '7:00 PM — 9:00 PM', tip: 'Evening prime time for short-form video algorithms.' },
  whatsapp: { bestTime: '9:00 AM — 11:00 AM', tip: 'Morning routine broadcasts receive highest open rates.' },
  x_twitter: { bestTime: '8:00 AM — 10:00 AM', tip: 'Morning commute news scan hours.' },
  pinterest: { bestTime: '8:00 PM — 11:00 PM', tip: 'Late night inspiration visual browsing peak.' },
  tiktok: { bestTime: '6:00 PM — 10:00 PM', tip: 'Peak evening FYP algorithm watch time.' },
};

export const ScheduleModal: React.FC<ScheduleModalProps> = ({ post, onClose }) => {
  const platformInfo = PEAK_POSTING_TIMES[post.platform] || { bestTime: '12:00 PM — 3:00 PM', tip: 'Standard audience peak hours.' };
  
  const [scheduledDate, setScheduledDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [scheduledTime, setScheduledTime] = useState('19:00');
  const [downloaded, setDownloaded] = useState(false);

  // Generate iCal (.ics) file
  const handleDownloadICal = () => {
    try {
      const [year, month, day] = scheduledDate.split('-').map(Number);
      const [hours, minutes] = scheduledTime.split(':').map(Number);

      const startDate = new Date(Date.UTC(year, month - 1, day, hours, minutes));
      const endDate = new Date(startDate.getTime() + 15 * 60 * 1000); // 15 mins

      const formatDate = (date: Date) => {
        return date.toISOString().replace(/-|:|\.\d+/g, '');
      };

      const icsContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Affiliate Post Generator Pro//EN',
        'BEGIN:VEVENT',
        `UID:post-${post.id}@affiliatepro`,
        `DTSTAMP:${formatDate(new Date())}`,
        `DTSTART:${formatDate(startDate)}`,
        `DTEND:${formatDate(endDate)}`,
        `SUMMARY:📢 Publish ${PLATFORM_NAMES[post.platform]} - ${post.productTitle}`,
        `DESCRIPTION:Post Text:\\n${post.text.replace(/\n/g, '\\n')}\\n\\nLink: ${post.productUrl}`,
        'STATUS:CONFIRMED',
        'BEGIN:VALARM',
        'TRIGGER:-PT10M',
        'ACTION:DISPLAY',
        `DESCRIPTION:Reminder: Time to publish ${PLATFORM_NAMES[post.platform]} affiliate post!`,
        'END:VALARM',
        'END:VEVENT',
        'END:VCALENDAR',
      ].join('\r\n');

      const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Schedule-${post.platform}-${post.productTitle.slice(0, 10)}.ics`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      logAnalyticsEvent({
        postId: post.id,
        productId: post.productId,
        productTitle: post.productTitle,
        platform: post.platform,
        language: post.language,
        action: 'scheduled',
      });

      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 3000);
    } catch (err) {
      alert('Failed to generate calendar reminder file.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-[#18191e] border-2 border-dashed border-zinc-300 dark:border-zinc-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 relative">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-dashed border-zinc-200 dark:border-zinc-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-purple-500/20 border border-purple-500/40 text-purple-400 rounded-lg">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-mono font-bold text-sm uppercase text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                AI Social Schedule Optimizer
              </h3>
              <p className="text-xs text-zinc-500 font-sans">
                {PLATFORM_NAMES[post.platform]} • {post.language}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* AI Best Time Insight Card */}
        <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/30 space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-purple-600 dark:text-purple-300 uppercase">
            <Sparkles className="w-4 h-4 text-purple-400" />
            AI Peak Engagement Window
          </div>
          <div className="text-base font-mono font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-500" />
            {platformInfo.bestTime}
          </div>
          <p className="text-xs text-zinc-700 dark:text-zinc-300 font-sans">
            💡 {platformInfo.tip}
          </p>
        </div>

        {/* Date & Time Selector */}
        <div className="space-y-3">
          <label className="text-xs font-mono font-bold uppercase text-zinc-800 dark:text-zinc-200 block">
            Set Reminder Notification Date & Time
          </label>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-mono text-zinc-500 block mb-1">Target Date</label>
              <input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-xs font-mono text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="text-[11px] font-mono text-zinc-500 block mb-1">Target Time</label>
              <input
                type="time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-xs font-mono text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={handleDownloadICal}
          className="w-full py-3 rounded-lg bg-purple-500 hover:bg-purple-400 text-zinc-950 font-mono font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
        >
          {downloaded ? <Check className="w-4 h-4 stroke-[3]" /> : <Bell className="w-4 h-4" />}
          {downloaded ? 'Calendar Event (.ics) Exported!' : 'Export Calendar Reminder (.ics)'}
        </button>

        <p className="text-[10px] font-mono text-center text-zinc-500">
          The exported .ics file syncs automatically with Google Calendar, Apple Calendar, or Mobile Reminders.
        </p>

      </div>
    </div>
  );
};
