"use client";

import { useState, useRef, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Underline from '@tiptap/extension-underline';
import { TextStyle } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import TextAlign from '@tiptap/extension-text-align';
import { useTranslations } from 'next-intl';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Pilcrow,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Link2,
  Undo2,
  Redo2,
  Palette,
  Check,
  X,
} from 'lucide-react';

interface TiptapEditorProps {
  content: string;
  onChange: (content: string) => void;
}

const PRESET_COLORS = [
  '#000000',
  '#ffffff',
  '#ef4444',
  '#f97316',
  '#eab308',
  '#22c55e',
  '#06b6d4',
  '#3b82f6',
  '#8b5cf6',
  '#ec4899',
  '#951C30',
  '#9ca3af',
];

function ToolbarButton({
  onClick,
  active,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      aria-pressed={active}
      onClick={onClick}
      className={`inline-flex items-center justify-center w-8 h-8 rounded-md transition-colors ${
        active
          ? 'bg-rose-600 text-white'
          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
      }`}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <span className="mx-1 w-px h-6 bg-slate-300 dark:bg-slate-700" />;
}

export default function TiptapEditor({ content, onChange }: TiptapEditorProps) {
  const t = useTranslations('Admin.editor');
  const [colorOpen, setColorOpen] = useState(false);
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkValue, setLinkValue] = useState('');
  const colorRef = useRef<HTMLDivElement>(null);
  const linkRef = useRef<HTMLDivElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({ openOnClick: false, autolink: true }),
      Image,
      TextStyle,
      Color,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
    ],
    content,
    editorProps: {
      attributes: {
        class:
          'prose dark:prose-invert prose-sm sm:prose-base lg:prose-lg xl:prose-2xl prose-strong:text-inherit m-5 focus:outline-none min-h-[300px] border p-4 rounded-md max-w-none',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // Close popovers on outside click
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (colorRef.current && !colorRef.current.contains(e.target as Node)) {
        setColorOpen(false);
      }
      if (linkRef.current && !linkRef.current.contains(e.target as Node)) {
        setLinkOpen(false);
      }
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  if (!editor) {
    return null;
  }

  const currentHeading = editor.isActive('heading', { level: 1 })
    ? '1'
    : editor.isActive('heading', { level: 2 })
    ? '2'
    : editor.isActive('heading', { level: 3 })
    ? '3'
    : 'paragraph';

  function setHeading(value: string) {
    if (value === 'paragraph') {
      editor.chain().focus().setParagraph().run();
    } else {
      editor
        .chain()
        .focus()
        .toggleHeading({ level: Number(value) as 1 | 2 | 3 })
        .run();
    }
  }

  function applyLink() {
    const url = linkValue.trim();
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
    } else {
      editor
        .chain()
        .focus()
        .extendMarkRange('link')
        .setLink({ href: url })
        .run();
    }
    setLinkOpen(false);
    setLinkValue('');
  }

  return (
    <div className="border border-slate-300 dark:border-slate-700 rounded-md overflow-hidden bg-white dark:bg-slate-900">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
        {/* Headings */}
        <div className="relative">
          <select
            value={currentHeading}
            onChange={(e) => setHeading(e.target.value)}
            title={t('heading')}
            className="h-8 pl-2 pr-6 rounded-md bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 text-sm focus:outline-none cursor-pointer"
          >
            <option value="paragraph">{t('paragraph')}</option>
            <option value="1">{t('heading1')}</option>
            <option value="2">{t('heading2')}</option>
            <option value="3">{t('heading3')}</option>
          </select>
        </div>

        <Divider />

        {/* Text formatting */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive('bold')}
          title={t('bold')}
        >
          <Bold className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive('italic')}
          title={t('italic')}
        >
          <Italic className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive('underline')}
          title={t('underline')}
        >
          <UnderlineIcon className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          active={editor.isActive('strike')}
          title={t('strike')}
        >
          <Strikethrough className="w-4 h-4" />
        </ToolbarButton>

        <Divider />

        {/* Color */}
        <div className="relative" ref={colorRef}>
          <ToolbarButton
            onClick={() => setColorOpen((v) => !v)}
            active={colorOpen}
            title={t('color')}
          >
            <Palette className="w-4 h-4" />
          </ToolbarButton>
          {colorOpen && (
            <div className="absolute z-20 mt-1 p-3 w-56 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl">
              <div className="grid grid-cols-6 gap-2 mb-3">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    title={c}
                    onClick={() => editor.chain().focus().setColor(c).run()}
                    className="w-7 h-7 rounded-full border border-slate-300 dark:border-slate-600"
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  defaultValue="#951C30"
                  onChange={(e) =>
                    editor.chain().focus().setColor(e.target.value).run()
                  }
                  className="w-9 h-9 rounded cursor-pointer bg-transparent border border-slate-300 dark:border-slate-700"
                />
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {t('customColor')}
                </span>
              </div>
              <button
                type="button"
                onClick={() => editor.chain().focus().unsetColor().run()}
                className="mt-3 w-full text-xs py-1.5 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
              >
                {t('removeColor')}
              </button>
            </div>
          )}
        </div>

        <Divider />

        {/* Alignment */}
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          active={editor.isActive({ textAlign: 'left' })}
          title={t('alignLeft')}
        >
          <AlignLeft className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          active={editor.isActive({ textAlign: 'center' })}
          title={t('alignCenter')}
        >
          <AlignCenter className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          active={editor.isActive({ textAlign: 'right' })}
          title={t('alignRight')}
        >
          <AlignRight className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('justify').run()}
          active={editor.isActive({ textAlign: 'justify' })}
          title={t('alignJustify')}
        >
          <AlignJustify className="w-4 h-4" />
        </ToolbarButton>

        <Divider />

        {/* Lists */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive('bulletList')}
          title={t('bulletList')}
        >
          <List className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive('orderedList')}
          title={t('orderedList')}
        >
          <ListOrdered className="w-4 h-4" />
        </ToolbarButton>

        <Divider />

        {/* Link */}
        <div className="relative" ref={linkRef}>
          <ToolbarButton
            onClick={() => {
              setLinkValue(
                editor.getAttributes('link').href?.toString() ?? ''
              );
              setLinkOpen((v) => !v);
            }}
            active={editor.isActive('link')}
            title={t('link')}
          >
            <Link2 className="w-4 h-4" />
          </ToolbarButton>
          {linkOpen && (
            <div className="absolute z-20 mt-1 p-3 w-72 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl">
              <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                {t('linkUrl')}
              </label>
              <input
                autoFocus
                value={linkValue}
                onChange={(e) => setLinkValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    applyLink();
                  }
                }}
                placeholder="https://example.com"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md px-3 py-2 text-sm text-slate-700 dark:text-slate-200 focus:outline-none"
              />
              <div className="flex items-center justify-end gap-2 mt-2">
                {editor.isActive('link') && (
                  <button
                    type="button"
                    onClick={() => {
                      editor.chain().focus().extendMarkRange('link').unsetLink().run();
                      setLinkOpen(false);
                      setLinkValue('');
                    }}
                    className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
                  >
                    <X className="w-3.5 h-3.5" /> {t('remove')}
                  </button>
                )}
                <button
                  type="button"
                  onClick={applyLink}
                  className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-md bg-rose-600 hover:bg-rose-500 text-white"
                >
                  <Check className="w-3.5 h-3.5" /> {t('apply')}
                </button>
              </div>
            </div>
          )}
        </div>

        <Divider />

        {/* Undo / Redo */}
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          title={t('undo')}
        >
          <Undo2 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          title={t('redo')}
        >
          <Redo2 className="w-4 h-4" />
        </ToolbarButton>
      </div>

      <EditorContent editor={editor} />
    </div>
  );
}
