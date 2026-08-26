'use client';

import { useState, useEffect } from 'react';
import { Loader2, Plus, Trash2, Save } from 'lucide-react';
import toast from 'react-hot-toast';

const PLATFORMS = [
  'instagram',
  'behance',
  'dribbble',
  'linkedin',
  'twitter',
  'facebook',
  'github',
  'youtube',
  'email',
  'website',
];

type Social = { platform: string; url: string; label?: string };

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [siteName, setSiteName] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [copyright, setCopyright] = useState('');
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [socials, setSocials] = useState<Social[]>([]);
  const [usefulLinks, setUsefulLinks] = useState<{ label: string; url: string }[]>([]);

  async function fetchData() {
    try {
      const res = await fetch('/api/global-settings');
      const data = await res.json();
      if (data.success && data.data) {
        const s = data.data;
        setSiteName(s.siteName || '');
        setLogoUrl(s.logoUrl || '');
        setEmail(s.email || '');
        setWhatsapp(s.whatsapp || '');
        setCopyright(s.copyright || '');
        setSeoTitle(s.seoTitle || '');
        setSeoDescription(s.seoDescription || '');
        setSocials(Array.isArray(s.socials) ? s.socials : []);
        setUsefulLinks(Array.isArray(s.usefulLinks) ? s.usefulLinks : []);
      }
    } catch {
      toast.error('Failed to load settings');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    // Standard mount-time data fetch; state is only set after await.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/global-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ siteName, logoUrl, email, whatsapp, copyright, seoTitle, seoDescription, socials, usefulLinks }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to save');
      toast.success('Settings saved!');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
      </div>
    );
  }

  const inputClass =
    'w-full bg-black/40 border border-rose-900/30 rounded-lg px-4 py-2.5 text-white placeholder-rose-200/30 outline-none focus:border-rose-500 transition-colors';

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-12">
      <div>
        <h1 className="text-3xl font-light text-white mb-2 font-serif">Global Settings</h1>
        <p className="text-rose-200/60">
          Manage the site-wide content shown in the footer and across the public site.
        </p>
      </div>

      <section className="bg-black/40 p-6 rounded-2xl border border-rose-900/30 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs uppercase tracking-widest text-rose-300/70 mb-2">Site Name</label>
            <input className={inputClass} value={siteName} onChange={(e) => setSiteName(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest text-rose-300/70 mb-2">Logo URL</label>
            <input className={inputClass} value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} placeholder="/portfolio-logo.jpeg" />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest text-rose-300/70 mb-2">Contact Email</label>
            <input className={inputClass} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="studio@example.com" />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest text-rose-300/70 mb-2">WhatsApp Number</label>
            <input className={inputClass} value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="9665xxxxxxxx (country code + number)" />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest text-rose-300/70 mb-2">Copyright Text</label>
            <input className={inputClass} value={copyright} onChange={(e) => setCopyright(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest text-rose-300/70 mb-2">SEO Title</label>
            <input className={inputClass} value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} placeholder="Default site title for search engines" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs uppercase tracking-widest text-rose-300/70 mb-2">SEO Description</label>
            <textarea className={`${inputClass} min-h-[80px] resize-y`} value={seoDescription} onChange={(e) => setSeoDescription(e.target.value)} placeholder="Default site description for search engines" />
          </div>
        </div>
      </section>

      <section className="bg-black/40 p-6 rounded-2xl border border-rose-900/30">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-rose-100">Social Links</h2>
          <button
            onClick={() => setSocials([...socials, { platform: 'instagram', url: '' }])}
            className="inline-flex items-center gap-2 rounded-lg border border-rose-900/50 px-4 py-2 text-sm text-rose-200 hover:bg-rose-950/30 transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Social Link
          </button>
        </div>

        <div className="space-y-3">
          {socials.length === 0 && (
            <p className="text-rose-200/40 text-sm">No social links yet. Add one above.</p>
          )}
          {socials.map((s, i) => (
            <div key={i} className="flex items-center gap-3">
              <input
                list="social-platforms"
                value={s.platform}
                onChange={(e) => {
                  const next = [...socials];
                  next[i] = { ...s, platform: e.target.value };
                  setSocials(next);
                }}
                className="bg-black/40 border border-rose-900/30 rounded-lg px-3 py-2.5 text-white outline-none focus:border-rose-500 w-44"
                placeholder="platform (e.g. instagram)"
              />
              <input
                className={inputClass}
                value={s.url}
                onChange={(e) => {
                  const next = [...socials];
                  next[i] = { ...s, url: e.target.value };
                  setSocials(next);
                }}
                placeholder="https://..."
              />
              <button
                onClick={() => setSocials(socials.filter((_, index) => index !== i))}
                className="p-2.5 rounded-lg text-red-400 hover:bg-red-950/40 transition-colors"
                aria-label="Remove"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        <datalist id="social-platforms">
          {PLATFORMS.map((p) => (
            <option key={p} value={p} />
          ))}
        </datalist>

        <p className="text-xs text-rose-200/40">
          Type any platform name. Known brands (instagram, behance, dribbble, linkedin, twitter, facebook, github, youtube) show their logo; any other name shows that site&apos;s favicon next to the link.
        </p>
      </section>

      <section className="bg-black/40 p-6 rounded-2xl border border-rose-900/30">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-rose-100">Useful Links</h2>
          <button
            onClick={() => setUsefulLinks([...usefulLinks, { label: '', url: '' }])}
            className="inline-flex items-center gap-2 rounded-lg border border-rose-900/50 px-4 py-2 text-sm text-rose-200 hover:bg-rose-950/30 transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Link
          </button>
        </div>

        <div className="space-y-3">
          {usefulLinks.length === 0 && (
            <p className="text-rose-200/40 text-sm">No useful links yet. Add one above.</p>
          )}
          {usefulLinks.map((l, i) => (
            <div key={i} className="flex items-center gap-3">
              <input
                className={inputClass}
                value={l.label}
                onChange={(e) => {
                  const next = [...usefulLinks];
                  next[i] = { ...l, label: e.target.value };
                  setUsefulLinks(next);
                }}
                placeholder="Label (e.g. Coupons)"
              />
              <input
                className={inputClass}
                value={l.url}
                onChange={(e) => {
                  const next = [...usefulLinks];
                  next[i] = { ...l, url: e.target.value };
                  setUsefulLinks(next);
                }}
                placeholder="https://..."
              />
              <button
                onClick={() => setUsefulLinks(usefulLinks.filter((_, index) => index !== i))}
                className="p-2.5 rounded-lg text-red-400 hover:bg-red-950/40 transition-colors"
                aria-label="Remove"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </section>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-rose-600 to-rose-900 hover:from-rose-500 hover:to-rose-800 text-white px-6 py-2.5 rounded-lg font-medium transition-all shadow-lg disabled:opacity-60"
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Settings
        </button>
      </div>
    </div>
  );
}
