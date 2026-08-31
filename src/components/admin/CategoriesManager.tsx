'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import { Plus, Trash2, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CategoriesManager() {
  const t = useTranslations('Admin.projectsPage');
  const router = useRouter();
  
  const [categories, setCategories] = useState<any[]>([]);
  const [newCategory, setNewCategory] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/admin/categories');
      const json = await res.json();
      if (json.success) {
        setCategories(json.data);
      } else {
        toast.error(t('failedLoadCategories'));
      }
    } catch (err) {
      toast.error(t('failedLoadCategories'));
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
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCategory.trim() }),
      });
      const json = await res.json();
      if (json.success) {
        setCategories([...categories, json.data].sort((a, b) => a.name.localeCompare(b.name)));
        setNewCategory('');
        router.refresh();
      } else {
        toast.error(json.error || 'Failed to add category');
      }
    } catch (err) {
      toast.error('Failed to add category');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(t('deleteConfirm'))) return;

    try {
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (json.success) {
        setCategories(categories.filter((c) => c._id !== id));
        router.refresh();
      } else {
        toast.error(json.error || 'Failed to delete category');
      }
    } catch (err) {
      toast.error('Failed to delete category');
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
      <h2 className="text-xl font-semibold text-white mb-4">{t('manageCategories')}</h2>
      
      <form onSubmit={handleAdd} className="flex gap-3 mb-6">
        <input
          type="text"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          placeholder={t('categoryName')}
          className="flex-1 bg-rose-950/20 border border-rose-900/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-rose-500 transition-colors"
          maxLength={50}
        />
        <button
          type="submit"
          disabled={isSubmitting || !newCategory.trim()}
          className="flex items-center gap-2 bg-rose-600 hover:bg-rose-500 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          {t('add')}
        </button>
      </form>

      <div className="flex flex-wrap gap-2">
        {categories.length === 0 ? (
          <p className="text-sm text-rose-200/50 italic">No categories added yet.</p>
        ) : (
          categories.map((cat, i: number) => (
            <div
              key={String(cat._id ?? cat.name ?? `cat-${i}`)}
              className="flex items-center gap-2 bg-rose-950/30 border border-rose-900/50 rounded-full pl-4 pr-2 py-1.5 group"
            >
              <span className="text-sm text-rose-200">{cat.name}</span>
              <button
                type="button"
                onClick={() => handleDelete(cat._id)}
                className="p-1.5 text-rose-400 hover:text-red-400 hover:bg-red-400/10 rounded-full transition-colors opacity-50 group-hover:opacity-100"
                title={t('delete')}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
