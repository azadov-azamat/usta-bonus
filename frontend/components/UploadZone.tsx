'use client'

import React from 'react'
import { Upload, X } from 'lucide-react'

interface UploadZoneProps {
  onFileSelect: (file: File) => void
  accept?: string
  label?: string
  description?: string
  maxSize?: number
  loading?: boolean
}

export function UploadZone({
  onFileSelect,
  accept = '.xlsx,.xls',
  label = 'Faylni tanlang yoki bu yerga sudring',
  description = 'Excel faylli (XLSX, XLS)',
  maxSize = 5 * 1024 * 1024, // 5MB
  loading = false,
}: UploadZoneProps) {
  const [isDragActive, setIsDragActive] = React.useState(false)
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(e.type === 'dragenter' || e.type === 'dragover')
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(false)

    const files = e.dataTransfer.files
    if (files.length > 0) {
      processFile(files[0])
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      processFile(files[0])
    }
  }

  const processFile = (file: File) => {
    if (file.size > maxSize) {
      alert(`Fayl hajmi ${maxSize / 1024 / 1024}MB dan katta bo'lmasligi kerak`)
      return
    }

    setSelectedFile(file)
    onFileSelect(file)
  }

  const clearFile = () => {
    setSelectedFile(null)
    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  return (
    <div
      className={`relative rounded-lg border-2 border-dashed transition-colors ${
        isDragActive
          ? 'border-primary bg-primary/5'
          : 'border-border bg-muted/5 hover:border-primary/50'
      }`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        className="hidden"
        disabled={loading}
      />

      <button
        onClick={() => inputRef.current?.click()}
        disabled={loading}
        className="w-full px-6 py-8 text-center"
      >
        {selectedFile ? (
          <div className="space-y-2">
            <div className="text-green-600 dark:text-green-400">
              <div className="mx-auto mb-2">✓</div>
              <p className="font-medium">{selectedFile.name}</p>
              <p className="text-sm text-muted">
                {(selectedFile.size / 1024).toFixed(2)} KB
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <Upload className="mx-auto h-8 w-8 text-muted" />
            <p className="font-medium text-foreground">{label}</p>
            <p className="text-sm text-muted">{description}</p>
          </div>
        )}
      </button>

      {selectedFile && !loading && (
        <button
          onClick={clearFile}
          className="absolute top-2 right-2 p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded transition-colors"
        >
          <X size={18} className="text-red-600 dark:text-red-400" />
        </button>
      )}
    </div>
  )
}
