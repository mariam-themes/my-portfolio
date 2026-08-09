'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Loader2, Trash2, Mail, Phone, Briefcase, Wallet, Clock, CheckCircle2, Inbox } from 'lucide-react';
import toast from 'react-hot-toast';

export type InquiryStatus = 'new' | 'contacted' | 'closed';

export type InquiryRecord = {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  service: string;
  budget?: string;
  timeline?: string;
  message?: string;
  status: InquiryStatus;
  createdAt: string;
};

type FilterTab = 'all' | InquiryStatus;

const STATUS_META: Record<InquiryStatus, { label: string; badgeClass: string; optionClass: string }> = {
  new: {
    label: 'New',
    badgeClass: 'bg-amber-500/20 text-amber-300 border border-amber-500/40',
    optionClass: '',
  },
  contacted: {
    label: 'Contacted',
    badgeClass: 'bg-blue-500/20 text-blue-300 border border-blue-500/40',
    optionClass: '',
  },
  closed: {
    label: 'Closed',
    badgeClass: 'bg-rose-500/20 text-rose-300 border border-rose-500/40',
    optionClass: '',
  },
};

function formatDate(value: string | undefined) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

export default function InquiriesClient({
  inquiries,
  activeStatus,
  stats,
}: {
  inquiries: InquiryRecord[];
  activeStatus: FilterTab;
  stats: { total: number; new: number; contacted: number; closed: number };
}) {
  const router = useRouter();
  const t = useTranslations('Admin.inquiries');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const statusLabel = (status: InquiryStatus) =>
    status === 'new' ? t('statusNew') : status === 'contacted' ? t('statusContacted') : t('statusClosed');

  const tabs: Array<{ key: FilterTab; label: string; count: number }> = [
    { key: 'all', label: t('all'), count: stats.total },
    { key: 'new', label: t('statusNew'), count: stats.new },
    { key: 'contacted', label: t('statusContacted'), count: stats.contacted },
    { key: 'closed', label: t('statusClosed'), count: stats.closed },
  ];

  const handleStatusChange = async (id: string, status: InquiryStatus) => {
    setBusyId(id);
    try {
      const response = await fetch(`/api/admin/inquiries/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || t('updateFailed'));
      toast.success(t('markAs', { status: statusLabel(status) }));
      router.refresh();
    } catch (error) {
      toast.error(errorMessage(error, t('error')));
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (inquiry: InquiryRecord) => {
    if (!window.confirm(t('deleteConfirm', { name: inquiry.name }))) return;
    setDeletingId(inquiry._id);
    try {
      const response = await fetch(`/api/admin/inquiries/${inquiry._id}`, { method: 'DELETE' });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || t('deleteFailed'));
      toast.success(t('deleted'));
      router.refresh();
    } catch (error) {
      toast.error(errorMessage(error, t('error')));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">{t('title')}</h1>
        <p className="text-rose-200/60 mt-1">{t('subtitle')}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <Link
            key={tab.key}
            href={tab.key === 'all' ? '/admin/inquiries' : `/admin/inquiries?status=${tab.key}`}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all border ${
              activeStatus === tab.key
                ? 'bg-gradient-to-r from-rose-600 to-rose-900 text-white border-rose-500/50 shadow-lg shadow-rose-900/20'
                : 'bg-black/30 text-rose-200/70 border-rose-900/30 hover:bg-black/50 hover:text-rose-100'
            }`}
          >
            {tab.label}
            <span
              className={`px-1.5 py-0.5 rounded-full text-[11px] font-semibold ${
                activeStatus === tab.key
                  ? 'bg-white/20 text-white'
                  : 'bg-rose-950/60 text-rose-300 border border-rose-900/40'
              }`}
            >
              {tab.count}
            </span>
          </Link>
        ))}
      </div>

      {inquiries.length === 0 ? (
        <div className="bg-rose-950/20 border border-rose-900/30 rounded-2xl p-12 text-center">
          <p className="text-rose-300">
            {activeStatus === 'all' ? t('noInquiries') : t('noInquiriesFilter')}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {inquiries.map((inquiry) => (
            <div
              key={inquiry._id}
              className="bg-black/40 border border-rose-900/30 rounded-xl overflow-hidden flex flex-col transition-all hover:border-rose-700/50 hover:shadow-lg hover:shadow-rose-900/10"
            >
              <div className="p-5 flex-1 flex flex-col gap-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{inquiry.name}</h3>
                    <a
                      href={`mailto:${inquiry.email}`}
                      className="inline-flex items-center gap-1.5 text-sm text-rose-200/70 hover:text-rose-200 transition-colors"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      {inquiry.email}
                    </a>
                  </div>
                  <span
                    className={`shrink-0 px-2.5 py-1 rounded-md text-xs font-semibold ${STATUS_META[inquiry.status].badgeClass}`}
                  >
                    {statusLabel(inquiry.status)}
                  </span>
                </div>

                {inquiry.phone && (
                  <a
                    href={`tel:${inquiry.phone}`}
                    className="inline-flex items-center gap-1.5 text-sm text-rose-200/70 hover:text-rose-200 transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    {inquiry.phone}
                  </a>
                )}

                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="inline-flex items-center gap-1.5 bg-rose-950/50 text-rose-300 px-2 py-1 rounded border border-rose-900/50">
                    <Briefcase className="w-3.5 h-3.5" /> {inquiry.service}
                  </span>
                  {inquiry.budget && (
                    <span className="inline-flex items-center gap-1.5 bg-rose-950/50 text-rose-300 px-2 py-1 rounded border border-rose-900/50">
                      <Wallet className="w-3.5 h-3.5" /> {inquiry.budget}
                    </span>
                  )}
                  {inquiry.timeline && (
                    <span className="inline-flex items-center gap-1.5 bg-rose-950/50 text-rose-300 px-2 py-1 rounded border border-rose-900/50">
                      <Clock className="w-3.5 h-3.5" /> {inquiry.timeline}
                    </span>
                  )}
                </div>

                {inquiry.message && (
                  <p className="text-sm text-rose-100/70 leading-relaxed whitespace-pre-wrap">
                    {inquiry.message}
                  </p>
                )}

                <div className="mt-auto pt-3 border-t border-rose-900/30 flex items-center justify-between gap-3">
                  <p className="text-xs text-rose-200/40">{formatDate(inquiry.createdAt)}</p>
                  <div className="flex items-center gap-2">
                    <select
                      value={inquiry.status}
                      disabled={busyId === inquiry._id}
                      onChange={(e) => handleStatusChange(inquiry._id, e.target.value as InquiryStatus)}
                      className="bg-rose-950/60 text-rose-200 text-xs border border-rose-900/50 rounded-lg px-2 py-1.5 outline-none focus:border-rose-500/50 appearance-none disabled:opacity-50 cursor-pointer"
                    >
                      <option value="new">{t('statusNew')}</option>
                      <option value="contacted">{t('statusContacted')}</option>
                      <option value="closed">{t('statusClosed')}</option>
                    </select>

                    {inquiry.status === 'new' && (
                      <button
                        type="button"
                        disabled={busyId === inquiry._id}
                        onClick={() => handleStatusChange(inquiry._id, 'contacted')}
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors disabled:opacity-50"
                      >
                        {busyId === inquiry._id && deletingId !== inquiry._id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4" />
                        )}
                        {t('markContacted')}
                      </button>
                    )}

                    <button
                      type="button"
                      disabled={deletingId === inquiry._id}
                      onClick={() => handleDelete(inquiry)}
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-red-400 hover:text-red-300 transition-colors disabled:opacity-50"
                    >
                      {deletingId === inquiry._id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                      {t('delete')}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {inquiries.length > 0 && (
        <p className="flex items-center justify-center gap-2 text-xs text-rose-200/40">
          <Inbox className="w-3.5 h-3.5" />
          {t('showing', { count: inquiries.length, total: stats.total })}
        </p>
      )}
    </div>
  );
}