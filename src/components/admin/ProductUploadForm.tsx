import { useState, useCallback, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { X, Upload, Eye, Save } from 'lucide-react'
import { ImageUploader } from './ImageUploader'
import { ProductPreview } from './ProductPreview'
import { supabase } from '../../lib/supabase/client'
import { toast } from 'sonner'
import type { AgeGroup } from '../../types'
import { SIZE_OPTIONS } from '../../types'

const productSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  story: z.string().min(5, 'Story must be at least 5 characters'),
  age_group: z.enum(['3mths', '6mths', '9mths', '1yr', '2yrs', '3yrs', '4yrs', '5yrs']),
  size: z.string().min(1, 'Size is required'),
  price: z.number().min(1, 'Price must be greater than 0'),
  product_type: z.string().min(1, 'Product type is required'),
  gender: z.string().optional(),
  collection: z.string().optional(),
  gift_category: z.string().optional(),
  is_gift_idea: z.boolean().optional()
})

type ProductFormData = z.infer<typeof productSchema>

interface ProductUploadFormProps {
  onSuccess?: (productId: string) => void
  initialData?: Partial<ProductFormData>
  productId?: string
}

export function ProductUploadForm({ onSuccess, initialData, productId }: ProductUploadFormProps) {
  const [image, setImage] = useState<File | null>(null)
  const [imageUrl, setImageUrl] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  // Set initial image URL when editing
  useEffect(() => {
    if (initialData?.image_url) {
      setImageUrl(initialData.image_url)
    }
  }, [initialData])

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      age_group: '1yr',
      collection: '',
      gift_category: '',
      is_gift_idea: false,
      ...initialData
    }
  })

  const watchedValues = watch()
  const selectedAgeGroup = watch('age_group')


  // Generate SKU
  const generateSKU = useCallback(() => {
    const prefix = 'NRNR'
    const timestamp = Date.now().toString().slice(-6)
    const random = Math.random().toString(36).substring(2, 5).toUpperCase()
    return `${prefix}-${timestamp}-${random}`
  }, [])

  // Generate slug from name
  const generateSlug = useCallback((name: string) => {
    const baseSlug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    // Add timestamp to ensure uniqueness
    const timestamp = Date.now().toString().slice(-6)
    return `${baseSlug}-${timestamp}`
  }, [])

  // Handle image upload
  const handleImagesSelected = (files: File[]) => {
    if (files[0]) {
      setImage(files[0])
      setImageUrl(URL.createObjectURL(files[0]))
    }
  }

  // Upload image to Supabase Storage
  const uploadImage = async (productId: string): Promise<string> => {
    if (!image) throw new Error('No image to upload')

    const fileExt = image.name.split('.').pop()
    const fileName = `${productId}-${Date.now()}.${fileExt}`

    const { data, error } = await supabase.storage
      .from('product-images')
      .upload(fileName, image)

    if (error) throw error

    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(data.path)

    return publicUrl
  }


  // Submit form
  const onSubmit = async (data: ProductFormData) => {
    setIsLoading(true)
    try {
      if (!image) {
        toast.error('Please upload a product image')
        return
      }


      // Create product record
      const productData: any = {
        name: data.name,
        slug: generateSlug(data.name),
        sku: generateSKU(),
        description: data.description,
        story: data.story,
        price: data.price,
        size: data.size,
        age_group: data.age_group,
        product_type: data.product_type,
        gender: data.gender,
        collection: data.collection,
        gift_category: data.gift_category,
        is_gift_idea: data.is_gift_idea,
        is_draft: false, // false means the product is active/published
        is_sold: false   // false means the product is available for purchase
      }

      let productResponse
      if (productId) {
        // Update existing product
        productResponse = await supabase
          .from('products')
          .update(productData)
          .eq('id', productId)
          .select()
          .single()
      } else {
        // Create new product
        productResponse = await supabase
          .from('products')
          .insert(productData)
          .select()
          .single()
      }

      if (productResponse.error) throw productResponse.error

      const newProductId = productResponse.data.id

      // Upload image
      if (image) {
        const uploadedUrl = await uploadImage(newProductId)

        // Update product with image_url
        await supabase
          .from('products')
          .update({ image_url: uploadedUrl })
          .eq('id', newProductId)
      }

      toast.success('Product saved successfully!')

      if (onSuccess) {
        onSuccess(newProductId)
      }

    } catch (error) {
      console.error('Error saving product:', error)
      toast.error('Failed to save product. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {productId ? 'Edit Product' : 'Add New Product'}
          </h1>
          <p className="text-muted-foreground">
            Create a new one-of-a-kind piece for your collection
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowPreview(!showPreview)}
          >
            <Eye className="w-4 h-4 mr-2" />
            {showPreview ? 'Hide Preview' : 'Preview'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Product Images</CardTitle>
              <CardDescription>
                {productId
                  ? "Current product image (cannot be changed when editing)"
                  : "Upload high-quality images of your unique piece"
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ImageUploader
                onImagesSelected={handleImagesSelected}
                maxImages={1}
                existingImages={imageUrl ? [imageUrl] : []}
                readOnly={!!productId}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  {...register('name')}
                  placeholder="Rainbow Butterfly Dress"
                />
                {errors.name && (
                  <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  {...register('description')}
                  placeholder="Detailed description of the piece..."
                  rows={4}
                />
                {errors.description && (
                  <p className="text-sm text-red-500 mt-1">{errors.description.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="story">Your Story *</Label>
                <Textarea
                  id="story"
                  {...register('story')}
                  placeholder="I made this piece thinking about..."
                  rows={3}
                />
                {errors.story && (
                  <p className="text-sm text-red-500 mt-1">{errors.story.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Pricing & Category</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="price">Price (AUD) *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  {...register('price', { valueAsNumber: true })}
                  placeholder="45.00"
                />
                {errors.price && (
                  <p className="text-sm text-red-500 mt-1">{errors.price.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Product Type *</Label>
                  <Select
                    value={watchedValues.product_type}
                    onValueChange={(value) => setValue('product_type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Dress">Dress</SelectItem>
                      <SelectItem value="Jacket">Jacket</SelectItem>
                      <SelectItem value="Overalls">Overalls</SelectItem>
                      <SelectItem value="Pants">Pants</SelectItem>
                      <SelectItem value="Romper">Romper</SelectItem>
                      <SelectItem value="Sets">Sets</SelectItem>
                      <SelectItem value="Shirts">Shirts</SelectItem>
                      <SelectItem value="Shorts">Shorts</SelectItem>
                      <SelectItem value="Top">Top</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.product_type && (
                    <p className="text-sm text-red-500 mt-1">{errors.product_type.message}</p>
                  )}
                </div>

                <div>
                  <Label>Gender</Label>
                  <Select
                    value={watchedValues.gender || 'none'}
                    onValueChange={(value) => setValue('gender', value === 'none' ? undefined : value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Optional" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Not specified</SelectItem>
                      <SelectItem value="Boys">Boys</SelectItem>
                      <SelectItem value="Girls">Girls</SelectItem>
                      <SelectItem value="Gender Neutral">Gender Neutral</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Collections</Label>
                <p className="text-sm text-muted-foreground mb-3">
                  Select all collections this product belongs to (optional)
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    'Garden Party',
                    'Modern Vintage',
                    'Rainbow Bright',
                    'Coastal Dreams',
                    'Spring Awakening',
                    'Summer Adventures',
                    'Coordinating Siblings',
                    'First Wardrobe',
                    'Special Occasions',
                    'Eco-Conscious'
                  ].map((collection) => (
                    <label key={collection} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        value={collection}
                        checked={watchedValues.collection?.includes(collection)}
                        onChange={(e) => {
                          const current = watchedValues.collection?.split(',').filter(Boolean) || []
                          const updated = e.target.checked
                            ? [...current, collection]
                            : current.filter(c => c !== collection)
                          setValue('collection', updated.join(','))
                        }}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm">{collection}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="mt-6">
                <Label>Gift Ideas</Label>
                <p className="text-sm text-muted-foreground mb-3">
                  Select gift occasions this product is perfect for (optional)
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    'First Birthday',
                    'New Baby',
                    'Christmas',
                    'Easter',
                    'Starting School',
                    'Big Sibling'
                  ].map((gift) => (
                    <label key={gift} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        value={gift}
                        checked={watchedValues.gift_category?.includes(gift)}
                        onChange={(e) => {
                          const current = watchedValues.gift_category?.split(',').filter(Boolean) || []
                          const updated = e.target.checked
                            ? [...current, gift]
                            : current.filter(g => g !== gift)

                          // Auto-set is_gift_idea if any gift category is selected
                          setValue('gift_category', updated.join(','))
                          setValue('is_gift_idea', updated.length > 0)
                        }}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm">{gift}</span>
                    </label>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Size & Measurements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="age_group">Age Group *</Label>
                  <Select
                    value={selectedAgeGroup}
                    onValueChange={(value: AgeGroup) => setValue('age_group', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3mths">3 Months</SelectItem>
                      <SelectItem value="6mths">6 Months</SelectItem>
                      <SelectItem value="9mths">9 Months</SelectItem>
                      <SelectItem value="1yr">1 Year</SelectItem>
                      <SelectItem value="2yrs">2 Years</SelectItem>
                      <SelectItem value="3yrs">3 Years</SelectItem>
                      <SelectItem value="4yrs">4 Years</SelectItem>
                      <SelectItem value="5yrs">5 Years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="size">Size *</Label>
                  <Select
                    value={watchedValues.size}
                    onValueChange={(value) => setValue('size', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent>
                      {SIZE_OPTIONS[selectedAgeGroup]?.map((size) => (
                        <SelectItem key={size} value={size}>
                          Size {size}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

            </CardContent>
          </Card>

          {showPreview && (
            <Card>
              <CardHeader>
                <CardTitle>Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <ProductPreview
                  data={watchedValues}
                  images={imageUrl ? [imageUrl] : []}
                />
              </CardContent>
            </Card>
          )}

          <Button
            type="button"
            onClick={handleSubmit(onSubmit)}
            disabled={isLoading}
            className="w-full"
          >
            <Save className="w-4 h-4 mr-2" />
            {isLoading ? 'Saving...' : 'Save Product'}
          </Button>
        </div>
      </div>
    </div>
  )
}