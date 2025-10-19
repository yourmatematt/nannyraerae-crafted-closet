import { useState, useEffect } from 'react'
import { X, Clock, AlertTriangle } from 'lucide-react'
import { Button } from '../ui/button'
import { Card, CardContent } from '../ui/card'
import { Badge } from '../ui/badge'
import { Timer, Countdown } from '../ui/timer'
import { useCartStore } from '../../lib/store'
import { formatPrice } from '../../lib/utils/currency'
import { releaseReservation, isReservationExpired } from '../../lib/utils/reservations'
import type { CartItemWithProduct } from '../../types'

interface CartReservationProps {
  onClose?: () => void
  showTitle?: boolean
}

export function CartReservation({ onClose, showTitle = true }: CartReservationProps) {
  const { items, removeItem, currency, clearCart } = useCartStore()
  const [expiredItems, setExpiredItems] = useState<string[]>([])

  // Check for expired items periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const newExpiredItems: string[] = []

      items.forEach(item => {
        if (item.expires_at && isReservationExpired(new Date(item.expires_at))) {
          newExpiredItems.push(item.product_id!)
        }
      })

      if (newExpiredItems.length > 0) {
        setExpiredItems(prev => [...new Set([...prev, ...newExpiredItems])])
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [items])

  // Handle item removal
  const handleRemoveItem = async (productId: string) => {
    try {
      await releaseReservation(productId)
      removeItem(productId)
    } catch (error) {
      console.error('Error removing item:', error)
      // Remove from UI anyway
      removeItem(productId)
    }
  }

  // Handle expired item cleanup
  const handleExpiredItem = async (productId: string) => {
    await handleRemoveItem(productId)
    setExpiredItems(prev => prev.filter(id => id !== productId))
  }

  // Calculate totals
  const subtotal = items.reduce((total, item) => {
    if (!expiredItems.includes(item.product_id!)) {
      return total + item.product.price
    }
    return total
  }, 0)

  const validItems = items.filter(item => !expiredItems.includes(item.product_id!))

  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="text-muted-foreground">
            <Clock className="w-8 h-8 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Your cart is empty</h3>
            <p className="text-sm">
              Find a one-of-a-kind piece to add to your cart
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-6">
        {showTitle && (
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Your Reserved Items</h2>
            {onClose && (
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        )}

        <div className="space-y-4">
          {items.map((item) => {
            const isExpired = expiredItems.includes(item.product_id!)
            const expiresAt = item.expires_at ? new Date(item.expires_at) : new Date()

            return (
              <CartItem
                key={item.id}
                item={item}
                currency={currency}
                isExpired={isExpired}
                expiresAt={expiresAt}
                onRemove={() => handleRemoveItem(item.product_id!)}
                onExpired={() => handleExpiredItem(item.product_id!)}
              />
            )
          })}
        </div>

        {validItems.length > 0 && (
          <div className="mt-6 pt-6 border-t">
            <div className="flex items-center justify-between text-lg font-semibold">
              <span>Total</span>
              <span>{formatPrice(subtotal, currency)}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Prices include GST for Australian customers
            </p>

            <Button className="w-full mt-4" size="lg">
              Proceed to Checkout
            </Button>

            <p className="text-xs text-center text-muted-foreground mt-2">
              Complete your purchase before your reservation expires
            </p>
          </div>
        )}

        {expiredItems.length > 0 && (
          <div className="mt-4 p-4 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm">
              <AlertTriangle className="w-4 h-4" />
              <span>Some items have expired and were removed from your cart</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

interface CartItemProps {
  item: CartItemWithProduct
  currency: string
  isExpired: boolean
  expiresAt: Date
  onRemove: () => void
  onExpired: () => void
}

function CartItem({ item, currency, isExpired, expiresAt, onRemove, onExpired }: CartItemProps) {
  const primaryImage = item.product.product_images?.find(img => img.is_primary) || item.product.product_images?.[0]

  if (isExpired) {
    return (
      <div className="flex items-center gap-4 p-4 border border-red-200 dark:border-red-800 rounded-lg bg-red-50 dark:bg-red-950/20">
        <div className="w-16 h-16 bg-muted rounded-lg overflow-hidden opacity-50">
          {primaryImage ? (
            <img
              src={primaryImage.url}
              alt={item.product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-muted" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-red-600 dark:text-red-400 truncate">
            {item.product.name}
          </h3>
          <p className="text-sm text-red-500 dark:text-red-400">
            Size {item.product.size} • {item.product.age_group}
          </p>
          <p className="text-sm text-red-600 dark:text-red-400 font-medium">
            Reservation expired
          </p>
        </div>

        <Button size="sm" variant="outline" onClick={onExpired}>
          Remove
        </Button>
      </div>
    )
  }

  return (
    <div className="flex items-start gap-4 p-4 border rounded-lg">
      <div className="w-16 h-16 bg-muted rounded-lg overflow-hidden flex-shrink-0">
        {primaryImage ? (
          <img
            src={primaryImage.url}
            alt={item.product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-muted" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="font-medium truncate">{item.product.name}</h3>
            <p className="text-sm text-muted-foreground">
              Size {item.product.size} • {item.product.age_group}
            </p>
          </div>
          <div className="text-right">
            <p className="font-semibold">{formatPrice(item.product.price, currency)}</p>
            <Badge variant="outline" className="text-xs">
              ONE OF A KIND
            </Badge>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <Timer
            expiresAt={expiresAt}
            onExpire={onExpired}
            className="text-xs"
          />
          <Button size="sm" variant="ghost" onClick={onRemove}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Progress bar for time remaining */}
        <div className="mt-2">
          <Countdown
            expiresAt={expiresAt}
            onExpire={onExpired}
          />
        </div>
      </div>
    </div>
  )
}