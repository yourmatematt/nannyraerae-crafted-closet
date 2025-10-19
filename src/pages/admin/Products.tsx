import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ArrowLeft, Search, Plus, Edit, Trash2, Package, Eye, Upload, X } from 'lucide-react'

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

interface ProductFormData {
  name: string
  description: string
  price: string
  age_group: string
  available: boolean
  is_active: boolean
  gender: string
  product_type: string
  is_gift_idea: boolean
  collection: string
  gift_category: string
  image?: File
}

export default function Products() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    price: '',
    age_group: '',
    available: true,
    is_active: true,
    gender: '',
    product_type: '',
    is_gift_idea: false,
    collection: ''
  })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const { data: productsData, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      setProducts(productsData || [])
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const uploadImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop()
    const fileName = `${crypto.randomUUID()}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(fileName, file)

    if (uploadError) throw uploadError

    const { data } = supabase.storage
      .from('product-images')
      .getPublicUrl(fileName)

    return data.publicUrl
  }

  const deleteImageFromStorage = async (imageUrl: string) => {
    try {
      const fileName = imageUrl.split('/').pop()
      if (fileName) {
        await supabase.storage
          .from('product-images')
          .remove([fileName])
      }
    } catch (error) {
      console.error('Error deleting image:', error)
    }
  }

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    if (!formData.name.trim()) errors.name = 'Name is required'
    if (!formData.description.trim()) errors.description = 'Description is required'
    if (formData.description.length > 500) errors.description = 'Description must be 500 characters or less'
    if (!formData.price || parseFloat(formData.price) < 0.01) errors.price = 'Price must be at least $0.01'
    if (!formData.age_group) errors.age_group = 'Age group is required'
    if (!editingProduct && !formData.image) errors.image = 'Image is required'
    if (formData.is_gift_idea && (!formData.gift_category || formData.gift_category === 'not-selected')) {
      errors.gift_category = 'Gift category is required when marked as gift idea'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      age_group: '',
      available: true,
      is_active: true,
      gender: 'not-selected',
      product_type: 'not-selected',
      is_gift_idea: false,
      collection: '',
      gift_category: 'not-selected'
    })
    setFormErrors({})
    setImagePreview(null)
    setEditingProduct(null)
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/webp']
      if (!validTypes.includes(file.type)) {
        setFormErrors({ ...formErrors, image: 'Please select a JPG, PNG, or WebP image' })
        return
      }

      setFormData({ ...formData, image: file })

      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)

      // Clear image error
      const newErrors = { ...formErrors }
      delete newErrors.image
      setFormErrors(newErrors)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setSubmitting(true)

    try {
      let imageUrl = editingProduct?.image_url || null

      // Upload new image if provided
      if (formData.image) {
        // Delete old image if editing
        if (editingProduct?.image_url) {
          await deleteImageFromStorage(editingProduct.image_url)
        }
        imageUrl = await uploadImage(formData.image)
      }

      const productData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        age_group: formData.age_group,
        stock: formData.available ? 1 : 0, // Convert available boolean to stock number
        is_active: formData.is_active,
        gender: formData.gender === 'not-selected' ? null : formData.gender || null,
        product_type: formData.product_type === 'not-selected' ? null : formData.product_type || null,
        is_gift_idea: formData.is_gift_idea,
        collection: formData.collection.trim() || null,
        gift_category: formData.gift_category === 'not-selected' ? null : formData.gift_category || null,
        image_url: imageUrl
      }

      if (editingProduct) {
        // Update existing product
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id)

        if (error) throw error

        setProducts(products.map(p =>
          p.id === editingProduct.id
            ? { ...p, ...productData, updated_at: new Date().toISOString() }
            : p
        ))
        setIsEditDialogOpen(false)
      } else {
        // Create new product
        const { data: newProduct, error } = await supabase
          .from('products')
          .insert(productData)
          .select()
          .single()

        if (error) throw error

        setProducts([newProduct, ...products])
        setIsAddDialogOpen(false)
      }

      resetForm()
    } catch (error) {
      console.error('Error saving product:', error)
      alert('Failed to save product. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      age_group: product.age_group,
      available: product.stock > 0, // Convert stock number to available boolean
      is_active: product.is_active,
      gender: product.gender || 'not-selected',
      product_type: product.product_type || 'not-selected',
      is_gift_idea: product.is_gift_idea || false,
      collection: product.collection || '',
      gift_category: product.gift_category || 'not-selected'
    })
    setImagePreview(product.image_url)
    setIsEditDialogOpen(true)
  }

  const handleDelete = async (product: Product) => {
    const confirmed = confirm(`Are you sure you want to delete "${product.name}"? This action cannot be undone.`)

    if (!confirmed) return

    try {
      // Soft delete - set is_active to false
      const { error } = await supabase
        .from('products')
        .update({ is_active: false })
        .eq('id', product.id)

      if (error) throw error

      setProducts(products.map(p =>
        p.id === product.id ? { ...p, is_active: false } : p
      ))
    } catch (error) {
      console.error('Error deleting product:', error)
      alert('Failed to delete product. Please try again.')
    }
  }

  const toggleActive = async (product: Product) => {
    try {
      const newStatus = !product.is_active
      const { error } = await supabase
        .from('products')
        .update({ is_active: newStatus })
        .eq('id', product.id)

      if (error) throw error

      setProducts(products.map(p =>
        p.id === product.id ? { ...p, is_active: newStatus } : p
      ))
    } catch (error) {
      console.error('Error updating product status:', error)
      alert('Failed to update product status.')
    }
  }

  const getProductStatus = (product: Product) => {
    if (!product.is_active) return { label: 'Inactive', variant: 'secondary' as const, color: 'bg-gray-100 text-gray-800' }
    if (product.stock === 0) return { label: 'Out of Stock', variant: 'destructive' as const, color: 'bg-red-100 text-red-800' }
    if (product.stock <= 5) return { label: 'Low Stock', variant: 'outline' as const, color: 'bg-yellow-100 text-yellow-800' }
    return { label: 'Active', variant: 'default' as const, color: 'bg-green-100 text-green-800' }
  }

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === 'all' || (
      statusFilter === 'active' && product.is_active && product.stock > 0
    ) || (
      statusFilter === 'inactive' && !product.is_active
    ) || (
      statusFilter === 'available' && product.is_active && product.stock > 0
    ) || (
      statusFilter === 'sold' && (product.stock === 0 || !product.is_active)
    )

    return matchesSearch && matchesStatus
  })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
    }).format(amount)
  }

  if (loading) {
    return <div className="p-8">Loading products...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <Button asChild variant="ghost">
                <Link to="/admin/dashboard">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Dashboard
                </Link>
              </Button>
              <h1 className="text-3xl font-bold text-gray-900">Products</h1>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Product
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Product</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <Label htmlFor="name">Product Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className={formErrors.name ? 'border-red-500' : ''}
                      />
                      {formErrors.name && <p className="text-sm text-red-500 mt-1">{formErrors.name}</p>}
                    </div>

                    <div className="col-span-2">
                      <Label htmlFor="description">Description * (max 500 characters)</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        maxLength={500}
                        rows={3}
                        className={formErrors.description ? 'border-red-500' : ''}
                      />
                      <p className="text-sm text-gray-500 mt-1">{formData.description.length}/500</p>
                      {formErrors.description && <p className="text-sm text-red-500 mt-1">{formErrors.description}</p>}
                    </div>

                    <div>
                      <Label htmlFor="price">Price (AUD) *</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        min="0.01"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        className={formErrors.price ? 'border-red-500' : ''}
                      />
                      {formErrors.price && <p className="text-sm text-red-500 mt-1">{formErrors.price}</p>}
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="available"
                        checked={formData.available}
                        onCheckedChange={(checked) => setFormData({ ...formData, available: checked })}
                      />
                      <Label htmlFor="available">Available for purchase</Label>
                    </div>

                    <div>
                      <Label htmlFor="age_group">Age Group *</Label>
                      <Select value={formData.age_group} onValueChange={(value) => setFormData({ ...formData, age_group: value })}>
                        <SelectTrigger className={formErrors.age_group ? 'border-red-500' : ''}>
                          <SelectValue placeholder="Select age group" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0-3 months">0-3 months</SelectItem>
                          <SelectItem value="3-12 months">3-12 months</SelectItem>
                          <SelectItem value="1-3 years">1-3 years</SelectItem>
                          <SelectItem value="3-5 years">3-5 years</SelectItem>
                          <SelectItem value="5-10 years">5-10 years</SelectItem>
                          <SelectItem value="All Ages">All Ages</SelectItem>
                        </SelectContent>
                      </Select>
                      {formErrors.age_group && <p className="text-sm text-red-500 mt-1">{formErrors.age_group}</p>}
                    </div>

                    <div>
                      <Label htmlFor="gender">Gender (Optional)</Label>
                      <Select
                        value={formData.gender || 'not-selected'}
                        onValueChange={(value) => setFormData({ ...formData, gender: value === 'not-selected' ? '' : value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="not-selected" disabled>Not specified</SelectItem>
                          <SelectItem value="Boys">Boys</SelectItem>
                          <SelectItem value="Girls">Girls</SelectItem>
                          <SelectItem value="Gender Neutral">Gender Neutral</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="product_type">Product Type (Optional)</Label>
                      <Select
                        value={formData.product_type || 'not-selected'}
                        onValueChange={(value) => setFormData({ ...formData, product_type: value === 'not-selected' ? '' : value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select product type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="not-selected" disabled>Not specified</SelectItem>
                          <SelectItem value="Top">Top</SelectItem>
                          <SelectItem value="Dress">Dress</SelectItem>
                          <SelectItem value="Overalls">Overalls</SelectItem>
                          <SelectItem value="Romper">Romper</SelectItem>
                          <SelectItem value="Pants">Pants</SelectItem>
                          <SelectItem value="Jacket">Jacket</SelectItem>
                          <SelectItem value="Accessories">Accessories</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="col-span-2">
                      <Label htmlFor="collection">Collection (Optional)</Label>
                      <Input
                        id="collection"
                        type="text"
                        placeholder="e.g., Garden Party, Modern Vintage"
                        value={formData.collection}
                        onChange={(e) => setFormData({ ...formData, collection: e.target.value })}
                      />
                    </div>

                    <div>
                      <div className="flex items-center space-x-2 mb-3">
                        <Switch
                          id="is_gift_idea"
                          checked={formData.is_gift_idea}
                          onCheckedChange={(checked) => {
                            setFormData({ ...formData, is_gift_idea: checked })
                            if (!checked) {
                              // Clear category when toggle turned off
                              setFormData(prev => ({ ...prev, gift_category: null }))
                            }
                          }}
                        />
                        <Label htmlFor="is_gift_idea">Featured as Gift Idea</Label>
                      </div>

                      {formData.is_gift_idea && (
                        <div>
                          <Label htmlFor="gift_category">Gift Category</Label>
                          <Select
                            value={formData.gift_category || 'not-selected'}
                            onValueChange={(value) =>
                              setFormData({ ...formData, gift_category: value === 'not-selected' ? null : value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select gift category..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="not-selected" disabled>Select a category</SelectItem>
                              <SelectItem value="First Birthday">First Birthday</SelectItem>
                              <SelectItem value="New Baby">New Baby</SelectItem>
                              <SelectItem value="Christmas">Christmas</SelectItem>
                              <SelectItem value="Easter">Easter</SelectItem>
                              <SelectItem value="Starting School">Starting School</SelectItem>
                              <SelectItem value="Big Sibling">Big Sibling</SelectItem>
                            </SelectContent>
                          </Select>
                          {formErrors.gift_category && (
                            <p className="text-red-500 text-sm mt-1">{formErrors.gift_category}</p>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="is_active"
                        checked={formData.is_active}
                        onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                      />
                      <Label htmlFor="is_active">Product is active</Label>
                    </div>

                    <div className="col-span-2">
                      <Label htmlFor="image">Product Image * (JPG, PNG, WebP)</Label>
                      <Input
                        id="image"
                        type="file"
                        accept=".jpg,.jpeg,.png,.webp"
                        onChange={handleImageChange}
                        className={formErrors.image ? 'border-red-500' : ''}
                      />
                      {formErrors.image && <p className="text-sm text-red-500 mt-1">{formErrors.image}</p>}

                      {imagePreview && (
                        <div className="mt-4">
                          <Label>Preview:</Label>
                          <div className="relative w-32 h-32 border rounded overflow-hidden">
                            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={submitting}>
                      {submitting ? 'Creating...' : 'Create Product'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Products</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="sold">Sold</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Products Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Products ({filteredProducts.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Image</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Age Group</TableHead>
                  <TableHead>Availability</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => {
                  const status = getProductStatus(product)

                  return (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="w-20 h-20 bg-gray-100 rounded overflow-hidden">
                          {product.image_url ? (
                            <img
                              src={product.image_url}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-gray-500 line-clamp-2">{product.description}</p>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(product.price)}
                      </TableCell>
                      <TableCell>{product.age_group}</TableCell>
                      <TableCell>
                        <Badge className={product.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                          {product.stock > 0 ? 'Available' : 'Sold'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={status.color}>
                          {status.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(product)}
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                          <Switch
                            checked={product.is_active}
                            onCheckedChange={() => toggleActive(product)}
                            disabled={!product.is_active && product.stock === 0}
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(product)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>

            {filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium mb-2">No products found</h3>
                <p className="text-gray-500">
                  {searchTerm || statusFilter !== 'all'
                    ? 'Try adjusting your filters'
                    : 'Products will appear here when you create them'
                  }
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit Product Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="edit-name">Product Name *</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={formErrors.name ? 'border-red-500' : ''}
                />
                {formErrors.name && <p className="text-sm text-red-500 mt-1">{formErrors.name}</p>}
              </div>

              <div className="col-span-2">
                <Label htmlFor="edit-description">Description * (max 500 characters)</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  maxLength={500}
                  rows={3}
                  className={formErrors.description ? 'border-red-500' : ''}
                />
                <p className="text-sm text-gray-500 mt-1">{formData.description.length}/500</p>
                {formErrors.description && <p className="text-sm text-red-500 mt-1">{formErrors.description}</p>}
              </div>

              <div>
                <Label htmlFor="edit-price">Price (AUD) *</Label>
                <Input
                  id="edit-price"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className={formErrors.price ? 'border-red-500' : ''}
                />
                {formErrors.price && <p className="text-sm text-red-500 mt-1">{formErrors.price}</p>}
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-available"
                  checked={formData.available}
                  onCheckedChange={(checked) => setFormData({ ...formData, available: checked })}
                />
                <Label htmlFor="edit-available">Available for purchase</Label>
              </div>

              <div>
                <Label htmlFor="edit-age_group">Age Group *</Label>
                <Select value={formData.age_group} onValueChange={(value) => setFormData({ ...formData, age_group: value })}>
                  <SelectTrigger className={formErrors.age_group ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select age group" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0-3 months">0-3 months</SelectItem>
                    <SelectItem value="3-12 months">3-12 months</SelectItem>
                    <SelectItem value="1-3 years">1-3 years</SelectItem>
                    <SelectItem value="3-5 years">3-5 years</SelectItem>
                    <SelectItem value="5-10 years">5-10 years</SelectItem>
                    <SelectItem value="All Ages">All Ages</SelectItem>
                  </SelectContent>
                </Select>
                {formErrors.age_group && <p className="text-sm text-red-500 mt-1">{formErrors.age_group}</p>}
              </div>

              <div>
                <Label htmlFor="edit-gender">Gender (Optional)</Label>
                <Select
                  value={formData.gender || 'not-selected'}
                  onValueChange={(value) => setFormData({ ...formData, gender: value === 'not-selected' ? '' : value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="not-selected" disabled>Not specified</SelectItem>
                    <SelectItem value="Boys">Boys</SelectItem>
                    <SelectItem value="Girls">Girls</SelectItem>
                    <SelectItem value="Gender Neutral">Gender Neutral</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="edit-product_type">Product Type (Optional)</Label>
                <Select
                  value={formData.product_type || 'not-selected'}
                  onValueChange={(value) => setFormData({ ...formData, product_type: value === 'not-selected' ? '' : value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select product type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="not-selected" disabled>Not specified</SelectItem>
                    <SelectItem value="Top">Top</SelectItem>
                    <SelectItem value="Dress">Dress</SelectItem>
                    <SelectItem value="Overalls">Overalls</SelectItem>
                    <SelectItem value="Romper">Romper</SelectItem>
                    <SelectItem value="Pants">Pants</SelectItem>
                    <SelectItem value="Jacket">Jacket</SelectItem>
                    <SelectItem value="Accessories">Accessories</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="col-span-2">
                <Label htmlFor="edit-collection">Collection (Optional)</Label>
                <Input
                  id="edit-collection"
                  type="text"
                  placeholder="e.g., Garden Party, Modern Vintage"
                  value={formData.collection}
                  onChange={(e) => setFormData({ ...formData, collection: e.target.value })}
                />
              </div>

              <div>
                <div className="flex items-center space-x-2 mb-3">
                  <Switch
                    id="edit-is_gift_idea"
                    checked={formData.is_gift_idea}
                    onCheckedChange={(checked) => {
                      setFormData({ ...formData, is_gift_idea: checked })
                      if (!checked) {
                        // Clear category when toggle turned off
                        setFormData(prev => ({ ...prev, gift_category: null }))
                      }
                    }}
                  />
                  <Label htmlFor="edit-is_gift_idea">Featured as Gift Idea</Label>
                </div>

                {formData.is_gift_idea && (
                  <div>
                    <Label htmlFor="edit-gift_category">Gift Category</Label>
                    <Select
                      value={formData.gift_category || 'not-selected'}
                      onValueChange={(value) =>
                        setFormData({ ...formData, gift_category: value === 'not-selected' ? null : value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select gift category..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="not-selected" disabled>Select a category</SelectItem>
                        <SelectItem value="First Birthday">First Birthday</SelectItem>
                        <SelectItem value="New Baby">New Baby</SelectItem>
                        <SelectItem value="Christmas">Christmas</SelectItem>
                        <SelectItem value="Easter">Easter</SelectItem>
                        <SelectItem value="Starting School">Starting School</SelectItem>
                        <SelectItem value="Big Sibling">Big Sibling</SelectItem>
                      </SelectContent>
                    </Select>
                    {formErrors.gift_category && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.gift_category}</p>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="edit-is_active">Product is active</Label>
              </div>

              <div className="col-span-2">
                <Label htmlFor="edit-image">Change Image (optional)</Label>
                <Input
                  id="edit-image"
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp"
                  onChange={handleImageChange}
                  className={formErrors.image ? 'border-red-500' : ''}
                />
                {formErrors.image && <p className="text-sm text-red-500 mt-1">{formErrors.image}</p>}

                {imagePreview && (
                  <div className="mt-4">
                    <Label>Current/Preview Image:</Label>
                    <div className="relative w-32 h-32 border rounded overflow-hidden">
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Updating...' : 'Update Product'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}