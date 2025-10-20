import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useCart } from '@/contexts/CartContext'
import { toast } from 'sonner'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, ShoppingCart, Package, Heart, Star, Award, Shield, Truck, RefreshCw, RotateCcw, Shirt, Sparkles } from 'lucide-react'
import { ProductCard } from '@/components/ProductCard'
import { Textarea } from '@/components/ui/textarea'

interface Product {
  id: string
  name: string
  description: string
  price: number
  image_url: string | null
  stock: number
  age_group: string
  is_active: boolean
  gender?: string
  product_type?: string
  is_gift_idea?: boolean
  collection?: string
  gift_category?: string
  created_at: string
  updated_at: string
}

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { addToCart } = useCart()

  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [addingToCart, setAddingToCart] = useState(false)
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    message: ''
  })
  const [sendingMessage, setSendingMessage] = useState(false)

  useEffect(() => {
    if (id) {
      fetchProduct()
    }
  }, [id])

  const fetchProduct = async () => {
    if (!id) return

    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .eq('is_active', true)
        .single()

      if (error) throw error

      setProduct(data)
    } catch (error) {
      console.error('Error fetching product:', error)
      navigate('/shop')
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = async () => {
    if (!product) return

    setAddingToCart(true)
    try {
      // Add single item to cart (one-of-a-kind)
      addToCart({
        productId: product.id,
        name: product.name,
        price: product.price,
        imageUrl: product.image_url || '',
      })

      // Success message is now handled in CartContext
    } catch (error) {
      console.error('Error adding to cart:', error)
      alert('Failed to add to cart. Please try again.')
    } finally {
      setAddingToCart(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
    }).format(amount)
  }


  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!contactForm.name.trim() || !contactForm.email.trim() || !contactForm.message.trim()) return

    setSendingMessage(true)

    try {
      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'api-key': import.meta.env.VITE_BREVO_API_KEY,
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          sender: { name: contactForm.name, email: contactForm.email },
          to: [{ email: 'hello@bynannyraerae.com.au' }],
          subject: `Question about ${product?.name}`,
          htmlContent: `
            <h3>Product Inquiry</h3>
            <p><strong>Product:</strong> ${product?.name}</p>
            <p><strong>From:</strong> ${contactForm.name} (${contactForm.email})</p>
            <p><strong>Message:</strong></p>
            <p>${contactForm.message.replace(/\n/g, '<br>')}</p>
          `
        })
      })

      if (response.ok) {
        toast.success("Message sent! We'll reply within 24 hours.")
        setContactForm({ name: '', email: '', message: '' })
      } else {
        throw new Error('Failed to send message')
      }
    } catch (error) {
      console.error('Error sending message:', error)
      toast.error('Failed to send message. Please try again.')
    } finally {
      setSendingMessage(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-pink-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading product...</p>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Product not found</h2>
          <p className="text-gray-600 mb-6">The product you're looking for doesn't exist.</p>
          <Button asChild>
            <Link to="/new-arrivals" state={{ preserveScroll: true }}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Shop
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  const isSold = product.stock === 0

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gray-50">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumb */}
          <div className="mb-6">
            <Button asChild variant="ghost">
              <Link to="/new-arrivals" state={{ preserveScroll: true }}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Products
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Image */}
          <div className="space-y-4">
            <div className="aspect-square bg-white rounded-lg overflow-hidden shadow-sm">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                  <Package className="w-24 h-24 text-gray-400" />
                </div>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-4">
            {/* Badges Section */}
            <div className="flex items-center gap-3 mb-2">
              <Badge variant="outline" className="px-3 py-1">{product.age_group}</Badge>
              {isSold && (
                <Badge variant="destructive" className="bg-red-600 text-white px-3 py-1">
                  Sold
                </Badge>
              )}
            </div>

            {/* Title and Price Section */}
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold text-gray-900 leading-tight">{product.name}</h1>
              <p className="text-xl font-semibold text-pink-600 mb-4">
                {formatCurrency(product.price)}
              </p>
            </div>

            {/* Description Section */}
            <div>
              <p className="text-gray-600 leading-relaxed text-base font-normal">{product.description}</p>
            </div>

            {/* Add to Cart Section */}
            <div className="space-y-4 mt-4">
              <Button
                onClick={handleAddToCart}
                disabled={addingToCart || isSold}
                className={`w-full py-2.5 text-sm font-medium ${isSold ? 'bg-gray-400 text-gray-600 cursor-not-allowed' : 'bg-primary hover:bg-primary/90 text-white'}`}
              >
                {isSold ? (
                  'Sold Out'
                ) : addingToCart ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Adding to Cart...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Add to Cart
                  </>
                )}
              </Button>

              {/* Trust badges with improved design */}
              <div className="my-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Free Shipping */}
                <div className="flex flex-col items-center text-center p-6 bg-primary/5 rounded-lg border border-primary/20">
                  <div className="w-12 h-12 mb-3 bg-primary/10 rounded-full flex items-center justify-center">
                    <Truck className="w-6 h-6 text-primary" />
                  </div>
                  <h4 className="font-semibold text-foreground mb-1">Free Shipping</h4>
                  <p className="text-sm text-muted-foreground">On orders over $100</p>
                </div>

                {/* Secure Payment */}
                <div className="flex flex-col items-center text-center p-6 bg-primary/5 rounded-lg border border-primary/20">
                  <div className="w-12 h-12 mb-3 bg-primary/10 rounded-full flex items-center justify-center">
                    <Shield className="w-6 h-6 text-primary" />
                  </div>
                  <h4 className="font-semibold text-foreground mb-1">Secure Payment</h4>
                  <p className="text-sm text-muted-foreground">Safe & encrypted</p>
                </div>

                {/* 30-Day Returns */}
                <div className="flex flex-col items-center text-center p-6 bg-primary/5 rounded-lg border border-primary/20">
                  <div className="w-12 h-12 mb-3 bg-primary/10 rounded-full flex items-center justify-center">
                    <RotateCcw className="w-6 h-6 text-primary" />
                  </div>
                  <h4 className="font-semibold text-foreground mb-1">Easy Returns</h4>
                  <p className="text-sm text-muted-foreground">30-day guarantee</p>
                </div>
              </div>

              {/* Additional product details */}
              <div className="mt-6 space-y-4 border-t pt-6">
                <div className="flex items-start gap-3">
                  <Shirt className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-sm mb-1">One-of-a-Kind</h4>
                    <p className="text-sm text-muted-foreground">This item is handmade and unique. No two pieces are exactly alike.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-sm mb-1">Quality Fabrics</h4>
                    <p className="text-sm text-muted-foreground">Made from premium cotton and natural materials for comfort and durability.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Heart className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-sm mb-1">Handmade in Australia</h4>
                    <p className="text-sm text-muted-foreground">Lovingly crafted by Rae in regional Australia with years of experience.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Product Information Tabs */}
            <div className="mt-4">
              <ProductInfoTabs product={product} />
            </div>
          </div>
        </div>
      </div>

      {/* Similar Products Section */}
      <SimilarProducts currentProductId={product.id} product={product} />

        {/* Value Proposition Section */}
        <section className="py-16 bg-muted/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

              {/* Card 1: Handmade with Love */}
              <div className="text-center bg-card rounded-xl p-8 shadow-soft hover:shadow-medium transition-shadow">
                <div className="w-16 h-16 mx-auto mb-6 bg-pink-100 rounded-full flex items-center justify-center">
                  <Heart className="w-8 h-8 text-pink-600" />
                </div>
                <h3 className="font-playfair text-xl font-bold text-foreground mb-4">
                  Handmade with Love
                </h3>
                <p className="font-inter text-muted-foreground mb-6 leading-relaxed">
                  Each piece is uniquely crafted by Rae with care and attention to detail
                </p>
                <Link to="/about">
                  <Button variant="outline" className="font-inter font-semibold">
                    Our Story
                  </Button>
                </Link>
              </div>

              {/* Card 2: One-of-a-Kind Pieces */}
              <div className="text-center bg-card rounded-xl p-8 shadow-soft hover:shadow-medium transition-shadow">
                <div className="w-16 h-16 mx-auto mb-6 bg-blue-100 rounded-full flex items-center justify-center">
                  <Star className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="font-playfair text-xl font-bold text-foreground mb-4">
                  Unique Pieces
                </h3>
                <p className="font-inter text-muted-foreground mb-6 leading-relaxed">
                  Every item is unique - when it's gone, it's gone
                </p>
                <Link to="/new-arrivals">
                  <Button variant="outline" className="font-inter font-semibold">
                    Shop All
                  </Button>
                </Link>
              </div>

              {/* Card 3: Quality You Can Trust */}
              <div className="text-center bg-card rounded-xl p-8 shadow-soft hover:shadow-medium transition-shadow">
                <div className="w-16 h-16 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
                  <Award className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="font-playfair text-xl font-bold text-foreground mb-4">
                  Quality You Can Trust
                </h3>
                <p className="font-inter text-muted-foreground mb-6 leading-relaxed">
                  Made with premium fabrics and craftsmanship that lasts
                </p>
                <Link to="/about">
                  <Button variant="outline" className="font-inter font-semibold">
                    Learn More
                  </Button>
                </Link>
              </div>

            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  )
}

// Product Info Tabs Component
function ProductInfoTabs({ product }: { product: Product | null }) {
  const [activeTab, setActiveTab] = useState('story')

  const tabs = [
    { id: 'story', label: 'The Story' },
    { id: 'care', label: 'Care' },
    { id: 'details', label: 'Sizing Guide' },
    { id: 'returns', label: 'Returns' }
  ]

  return (
    <div className="w-full">
      {/* Tab Navigation */}
      <div className="flex justify-center mb-6">
        <div className="bg-muted rounded-full p-1 inline-flex max-w-2xl w-full">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-12 py-2 text-sm font-medium transition-all duration-200 rounded-full relative whitespace-nowrap ${
                activeTab === tab.id
                  ? 'text-foreground bg-white shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="py-4 min-h-[200px]">
        {activeTab === 'details' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium mb-3">Sizing Guide</h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300 rounded-lg text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-sm">
                      <th className="border border-gray-300 px-4 py-2 text-left font-semibold text-sm">Age</th>
                      <th className="border border-gray-300 px-4 py-2 text-left font-semibold text-sm">Height (cm)</th>
                      <th className="border border-gray-300 px-4 py-2 text-left font-semibold text-sm">Chest (cm)</th>
                      <th className="border border-gray-300 px-4 py-2 text-left font-semibold text-sm">Waist (cm)</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    <tr className="text-sm">
                      <td className="border border-gray-300 px-4 py-2 text-sm">3mths</td>
                      <td className="border border-gray-300 px-4 py-2 text-sm">56-62</td>
                      <td className="border border-gray-300 px-4 py-2 text-sm">38-42</td>
                      <td className="border border-gray-300 px-4 py-2 text-sm">38-42</td>
                    </tr>
                    <tr className="bg-gray-50 text-sm">
                      <td className="border border-gray-300 px-4 py-2 text-sm">6mths</td>
                      <td className="border border-gray-300 px-4 py-2 text-sm">62-68</td>
                      <td className="border border-gray-300 px-4 py-2 text-sm">42-44</td>
                      <td className="border border-gray-300 px-4 py-2 text-sm">42-44</td>
                    </tr>
                    <tr className="text-sm">
                      <td className="border border-gray-300 px-4 py-2 text-sm">9mths</td>
                      <td className="border border-gray-300 px-4 py-2 text-sm">68-74</td>
                      <td className="border border-gray-300 px-4 py-2 text-sm">44-46</td>
                      <td className="border border-gray-300 px-4 py-2 text-sm">44-46</td>
                    </tr>
                    <tr className="bg-gray-50 text-sm">
                      <td className="border border-gray-300 px-4 py-2 text-sm">1yr</td>
                      <td className="border border-gray-300 px-4 py-2 text-sm">74-80</td>
                      <td className="border border-gray-300 px-4 py-2 text-sm">46-48</td>
                      <td className="border border-gray-300 px-4 py-2 text-sm">46-48</td>
                    </tr>
                    <tr className="text-sm">
                      <td className="border border-gray-300 px-4 py-2 text-sm">2yrs</td>
                      <td className="border border-gray-300 px-4 py-2 text-sm">80-92</td>
                      <td className="border border-gray-300 px-4 py-2 text-sm">48-51</td>
                      <td className="border border-gray-300 px-4 py-2 text-sm">48-51</td>
                    </tr>
                    <tr className="bg-gray-50 text-sm">
                      <td className="border border-gray-300 px-4 py-2 text-sm">3yrs</td>
                      <td className="border border-gray-300 px-4 py-2 text-sm">92-98</td>
                      <td className="border border-gray-300 px-4 py-2 text-sm">51-53</td>
                      <td className="border border-gray-300 px-4 py-2 text-sm">51-53</td>
                    </tr>
                    <tr className="text-sm">
                      <td className="border border-gray-300 px-4 py-2 text-sm">4yrs</td>
                      <td className="border border-gray-300 px-4 py-2 text-sm">98-104</td>
                      <td className="border border-gray-300 px-4 py-2 text-sm">53-55</td>
                      <td className="border border-gray-300 px-4 py-2 text-sm">53-55</td>
                    </tr>
                    <tr className="bg-gray-50 text-sm">
                      <td className="border border-gray-300 px-4 py-2 text-sm">5yrs</td>
                      <td className="border border-gray-300 px-4 py-2 text-sm">104-110</td>
                      <td className="border border-gray-300 px-4 py-2 text-sm">55-57</td>
                      <td className="border border-gray-300 px-4 py-2 text-sm">55-57</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                <strong>Note:</strong> Each piece is handmade and may vary slightly. Contact us for specific measurements.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'story' && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium mb-3">The Story Behind This Piece</h3>
            <div className="text-muted-foreground leading-relaxed text-sm">
              <p>
                Each piece from Nanny Rae Rae's collection is lovingly handcrafted in regional Australia with the care and attention that only comes from years of experience creating beautiful children's clothing. Rae's passion for creating unique, one-of-a-kind pieces means that no two items are exactly alike. Every stitch tells a story, every fabric choice is made with love, and every finished piece carries the warmth of a grandmother's touch. This particular piece showcases Rae's signature style - combining traditional craftsmanship with modern design elements that children love to wear and parents love to see. When you choose a Nanny Rae Rae piece, you're not just buying clothing - you're bringing home a piece of Australian handmade tradition that will create lasting memories for your little one.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'care' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-medium mb-3">Care Instructions</h3>
              <div className="space-y-3 text-sm">
                <p>• Machine wash cold (30°C) with similar colors</p>
                <p>• Use gentle or delicate cycle to preserve fabric quality</p>
                <p>• Avoid bleach or harsh chemicals</p>
                <p>• Tumble dry low or hang dry in shade</p>
                <p>• Iron on low heat if needed, inside out</p>
                <p>• Store in a cool, dry place</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'returns' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-medium mb-3">Returns & Exchanges</h3>
              <div className="space-y-3 text-sm">
                <p>• Returns accepted within 14 days of receipt</p>
                <p>• Items must be unworn, unwashed, with original tags</p>
                <p>• Refunds issued to original payment method</p>
                <p>• Customer pays return shipping unless item is faulty</p>
                <p>• Email <a href="mailto:hello@bynannyraerae.com.au" className="text-primary underline">hello@bynannyraerae.com.au</a> to initiate return</p>
                <p>• No returns on sale items</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Similar Products Component
function SimilarProducts({ currentProductId, product }: { currentProductId: string, product: Product }) {
  const [similarProducts, setSimilarProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSimilarProducts()
  }, [currentProductId])

  const fetchSimilarProducts = async () => {
    try {
      setLoading(true)

      // Build query with prioritized filters
      const query = supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .neq('id', currentProductId)
        .limit(4)

      // Try to find products in same collection first
      if (product.collection) {
        const { data: collectionProducts } = await query
          .eq('collection', product.collection)
          .limit(4)

        if (collectionProducts && collectionProducts.length >= 4) {
          setSimilarProducts(collectionProducts)
          return
        }
      }

      // If not enough collection matches, try gender
      if (product.gender) {
        const { data: genderProducts } = await query
          .eq('gender', product.gender)
          .limit(4)

        if (genderProducts && genderProducts.length >= 4) {
          setSimilarProducts(genderProducts)
          return
        }
      }

      // If not enough gender matches, try product type
      if (product.product_type) {
        const { data: typeProducts } = await query
          .eq('product_type', product.product_type)
          .limit(4)

        if (typeProducts && typeProducts.length >= 4) {
          setSimilarProducts(typeProducts)
          return
        }
      }

      // Fallback: get any products
      const { data: fallbackProducts } = await query.limit(4)
      setSimilarProducts(fallbackProducts || [])

    } catch (error) {
      console.error('Error fetching similar products:', error)
      setSimilarProducts([])
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-playfair text-3xl font-bold text-center text-foreground mb-12">
            You Might Also Love
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse bg-card rounded-xl p-4 shadow-soft">
                <div className="aspect-[3/4] bg-muted rounded-lg mb-4"></div>
                <div className="h-4 bg-muted rounded mb-2"></div>
                <div className="h-4 bg-muted rounded mb-2 w-24"></div>
                <div className="h-6 bg-muted rounded mb-3 w-20"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (similarProducts.length === 0) {
    return null
  }

  return (
    <section className="py-16 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="font-playfair text-3xl font-bold text-center text-foreground mb-12">
          You Might Also Love
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {similarProducts.map((similarProduct) => (
            <ProductCard
              key={similarProduct.id}
              product={similarProduct}
            />
          ))}
        </div>
      </div>
    </section>
  )
}