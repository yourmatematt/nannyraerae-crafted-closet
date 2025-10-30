import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X, MoveUp, MoveDown, Star } from 'lucide-react'
import { Button } from '../ui/button'
import { cn } from '../../lib/utils'

interface ImageUploaderProps {
  onImagesSelected: (files: File[]) => void
  maxImages?: number
  existingImages?: string[]
  onReorder?: (images: string[]) => void
  onRemove?: (index: number) => void
  onSetPrimary?: (index: number) => void
  readOnly?: boolean
}

export function ImageUploader({
  onImagesSelected,
  maxImages = 8,
  existingImages = [],
  onReorder,
  onRemove,
  onSetPrimary,
  readOnly = false
}: ImageUploaderProps) {
  const [images, setImages] = useState<(File | string)[]>(existingImages)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newImages = [...images, ...acceptedFiles].slice(0, maxImages)
    setImages(newImages)

    // Only pass File objects to parent
    const fileImages = newImages.filter((img): img is File => img instanceof File)
    onImagesSelected(fileImages)
  }, [images, maxImages, onImagesSelected])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxFiles: maxImages - images.length,
    disabled: images.length >= maxImages || readOnly
  })

  const removeImage = (indexToRemove: number) => {
    const newImages = images.filter((_, index) => index !== indexToRemove)
    setImages(newImages)

    const fileImages = newImages.filter((img): img is File => img instanceof File)
    onImagesSelected(fileImages)

    if (onRemove) {
      onRemove(indexToRemove)
    }
  }

  const moveImage = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= images.length) return

    const newImages = [...images]
    const [movedImage] = newImages.splice(fromIndex, 1)
    newImages.splice(toIndex, 0, movedImage)
    setImages(newImages)

    const fileImages = newImages.filter((img): img is File => img instanceof File)
    onImagesSelected(fileImages)

    if (onReorder) {
      onReorder(newImages.filter((img): img is string => typeof img === 'string'))
    }
  }

  const setPrimaryImage = (index: number) => {
    const newImages = [...images]
    const [primaryImage] = newImages.splice(index, 1)
    newImages.unshift(primaryImage)
    setImages(newImages)

    const fileImages = newImages.filter((img): img is File => img instanceof File)
    onImagesSelected(fileImages)

    if (onSetPrimary) {
      onSetPrimary(0)
    }
  }

  const getImageUrl = (image: File | string): string => {
    if (typeof image === 'string') {
      return image
    }
    return URL.createObjectURL(image)
  }

  return (
    <div className="space-y-4">
      {/* Dropzone */}
      {images.length < maxImages && !readOnly && (
        <div
          {...getRootProps()}
          className={cn(
            'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
            isDragActive
              ? 'border-primary bg-primary/10'
              : 'border-muted-foreground/25 hover:border-primary/50',
            images.length >= maxImages && 'opacity-50 cursor-not-allowed'
          )}
        >
          <input {...getInputProps()} />
          <Upload className="w-8 h-8 mx-auto mb-4 text-muted-foreground" />
          <div className="space-y-2">
            <p className="text-sm font-medium">
              {isDragActive
                ? 'Drop images here...'
                : 'Drag & drop images, or click to select'
              }
            </p>
            <p className="text-xs text-muted-foreground">
              Upload up to {maxImages} images (JPEG, PNG, WebP)
            </p>
            <p className="text-xs text-muted-foreground">
              {images.length}/{maxImages} images uploaded
            </p>
          </div>
        </div>
      )}

      {/* Image Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div
              key={index}
              className="relative group aspect-square border rounded-lg overflow-hidden bg-muted"
              draggable
              onDragStart={() => setDraggedIndex(index)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault()
                if (draggedIndex !== null && draggedIndex !== index) {
                  moveImage(draggedIndex, index)
                }
                setDraggedIndex(null)
              }}
            >
              <img
                src={getImageUrl(image)}
                alt={`Product image ${index + 1}`}
                className="w-full h-full object-cover"
              />

              {/* Primary badge */}
              {index === 0 && (
                <div className="absolute top-2 left-2">
                  <div className="bg-yellow-500 text-white px-2 py-1 rounded text-xs font-medium flex items-center gap-1">
                    <Star className="w-3 h-3" />
                    Primary
                  </div>
                </div>
              )}

              {/* Overlay controls */}
              {!readOnly && (
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="flex gap-1">
                  {/* Move up */}
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => moveImage(index, index - 1)}
                    disabled={index === 0}
                  >
                    <MoveUp className="w-3 h-3" />
                  </Button>

                  {/* Move down */}
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => moveImage(index, index + 1)}
                    disabled={index === images.length - 1}
                  >
                    <MoveDown className="w-3 h-3" />
                  </Button>

                  {/* Set as primary */}
                  {index !== 0 && (
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={() => setPrimaryImage(index)}
                    >
                      <Star className="w-3 h-3" />
                    </Button>
                  )}

                  {/* Remove */}
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    onClick={() => removeImage(index)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              </div>
              )}

              {/* Drag indicator */}
              <div className="absolute top-2 right-2">
                <div className="bg-white/80 backdrop-blur-sm rounded px-2 py-1 text-xs font-medium">
                  {index + 1}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {images.length > 0 && (
        <div className="text-xs text-muted-foreground space-y-1">
          <p>• First image will be used as the primary product image</p>
          <p>• Drag images to reorder, or use the arrow buttons</p>
          <p>• Click the star to set any image as primary</p>
          <p>• Images will be optimized and compressed automatically</p>
        </div>
      )}
    </div>
  )
}