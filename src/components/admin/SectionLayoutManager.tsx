'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslations } from 'next-intl';
import { Eye, EyeOff, Save } from 'lucide-react';

interface SectionRow {
  id: string;
  labelKey: string;
  isVisible: boolean;
  content?: unknown;
}

export default function SectionLayoutManager({
  initialSections,
}: {
  initialSections: SectionRow[];
}) {
  const t = useTranslations('Admin.homeSections');
  const [sections, setSections] = useState<SectionRow[]>(initialSections);
  const [saving, setSaving] = useState(false);

  const toggle = (id: string) => {
    setSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isVisible: !s.isVisible } : s))
    );
  };

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/section-layout', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sections: sections.map((s) => ({
            id: s.id,
            isVisible: s.isVisible,
          })),
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Failed to save');
      toast.success(t('saved'));
    } catch (error: any) {
      toast.error(error.message || t('failed'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-black/40 border border-rose-900/30 rounded-2xl overflow-hidden">
        <div className="grid grid-cols-[1fr_auto_auto] items-center gap-4 px-6 py-4 border-b border-rose-900/30 text-xs uppercase tracking-widest text-rose-300/70 font-semibold">
          <span>{t('section')}</span>
          <span className="w-24 text-center">{t('visibility')}</span>
          <span className="w-8" />
        </div>

        {sections.map((s) => (
          <div
            key={s.id}
            className="grid grid-cols-[1fr_auto_auto] items-center gap-4 px-6 py-5 border-b border-rose-900/20 last:border-b-0 hover:bg-white/[0.03] transition-colors"
          >
            <div>
              <p className="text-white font-medium">{t(s.labelKey)}</p>
              <p className="text-rose-200/50 text-sm mt-0.5 font-mono">
                /{s.id}
              </p>
            </div>

            <div className="w-24 flex justify-center">
              <button
                type="button"
                role="switch"
                aria-checked={s.isVisible}
                aria-label={t(s.labelKey)}
                onClick={() => toggle(s.id)}
                className={`relative w-14 h-8 rounded-full transition-colors duration-300 ${
                  s.isVisible
                    ? 'bg-gradient-to-r from-rose-500 to-rose-700 shadow-lg shadow-rose-900/40'
                    : 'bg-rose-950/60 border border-rose-900/50'
                }`}
              >
                <span
                  className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow transition-all duration-300 ${
                    s.isVisible ? 'left-7' : 'left-1'
                  }`}
                />
              </button>
            </div>

            <div className="w-8 flex justify-center">
              {s.isVisible ? (
                <Eye className="w-4 h-4 text-rose-300/70" />
              ) : (
                <EyeOff className="w-4 h-4 text-rose-200/30" />
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-rose-600 to-rose-900 hover:from-rose-500 hover:to-rose-800 text-white px-6 py-2.5 rounded-lg font-medium transition-all shadow-lg shadow-rose-900/20 disabled:opacity-60"
        >
          <Save className="w-4 h-4" />
          {saving ? t('saving') : t('save')}
        </button>
      </div>
    </div>
  );
}
