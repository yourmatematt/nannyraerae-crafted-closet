import { useState } from 'react'
import { Heart, Clock, ShoppingCart, Eye } from 'lucide-react'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Card, CardContent } from '../ui/card'
import { Timer } from '../ui/timer'
import { useCartStore } from '../../lib/store'
import { formatPrice } from '../../lib/utils/currency'
import { reserveProduct } from '../../lib/utils/reservations'
import { getProductStatus, type ProductWithImages, type ProductStatus } from '../../types'
import { toast } from 'sonner'
import productDress from '@/assets/product-dress.jpg'
import productRomper from '@/assets/product-romper.jpg'
import productPants from '@/assets/product-pants.jpg'
import heroImage from '@/assets/hero-image.jpg'

interface ProductCardProps {
  product: ProductWithImages
  onAddToCart?: (productId: string) => void
  onViewProduct?: (productId: string) => void
  showCTA?: boolean
}

export function ProductCard({
  product,
  onAddToCart,
  onViewProduct,
  showCTA = true
}: ProductCardProps) {
  const { currency, addItem } = useCartStore()
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [isInWishlist, setIsInWishlist] = useState(false)

  const status = getProductStatus(product)
  const primaryImage = product.product_images?.find(img => img.is_primary) || product.product_images?.[0]
  const reservedUntil = product.reserved_until ? new Date(product.reserved_until) : null

  // Get placeholder image based on product ID
  const getPlaceholderImage = () => {
    const images = [productDress, productRomper, productPants, heroImage]
    const hash = product.id.split('').reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a }, 0)
    return images[Math.abs(hash) % images.length]
  }

  const handleAddToCart = async () => {
    if (status !== 'available') return

    setIsAddingToCart(true)
    try {
      // Reserve the product
      const result = await reserveProduct(product.id)

      if (result.success && result.expiresAt) {
        // Add to cart store
        addItem(product, result.expiresAt)
        toast.success('Item reserved for 15 minutes!')

        if (onAddToCart) {
          onAddToCart(product.id)
        }
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

  const handleWishlist = () => {
    setIsInWishlist(!isInWishlist)
    // TODO: Implement wishlist functionality
  }

  const handleViewProduct = () => {
    if (onViewProduct) {
      onViewProduct(product.id)
    }
  }

  const getStatusBadge = (status: ProductStatus) => {
    switch (status) {
      case 'sold':
        return (
          <Badge variant="destructive" className="absolute top-3 left-3 z-10">
            SOLD
          </Badge>
        )
      case 'reserved':
        return (
          <Badge variant="outline" className="absolute top-3 left-3 z-10 bg-orange-100 text-orange-800 border-orange-200">
            IN CART
          </Badge>
        )
      case 'draft':
        return (
          <Badge variant="secondary" className="absolute top-3 left-3 z-10">
            DRAFT
          </Badge>
        )
      default:
        return (
          <Badge variant="secondary" className="absolute top-3 left-3 z-10 bg-pink-100 text-pink-800 border-pink-200">
            ONE OF A KIND
          </Badge>
        )
    }
  }

  const getSoldOverlay = () => {
    if (status === 'sold') {
      return (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-20">
          <div className="transform rotate-12 bg-red-600 text-white px-8 py-2 text-lg font-bold">
            SOLD
          </div>
        </div>
      )
    }
    return null
  }

  const getReservedIndicator = () => {
    if (status === 'reserved' && reservedUntil) {
      return (
        <div className="absolute bottom-3 left-3 right-3 z-10">
          <div className="bg-orange-100 dark:bg-orange-900/50 text-orange-800 dark:text-orange-200 px-2 py-1 rounded text-xs text-center">
            <Timer
              expiresAt={reservedUntil}
              showIcon={false}
              className="text-xs"
            />
            <div className="text-xs">in someone's cart</div>
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-all duration-200 cursor-pointer">
      <div className="relative aspect-square bg-muted overflow-hidden">
        <img
          src={primaryImage?.url || getPlaceholderImage()}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onClick={handleViewProduct}
        />

        {getStatusBadge(status)}
        {getSoldOverlay()}
        {getReservedIndicator()}

        {/* Wishlist button */}
        <Button
          size="sm"
          variant="ghost"
          className="absolute top-3 right-3 z-10 p-2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white"
          onClick={(e) => {
            e.stopPropagation()
            handleWishlist()
          }}
        >
          <Heart className={`w-4 h-4 ${isInWishlist ? 'fill-red-500 text-red-500' : ''}`} />
        </Button>

        {/* Image count indicator */}
        {product.product_images && product.product_images.length > 1 && (
          <div className="absolute bottom-3 right-3 z-10">
            <div className="bg-black/60 text-white px-2 py-1 rounded text-xs">
              +{product.product_images.length - 1}
            </div>
          </div>
        )}

        {/* Quick view overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
          <Button
            variant="secondary"
            onClick={handleViewProduct}
            className="transform scale-90 group-hover:scale-100 transition-transform"
          >
            <Eye className="w-4 h-4 mr-2" />
            Quick View
          </Button>
        </div>
      </div>

      <CardContent className="p-4">
        <div className="space-y-2">
          <h3 className="font-medium text-sm line-clamp-2 min-h-[2.5rem]">
            {product.name}
          </h3>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              Size {product.size}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {product.age_group}
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-semibold text-primary">
                {formatPrice(product.price, currency)}
              </p>
              {product.color_primary && (
                <p className="text-xs text-muted-foreground">
                  {product.color_primary}
                  {product.color_secondary && `, ${product.color_secondary}`}
                </p>
              )}
            </div>
          </div>

          {status === 'sold' && (
            <div className="pt-2">
              <p className="text-xs text-muted-foreground mb-2">
                This unique piece has found its home
              </p>
              <Button variant="outline" size="sm" className="w-full">
                Notify me of similar items
              </Button>
            </div>
          )}

          {status === 'reserved' && reservedUntil && (
            <div className="pt-2">
              <p className="text-xs text-orange-600 dark:text-orange-400 mb-2">
                Currently in someone's cart
              </p>
              <div className="text-center">
                <Timer
                  expiresAt={reservedUntil}
                  variant="warning"
                  className="text-xs justify-center"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Available if not purchased
                </p>
              </div>
            </div>
          )}

          {status === 'available' && showCTA && (
            <Button
              className="w-full mt-3"
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
                  Reserve for 15 min
                </>
              )}
            </Button>
          )}

          {status === 'draft' && (
            <Badge variant="secondary" className="w-full justify-center">
              Coming Soon
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  )
}