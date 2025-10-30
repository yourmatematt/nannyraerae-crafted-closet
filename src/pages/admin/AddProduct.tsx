import { useNavigate, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { ProductUploadForm } from '../../components/admin/ProductUploadForm'
import { ArrowLeft } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { supabase } from '@/lib/supabase'

export function AddProduct() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [initialData, setInitialData] = useState(null)
  const [loading, setLoading] = useState(!!id)

  const isEditMode = !!id

  useEffect(() => {
    if (id) {
      loadProduct(id)
    }
  }, [id])

  const loadProduct = async (productId: string) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single()

      if (error) throw error
      setInitialData(data)
    } catch (error) {
      console.error('Error loading product:', error)
      navigate('/admin/products')
    } finally {
      setLoading(false)
    }
  }

  const handleSuccess = () => {
    navigate('/admin/dashboard')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Loading product...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/admin/products')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Products
          </Button>
        </div>

        <ProductUploadForm
          onSuccess={handleSuccess}
          initialData={initialData}
          productId={id}
        />
      </div>
    </div>
  )
}