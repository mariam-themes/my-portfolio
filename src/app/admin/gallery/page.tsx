'use client';

import { useState, useEffect } from 'react';
import { Loader2, Image as ImageIcon, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import ImageUpload from '@/components/admin/ImageUpload';

export default function GalleryPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [otherProjectsData, setOtherProjectsData] = useState<any[]>([]);
  const [isSavingOther, setIsSavingOther] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const sectionsRes = await fetch('/api/admin/section-layout');
      const sectionsData = await sectionsRes.json();
      
      if (sectionsData.success) {
        const opSection = sectionsData.data.find((s: any) => s.id === 'other-projects');
        if (opSection && opSection.content?.gallery) {
          setOtherProjectsData(opSection.content.gallery);
        } else {
          setOtherProjectsData([]);
        }
      }
    } catch (err) {
      toast.error('Failed to load gallery data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveOtherProjects = async () => {
    setIsSavingOther(true);
    try {
      const sectionsRes = await fetch('/api/admin/section-layout');
      const sectionsData = await sectionsRes.json();
      if (!sectionsData.success) throw new Error('Failed to get layout');

      const payload = sectionsData.data.map((s: any) => {
        if (s.id === 'other-projects') {
          return { ...s, content: { gallery: otherProjectsData } };
        }
        return s;
      });

      const response = await fetch('/api/admin/section-layout', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sections: payload }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      
      toast.success('Other Projects gallery updated!');
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update gallery');
    } finally {
      setIsSavingOther(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-12">
      <div>
        <h1 className="text-3xl font-light text-white mb-2 font-serif flex items-center gap-3">
          <ImageIcon className="text-rose-500" />
          Gallery Manager
        </h1>
        <p className="text-rose-200/60">Upload images for the 'Other Projects' gallery section on the homepage.</p>
      </div>

      <section>
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-xl font-semibold text-rose-100 flex items-center gap-2 mb-2">
              Gallery Images
            </h2>
          </div>
          <button
            onClick={handleSaveOtherProjects}
            disabled={isSavingOther}
            className="flex items-center gap-2 bg-gradient-to-r from-rose-600 to-rose-900 hover:from-rose-500 hover:to-rose-800 text-white px-6 py-2.5 rounded-lg font-medium transition-all shadow-lg text-sm"
          >
            {isSavingOther ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Gallery Updates'}
          </button>
        </div>

        <div className="bg-black/40 p-6 rounded-2xl border border-rose-900/30 backdrop-blur-xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {otherProjectsData.map((url, i) => (
              <div key={i} className="relative group rounded-xl overflow-hidden border border-rose-900/50 aspect-[4/3]">
                <img src={url} alt={`Gallery ${i}`} className="w-full h-full object-cover" />
                <button
                  onClick={() => setOtherProjectsData(otherProjectsData.filter((_, index) => index !== i))}
                  className="absolute top-2 right-2 p-2 bg-red-950/80 text-red-400 hover:text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            <div className="aspect-[4/3] flex items-center justify-center p-4 border-2 border-dashed border-rose-900/50 rounded-xl bg-rose-950/10 hover:bg-rose-950/30 transition-colors">
              <div className="w-full">
                <ImageUpload
                  label="Add Image"
                  value=""
                  onChange={(url) => {
                    if (url) setOtherProjectsData([...otherProjectsData, url]);
                  }}
                  folder="other-projects"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
