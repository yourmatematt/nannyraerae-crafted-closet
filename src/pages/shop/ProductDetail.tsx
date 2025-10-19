import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase/client'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { Separator } from '../../components/ui/separator'
import { Timer, Countdown } from '../../components/ui/timer'
import { CurrencySelector } from '../../components/CurrencySelector'
import {
  ArrowLeft,
  Heart,
  Share2,
  ShoppingCart,
  Clock,
  Ruler,
  Package,
  Shield,
  Star,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Bell
} from 'lucide-react'
import { useCartStore } from '../../lib/store'
import { formatPrice } from '../../lib/utils/currency'
import { reserveProduct } from '../../lib/utils/reservations'
import { getProductStatus, type ProductWithImages, type Review } from '../../types'
import { toast } from 'sonner'

export function ProductDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [product, setProduct] = useState<ProductWithImages | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isInWishlist, setIsInWishlist] = useState(false)
  const [similarProducts, setSimilarProducts] = useState<ProductWithImages[]>([])

  const { currency, addItem } = useCartStore()

  useEffect(() => {
    if (id) {
      loadProduct()
      loadReviews()
      loadSimilarProducts()
    }
  }, [id])

  const loadProduct = async () => {
    if (!id) return

    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          product_images (
            id,
            url,
            alt_text,
            is_primary,
            display_order
          ),
          category:categories (
            id,
            name,
            slug
          )
        `)
        .eq('id', id)
        .single()

      if (error) throw error
      setProduct(data)
    } catch (error) {
      console.error('Error loading product:', error)
      navigate('/shop')
    } finally {
      setIsLoading(false)
    }
  }

  const loadReviews = async () => {
    if (!id) return

    const { data } = await supabase
      .from('reviews')
      .select(`
        *,
        customer_profile:customer_profiles (
          first_name,
          last_name
        )
      `)
      .eq('product_id', id)
      .order('created_at', { ascending: false })

    if (data) setReviews(data)
  }

  const loadSimilarProducts = async () => {
    if (!id || !product) return

    const { data } = await supabase
      .from('products')
      .select(`
        *,
        product_images (
          id,
          url,
          alt_text,
          is_primary,
          display_order
        )
      `)
      .eq('category_id', product.category_id)
      .eq('is_draft', false)
      .neq('id', id)
      .limit(4)

    if (data) setSimilarProducts(data)
  }

  if (isLoading || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Loading product...</p>
        </div>
      </div>
    )
  }

  const status = getProductStatus(product)
  const reservedUntil = product.reserved_until ? new Date(product.reserved_until) : null
  const sortedImages = product.product_images?.sort((a, b) => a.display_order - b.display_order) || []
  const currentImage = sortedImages[currentImageIndex]

  const handleAddToCart = async () => {
    if (status !== 'available') return

    setIsAddingToCart(true)
    try {
      const result = await reserveProduct(product.id)

      if (result.success && result.expiresAt) {
        addItem(product, result.expiresAt)
        toast.success('Item reserved for 15 minutes!')
      } else {
        toast.error(result.error || 'Failed to reserve item')
      }
    } catch (error) {
      console.error('Error adding to cart:', error)
      toast.error('Something went wrong. Please try again.')
    } finally {
      setIsAddingToCart(false)
    }
  }

  const handleImageNavigation = (direction: 'prev' | 'next') => {
    if (sortedImages.length <= 1) return

    if (direction === 'prev') {
      setCurrentImageIndex(prev => prev === 0 ? sortedImages.length - 1 : prev - 1)
    } else {
      setCurrentImageIndex(prev => prev === sortedImages.length - 1 ? 0 : prev + 1)
    }
  }

  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : 0

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6">
          <Button variant="ghost" onClick={() => navigate('/shop')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Shop
          </Button>
          <span className="text-muted-foreground">/</span>
          <span className="text-sm">{product.category?.name}</span>
          <span className="text-muted-foreground">/</span>
          <span className="text-sm font-medium">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="relative aspect-square bg-muted rounded-lg overflow-hidden">
              {currentImage ? (
                <img
                  src={currentImage.url}
                  alt={currentImage.alt_text || product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="w-16 h-16 text-muted-foreground" />
                </div>
              )}

              {/* Status Overlays */}
              {status === 'sold' && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <div className="transform rotate-12 bg-red-600 text-white px-8 py-4 text-2xl font-bold">
                    SOLD
                  </div>
                </div>
              )}

              {status === 'reserved' && reservedUntil && (
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="bg-orange-100 dark:bg-orange-900/50 text-orange-800 dark:text-orange-200 px-4 py-2 rounded-lg text-center">
                    <div className="font-medium mb-1">Currently in someone's cart</div>
                    <Timer
                      expiresAt={reservedUntil}
                      showIcon={false}
                      className="text-sm justify-center"
                    />
                  </div>
                </div>
              )}

              {/* Image Navigation */}
              {sortedImages.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm"
                    onClick={() => handleImageNavigation('prev')}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm"
                    onClick={() => handleImageNavigation('next')}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>

                  {/* Image indicator */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
                    <div className="bg-black/60 text-white px-3 py-1 rounded-full text-sm">
                      {currentImageIndex + 1} / {sortedImages.length}
                    </div>
                  </div>
                </>
              )}

              {/* One of a kind badge */}
              <div className="absolute top-4 left-4">
                <Badge className="bg-pink-100 text-pink-800 border-pink-200">
                  <Sparkles className="w-3 h-3 mr-1" />
                  ONE OF A KIND
                </Badge>
              </div>
            </div>

            {/* Thumbnail images */}
            {sortedImages.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {sortedImages.map((image, index) => (
                  <button
                    key={image.id}
                    className={`aspect-square bg-muted rounded overflow-hidden border-2 transition-colors ${
                      index === currentImageIndex
                        ? 'border-primary'
                        : 'border-transparent hover:border-muted-foreground/50'
                    }`}
                    onClick={() => setCurrentImageIndex(index)}
                  >
                    <img
                      src={image.url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-start justify-between mb-2">
                <h1 className="text-3xl font-bold">{product.name}</h1>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm">
                    <Heart className={`w-4 h-4 ${isInWishlist ? 'fill-red-500 text-red-500' : ''}`} />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-4 mb-4">
                <div className="text-3xl font-bold text-primary">
                  {formatPrice(product.price, currency)}
                </div>
                <CurrencySelector />
              </div>

              {/* Rating */}
              {reviews.length > 0 && (
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= averageRating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-muted-foreground'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    ({reviews.length} review{reviews.length !== 1 ? 's' : ''})
                  </span>
                </div>
              )}

              {/* Size and Age */}
              <div className="flex gap-2 mb-6">
                <Badge variant="outline">Size {product.size}</Badge>
                <Badge variant="outline">{product.age_group}</Badge>
                {product.color_primary && (
                  <Badge variant="outline">{product.color_primary}</Badge>
                )}
                {product.color_secondary && (
                  <Badge variant="outline">{product.color_secondary}</Badge>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="font-medium mb-2">Description</h3>
              <p className="text-muted-foreground">{product.description}</p>
            </div>

            {/* Nanny's Story */}
            {product.story && (
              <div>
                <h3 className="font-medium mb-2">Nanny's Story</h3>
                <p className="text-muted-foreground italic">"{product.story}"</p>
              </div>
            )}

            {/* Measurements */}
            {product.measurements && Object.keys(product.measurements).length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Ruler className="w-4 h-4" />
                    Measurements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {Object.entries(product.measurements as Record<string, number>).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="capitalize">{key}:</span>
                        <span>{value}cm</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Materials & Care */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4">
                  <h4 className="font-medium mb-2">Materials</h4>
                  <p className="text-sm text-muted-foreground">{product.fabric}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <h4 className="font-medium mb-2">Care Instructions</h4>
                  <p className="text-sm text-muted-foreground">{product.care_instructions}</p>
                </CardContent>
              </Card>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              {status === 'available' && (
                <>
                  <Button
                    size="lg"
                    className="w-full"
                    onClick={handleAddToCart}
                    disabled={isAddingToCart}
                  >
                    {isAddingToCart ? (
                      <>
                        <Clock className="w-4 h-4 mr-2 animate-spin" />
                        Reserving...
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Reserve for 15 minutes
                      </>
                    )}
                  </Button>
                  <p className="text-xs text-center text-muted-foreground">
                    This piece will be reserved for you for 15 minutes to complete your purchase
                  </p>
                </>
              )}

              {status === 'sold' && (
                <>
                  <div className="text-center p-6 bg-muted/50 rounded-lg">
                    <h3 className="font-medium text-lg mb-2">This piece has found its home</h3>
                    <p className="text-muted-foreground mb-4">
                      But don't worry! Nanny Rae Rae creates similar beautiful pieces.
                    </p>
                    <Button variant="outline" className="w-full">
                      <Bell className="w-4 h-4 mr-2" />
                      Notify me of similar items
                    </Button>
                  </div>
                </>
              )}

              {status === 'reserved' && reservedUntil && (
                <div className="text-center p-6 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                  <h3 className="font-medium text-lg mb-2">Currently in someone's cart</h3>
                  <p className="text-muted-foreground mb-4">
                    This item will become available if not purchased within:
                  </p>
                  <Countdown
                    expiresAt={reservedUntil}
                    onExpire={() => {
                      // Reload product data
                      loadProduct()
                      toast.success('Item is now available!')
                    }}
                  />
                </div>
              )}
            </div>

            {/* Trust indicators */}
            <div className="flex items-center justify-center gap-6 pt-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                <span>Secure checkout</span>
              </div>
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                <span>Fast shipping</span>
              </div>
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4" />
                <span>Made with love</span>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        {reviews.length > 0 && (
          <Card className="mb-12">
            <CardHeader>
              <CardTitle>Customer Reviews</CardTitle>
              <CardDescription>
                See what other parents love about this piece
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {reviews.slice(0, 3).map((review) => (
                  <div key={review.id}>
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-4 h-4 ${
                                  star <= review.rating
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-muted-foreground'
                                }`}
                              />
                            ))}
                          </div>
                          <Badge variant="outline" className="text-xs">
                            Verified Purchase
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {review.customer_profile?.first_name} {review.customer_profile?.last_name?.[0]}.
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(review.created_at!).toLocaleDateString()}
                      </p>
                    </div>
                    {review.title && (
                      <h4 className="font-medium mb-1">{review.title}</h4>
                    )}
                    <p className="text-sm text-muted-foreground">{review.comment}</p>
                    {review !== reviews[reviews.length - 1] && <Separator className="mt-4" />}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}