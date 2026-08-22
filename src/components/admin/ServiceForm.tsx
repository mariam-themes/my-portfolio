'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, Plus, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import ImageUpload from '@/components/admin/ImageUpload';

const serviceSchema = z.object({
  title: z.string().min(2, 'Title is required'),
  description: z.string().min(5, 'Description is required'),
  image: z.string().min(1, 'Please upload an image'),
  tags: z.array(z.string()),
  order: z.number().int(),
});

type ServiceFormValues = z.infer<typeof serviceSchema>;

interface ServiceFormProps {
  initialData?: any;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function ServiceForm({ initialData, onSuccess, onCancel }: ServiceFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [tagInput, setTagInput] = useState('');

  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      image: initialData?.image || '',
      tags: initialData?.tags || [],
      order: initialData?.order ?? 0,
    },
  });

  const tags = form.watch('tags');

  const handleAddTag = () => {
    const val = tagInput.trim();
    if (val && !tags.includes(val)) {
      form.setValue('tags', [...tags, val], { shouldValidate: true });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    form.setValue(
      'tags',
      tags.filter((t) => t !== tagToRemove),
      { shouldValidate: true }
    );
  };

  const onSubmit = async (data: ServiceFormValues) => {
    setIsLoading(true);
    try {
      const url = initialData?._id ? `/api/admin/services/${initialData._id}` : '/api/admin/services';
      const method = initialData?._id ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to save service');

      toast.success(initialData?._id ? 'Service updated successfully' : 'Service created successfully');
      router.refresh();
      if (onSuccess) onSuccess();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 bg-black/40 p-6 rounded-2xl border border-rose-900/30 backdrop-blur-xl">
      <div className="space-y-1">
        <label className="text-xs font-medium text-rose-200">Title (Auto-translated to EN if AR)</label>
        <input
          {...form.register('title')}
          className="w-full bg-rose-950/20 border border-rose-900/50 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-rose-500 transition-colors"
          placeholder="e.g. Visual Identity"
        />
        {form.formState.errors.title && <p className="text-red-400 text-xs">{form.formState.errors.title.message}</p>}
      </div>

      <div className="space-y-1">
        <label className="text-xs font-medium text-rose-200">Description</label>
        <textarea
          {...form.register('description')}
          rows={3}
          className="w-full bg-rose-950/20 border border-rose-900/50 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-rose-500 transition-colors resize-none"
          placeholder="Service details..."
        />
        {form.formState.errors.description && <p className="text-red-400 text-xs">{form.formState.errors.description.message}</p>}
      </div>

      <div className="space-y-2">
        <label className="text-xs font-medium text-rose-200">Tags (e.g. Logo Systems, Brand Books)</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddTag();
              }
            }}
            placeholder="Add a tag..."
            className="flex-1 bg-rose-950/20 border border-rose-900/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-rose-500 transition-colors text-sm"
          />
          <button
            type="button"
            onClick={handleAddTag}
            className="bg-rose-900/50 hover:bg-rose-800 text-rose-200 px-4 py-2 rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {tags.map((tag) => (
            <span key={tag} className="flex items-center gap-1 bg-rose-900/30 text-rose-300 px-3 py-1 rounded-full text-xs font-medium border border-rose-800/50 uppercase tracking-wider">
              {tag}
              <button
                type="button"
                onClick={() => handleRemoveTag(tag)}
                className="hover:text-red-400 transition-colors ml-1"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <ImageUpload
          label="Service Image"
          value={form.watch('image')}
          onChange={(url) => form.setValue('image', url, { shouldValidate: true })}
          folder="services"
          accept="image/*"
        />
        {form.formState.errors.image && <p className="text-red-400 text-xs">{form.formState.errors.image.message}</p>}
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-rose-900/30">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 rounded-lg text-rose-300 hover:bg-rose-950/50 transition-colors font-medium text-sm"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isLoading}
          className="flex items-center gap-2 bg-gradient-to-r from-rose-600 to-rose-900 hover:from-rose-500 hover:to-rose-800 text-white px-6 py-2.5 rounded-lg font-medium transition-all transform hover:scale-105 disabled:opacity-50 disabled:pointer-events-none shadow-lg shadow-rose-900/20 text-sm"
        >
          {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
          {initialData?._id ? 'Update Service' : 'Create Service'}
        </button>
      </div>
    </form>
  );
}
