'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import toast from 'react-hot-toast';
import { Plus, Trash2, Loader2, Tag } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ServiceCategoriesManager() {
  const t = useTranslations('Admin.servicesPage');
  const locale = useLocale();
  const router = useRouter();
  
  const [categories, setCategories] = useState<any[]>([]);
  const [newCategory, setNewCategory] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/admin/service-categories');
      const json = await res.json();
      if (json.success) {
        setCategories(json.data);
      } else {
        toast.error(locale === 'ar' ? 'فشل تحميل تصنيفات الخدمات' : 'Failed to load service categories');
      }
    } catch (err) {
      toast.error(locale === 'ar' ? 'فشل تحميل تصنيفات الخدمات' : 'Failed to load service categories');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/admin/service-categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCategory.trim() }),
      });
      const json = await res.json();
      if (json.success) {
        setCategories([...categories, json.data].sort((a, b) => a.name.localeCompare(b.name)));
        setNewCategory('');
        toast.success(locale === 'ar' ? 'تمت إضافة التصنيف بنجاح' : 'Service category added');
        router.refresh();
      } else {
        toast.error(json.error || (locale === 'ar' ? 'فشل إضافة التصنيف' : 'Failed to add category'));
      }
    } catch (err) {
      toast.error(locale === 'ar' ? 'فشل إضافة التصنيف' : 'Failed to add category');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    const confirmMessage = locale === 'ar'
      ? `هل أنت متأكد من حذف تصنيف "${name}"؟ (لن يتم حذف أي خدمات مرتبطة به)`
      : `Are you sure you want to delete "${name}"? (Associated services will not be deleted)`;

    if (!window.confirm(confirmMessage)) return;

    try {
      const res = await fetch(`/api/admin/service-categories/${id}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (json.success) {
        setCategories(categories.filter((c) => c._id !== id));
        toast.success(locale === 'ar' ? 'تم حذف التصنيف' : 'Category deleted');
        router.refresh();
      } else {
        toast.error(json.error || (locale === 'ar' ? 'فشل حذف التصنيف' : 'Failed to delete category'));
      }
    } catch (err) {
      toast.error(locale === 'ar' ? 'فشل حذف التصنيف' : 'Failed to delete category');
    }
  };

  if (isLoading) {
    return (
      <div className="bg-black/40 border border-rose-900/30 rounded-2xl p-6 flex justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-rose-500" />
      </div>
    );
  }

  return (
    <div className="bg-black/40 border border-rose-900/30 rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <Tag className="w-5 h-5 text-rose-500" />
        <h2 className="text-xl font-semibold text-white">
          {locale === 'ar' ? 'إدارة تصنيفات الخدمات' : 'Service Categories'}
        </h2>
      </div>
      
      <form onSubmit={handleAdd} className="flex gap-3 mb-6">
        <input
          type="text"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          placeholder={locale === 'ar' ? 'اسم التصنيف الجديد (مثال: متاجر إلكترونية)' : 'New category name (e.g. E-Commerce)'}
          className="flex-1 bg-rose-950/20 border border-rose-900/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-rose-500 transition-colors placeholder:text-rose-200/40 text-sm"
          maxLength={50}
        />
        <button
          type="submit"
          disabled={isSubmitting || !newCategory.trim()}
          className="flex items-center gap-2 bg-rose-600 hover:bg-rose-500 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          {locale === 'ar' ? 'إضافة تصنيف' : 'Add Category'}
        </button>
      </form>

      <div className="flex flex-wrap gap-2">
        {categories.length === 0 ? (
          <p className="text-sm text-rose-200/50 italic">
            {locale === 'ar' ? 'لم تتم إضافة أي تصنيفات للخدمات بعد.' : 'No service categories added yet.'}
          </p>
        ) : (
          categories.map((cat, i: number) => {
            const displayName = locale === 'ar' ? (cat.nameAr || cat.name) : (cat.nameEn || cat.name);
            return (
              <div
                key={String(cat._id ?? cat.name ?? `scat-${i}`)}
                className="flex items-center gap-2 bg-rose-950/30 border border-rose-900/50 rounded-full pl-4 pr-2 rtl:pl-2 rtl:pr-4 py-1.5 group"
              >
                <span className="text-sm text-rose-200">{displayName}</span>
                {cat.nameEn && cat.nameAr && cat.nameEn !== cat.nameAr && (
                  <span className="text-[10px] text-rose-400/60 font-mono">
                    ({locale === 'ar' ? cat.nameEn : cat.nameAr})
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => handleDelete(cat._id, cat.name)}
                  className="p-1.5 text-rose-400 hover:text-red-400 hover:bg-red-400/10 rounded-full transition-colors opacity-50 group-hover:opacity-100"
                  title={locale === 'ar' ? 'حذف التصنيف' : 'Delete Category'}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

