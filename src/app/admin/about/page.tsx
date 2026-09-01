'use client';

import { useState, useEffect } from 'react';
import { Loader2, Plus, Trash2, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTranslations } from 'next-intl';
import ImageUpload from '@/components/admin/ImageUpload';
import TiptapEditor from '@/components/admin/TiptapEditor';

interface IExperience {
  role: string;
  company: string;
  duration: string;
  description: string;
}

export default function AboutMePage() {
  const t = useTranslations('Admin.aboutPage');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [bio, setBio] = useState('');
  const [photo, setPhoto] = useState('');
  const [cvLink, setCvLink] = useState('');
  const [skillsStr, setSkillsStr] = useState('');
  const [experience, setExperience] = useState<IExperience[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/about-me');
        const data = await res.json();
        if (data.success && data.data) {
          const d = data.data;
          setBio(d.bio || '');
          setPhoto(d.photo || '');
          setCvLink(d.cvLink || '');
          setSkillsStr(Array.isArray(d.skills) ? d.skills.join(', ') : '');
          setExperience(Array.isArray(d.experience) ? d.experience : []);
        }
      } catch {
        toast.error('Failed to load about me data');
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const skills = skillsStr.split(',').map((s) => s.trim()).filter(Boolean);
      const res = await fetch('/api/about-me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bio,
          photo,
          cvLink,
          skills,
          experience,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to save');
      toast.success(t('saved'));
    } catch (err) {
      toast.error(t('failed'));
    } finally {
      setIsSaving(false);
    }
  };

  const addExperience = () => {
    setExperience([...experience, { role: '', company: '', duration: '', description: '' }]);
  };

  const updateExperience = (index: number, field: keyof IExperience, value: string) => {
    const next = [...experience];
    next[index] = { ...next[index], [field]: value };
    setExperience(next);
  };

  const removeExperience = (index: number) => {
    setExperience(experience.filter((_, i) => i !== index));
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
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">{t('title')}</h1>
        <p className="text-rose-200/60 mt-1">{t('subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <section className="bg-black/40 p-6 rounded-2xl border border-rose-900/30 space-y-4">
            <h2 className="text-xl font-semibold text-rose-100">{t('bioLabel')}</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-widest text-rose-300/70 mb-2">{t('cvLabel')}</label>
                <input
                  className={inputClass}
                  value={cvLink}
                  onChange={(e) => setCvLink(e.target.value)}
                  placeholder={t('cvPh')}
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-widest text-rose-300/70 mb-2">{t('skillsLabel')}</label>
                <input
                  className={inputClass}
                  value={skillsStr}
                  onChange={(e) => setSkillsStr(e.target.value)}
                  placeholder={t('skillsPh')}
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-widest text-rose-300/70 mb-2">{t('bioLabel')}</label>
                <div className="rounded-xl overflow-hidden border border-rose-900/30">
                  <TiptapEditor content={bio} onChange={setBio} />
                </div>
              </div>
            </div>
          </section>

          <section className="bg-black/40 p-6 rounded-2xl border border-rose-900/30">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-rose-100">{t('experienceLabel')}</h2>
              <button
                onClick={addExperience}
                className="inline-flex items-center gap-2 rounded-lg border border-rose-900/50 px-4 py-2 text-sm text-rose-200 hover:bg-rose-950/30 transition-colors"
              >
                <Plus className="w-4 h-4" /> {t('addExp')}
              </button>
            </div>

            <div className="space-y-6">
              {experience.length === 0 && (
                <p className="text-rose-200/40 text-sm">No experience entries yet. Add one above.</p>
              )}
              {experience.map((exp, i) => (
                <div key={i} className="relative bg-rose-950/10 p-5 rounded-xl border border-rose-900/30 space-y-4">
                  <button
                    onClick={() => removeExperience(i)}
                    className="absolute top-4 right-4 p-2 rounded-lg text-red-400 hover:bg-red-950/40 transition-colors"
                    aria-label="Remove"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-10">
                    <div>
                      <label className="block text-xs text-rose-300/70 mb-1">{t('roleLabel')}</label>
                      <input
                        className={inputClass}
                        value={exp.role}
                        onChange={(e) => updateExperience(i, 'role', e.target.value)}
                        placeholder={t('rolePh')}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-rose-300/70 mb-1">{t('companyLabel')}</label>
                      <input
                        className={inputClass}
                        value={exp.company}
                        onChange={(e) => updateExperience(i, 'company', e.target.value)}
                        placeholder={t('companyPh')}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs text-rose-300/70 mb-1">{t('durationLabel')}</label>
                      <input
                        className={inputClass}
                        value={exp.duration}
                        onChange={(e) => updateExperience(i, 'duration', e.target.value)}
                        placeholder={t('durationPh')}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs text-rose-300/70 mb-1">{t('descLabel')}</label>
                      <textarea
                        className={`${inputClass} min-h-[80px] resize-y`}
                        value={exp.description}
                        onChange={(e) => updateExperience(i, 'description', e.target.value)}
                        placeholder={t('descPh')}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="bg-black/40 p-6 rounded-2xl border border-rose-900/30 sticky top-6">
            <h2 className="text-xl font-semibold text-rose-100 mb-4">{t('photo')}</h2>
            <ImageUpload
              label="Upload a high-quality portrait"
              value={photo}
              onChange={setPhoto}
              folder="portfolio_about"
              accept="image/*"
            />

            <div className="mt-8 pt-6 border-t border-rose-900/30">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-rose-600 to-rose-900 hover:from-rose-500 hover:to-rose-800 text-white px-6 py-3 rounded-xl font-medium transition-all shadow-lg disabled:opacity-60"
              >
                {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                {isSaving ? t('saving') : t('save')}
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
