'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, ArrowUp, ArrowDown, Briefcase, Loader2, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import ServiceForm from '@/components/admin/ServiceForm';
import ImageUpload from '@/components/admin/ImageUpload';
import DeleteItemButton from '@/components/admin/DeleteItemButton';

export default function ServicesPage() {
  const router = useRouter();
  const [services, setServices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState<any | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Other Projects state
  const [otherProjectsData, setOtherProjectsData] = useState<any[]>([]);
  const [isSavingOther, setIsSavingOther] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [servicesRes, sectionsRes] = await Promise.all([
        fetch('/api/admin/services'),
        fetch('/api/admin/section-layout'),
      ]);
      
      const servicesData = await servicesRes.json();
      if (servicesData.success) {
        setServices(servicesData.data);
      }

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
      toast.error('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const moveService = async (index: number, direction: 'up' | 'down') => {
    const newServices = [...services];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex < 0 || targetIndex >= newServices.length) return;

    // Swap elements visually
    const temp = newServices[index];
    newServices[index] = newServices[targetIndex];
    newServices[targetIndex] = temp;

    // Update their order property
    newServices[index].order = index;
    newServices[targetIndex].order = targetIndex;

    setServices(newServices);

    try {
      // Background save for both
      await Promise.all([
        fetch(`/api/admin/services/${newServices[index]._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order: newServices[index].order })
        }),
        fetch(`/api/admin/services/${newServices[targetIndex]._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order: newServices[targetIndex].order })
        })
      ]);
      router.refresh();
    } catch (err) {
      toast.error('Failed to update order');
      fetchData(); // Revert on failure
    }
  };

  const handleSaveOtherProjects = async () => {
    setIsSavingOther(true);
    try {
      // First, we need to get the current layout to just update 'other-projects'
      const sectionsRes = await fetch('/api/admin/section-layout');
      const sectionsData = await sectionsRes.json();
      if (!sectionsData.success) throw new Error('Failed to get layout');

      // Map existing and update only 'other-projects' content
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
          <Briefcase className="text-rose-500" />
          Services Manager
        </h1>
        <p className="text-rose-200/60">Manage your offerings and the 'Other Projects' gallery section.</p>
      </div>

      {/* Services List */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-rose-100 flex items-center gap-2">
            Services List
          </h2>
          {(!isCreating && !isEditing) && (
            <button
              onClick={() => setIsCreating(true)}
              className="flex items-center gap-2 bg-rose-600 hover:bg-rose-500 text-white px-4 py-2 rounded-lg text-sm transition-colors"
            >
              <Plus className="w-4 h-4" /> Add Service
            </button>
          )}
        </div>

        {isCreating && (
          <div className="mb-8">
            <h3 className="text-lg font-medium text-rose-200 mb-4">Add New Service</h3>
            <ServiceForm
              initialData={{ order: services.length }}
              onCancel={() => setIsCreating(false)}
              onSuccess={() => {
                setIsCreating(false);
                fetchData();
              }}
            />
          </div>
        )}

        {isEditing && (
          <div className="mb-8">
            <h3 className="text-lg font-medium text-rose-200 mb-4">Edit Service</h3>
            <ServiceForm
              initialData={isEditing}
              onCancel={() => setIsEditing(null)}
              onSuccess={() => {
                setIsEditing(null);
                fetchData();
              }}
            />
          </div>
        )}

        {!isCreating && !isEditing && (
          <div className="grid grid-cols-1 gap-4">
            {services.length === 0 ? (
              <div className="p-8 text-center bg-black/20 rounded-2xl border border-rose-900/30 text-rose-300">
                No services added yet.
              </div>
            ) : (
              services.map((service, index) => (
                <div key={service._id} className="flex items-center justify-between p-4 bg-black/40 border border-rose-900/30 rounded-xl backdrop-blur-sm group hover:border-rose-500/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col gap-1">
                      <button 
                        onClick={() => moveService(index, 'up')}
                        disabled={index === 0}
                        className="text-rose-500/50 hover:text-rose-300 disabled:opacity-20 transition-colors"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => moveService(index, 'down')}
                        disabled={index === services.length - 1}
                        className="text-rose-500/50 hover:text-rose-300 disabled:opacity-20 transition-colors"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>
                    </div>
                    <div>
                      <h4 className="text-lg font-medium text-rose-100 flex items-center gap-2">
                        {service.title} 
                        {service.translations?.en?.title && (
                          <span className="text-[10px] px-2 py-0.5 bg-rose-900/50 rounded-full text-rose-300">
                            {service.translations.en.title}
                          </span>
                        )}
                      </h4>
                      <p className="text-sm text-rose-200/60 mt-1 line-clamp-1">{service.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {service.image && (
                      <div className="w-16 h-12 rounded-lg overflow-hidden border border-rose-900/30 mr-4">
                        <img src={service.image} alt={service.title} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <button
                      onClick={() => setIsEditing(service)}
                      className="p-2 text-rose-400 hover:text-white hover:bg-rose-900/50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <DeleteItemButton
                      itemId={service._id}
                      endpoint="/api/admin/services"
                      confirmText={`Are you sure you want to delete ${service.title}?`}
                      successText="Service deleted successfully"
                      failedText="Failed to delete service"
                      deleteText="Delete"
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </section>

      {/* Other Projects Image Uploader */}
      <section className="pt-8 border-t border-rose-900/30">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-xl font-semibold text-rose-100 flex items-center gap-2 mb-2">
              <ImageIcon className="w-5 h-5 text-rose-500" />
              "Other Projects" Gallery
            </h2>
            <p className="text-sm text-rose-200/60">Upload images for the Other Projects section on the homepage.</p>
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
