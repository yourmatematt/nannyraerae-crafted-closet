import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Package,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  DollarSign,
  Filter,
  MessageCircle
} from 'lucide-react'
export function AdminDashboard() {
  const navigate = useNavigate()
  const [products, setProducts] = useState<any[]>([])
  const [filteredProducts, setFilteredProducts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')

  const formatPrice = (price: number, currency: string = 'AUD') => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: currency,
    }).format(price)
  }

  useEffect(() => {
    loadProducts()
  }, [])

  useEffect(() => {
    filterProducts()
  }, [products, searchQuery, statusFilter, categoryFilter])

  const loadProducts = async () => {
    try {
      setIsLoading(true)

      const { data: productsData } = await supabase
        .from('products')
        .select('id, name, description, price, image_url, stock, age_group, is_active, created_at, updated_at, is_gift_idea, gift_category')
        .order('created_at', { ascending: false })

      if (productsData) {
        setProducts(productsData)
        setFilteredProducts(productsData)
      }

    } catch (error) {
      console.error('Error loading products:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterProducts = () => {
    let filtered = products

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      switch (statusFilter) {
        case 'available':
          filtered = filtered.filter(p => p.is_active && p.stock > 0)
          break
        case 'sold':
          filtered = filtered.filter(p => !p.is_active || p.stock === 0)
          break
      }
    }

    // Category filter
    if (categoryFilter !== 'all') {
      if (categoryFilter === 'gift-ideas') {
        filtered = filtered.filter(p => p.is_gift_idea)
      } else {
        filtered = filtered.filter(p => p.age_group === categoryFilter)
      }
    }

    setFilteredProducts(filtered)
  }

  const getProductStatus = (product: any) => {
    if (!product.is_active || product.stock === 0) {
      return { label: 'Sold', variant: 'destructive' as const }
    }
    return { label: 'Available', variant: 'default' as const }
  }

  const deleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return
    }

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId)

      if (error) throw error

      // Reload data
      loadProducts()
    } catch (error) {
      console.error('Error deleting product:', error)
      alert('Failed to delete product')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header Bar */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Hello Rae</h1>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => navigate('/admin/orders')}>
              <Package className="w-4 h-4 mr-2" />
              View Orders
            </Button>
            <Button variant="outline" onClick={() => navigate('/admin/messages')}>
              <MessageCircle className="w-4 h-4 mr-2" />
              Messages
            </Button>
            <Button onClick={() => navigate('/admin/products/new')}>
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-lg border p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-3">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="sold">Sold</SelectItem>
                </SelectContent>
              </Select>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="gift-ideas">Gift Ideas</SelectItem>
                  <SelectItem value="0-3m">0-3 months</SelectItem>
                  <SelectItem value="3-12m">3-12 months</SelectItem>
                  <SelectItem value="1-3y">1-3 years</SelectItem>
                  <SelectItem value="3-5y">3-5 years</SelectItem>
                  <SelectItem value="5-10y">5-10 years</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-600">
            <span className="font-medium">{filteredProducts.length}</span> of <span className="font-medium">{products.length}</span> products
          </div>
        </div>

        {/* Products Table */}
        <Card>
          <CardContent className="p-0">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No products found</h3>
                <p className="text-muted-foreground mb-4">
                  {products.length === 0
                    ? "Create your first product to get started"
                    : "Try adjusting your search or filters"
                  }
                </p>
                {products.length === 0 && (
                  <Button onClick={() => navigate('/admin/products/new')}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Product
                  </Button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Product</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Price</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Stock</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Age Group</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Created</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((product) => {
                      const status = getProductStatus(product)

                      return (
                        <tr key={product.id} className="border-b hover:bg-gray-50">
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                                {product.image_url ? (
                                  <img
                                    src={product.image_url}
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <Package className="w-5 h-5 text-gray-400" />
                                )}
                              </div>
                              <div>
                                <div className="font-medium text-gray-900 max-w-xs truncate">
                                  {product.name}
                                </div>
                                {product.is_gift_idea && (
                                  <div className="text-sm text-blue-600">
                                    Gift: {product.gift_category}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <span className="font-medium text-gray-900">
                              {formatPrice(product.price, 'AUD')}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <span className={`font-medium ${
                              product.stock === 0 ? 'text-red-600' :
                              product.stock <= 5 ? 'text-orange-600' : 'text-gray-900'
                            }`}>
                              {product.stock}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <Badge variant={status.variant}>{status.label}</Badge>
                          </td>
                          <td className="py-4 px-4">
                            <span className="text-gray-600">{product.age_group}</span>
                          </td>
                          <td className="py-4 px-4">
                            <span className="text-gray-600">
                              {new Date(product.created_at).toLocaleDateString()}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2 justify-end">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => navigate(`/products/${product.id}`)}
                                className="px-2"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => navigate(`/admin/products/${product.id}/edit`)}
                                className="px-2"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => deleteProduct(product.id)}
                                className="px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  )
}