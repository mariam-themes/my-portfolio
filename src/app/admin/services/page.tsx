'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, ArrowUp, ArrowDown, Briefcase, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import ServiceForm from '@/components/admin/ServiceForm';
import DeleteItemButton from '@/components/admin/DeleteItemButton';

export default function ServicesPage() {
  const t = useTranslations('Admin.servicesPage');
  const router = useRouter();
  const [services, setServices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState<any | null>(null);
  const [isCreating, setIsCreating] = useState(false);


  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [servicesRes] = await Promise.all([
        fetch('/api/admin/services'),
      ]);
      
      const servicesData = await servicesRes.json();
      if (servicesData.success) {
        setServices(servicesData.data);
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
          {t('title')}
        </h1>
        <p className="text-rose-200/60">{t('subtitle')}</p>
      </div>

      {/* Services List */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-rose-100 flex items-center gap-2">
            {t('list')}
          </h2>
          {(!isCreating && !isEditing) && (
            <button
              onClick={() => setIsCreating(true)}
              className="flex items-center gap-2 bg-rose-600 hover:bg-rose-500 text-white px-4 py-2 rounded-lg text-sm transition-colors"
            >
              <Plus className="w-4 h-4" /> {t('addService')}
            </button>
          )}
        </div>

        {isCreating && (
          <div className="mb-8">
            <h3 className="text-lg font-medium text-rose-200 mb-4">{t('addNew')}</h3>
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
            <h3 className="text-lg font-medium text-rose-200 mb-4">{t('editTitle')}</h3>
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
                {t('noServices')}
              </div>
            ) : (
              services.map((service, index) => (
                <div key={String(service._id ?? service.slug ?? service.title ?? `svc-${index}`)} className="flex items-center justify-between p-4 bg-black/40 border border-rose-900/30 rounded-xl backdrop-blur-sm group hover:border-rose-500/50 transition-colors">
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
                      onSuccess={() => setServices((prev) => prev.filter((s) => s._id !== service._id))}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </section>



    </div>
  );
}
