'use client';
import { useState, useRef } from 'react';
import { useCloudinaryUpload } from '@/hooks/useCloudinaryUpload';
import Image from 'next/image';
import { UploadCloud, X, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

interface ImageUploadProps {
  label: string;
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
  accept = "image/*,video/*"
}: ImageUploadProps) {
  const { uploadFile, state, error } = useCloudinaryUpload();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = await uploadFile(file, folder);
    if (url) {
      onChange(url);
    }
  };

  const handleRemove = () => {
    onChange('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="flex flex-col space-y-3 w-full">
      <label className="text-sm font-medium text-rose-200">{label}</label>
      
      {value ? (
        <div className="relative rounded-xl overflow-hidden border border-rose-900/50 bg-[#1A050C] group">
          {/* Determine if it's a video based on extension */}
          {value.match(/\.(mp4|webm|mov)$/i) ? (
            <div className="w-full h-48 flex items-center justify-center bg-rose-950/20 text-rose-300">
              <span className="bg-rose-900/40 px-4 py-2 rounded-full border border-rose-500/30">
                🎥 Video File Ready
              </span>
            </div>
          ) : (
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
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      ) : (
        <div 
          onClick={() => fileInputRef.current?.click()}
          className={`
            relative w-full h-48 rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all
            ${state === 'error' ? 'border-red-500/50 bg-red-950/10' : 'border-rose-900/50 bg-rose-950/10 hover:border-rose-500/50 hover:bg-rose-900/20'}
          `}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept={accept}
            className="hidden"
            disabled={state === 'uploading'}
          />
          
          {state === 'uploading' ? (
            <div className="flex flex-col items-center text-rose-400">
              <Loader2 className="w-8 h-8 animate-spin mb-2" />
              <span className="text-sm">Uploading massive file directly...</span>
            </div>
          ) : state === 'error' ? (
            <div className="flex flex-col items-center text-red-400 text-center px-4">
              <AlertCircle className="w-8 h-8 mb-2" />
              <span className="text-sm">{error}</span>
            </div>
          ) : (
            <div className="flex flex-col items-center text-rose-500/70">
              <UploadCloud className="w-10 h-10 mb-3 group-hover:text-rose-400 transition-colors" />
              <span className="text-sm font-medium text-rose-200">Click to upload media</span>
              <span className="text-xs mt-1 text-rose-500/50">Supports huge Browser Screenshots & Videos</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
