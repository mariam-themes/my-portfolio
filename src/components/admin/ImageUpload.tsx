'use client';
import { useState, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { useCloudinaryUpload } from '@/hooks/useCloudinaryUpload';
import Image from 'next/image';
import { UploadCloud, X, Loader2, AlertCircle, Sparkles } from 'lucide-react';

interface ImageUploadProps {
  label: React.ReactNode;
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  accept?: string;
}

export default function ImageUpload({ 
  label, 
  value, 
  onChange, 
  folder = 'projects',
  accept = "image/*,video/mp4,video/webm,video/quicktime,.mp4,.mov,.webm"
}: ImageUploadProps) {
  const t = useTranslations('Admin.upload');
  const { uploadFile, state, progress, isCompressing, error, reset, lastMediaType } = useCloudinaryUpload();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleProcessFile = async (file: File) => {
    const url = await uploadFile(file, folder);
    if (url) {
      onChange(url);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await handleProcessFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    await handleProcessFile(file);
  };

  const handleRemove = () => {
    onChange('');
    reset();
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const isBusy = state === 'uploading' || state === 'compressing';

  return (
    <div className="flex flex-col space-y-3 w-full">
      <label className="text-sm font-medium text-rose-200">{label}</label>
      
      {value ? (
        <div className="relative rounded-xl overflow-hidden border border-rose-900/50 bg-[#1A050C] group">
          {/* Determine media type from upload state or fallback to extension */}
          {(lastMediaType === 'video' || (!lastMediaType && value.match(/\.(mp4|webm|mov)$/i))) ? (
            // Video
            <div className="w-full h-48 flex items-center justify-center bg-rose-950/20 text-rose-300">
              <span className="bg-rose-900/40 px-4 py-2 rounded-full border border-rose-500/30">
                {t('videoReady')}
              </span>
            </div>
          ) : (lastMediaType === 'gif' || (!lastMediaType && value.match(/\.gif$/i))) ? (
            // GIF — show the actual animated image + a badge
            <div className="relative w-full h-48">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={value} alt="Uploaded GIF" className="w-full h-full object-cover" />
              <span className="absolute top-2 left-2 bg-rose-700/90 text-white text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border border-rose-400/30">
                GIF
              </span>
            </div>
          ) : (
            // Static image
            <div className="relative w-full h-48">
              <Image src={value} alt="Uploaded media" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" unoptimized />
            </div>
          )}
          
          {/* Hover Overlay with Delete Button */}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <button
              type="button"
              onClick={handleRemove}
              className="bg-red-500 hover:bg-red-600 text-white p-3 rounded-full shadow-lg transition-transform hover:scale-110"
              title="Remove"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      ) : (
        <div 
          onClick={() => !isBusy && fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            relative w-full h-48 rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all p-4
            ${isDragOver ? 'border-rose-400 bg-rose-900/30 scale-[1.01]' : ''}
            ${state === 'error' ? 'border-red-500/50 bg-red-950/10' : !isDragOver ? 'border-rose-900/50 bg-rose-950/10 hover:border-rose-500/50 hover:bg-rose-900/20' : ''}
          `}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept={accept}
            className="hidden"
            disabled={isBusy}
          />
          
          {isCompressing ? (
            <div className="flex flex-col items-center text-rose-300 animate-pulse">
              <Sparkles className="w-8 h-8 text-rose-400 mb-2 animate-spin" />
              <span className="text-sm font-medium">{t('optimizing') || 'Optimizing & compressing image...'}</span>
              <span className="text-xs text-rose-400/60 mt-1">Preparing high-speed upload...</span>
            </div>
          ) : state === 'uploading' ? (
            <div className="flex flex-col items-center w-full max-w-[220px] text-rose-400">
              <Loader2 className="w-8 h-8 animate-spin mb-2" />
              <div className="flex justify-between w-full text-xs font-semibold mb-1.5 text-rose-200">
                <span>{t('uploading')}</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full h-2 bg-rose-950/80 rounded-full overflow-hidden border border-rose-900/40">
                <div 
                  className="h-full bg-gradient-to-r from-rose-500 to-rose-400 transition-all duration-200 rounded-full shadow-[0_0_8px_rgba(244,63,94,0.6)]" 
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ) : state === 'error' ? (
            <div className="flex flex-col items-center text-red-400 text-center px-4">
              <AlertCircle className="w-8 h-8 mb-2" />
              <span className="text-sm font-medium">{error}</span>
              <span className="text-xs text-rose-400/70 mt-2 underline">اضغط لإعادة المحاولة</span>
            </div>
          ) : (
            <div className="flex flex-col items-center text-rose-500/70 text-center pointer-events-none">
              <UploadCloud className="w-10 h-10 mb-3 group-hover:text-rose-400 transition-colors" />
              <span className="text-sm font-medium text-rose-200">{t('clickToUpload')}</span>
              <span className="text-xs mt-1 text-rose-500/50">{t('supports')}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
