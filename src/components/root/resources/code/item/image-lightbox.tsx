"use client";

import React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageLightboxProps {
  src: string;
  alt: string;
  isOpen: boolean;
  onClose: () => void;
}

const styles = {
  overlay: 'fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 cursor-pointer',
  closeButton: 'absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10',
  imageContainer: 'relative max-w-7xl max-h-[90vh] w-full h-full flex items-center justify-center',
  image: 'max-w-full max-h-full object-contain rounded-lg shadow-2xl',
};

export function ImageLightbox({ src, alt, isOpen, onClose }: ImageLightboxProps) {
  if (!isOpen) return null;

  return (
    <div 
      className={styles.overlay}
      onClick={onClose}
    >
      <button
        className={styles.closeButton}
        onClick={onClose}
        aria-label="关闭"
      >
        <X className="w-6 h-6" />
      </button>
      <div 
        className={styles.imageContainer}
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={src}
          alt={alt}
          className={styles.image}
        />
      </div>
    </div>
  );
}
