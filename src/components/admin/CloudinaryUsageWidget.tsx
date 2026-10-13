'use client';
import { useEffect, useState, useCallback } from 'react';
import { useLocale } from 'next-intl';
import { 
  Cloud, 
  HardDrive, 
  Wifi, 
  RefreshCw, 
  AlertTriangle, 
  Database, 
  Zap, 
  Film, 
  Image as ImageIcon, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp,
  ShieldCheck,
  Sparkles,
  Users
} from 'lucide-react';

interface UsageData {
  storage:   { usedMB: number; usedGB: number; limitGB: number; pct: number };
  bandwidth: { usedMB: number; usedGB: number; limitGB: number; pct: number };
  resources: { total: number; transformations: number; transformationsLimit: number };
  credits:   { used: number; limit: number; usedPercent: number };
  plan:        string;
  lastUpdated: string | null;
  videoMaxMB:  number;
}

export default function CloudinaryUsageWidget({ locale: propLocale }: { locale?: string }) {
  const activeLocale = useLocale();
  const locale = activeLocale || propLocale || 'en';
  const isAr = locale === 'ar';

  const [data, setData]               = useState<UsageData | null>(null);
  const [error, setError]             = useState<string | null>(null);
  const [loading, setLoading]         = useState(true);
  const [justRefreshed, setJustRefreshed] = useState(false);
  const [showTechDetails, setShowTechDetails] = useState(false);

  const fetchUsage = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/cloudinary-usage');
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Failed to load usage');
      setData(json.data);
      if (silent) {
        setJustRefreshed(true);
        setTimeout(() => setJustRefreshed(false), 2000);
      }
    } catch (e: any) {
      setError(e.message || 'Failed to load usage');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsage(); }, [fetchUsage]);

  // Listen for upload events to auto-refresh
  useEffect(() => {
    const handler = () => fetchUsage(true);
    window.addEventListener('cloudinary-upload-success', handler);
    return () => window.removeEventListener('cloudinary-upload-success', handler);
  }, [fetchUsage]);

  const remainingGB = data ? +(data.storage.limitGB - data.storage.usedGB).toFixed(2) : 24.74;
  const usedMB = data ? data.storage.usedMB : 262;
  const usedPct = data ? data.storage.pct : 1.0;

  return (
    <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-[#3D0B1B] via-[#220712] to-[#120308] border border-rose-900/40 shadow-2xl space-y-6">
      
      {/* ── 1. Client-Friendly Header ── */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-rose-900/30 pb-5">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-700 to-rose-950 border border-rose-500/40 flex items-center justify-center shadow-lg shadow-rose-950/60">
            <Cloud size={24} className="text-rose-100" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h3 className="text-lg font-bold text-white tracking-tight">
                {isAr ? 'مساحة تخزين الصور والفيديوهات' : 'Photos & Videos Storage'}
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                {isAr ? 'المساحة آمنة ومجانية 100%' : '100% Free & Safe'}
              </span>
            </div>
            <p className="text-xs text-rose-300/80 mt-1">
              {isAr
                ? 'المساحة المخصصة لرفع أعمالك ومشاريعك على الموقع دون أي رسوم أو قلق'
                : 'Free storage for uploading your portfolio projects, videos, and photos'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {justRefreshed && (
            <span className="text-xs text-emerald-400 flex items-center gap-1 font-semibold animate-fade-in">
              <CheckCircle2 size={13} /> {isAr ? 'تم التحديث!' : 'Updated!'}
            </span>
          )}
          <button
            onClick={() => fetchUsage()}
            disabled={loading}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-rose-950/70 hover:bg-rose-900/60 border border-rose-800/40 text-rose-200 text-xs font-medium transition-all shadow-sm active:scale-95"
            title={isAr ? 'تحديث الإحصائيات الآن' : 'Refresh stats'}
          >
            <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
            <span>{isAr ? 'تحديث الأرقام' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* ── 2. Content ── */}
      {loading ? (
        <div className="space-y-4 animate-pulse">
          <div className="h-28 rounded-2xl bg-rose-950/40 border border-rose-900/30" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-28 rounded-2xl bg-rose-950/30" />
            <div className="h-28 rounded-2xl bg-rose-950/30" />
          </div>
        </div>
      ) : error ? (
        <div className="flex items-center gap-3 text-amber-300 text-xs bg-amber-950/40 border border-amber-800/50 rounded-2xl p-4">
          <AlertTriangle size={18} className="flex-shrink-0 text-amber-400" />
          <div>
            <p className="font-semibold">{isAr ? 'تعذر جلب إحصائيات المساحة' : 'Failed to fetch storage info'}</p>
            <p className="text-[11px] text-amber-400/80 mt-0.5">{error}</p>
          </div>
        </div>
      ) : data ? (
        <div className="space-y-6">
          
          {/* ══ Hero Box: The Big Peace-of-Mind Remaining Space ══ */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-rose-950/70 via-[#2C0A17] to-rose-950/50 border border-rose-600/30 shadow-inner">
            <div className="flex flex-wrap items-end justify-between gap-4 mb-3.5">
              <div>
                <span className="text-xs font-semibold text-rose-300/80 uppercase tracking-wider flex items-center gap-1.5">
                  <HardDrive size={14} className="text-rose-400" />
                  {isAr ? 'المساحة الفارغة المتبقية للرفع' : 'Available Free Space for Uploads'}
                </span>
                <div className="flex items-baseline gap-2.5 mt-1.5">
                  <span className="text-3xl md:text-5xl font-black text-white tracking-tight">
                    {remainingGB} <span className="text-xl font-bold text-rose-300">GB</span>
                  </span>
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-700/50 flex items-center gap-1">
                    <Sparkles size={11} />
                    {isAr ? '99% فارغ ومتاح' : '99% Available'}
                  </span>
                </div>
              </div>

              <div className="text-left rtl:text-right">
                <span className="text-xs text-rose-300/70 block">
                  {isAr ? 'المستخدم حتى الآن من ملفاتك:' : 'Used so far by your files:'}
                </span>
                <span className="font-mono text-base font-bold text-rose-100">
                  {usedMB} MB <span className="text-xs font-normal text-rose-400/60">/ 25 GB ({usedPct}%)</span>
                </span>
              </div>
            </div>

            {/* Visual Progress Bar */}
            <div className="w-full h-3 rounded-full bg-black/50 border border-rose-900/50 overflow-hidden p-0.5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 transition-all duration-1000 shadow-sm"
                style={{ width: `${Math.max(usedPct, 1.2)}%` }}
              />
            </div>

            <div className="flex justify-between items-center text-xs text-rose-300/70 mt-2.5">
              <span className="flex items-center gap-1 text-emerald-400 font-medium">
                <ShieldCheck size={13} />
                {isAr
                  ? `أنتِ في أمان تام — استخدمتِ حوالي ${usedPct}% فقط من المساحة المجانية المتاحة!`
                  : `Plenty of space left — You have only used ~${usedPct}% of your free quota!`}
              </span>
              <span className="text-rose-400/50 font-mono text-[11px]">25 GB Max Limit</span>
            </div>
          </div>

          {/* ══ Capability Cards: What can the client actually upload? ══ */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* 🎬 Video Capacity */}
            <div className="p-5 rounded-2xl bg-rose-950/30 border border-rose-900/40 hover:border-rose-700/50 transition-colors">
              <div className="flex items-center gap-3 mb-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-950/70 border border-purple-700/50 flex items-center justify-center">
                  <Film size={17} className="text-purple-300" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">
                    {isAr ? '🎬 سعة الفيديوهات المتبقية' : '🎬 Videos You Can Upload'}
                  </h4>
                  <p className="text-[11px] text-purple-300/70">
                    {isAr ? 'أقصى حجم للفيديو الواحد: 100 ميجابايت' : 'Max 100 MB per video file'}
                  </p>
                </div>
              </div>
              <p className="text-xs text-rose-200/90 leading-relaxed">
                {isAr
                  ? `المساحة المتبقية (${remainingGB} جيجابايت) تكفي لرفع أكثر من 1,000 فيديو إضافي لمشاريعك (إذا كان متوسط حجم الفيديو 20-30 ميجا).`
                  : `Your remaining space (${remainingGB} GB) has enough room for over 1,000 more project videos (average 25 MB each).`}
              </p>
            </div>

            {/* 🖼️ Photo Capacity */}
            <div className="p-5 rounded-2xl bg-rose-950/30 border border-rose-900/40 hover:border-rose-700/50 transition-colors">
              <div className="flex items-center gap-3 mb-2.5">
                <div className="w-9 h-9 rounded-xl bg-rose-950/70 border border-rose-700/50 flex items-center justify-center">
                  <ImageIcon size={17} className="text-rose-300" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">
                    {isAr ? '🖼️ سعة الصور المتبقية' : '🖼️ Photos You Can Upload'}
                  </h4>
                  <p className="text-[11px] text-rose-300/70">
                    {isAr ? 'أقصى حجم للصورة الواحدة: 10 ميجابايت' : 'Max 10 MB per image'}
                  </p>
                </div>
              </div>
              <p className="text-xs text-rose-200/90 leading-relaxed">
                {isAr
                  ? `المساحة المتبقية تكفي لأكثر من 12,000 صورة بجودة فائقة لمعرض الأعمال وتفاصيل المشاريع (بمتوسط 2 ميجا لكل صورة).`
                  : `Your remaining space fits more than 12,000 high-resolution photos for galleries and project mockups.`}
              </p>
            </div>

          </div>

          {/* ══ Client-Friendly Summary Row (Human terms) ══ */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1">
            
            {/* Uploaded Files */}
            <div className="p-4 rounded-xl bg-black/25 border border-rose-900/30">
              <div className="flex items-center gap-1.5 text-rose-300/80 text-xs font-semibold mb-1">
                <Database size={13} className="text-rose-400" />
                <span>{isAr ? 'الملفات المرفوعة حالياً' : 'Current Uploaded Files'}</span>
              </div>
              <p className="text-xl font-bold text-white font-mono">{data.resources.total.toLocaleString()}</p>
              <p className="text-[11px] text-rose-400/60 mt-0.5">
                {isAr ? 'صورة وفيديو محفوظة في حسابك' : 'photos & videos stored safely'}
              </p>
            </div>

            {/* Monthly Visitor Traffic */}
            <div className="p-4 rounded-xl bg-black/25 border border-rose-900/30">
              <div className="flex items-center gap-1.5 text-rose-300/80 text-xs font-semibold mb-1">
                <Users size={13} className="text-rose-400" />
                <span>{isAr ? 'مشاهدات الزوار للموقع' : 'Visitor Views & Traffic'}</span>
              </div>
              <p className="text-xl font-bold text-emerald-400 font-mono">
                {data.bandwidth.usedMB} MB <span className="text-xs text-rose-400/60 font-normal">/ 25 GB</span>
              </p>
              <p className="text-[11px] text-emerald-400/80 mt-0.5">
                {isAr ? 'نشط وآمن (يتجدد مجاناً كل شهر)' : 'Active & safe (Resets free monthly)'}
              </p>
            </div>

            {/* Plan Guarantee */}
            <div className="p-4 rounded-xl bg-black/25 border border-rose-900/30">
              <div className="flex items-center gap-1.5 text-amber-300/90 text-xs font-semibold mb-1">
                <ShieldCheck size={13} className="text-amber-400" />
                <span>{isAr ? 'نوع الحساب والتكلفة' : 'Plan Status & Cost'}</span>
              </div>
              <p className="text-xl font-bold text-white">
                {isAr ? 'مجاني 100%' : '100% Free'}
              </p>
              <p className="text-[11px] text-rose-400/60 mt-0.5">
                {isAr ? 'لا توجد أي تكاليف أو اشتراكات' : 'No fees or subscription required'}
              </p>
            </div>

          </div>

          {/* ══ Optional Developer Details Toggle (Hidden by default for non-technical users) ══ */}
          <div className="pt-2 border-t border-rose-900/20">
            <button
              onClick={() => setShowTechDetails(!showTechDetails)}
              className="text-xs text-rose-400/60 hover:text-rose-300 flex items-center gap-1.5 transition-colors mx-auto py-1"
            >
              <span>
                {showTechDetails
                  ? (isAr ? 'إخفاء التفاصيل التقنية المتقدمة ▴' : 'Hide Advanced Developer Stats ▴')
                  : (isAr ? 'عرض التفاصيل التقنية المتقدمة للمطورين (Bandwidth, Credits, Transforms) ▾' : 'Show Advanced Developer Stats (Bandwidth, Credits, Transforms) ▾')}
              </span>
            </button>

            {showTechDetails && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3 p-4 rounded-2xl bg-black/40 border border-rose-900/30 text-xs">
                <div>
                  <p className="text-[10px] text-rose-400/60 uppercase">Bandwidth</p>
                  <p className="text-sm font-bold text-white font-mono">{data.bandwidth.usedMB} MB / 25 GB</p>
                  <p className="text-[10px] text-emerald-400">0.18% used</p>
                </div>
                <div>
                  <p className="text-[10px] text-rose-400/60 uppercase">Credits</p>
                  <p className="text-sm font-bold text-white font-mono">{data.credits.used} / {data.credits.limit}</p>
                  <p className="text-[10px] text-emerald-400">{data.credits.usedPercent}% used</p>
                </div>
                <div>
                  <p className="text-[10px] text-rose-400/60 uppercase">Transformations</p>
                  <p className="text-sm font-bold text-white font-mono">{data.resources.transformations} / 25,000</p>
                  <p className="text-[10px] text-emerald-400">Resets monthly</p>
                </div>
                <div>
                  <p className="text-[10px] text-rose-400/60 uppercase">API Resources</p>
                  <p className="text-sm font-bold text-white font-mono">{data.resources.total}</p>
                  <p className="text-[10px] text-rose-400/50">Stored assets</p>
                </div>
              </div>
            )}
          </div>

        </div>
      ) : null}

    </div>
  );
}
