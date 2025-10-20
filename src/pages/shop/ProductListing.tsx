import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase/client'
import { ProductCard } from '../../components/shop/ProductCard'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'
import { Checkbox } from '../../components/ui/checkbox'
import { Filter, Grid, List, SortAsc, SortDesc, Package } from 'lucide-react'
import { CurrencySelector } from '../../components/CurrencySelector'
import type { ProductWithImages, Category } from '../../types'

interface Filters {
  category?: string
  ageGroup?: string
  gender?: string
  priceRange?: string
  colors?: string[]
  size?: string
  showSold: boolean
  fabric?: string
}

export function ProductListing() {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()

  const [products, setProducts] = useState<ProductWithImages[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState('newest')
  const [filters, setFilters] = useState<Filters>({
    showSold: false
  })

  // Available filter options
  const ageGroups = ['3mths', '6mths', '9mths', '1yr', '2yrs', '3yrs', '4yrs', '5yrs']
  const genders = ['Boys', 'Girls', 'Gender Neutral']
  const priceRanges = [
    { label: 'Under $50', value: '0-50' },
    { label: '$50 - $100', value: '50-100' },
    { label: '$100 - $150', value: '100-150' },
    { label: 'Over $150', value: '150-999' }
  ]
  const colors = ['Pink', 'Blue', 'White', 'Yellow', 'Green', 'Purple', 'Red']
  const fabrics = ['Cotton', 'Organic Cotton', 'Bamboo', 'Linen', 'Jersey']

  useEffect(() => {
    loadCategories()
    loadProducts()
  }, [filters, sortBy])

  useEffect(() => {
    // Update URL params based on filters
    const params = new URLSearchParams()
    if (filters.category) params.set('category', filters.category)
    if (filters.ageGroup) params.set('age', filters.ageGroup)
    if (filters.gender) params.set('gender', filters.gender)
    if (filters.priceRange) params.set('price', filters.priceRange)
    if (filters.showSold) params.set('sold', 'true')
    setSearchParams(params)
  }, [filters, setSearchParams])

  const loadCategories = async () => {
    const { data } = await supabase
      .from('categories')
      .select('*')
      .order('display_order')
    if (data) setCategories(data)
  }

  const loadProducts = async () => {
    setIsLoading(true)
    try {
      let query = supabase
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
        .eq('is_draft', false)

      // Apply filters
      if (filters.category) {
        query = query.eq('category_id', filters.category)
      }

      if (filters.ageGroup) {
        query = query.eq('age_group', filters.ageGroup)
      }

      if (filters.gender) {
        query = query.eq('gender', filters.gender)
      }

      if (filters.size) {
        query = query.eq('size', filters.size)
      }

      if (filters.fabric) {
        query = query.eq('fabric', filters.fabric)
      }

      if (filters.colors && filters.colors.length > 0) {
        query = query.in('color_primary', filters.colors)
      }

      if (!filters.showSold) {
        query = query.eq('is_sold', false)
      }

      if (filters.priceRange) {
        const [min, max] = filters.priceRange.split('-').map(Number)
        query = query.gte('price', min)
        if (max < 999) {
          query = query.lte('price', max)
        }
      }

      // Apply sorting
      switch (sortBy) {
        case 'newest':
          query = query.order('created_at', { ascending: false })
          break
        case 'oldest':
          query = query.order('created_at', { ascending: true })
          break
        case 'price-low':
          query = query.order('price', { ascending: true })
          break
        case 'price-high':
          query = query.order('price', { ascending: false })
          break
        case 'name':
          query = query.order('name', { ascending: true })
          break
        default:
          query = query.order('created_at', { ascending: false })
      }

      const { data, error } = await query

      if (error) throw error
      setProducts(data || [])
    } catch (error) {
      console.error('Error loading products:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const updateFilter = (key: keyof Filters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => {
    setFilters({ showSold: false })
  }

  const activeFilterCount = Object.entries(filters).filter(([key, value]) => {
    if (key === 'showSold') return false
    return value && (Array.isArray(value) ? value.length > 0 : true)
  }).length

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">One-of-a-Kind Collection</h1>
            <p className="text-muted-foreground">
              Each piece is unique and made with love
            </p>
          </div>
          <CurrencySelector />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    Filters
                  </span>
                  {activeFilterCount > 0 && (
                    <Badge variant="secondary">{activeFilterCount}</Badge>
                  )}
                </CardTitle>
                {activeFilterCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    Clear all
                  </Button>
                )}
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Category Filter */}
                <div>
                  <h3 className="font-medium mb-3">Category</h3>
                  <Select
                    value={filters.category || ''}
                    onValueChange={(value) => updateFilter('category', value || undefined)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All categories</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Age Group Filter */}
                <div>
                  <h3 className="font-medium mb-3">Age Group</h3>
                  <Select
                    value={filters.ageGroup || ''}
                    onValueChange={(value) => updateFilter('ageGroup', value || undefined)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All ages" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All ages</SelectItem>
                      {ageGroups.map((age) => (
                        <SelectItem key={age} value={age}>
                          {age}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Gender Filter */}
                <div>
                  <h3 className="font-medium mb-3">Gender</h3>
                  <Select
                    value={filters.gender || ''}
                    onValueChange={(value) => updateFilter('gender', value || undefined)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All genders" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All genders</SelectItem>
                      {genders.map((gender) => (
                        <SelectItem key={gender} value={gender}>
                          {gender}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Price Range Filter */}
                <div>
                  <h3 className="font-medium mb-3">Price Range</h3>
                  <Select
                    value={filters.priceRange || ''}
                    onValueChange={(value) => updateFilter('priceRange', value || undefined)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Any price" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any price</SelectItem>
                      {priceRanges.map((range) => (
                        <SelectItem key={range.value} value={range.value}>
                          {range.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Fabric Filter */}
                <div>
                  <h3 className="font-medium mb-3">Fabric</h3>
                  <Select
                    value={filters.fabric || ''}
                    onValueChange={(value) => updateFilter('fabric', value || undefined)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Any fabric" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any fabric</SelectItem>
                      {fabrics.map((fabric) => (
                        <SelectItem key={fabric} value={fabric}>
                          {fabric}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Show Sold Items */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="show-sold"
                    checked={filters.showSold}
                    onCheckedChange={(checked) => updateFilter('showSold', checked)}
                  />
                  <label htmlFor="show-sold" className="text-sm">
                    Show sold items
                  </label>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <p className="text-sm text-muted-foreground">
                  {products.length} unique piece{products.length !== 1 ? 's' : ''}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {/* Sort */}
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest first</SelectItem>
                    <SelectItem value="oldest">Oldest first</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="name">Name A-Z</SelectItem>
                  </SelectContent>
                </Select>

                {/* View Mode */}
                <div className="flex border rounded-lg">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="text-center py-12">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading unique pieces...</p>
              </div>
            )}

            {/* No Products */}
            {!isLoading && products.length === 0 && (
              <Card>
                <CardContent className="text-center py-12">
                  <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No products found</h3>
                  <p className="text-muted-foreground mb-4">
                    Try adjusting your filters to see more results
                  </p>
                  {activeFilterCount > 0 && (
                    <Button variant="outline" onClick={clearFilters}>
                      Clear filters
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Products Grid */}
            {!isLoading && products.length > 0 && (
              <div className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
                  : 'space-y-4'
              }>
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onViewProduct={(id) => navigate(`/products/${id}`)}
                    onAddToCart={(id) => {
                      // Handle add to cart success
                      console.log('Added to cart:', id)
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}