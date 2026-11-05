'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Plus, Edit2, ShoppingBag, ArrowLeft, ArrowRight, Save, Loader2 } from 'lucide-react';
import DeleteProjectButton from './DeleteProjectButton';
import toast from 'react-hot-toast';

type Tab = 'all' | 'forSale';

interface AdminProject {
  _id: string;
  title: string;
  slug: string;
  sector?: string;
  year?: number;
  heroMediaUrl?: string;
  isFeatured?: boolean;
  isForSale?: boolean;
  price?: number;
  currency?: string;
  saleOrder?: number;
  order?: number;
  createdAt?: string;
}

export default function AdminProjectsClient() {
  const [tab, setTab] = useState<Tab>('all');
  const [allProjects, setAllProjects] = useState<AdminProject[]>([]);
  const [saleProjects, setSaleProjects] = useState<AdminProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [originalOrder, setOriginalOrder] = useState<string[]>([]);
  const [originalAllOrder, setOriginalAllOrder] = useState<string[]>([]);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/projects');
      const json = await res.json();
      if (!json.success) throw new Error();

      const all: AdminProject[] = json.data.map((p: any) => ({
        ...p,
        _id: String(p._id),
        title: typeof p.title === 'object' ? p.title?.en || '' : p.title,
        sector: typeof p.sector === 'object' ? p.sector?.en || '' : p.sector,
      }));

      // Sort allProjects by order if set
      const sortedAll = [...all].sort((a, b) => {
        if (a.order != null && b.order != null) return a.order - b.order;
        if (a.order != null) return -1;
        if (b.order != null) return 1;
        return (new Date(b.createdAt || 0).getTime() || 0) - (new Date(a.createdAt || 0).getTime() || 0);
      });

      setAllProjects(sortedAll);
      setOriginalAllOrder(sortedAll.map((p) => p._id));

      const forSale = [...all]
        .filter((p) => p.isForSale)
        .sort((a, b) => {
          if (a.saleOrder != null && b.saleOrder != null) return a.saleOrder - b.saleOrder;
          if (a.saleOrder != null) return -1;
          if (b.saleOrder != null) return 1;
          return 0;
        });

      setSaleProjects(forSale);
      setOriginalOrder(forSale.map((p) => p._id));
    } catch {
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    if (tab === 'forSale') {
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= saleProjects.length) return;

      setSaleProjects((prev) => {
        const copy = [...prev];
        const temp = copy[index];
        copy[index] = copy[targetIndex];
        copy[targetIndex] = temp;
        return copy;
      });
    } else {
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= allProjects.length) return;

      setAllProjects((prev) => {
        const copy = [...prev];
        const temp = copy[index];
        copy[index] = copy[targetIndex];
        copy[targetIndex] = temp;
        return copy;
      });
    }
  };

  const hasSaleOrderChanged =
    JSON.stringify(saleProjects.map((p) => p._id)) !== JSON.stringify(originalOrder);

  const hasAllOrderChanged =
    JSON.stringify(allProjects.map((p) => p._id)) !== JSON.stringify(originalAllOrder);

  const handleSaveOrder = async () => {
    setSaving(true);
    try {
      if (tab === 'forSale') {
        const res = await fetch('/api/admin/projects/reorder', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderedIds: saleProjects.map((p) => p._id) }),
        });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error();
        setOriginalOrder(saleProjects.map((p) => p._id));
        toast.success('Order saved!');
      } else {
        const res = await fetch('/api/admin/projects/reorder-all', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderedIds: allProjects.map((p) => p._id) }),
        });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error();
        setOriginalAllOrder(allProjects.map((p) => p._id));
        toast.success('Projects order saved!');
      }
    } catch {
      toast.error('Failed to save order');
    } finally {
      setSaving(false);
    }
  };

  const displayProjects = tab === 'all' ? allProjects : saleProjects;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Projects</h1>
          <p className="text-rose-200/60 mt-1">Manage your portfolio projects</p>
        </div>
        <Link
          href="/admin/projects/new"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-rose-600 to-rose-900 hover:from-rose-500 hover:to-rose-800 text-white px-6 py-2.5 rounded-lg font-medium transition-all shadow-lg shadow-rose-900/20"
        >
          <Plus className="w-5 h-5" />
          Add New
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-black/30 border border-rose-900/30 rounded-xl p-1 w-fit">
        <button
          onClick={() => setTab('all')}
          className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            tab === 'all'
              ? 'bg-rose-900/60 text-white shadow-sm'
              : 'text-white/50 hover:text-white/80'
          }`}
        >
          All Projects
          {!loading && (
            <span className="ml-2 text-xs px-1.5 py-0.5 rounded-full bg-white/10">
              {allProjects.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setTab('forSale')}
          className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-1.5 ${
            tab === 'forSale'
              ? 'bg-amber-600/30 text-amber-300 shadow-sm border border-amber-500/20'
              : 'text-white/50 hover:text-white/80'
          }`}
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          هويات بصرية للبيع
          {!loading && (
            <span className="ml-1 text-xs px-1.5 py-0.5 rounded-full bg-white/10">
              {saleProjects.length}
            </span>
          )}
        </button>
      </div>

      {/* Save order button for forSale tab */}
      {tab === 'forSale' && hasSaleOrderChanged && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
          <span className="text-sm text-amber-300 flex-1">
            You have unsaved order changes.
          </span>
          <button
            onClick={handleSaveOrder}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-amber-950 font-semibold text-sm transition-colors disabled:opacity-60"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Order
              </>
            )}
          </button>
        </div>
      )}

      {/* Save order button for all projects tab */}
      {tab === 'all' && hasAllOrderChanged && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30">
          <span className="text-sm text-rose-200 flex-1">
            You have unsaved project order changes.
          </span>
          <button
            onClick={handleSaveOrder}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-sm transition-colors disabled:opacity-60 shadow-lg shadow-rose-900/40"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Order
              </>
            )}
          </button>
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-black/40 border border-rose-900/20 rounded-xl animate-pulse"
              style={{ height: '280px' }}
            />
          ))}
        </div>
      ) : displayProjects.length === 0 ? (
        <div className="bg-rose-950/20 border border-rose-900/30 rounded-2xl p-12 text-center">
          <p className="text-rose-300">
            {tab === 'forSale' ? 'No visual identities marked for sale yet.' : 'No projects yet.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayProjects.map((project, i) => (
            <div
              key={String(project._id ?? project.slug ?? `proj-${i}`)}
              className="bg-black/40 border border-rose-900/30 rounded-xl overflow-hidden flex flex-col transition-all hover:border-rose-700/50 hover:shadow-lg hover:shadow-rose-900/10"
            >
              {/* Cover Image */}
              <div className="relative aspect-video w-full bg-rose-950/50">
                {project.heroMediaUrl ? (
                  <Image
                    src={project.heroMediaUrl}
                    alt={project.title || 'Project cover'}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full text-rose-500/30 text-sm">
                    No Cover
                  </div>
                )}
                {/* Badges */}
                <div className="absolute top-2 left-2 flex flex-col gap-1">
                  {project.isFeatured && (
                    <span className="bg-amber-500/90 text-amber-950 px-2 py-0.5 rounded text-[10px] font-bold shadow">
                      Featured
                    </span>
                  )}
                  {project.isForSale && (
                    <span className="bg-emerald-500/90 text-emerald-950 px-2 py-0.5 rounded text-[10px] font-bold shadow flex items-center gap-1">
                      <ShoppingBag className="w-2.5 h-2.5" />
                      {project.price
                        ? `${new Intl.NumberFormat('en-US').format(project.price)} ${project.currency ?? 'SAR'}`
                        : 'للبيع'}
                    </span>
                  )}
                </div>

                {/* Order number */}
                <div className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/70 border border-white/10 flex items-center justify-center text-[11px] font-bold text-white/80">
                  {i + 1}
                </div>
              </div>

              {/* Content */}
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="text-lg font-semibold text-white mb-1 line-clamp-1">{project.title}</h3>

                <div className="flex flex-wrap gap-2 mb-4">
                  {project.year && (
                    <span className="text-xs bg-rose-950/50 text-rose-300 px-2 py-1 rounded border border-rose-900/50">
                      {project.year}
                    </span>
                  )}
                  {project.sector && (
                    <span className="text-xs bg-rose-950/50 text-rose-300 px-2 py-1 rounded border border-rose-900/50">
                      {project.sector}
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="mt-auto pt-4 border-t border-rose-900/30 flex items-center justify-between gap-2">
                  <Link
                    href={`/admin/projects/${project._id}`}
                    className="inline-flex items-center text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    <Edit2 className="w-4 h-4 mr-1.5" /> Edit
                  </Link>

                  {/* Reorder arrows */}
                  <div className="flex items-center gap-1 bg-black/30 rounded-lg border border-white/10 px-1.5 py-1">
                    <button
                      disabled={i === 0}
                      onClick={() => handleMove(i, 'up')}
                      title="Move up"
                      className={`p-1 rounded transition-colors ${
                        i === 0
                          ? 'text-white/15 cursor-not-allowed'
                          : 'text-white/60 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-[10px] text-white/30 px-0.5">ترتيب</span>
                    <button
                      disabled={i === displayProjects.length - 1}
                      onClick={() => handleMove(i, 'down')}
                      title="Move down"
                      className={`p-1 rounded transition-colors ${
                        i === displayProjects.length - 1
                          ? 'text-white/15 cursor-not-allowed'
                          : 'text-white/60 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <DeleteProjectButton projectId={project._id.toString()} title={project.title} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
