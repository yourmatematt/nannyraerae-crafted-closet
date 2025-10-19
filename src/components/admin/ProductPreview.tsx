import { Badge } from '../ui/badge'
import { Card, CardContent } from '../ui/card'
import { formatPrice } from '../../lib/utils/currency'
import { Heart, Ruler } from 'lucide-react'

interface ProductPreviewProps {
  data: {
    name?: string
    description?: string
    story?: string
    price?: number
    size?: string
    age_group?: string
    color_primary?: string
    color_secondary?: string
    fabric?: string
    care_instructions?: string
    measurements?: {
      chest?: number
      length?: number
      sleeve?: number
      waist?: number
    }
  }
  images: string[]
}

export function ProductPreview({ data, images }: ProductPreviewProps) {
  const {
    name = 'Untitled Product',
    description = '',
    story = '',
    price = 0,
    size = '',
    age_group = '',
    color_primary = '',
    color_secondary = '',
    fabric = '',
    care_instructions = '',
    measurements = {}
  } = data

  return (
    <div className="space-y-6 max-w-md">
      {/* Product Images */}
      <div className="relative">
        {images.length > 0 ? (
          <div className="aspect-square rounded-lg overflow-hidden bg-muted">
            <img
              src={images[0]}
              alt={name}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="aspect-square rounded-lg bg-muted flex items-center justify-center">
            <p className="text-sm text-muted-foreground">No image uploaded</p>
          </div>
        )}

        {/* One of a kind badge */}
        <div className="absolute top-3 left-3">
          <Badge variant="secondary" className="bg-pink-100 text-pink-800 border-pink-200">
            ONE OF A KIND
          </Badge>
        </div>

        {/* Wishlist button */}
        <button className="absolute top-3 right-3 p-2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-colors">
          <Heart className="w-4 h-4" />
        </button>

        {/* Image count indicator */}
        {images.length > 1 && (
          <div className="absolute bottom-3 right-3">
            <div className="bg-black/60 text-white px-2 py-1 rounded text-xs">
              1 / {images.length}
            </div>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold text-lg">{name}</h3>
          {price > 0 && (
            <p className="text-xl font-bold text-primary">
              {formatPrice(price, 'AUD')}
            </p>
          )}
        </div>

        {/* Size and Age Group */}
        {(size || age_group) && (
          <div className="flex gap-2">
            {size && (
              <Badge variant="outline">Size {size}</Badge>
            )}
            {age_group && (
              <Badge variant="outline">{age_group}</Badge>
            )}
          </div>
        )}

        {/* Colors */}
        {color_primary && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Colors</h4>
            <div className="flex gap-2">
              <Badge variant="outline">{color_primary}</Badge>
              {color_secondary && (
                <Badge variant="outline">{color_secondary}</Badge>
              )}
            </div>
          </div>
        )}

        {/* Fabric */}
        {fabric && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Fabric</h4>
            <p className="text-sm text-muted-foreground">{fabric}</p>
          </div>
        )}

        {/* Description */}
        {description && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Description</h4>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        )}

        {/* Story */}
        {story && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Nanny's Story</h4>
            <p className="text-sm text-muted-foreground italic">"{story}"</p>
          </div>
        )}

        {/* Measurements */}
        {Object.keys(measurements).length > 0 && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Ruler className="w-4 h-4" />
                <h4 className="text-sm font-medium">Measurements</h4>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {measurements.chest && (
                  <div className="flex justify-between">
                    <span>Chest:</span>
                    <span>{measurements.chest}cm</span>
                  </div>
                )}
                {measurements.length && (
                  <div className="flex justify-between">
                    <span>Length:</span>
                    <span>{measurements.length}cm</span>
                  </div>
                )}
                {measurements.sleeve && (
                  <div className="flex justify-between">
                    <span>Sleeve:</span>
                    <span>{measurements.sleeve}cm</span>
                  </div>
                )}
                {measurements.waist && (
                  <div className="flex justify-between">
                    <span>Waist:</span>
                    <span>{measurements.waist}cm</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Care Instructions */}
        {care_instructions && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Care Instructions</h4>
            <p className="text-sm text-muted-foreground">{care_instructions}</p>
          </div>
        )}

        {/* Add to Cart Button Preview */}
        <div className="pt-4">
          <button className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors">
            Reserve for 15 minutes
          </button>
          <p className="text-xs text-muted-foreground text-center mt-2">
            This piece will be reserved for you for 15 minutes
          </p>
        </div>
      </div>
    </div>
  )
}