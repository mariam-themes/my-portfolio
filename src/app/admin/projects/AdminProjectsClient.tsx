'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Plus, Edit2, ShoppingBag, Loader2, GripVertical } from 'lucide-react';
import DeleteProjectButton from './DeleteProjectButton';
import toast from 'react-hot-toast';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  MeasuringStrategy,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

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

interface SortableProjectCardProps {
  project: AdminProject;
  index: number;
}

function SortableProjectCard({ project, index }: SortableProjectCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: project._id });

  const style = {
    // Only animate transform — avoids layout recalc on sibling cards
    transform: CSS.Transform.toString(transform),
    transition: transition ?? undefined,
    willChange: 'transform',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-black/40 border rounded-xl overflow-hidden flex flex-col ${
        isDragging
          ? 'opacity-30 border-dashed border-rose-500'
          : 'border-rose-900/30 hover:border-rose-700/50'
      }`}
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

        {/* Order badge with drag handle */}
        <div
          {...attributes}
          {...listeners}
          className="absolute top-2 right-2 flex items-center gap-1 bg-black/75 backdrop-blur-sm border border-white/15 px-2 py-0.5 rounded-full text-[11px] font-bold text-white/90 cursor-grab active:cursor-grabbing hover:border-rose-500/60 hover:text-white transition-colors touch-none"
          title="اضغط واسحب لتغيير الترتيب"
        >
          <GripVertical className="w-3 h-3 text-rose-400" />
          <span>#{index + 1}</span>
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

          {/* Drag handle button replacing old arrow buttons */}
          <button
            type="button"
            {...attributes}
            {...listeners}
            className="flex items-center gap-1.5 bg-black/40 hover:bg-rose-950/60 text-white/70 hover:text-white rounded-lg border border-white/10 hover:border-rose-500/50 px-2.5 py-1.5 cursor-grab active:cursor-grabbing transition-all select-none touch-none"
            title="اضغط واسحب لتغيير الترتيب"
          >
            <GripVertical className="w-3.5 h-3.5 text-rose-400" />
            <span className="text-xs font-medium">سحب للترتيب</span>
          </button>

          <DeleteProjectButton projectId={project._id.toString()} title={project.title} />
        </div>
      </div>
    </div>
  );
}

function ProjectCardOverlay({ project }: { project: AdminProject }) {
  return (
    <div className="bg-[#18040a] border-2 border-rose-500 rounded-xl overflow-hidden flex flex-col shadow-lg ring-2 ring-rose-500/20 cursor-grabbing pointer-events-none opacity-95" style={{ willChange: 'transform' }}>
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
      </div>
      <div className="p-4">
        <h3 className="text-base font-semibold text-white line-clamp-1">{project.title}</h3>
      </div>
    </div>
  );
}

export default function AdminProjectsClient() {
  const [tab, setTab] = useState<Tab>('all');
  const [allProjects, setAllProjects] = useState<AdminProject[]>([]);
  const [saleProjects, setSaleProjects] = useState<AdminProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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

      const forSale = [...all]
        .filter((p) => p.isForSale)
        .sort((a, b) => {
          if (a.saleOrder != null && b.saleOrder != null) return a.saleOrder - b.saleOrder;
          if (a.saleOrder != null) return -1;
          if (b.saleOrder != null) return 1;
          return 0;
        });

      setSaleProjects(forSale);
    } catch {
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over || active.id === over.id) return;

    if (tab === 'forSale') {
      const oldIndex = saleProjects.findIndex((p) => p._id === active.id);
      const newIndex = saleProjects.findIndex((p) => p._id === over.id);
      if (oldIndex === -1 || newIndex === -1) return;

      const previousState = [...saleProjects];
      const newSaleProjects = arrayMove(saleProjects, oldIndex, newIndex);
      setSaleProjects(newSaleProjects);

      setSaving(true);
      try {
        const res = await fetch('/api/admin/projects/reorder', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderedIds: newSaleProjects.map((p) => p._id) }),
        });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error();
        toast.success('تم تحديث وحفظ ترتيب الهويات المعروضة للبيع!');
      } catch {
        setSaleProjects(previousState);
        toast.error('فشل حفظ الترتيب');
      } finally {
        setSaving(false);
      }
    } else {
      const oldIndex = allProjects.findIndex((p) => p._id === active.id);
      const newIndex = allProjects.findIndex((p) => p._id === over.id);
      if (oldIndex === -1 || newIndex === -1) return;

      const previousState = [...allProjects];
      const newAllProjects = arrayMove(allProjects, oldIndex, newIndex);
      setAllProjects(newAllProjects);

      setSaving(true);
      try {
        const res = await fetch('/api/admin/projects/reorder-all', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderedIds: newAllProjects.map((p) => p._id) }),
        });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error();
        toast.success('تم تحديث وحفظ ترتيب المشاريع!');
      } catch {
        setAllProjects(previousState);
        toast.error('فشل حفظ الترتيب');
      } finally {
        setSaving(false);
      }
    }
  };

  const displayProjects = tab === 'all' ? allProjects : saleProjects;
  const activeProject = activeId ? displayProjects.find((p) => p._id === activeId) : null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Projects</h1>
          <p className="text-rose-200/60 mt-1">Manage your portfolio projects (اسحب وأفلت لإعادة الترتيب)</p>
        </div>
        <div className="flex items-center gap-3">
          {saving && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs animate-pulse">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>جارٍ حفظ الترتيب...</span>
            </div>
          )}
          <Link
            href="/admin/projects/new"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-rose-600 to-rose-900 hover:from-rose-500 hover:to-rose-800 text-white px-6 py-2.5 rounded-lg font-medium transition-all shadow-lg shadow-rose-900/20"
          >
            <Plus className="w-5 h-5" />
            Add New
          </Link>
        </div>
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
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          measuring={{ droppable: { strategy: MeasuringStrategy.WhileDragging } }}
        >
          <SortableContext
            items={displayProjects.map((p) => p._id)}
            strategy={rectSortingStrategy}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayProjects.map((project, i) => (
                <SortableProjectCard
                  key={project._id}
                  project={project}
                  index={i}
                />
              ))}
            </div>
          </SortableContext>

          <DragOverlay adjustScale={false}>
            {activeProject ? <ProjectCardOverlay project={activeProject} /> : null}
          </DragOverlay>
        </DndContext>
      )}
    </div>
  );
}
