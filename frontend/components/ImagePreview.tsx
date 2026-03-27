'use client'

import React from 'react'
import { X, Download } from 'lucide-react'

interface ImagePreviewProps {
  imageUrl?: string
  alt?: string
  onRemove?: () => void
  onDownload?: () => void
  className?: string
}

export function ImagePreview({
  imageUrl,
  alt = 'Preview',
  onRemove,
  onDownload,
  className = '',
}: ImagePreviewProps) {
  if (!imageUrl) {
    return (
      <div className={`flex items-center justify-center bg-muted/10 rounded-lg ${className}`}>
        <p className="text-muted text-sm">Rasm mavjud emas</p>
      </div>
    )
  }

  return (
    <div className={`relative group rounded-lg overflow-hidden bg-muted/10 ${className}`}>
      <img
        src={imageUrl}
        alt={alt}
        className="w-full h-full object-cover"
      />

      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
        {onDownload && (
          <button
            onClick={onDownload}
            className="p-2 bg-white/90 hover:bg-white rounded-full transition-colors"
            title="Download"
          >
            <Download size={20} className="text-foreground" />
          </button>
        )}

        {onRemove && (
          <button
            onClick={onRemove}
            className="p-2 bg-red-500/90 hover:bg-red-600 rounded-full transition-colors"
            title="Remove"
          >
            <X size={20} className="text-white" />
          </button>
        )}
      </div>
    </div>
  )
}
