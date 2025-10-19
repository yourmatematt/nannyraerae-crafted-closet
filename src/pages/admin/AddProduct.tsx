import { useNavigate } from 'react-router-dom'
import { ProductUploadForm } from '../../components/admin/ProductUploadForm'
import { ArrowLeft } from 'lucide-react'
import { Button } from '../../components/ui/button'

export function AddProduct() {
  const navigate = useNavigate()

  const handleSuccess = () => {
    navigate('/admin/dashboard')
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

        <ProductUploadForm onSuccess={handleSuccess} />
      </div>
    </div>
  )
}