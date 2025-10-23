import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { ProductCard } from '@/components/ProductCard'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'

interface Product {
  id: string
  name: string
  description?: string
  price: number
  image_url?: string | null
  stock?: number
  age_group?: string
  is_active?: boolean
  created_at: string
  badge?: string
  in_stock?: boolean
  gender?: string
  product_type?: string
  is_gift_idea?: boolean
  collection?: string
  gift_category?: string
}

const NewArrivalsSection = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchNewArrivals()
  }, [])

  const fetchNewArrivals = async () => {
    try {
      setIsLoading(true)

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(4)

      if (error) {
        throw error
      }

      // Add "NEW" badge to recent products (within 7 days)
      const productsWithBadges = (data || []).map(product => {
        const createdAt = new Date(product.created_at)
        const daysOld = Math.ceil((Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24))

        return {
          ...product,
          badge: daysOld <= 7 ? 'NEW' : undefined,
          in_stock: (product.stock || 0) > 0
        }
      })

      setProducts(productsWithBadges)
    } catch (error) {
      console.error('Error fetching new arrivals:', error)
      setProducts([])
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="h-8 bg-gray-200 rounded mx-auto mb-4 w-48 animate-pulse"></div>
            <div className="h-6 bg-gray-200 rounded mx-auto w-96 animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[3/4] bg-gray-200 rounded-xl mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-6 bg-gray-200 rounded w-20"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (products.length === 0) {
    return null // Don't show section if no products
  }

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4" style={{ color: '#A38C71' }}>New Arrivals</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover our latest handcrafted pieces, each one unique and made with love
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
            />
          ))}
        </div>

        <div className="text-center">
          <Button asChild variant="outline" size="lg">
            <Link to="/new-arrivals">
              View All New Arrivals
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}

export default NewArrivalsSection