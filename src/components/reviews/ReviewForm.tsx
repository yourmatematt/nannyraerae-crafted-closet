import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Star, Upload, X } from 'lucide-react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { supabase } from '../../lib/supabase/client'
import { toast } from 'sonner'
import type { ReviewInsert } from '../../types'

const reviewSchema = z.object({
  rating: z.number().min(1, 'Please select a rating').max(5),
  title: z.string().min(3, 'Title must be at least 3 characters').max(100),
  comment: z.string().min(10, 'Comment must be at least 10 characters').max(1000),
})

type ReviewFormData = z.infer<typeof reviewSchema>

interface ReviewFormProps {
  productId: string
  orderId: string
  onSuccess?: () => void
  onCancel?: () => void
}

export function ReviewForm({ productId, orderId, onSuccess, onCancel }: ReviewFormProps) {
  const [images, setImages] = useState<File[]>([])
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hoveredRating, setHoveredRating] = useState(0)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: 0
    }
  })

  const watchedRating = watch('rating')

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    if (files.length + images.length > 3) {
      toast.error('You can upload up to 3 images')
      return
    }

    setImages(prev => [...prev, ...files])

    // Create preview URLs
    const newUrls = files.map(file => URL.createObjectURL(file))
    setImageUrls(prev => [...prev, ...newUrls])
  }

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
    setImageUrls(prev => {
      // Revoke the object URL to prevent memory leaks
      URL.revokeObjectURL(prev[index])
      return prev.filter((_, i) => i !== index)
    })
  }

  const uploadReviewImages = async (reviewId: string): Promise<string[]> => {
    if (images.length === 0) return []

    const uploadPromises = images.map(async (file, index) => {
      const fileExt = file.name.split('.').pop()
      const fileName = `reviews/${reviewId}/${index}-${Date.now()}.${fileExt}`

      const { data, error } = await supabase.storage
        .from('review-images')
        .upload(fileName, file)

      if (error) throw error

      const { data: { publicUrl } } = supabase.storage
        .from('review-images')
        .getPublicUrl(data.path)

      return publicUrl
    })

    return Promise.all(uploadPromises)
  }

  const onSubmit = async (data: ReviewFormData) => {
    setIsSubmitting(true)
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('You must be logged in to leave a review')
        return
      }

      // Create review
      const reviewData: ReviewInsert = {
        product_id: productId,
        customer_id: user.id,
        order_id: orderId,
        rating: data.rating,
        title: data.title,
        comment: data.comment,
        is_verified_purchase: true
      }

      const { data: review, error } = await supabase
        .from('reviews')
        .insert(reviewData)
        .select()
        .single()

      if (error) throw error

      // Upload images if any
      if (images.length > 0) {
        const uploadedUrls = await uploadReviewImages(review.id)

        // Update review with image URLs
        await supabase
          .from('reviews')
          .update({ images: uploadedUrls })
          .eq('id', review.id)
      }

      toast.success('Review submitted successfully!')

      if (onSuccess) {
        onSuccess()
      }

    } catch (error) {
      console.error('Error submitting review:', error)
      toast.error('Failed to submit review. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Write a Review</CardTitle>
        <CardDescription>
          Share your thoughts about this one-of-a-kind piece
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Rating */}
          <div>
            <Label className="text-base font-medium">Overall Rating *</Label>
            <div className="flex items-center gap-1 mt-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className="p-1"
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  onClick={() => setValue('rating', star)}
                >
                  <Star
                    className={`w-8 h-8 transition-colors ${
                      star <= (hoveredRating || watchedRating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-muted-foreground hover:text-yellow-400'
                    }`}
                  />
                </button>
              ))}
            </div>
            {errors.rating && (
              <p className="text-sm text-red-500 mt-1">{errors.rating.message}</p>
            )}
          </div>

          {/* Title */}
          <div>
            <Label htmlFor="title">Review Title *</Label>
            <Input
              id="title"
              {...register('title')}
              placeholder="Great quality and beautiful design"
              className="mt-1"
            />
            {errors.title && (
              <p className="text-sm text-red-500 mt-1">{errors.title.message}</p>
            )}
          </div>

          {/* Comment */}
          <div>
            <Label htmlFor="comment">Your Review *</Label>
            <Textarea
              id="comment"
              {...register('comment')}
              placeholder="Tell other parents about your experience with this piece..."
              rows={4}
              className="mt-1"
            />
            {errors.comment && (
              <p className="text-sm text-red-500 mt-1">{errors.comment.message}</p>
            )}
          </div>

          {/* Image Upload */}
          <div>
            <Label className="text-base font-medium">Add Photos (Optional)</Label>
            <p className="text-sm text-muted-foreground mb-3">
              Help other customers by showing how the piece looks! Up to 3 photos.
            </p>

            {images.length < 3 && (
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                  id="review-images"
                />
                <label htmlFor="review-images" className="cursor-pointer">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm">Click to upload photos</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    JPEG, PNG up to 5MB each
                  </p>
                </label>
              </div>
            )}

            {/* Image previews */}
            {imageUrls.length > 0 && (
              <div className="grid grid-cols-3 gap-3 mt-3">
                {imageUrls.map((url, index) => (
                  <div key={index} className="relative aspect-square">
                    <img
                      src={url}
                      alt={`Review image ${index + 1}`}
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-1 right-1 p-1 h-auto"
                      onClick={() => removeImage(index)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="flex-1"
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Review'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}