'use client';

import { useState, useRef, ChangeEvent } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Loader2, Upload, X, ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TeamImageUploaderProps {
  value?: string;
  onChange: (url: string | undefined) => void;
  className?: string;
}

export function TeamImageUploader({ value, onChange, className }: TeamImageUploaderProps) {
  const t = useTranslations('teams.form');
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(value || null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert(t('imageInvalidType'));
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert(t('imageTooLarge'));
      return;
    }

    setIsUploading(true);

    try {
      // Create a data URL for preview and storage
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setPreview(result);
        onChange(result);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Upload failed:', error);
      alert(t('imageUploadError'));
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onChange(undefined);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const triggerFileInput = () => {
    inputRef.current?.click();
  };

  return (
    <div className={cn("space-y-3", className)}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {preview ? (
        <div className="relative w-full aspect-video max-w-[300px] rounded-lg overflow-hidden border-2 border-dashed border-muted-foreground/25 group">
          <img
            src={preview}
            alt="Team logo"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={triggerFileInput}
              disabled={isUploading}
            >
              {isUploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleRemove}
              disabled={isUploading}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={triggerFileInput}
          disabled={isUploading}
          className="w-full aspect-video max-w-[300px] rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 transition-colors flex flex-col items-center justify-center gap-2 p-4 disabled:opacity-50"
        >
          {isUploading ? (
            <>
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{t('imageUploading')}</span>
            </>
          ) : (
            <>
              <ImageIcon className="h-8 w-8 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{t('imagePlaceholder')}</span>
              <span className="text-xs text-muted-foreground/60">{t('imageHint')}</span>
            </>
          )}
        </button>
      )}
    </div>
  );
}
