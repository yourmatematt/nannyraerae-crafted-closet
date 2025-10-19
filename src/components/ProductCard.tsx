import { Link } from 'react-router-dom'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Card, CardContent } from './ui/card'
import { Package, ShoppingCart } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'
import productDress from '@/assets/product-dress.jpg'
import productRomper from '@/assets/product-romper.jpg'
import productPants from '@/assets/product-pants.jpg'
import heroImage from '@/assets/hero-image.jpg'

interface Product {
  id: string | number
  name: string
  description?: string
  price: number
  image_url?: string | null
  stock?: number
  stock_quantity?: number
  age_group?: string
  is_active?: boolean
  badge?: string
  in_stock?: boolean
  gender?: string
  product_type?: string
  is_gift_idea?: boolean
  collection?: string
  gift_category?: string
}

interface ProductCardProps {
  product: Product
  showAddToCart?: boolean
}

export function ProductCard({ product, showAddToCart = true }: ProductCardProps) {
  const { addToCart } = useCart()

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
    }).format(amount)
  }

  // Get placeholder image based on product ID or type
  const getPlaceholderImage = () => {
    const images = [productDress, productRomper, productPants, heroImage]
    const numericId = typeof product.id === 'string' ? parseInt(product.id) || 0 : product.id
    return images[numericId % images.length]
  }

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault() // Prevent navigation when clicking the button
    e.stopPropagation()

    addToCart({
      productId: product.id.toString(),
      name: product.name,
      price: product.price,
      imageUrl: product.image_url || '',
    })
  }

  // Handle different stock field names
  const stock = product.stock ?? product.stock_quantity ?? 0
  const inStock = product.in_stock ?? (stock > 0)
  const isSold = !inStock || stock === 0

  return (
    <Link to={`/products/${product.id}`} className="block">
      <Card className={`group overflow-hidden transition-all duration-200 cursor-pointer bg-card rounded-xl shadow-soft ${isSold ? 'opacity-75 grayscale hover:shadow-sm' : 'hover:shadow-lg hover:shadow-medium'}`}>
        <div className="relative aspect-[3/4] bg-muted rounded-lg overflow-hidden">
          <img
            src={product.image_url || getPlaceholderImage()}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />

          {/* Status Badges */}
          <div className="absolute top-3 left-3 flex gap-2">
            {product.badge && (
              <Badge className="bg-brand-coral text-white font-semibold">
                {product.badge}
              </Badge>
            )}
          </div>

          {/* Status Badge */}
          <div className="absolute top-3 right-3">
            {isSold ? (
              <Badge variant="destructive" className="bg-red-600 text-white">
                Sold
              </Badge>
            ) : (
              <Badge variant="default" className="bg-green-600 text-white">
                Available
              </Badge>
            )}
          </div>
        </div>

        <CardContent className="p-4">
          <div className="space-y-3">
            <h3 className="font-inter font-semibold text-foreground group-hover:text-primary transition-colors">
              {product.name}
            </h3>

            {product.description && (
              <p className="font-inter text-sm text-muted-foreground line-clamp-2">
                {product.description}
              </p>
            )}

            <div className="flex items-center gap-2">
              {product.age_group && (
                <Badge variant="outline" className="text-xs font-inter">
                  {product.age_group}
                </Badge>
              )}
            </div>

            <p className="font-inter text-xl font-bold text-primary">
              {formatCurrency(product.price)}
            </p>

            {showAddToCart && (
              <Button
                className="w-full mt-3"
                onClick={handleAddToCart}
                size="sm"
                disabled={isSold}
                variant={isSold ? "outline" : "default"}
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                {isSold ? 'Sold' : 'Add to Cart'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}