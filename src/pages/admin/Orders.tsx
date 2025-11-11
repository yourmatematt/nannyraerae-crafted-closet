import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, Search, Package, Eye, CheckCircle, MessageCircle, Users, MapPin, ShoppingBag, Truck } from 'lucide-react'
import { toast } from 'sonner'
import { AddressLabel } from '@/components/admin/AddressLabel'

// Order status constants
const ORDER_STATUSES = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded'
} as const

type OrderStatus = typeof ORDER_STATUSES[keyof typeof ORDER_STATUSES]

interface Order {
  id: string
  customer_email: string
  customer_first_name: string
  customer_last_name: string
  customer_phone: string
  shipping_address_line1: string
  shipping_address_line2: string
  shipping_city: string
  shipping_state: string
  shipping_postcode: string
  shipping_country: string
  status: string
  subtotal: number
  shipping_cost: number
  total: number
  stripe_payment_intent_id: string
  stripe_checkout_session_id: string
  created_at: string
  tracking_number?: string
  shipped_at?: string
  order_items?: OrderItem[]
}

interface OrderItem {
  id: string
  product_name: string
  product_price: number
  quantity: number
}

export default function Orders() {
  const navigate = useNavigate()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [fulfillmentModalOpen, setFulfillmentModalOpen] = useState(false)
  const [trackingNumber, setTrackingNumber] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [orderItems, setOrderItems] = useState<Record<string, OrderItem[]>>({})

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const { data: ordersData, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      setOrders(ordersData || [])
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId)

      if (error) throw error

      // Update local state
      setOrders(orders.map(order =>
        order.id === orderId ? { ...order, status: newStatus } : order
      ))

      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus })
      }

      toast.success(`Order status updated to ${newStatus}`)
    } catch (error) {
      console.error('Error updating order status:', error)
      toast.error('Failed to update order status')
    }
  }

  const openFulfillmentModal = (order: Order) => {
    setSelectedOrder(order)
    setTrackingNumber('')
    setFulfillmentModalOpen(true)

    // Fetch order items if not already loaded
    if (!orderItems[order.id]) {
      fetchOrderItems(order.id)
    }
  }

  const closeFulfillmentModal = () => {
    setFulfillmentModalOpen(false)
    setSelectedOrder(null)
    setTrackingNumber('')
  }

  const fetchOrderItems = async (orderId: string) => {
    try {
      const { data, error } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', orderId)

      if (error) throw error

      setOrderItems(prev => ({
        ...prev,
        [orderId]: data || []
      }))
    } catch (error) {
      console.error('Error fetching order items:', error)
    }
  }

  const handleFulfillOrder = async () => {
    if (!selectedOrder || !trackingNumber.trim()) return

    setSubmitting(true)
    try {
      // Update order status to shipped
      const { error } = await supabase
        .from('orders')
        .update({
          status: ORDER_STATUSES.SHIPPED,
          tracking_number: trackingNumber.trim(),
          shipped_at: new Date().toISOString()
        })
        .eq('id', selectedOrder.id)

      if (error) throw error

      // Update local state
      const updatedOrder = {
        ...selectedOrder,
        status: ORDER_STATUSES.SHIPPED,
        tracking_number: trackingNumber.trim(),
        shipped_at: new Date().toISOString()
      }

      setOrders(orders.map(order =>
        order.id === selectedOrder.id ? updatedOrder : order
      ))

      console.log('Order updated successfully, now sending shipping email...')

      // Send shipping confirmation email
      try {
        const { data: emailResponse, error: emailError } = await supabase.functions.invoke('send-shipping-email', {
          body: {
            orderId: selectedOrder.id,
            trackingNumber: trackingNumber.trim()
          }
        })

        if (emailError) {
          console.error('Email sending failed:', emailError)
          toast.warning('Order marked as shipped, but email failed to send. Please contact customer manually.')
        } else if (emailResponse && emailResponse.success) {
          toast.success(`Order #${selectedOrder.id.slice(-8)} marked as shipped! Customer has been notified.`)
          console.log('Shipping confirmation email sent successfully')
        } else {
          console.error('Email sending failed:', emailResponse?.error || 'Unknown error')
          toast.warning('Order marked as shipped, but email failed to send. Please contact customer manually.')
        }
      } catch (emailError) {
        console.error('Error sending shipping email:', emailError)
        toast.warning('Order marked as shipped, but email failed to send. Please contact customer manually.')
      }

      closeFulfillmentModal()

    } catch (error) {
      console.error('Error fulfilling order:', error)
      toast.error('Failed to fulfill order')
    } finally {
      setSubmitting(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
    }).format(amount)
  }

  const getCustomerName = (order: Order) => {
    return `${order.customer_first_name} ${order.customer_last_name}`.trim()
  }

  const filteredOrders = orders.filter(order => {
    const customerName = getCustomerName(order)
    const matchesSearch = customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customer_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.id.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === 'all' || order.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case ORDER_STATUSES.PENDING: return 'outline' as const
      case ORDER_STATUSES.CONFIRMED: return 'default' as const
      case ORDER_STATUSES.PROCESSING: return 'secondary' as const
      case ORDER_STATUSES.SHIPPED: return 'default' as const
      case ORDER_STATUSES.DELIVERED: return 'default' as const
      case ORDER_STATUSES.COMPLETED: return 'default' as const
      case ORDER_STATUSES.CANCELLED: return 'destructive' as const
      case ORDER_STATUSES.REFUNDED: return 'destructive' as const
      // Legacy status support
      case 'paid': return 'default' as const
      case 'fulfilled': return 'secondary' as const
      default: return 'outline' as const
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case ORDER_STATUSES.PENDING: return 'bg-yellow-100 text-yellow-800'
      case ORDER_STATUSES.CONFIRMED: return 'bg-blue-100 text-blue-800'
      case ORDER_STATUSES.PROCESSING: return 'bg-indigo-100 text-indigo-800'
      case ORDER_STATUSES.SHIPPED: return 'bg-purple-100 text-purple-800'
      case ORDER_STATUSES.DELIVERED: return 'bg-green-100 text-green-800'
      case ORDER_STATUSES.COMPLETED: return 'bg-green-100 text-green-800'
      case ORDER_STATUSES.CANCELLED: return 'bg-red-100 text-red-800'
      case ORDER_STATUSES.REFUNDED: return 'bg-red-100 text-red-800'
      // Legacy status support
      case 'paid': return 'bg-green-100 text-green-800'
      case 'fulfilled': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return <div className="p-8">Loading orders...</div>
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
              <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={() => navigate('/admin/messages')}>
                <MessageCircle className="w-4 h-4 mr-2" />
                Messages
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by customer name, email, or order ID..."
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
              <SelectItem value="all">All Orders</SelectItem>
              <SelectItem value={ORDER_STATUSES.PENDING}>Pending</SelectItem>
              <SelectItem value={ORDER_STATUSES.CONFIRMED}>Confirmed</SelectItem>
              <SelectItem value={ORDER_STATUSES.PROCESSING}>Processing</SelectItem>
              <SelectItem value={ORDER_STATUSES.SHIPPED}>Shipped</SelectItem>
              <SelectItem value={ORDER_STATUSES.DELIVERED}>Delivered</SelectItem>
              <SelectItem value={ORDER_STATUSES.COMPLETED}>Completed</SelectItem>
              <SelectItem value={ORDER_STATUSES.CANCELLED}>Cancelled</SelectItem>
              <SelectItem value={ORDER_STATUSES.REFUNDED}>Refunded</SelectItem>
              {/* Legacy status support */}
              <SelectItem value="paid">Paid (Legacy)</SelectItem>
              <SelectItem value="fulfilled">Fulfilled (Legacy)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Orders Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Orders ({filteredOrders.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Tracking</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono text-sm">
                      #{order.id.slice(-8)}
                    </TableCell>
                    <TableCell className="font-medium">
                      {getCustomerName(order)}
                    </TableCell>
                    <TableCell>{order.customer_email}</TableCell>
                    <TableCell>
                      {new Date(order.created_at).toLocaleDateString('en-AU')}
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(order.total)}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(order.status)}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {order.tracking_number ? (
                        <div className="space-y-1">
                          <div className="font-mono text-sm text-blue-600">
                            {order.tracking_number}
                          </div>
                          {order.shipped_at && (
                            <div className="text-xs text-gray-500">
                              Shipped: {new Date(order.shipped_at).toLocaleDateString('en-AU')}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Order #{order.id.slice(-8)}</DialogTitle>
                            </DialogHeader>

                            <div className="space-y-6">
                              {/* Customer Info */}
                              <div>
                                <h3 className="font-medium mb-3">Customer Information</h3>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div><strong>Name:</strong> {getCustomerName(order)}</div>
                                  <div><strong>Email:</strong> {order.customer_email}</div>
                                  <div><strong>Phone:</strong> {order.customer_phone || 'N/A'}</div>
                                  <div><strong>Order Date:</strong> {new Date(order.created_at).toLocaleString('en-AU')}</div>
                                </div>
                              </div>

                              {/* Shipping Address */}
                              <div>
                                <h3 className="font-medium mb-3">Shipping Address</h3>
                                {order.shipping_address_line1 ? (
                                  <div className="text-sm space-y-1">
                                    <div>{order.shipping_address_line1}</div>
                                    {order.shipping_address_line2 && (
                                      <div>{order.shipping_address_line2}</div>
                                    )}
                                    <div>
                                      {order.shipping_city && `${order.shipping_city}, `}
                                      {order.shipping_state && `${order.shipping_state} `}
                                      {order.shipping_postcode}
                                    </div>
                                    <div>{order.shipping_country || 'Australia'}</div>
                                  </div>
                                ) : (
                                  <div className="text-sm text-gray-500">
                                    Shipping address not available
                                  </div>
                                )}
                              </div>

                              {/* Order Items */}
                              <div>
                                <h3 className="font-medium mb-3">Items Ordered</h3>
                                <div className="space-y-2">
                                  {order.order_items?.map((item) => (
                                    <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                                      <div>
                                        <div className="font-medium">{item.product_name}</div>
                                        <div className="text-sm text-gray-500">
                                          Qty: {item.quantity} × {formatCurrency(item.product_price)}
                                        </div>
                                      </div>
                                      <div className="font-medium">
                                        {formatCurrency(item.product_price * item.quantity)}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Order Total Breakdown */}
                              <div>
                                <h3 className="font-medium mb-3">Order Total</h3>
                                <div className="space-y-2 text-sm">
                                  <div className="flex justify-between">
                                    <span>Subtotal:</span>
                                    <span>{formatCurrency(order.subtotal)}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Shipping:</span>
                                    <span>{formatCurrency(order.shipping_cost)}</span>
                                  </div>
                                  <div className="flex justify-between font-medium text-lg border-t pt-2">
                                    <span>Total:</span>
                                    <span>{formatCurrency(order.total)}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Payment Info */}
                              <div>
                                <h3 className="font-medium mb-3">Payment Information</h3>
                                <div className="text-sm space-y-1">
                                  <div><strong>Stripe Payment ID:</strong> {order.stripe_payment_intent_id}</div>
                                  <div><strong>Session ID:</strong> {order.stripe_checkout_session_id}</div>
                                </div>
                              </div>

                              {/* Status Update */}
                              <div>
                                <h3 className="font-medium mb-3">Order Status</h3>
                                <div className="space-y-4">
                                  <div className="flex items-center gap-4">
                                    <Badge className={getStatusColor(order.status)}>
                                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                    </Badge>
                                  </div>

                                  <div>
                                    <Label htmlFor="status-select" className="text-sm font-medium mb-2 block">
                                      Update Status:
                                    </Label>
                                    <Select
                                      value={order.status}
                                      onValueChange={(newStatus) => updateOrderStatus(order.id, newStatus)}
                                    >
                                      <SelectTrigger className="w-48">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value={ORDER_STATUSES.PENDING}>Pending</SelectItem>
                                        <SelectItem value={ORDER_STATUSES.CONFIRMED}>Confirmed</SelectItem>
                                        <SelectItem value={ORDER_STATUSES.PROCESSING}>Processing</SelectItem>
                                        <SelectItem value={ORDER_STATUSES.SHIPPED}>Shipped</SelectItem>
                                        <SelectItem value={ORDER_STATUSES.DELIVERED}>Delivered</SelectItem>
                                        <SelectItem value={ORDER_STATUSES.COMPLETED}>Completed</SelectItem>
                                        <SelectItem value={ORDER_STATUSES.CANCELLED}>Cancelled</SelectItem>
                                        <SelectItem value={ORDER_STATUSES.REFUNDED}>Refunded</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>

                                  <div className="flex gap-2">
                                    {order.status !== ORDER_STATUSES.SHIPPED && order.status !== ORDER_STATUSES.DELIVERED && order.status !== ORDER_STATUSES.COMPLETED && (
                                      <Button
                                        onClick={() => openFulfillmentModal(order)}
                                        size="sm"
                                        variant="default"
                                      >
                                        <Truck className="w-4 h-4 mr-1" />
                                        Ship Order
                                      </Button>
                                    )}

                                    {order.status === ORDER_STATUSES.SHIPPED && (
                                      <Button
                                        onClick={() => updateOrderStatus(order.id, ORDER_STATUSES.DELIVERED)}
                                        size="sm"
                                        variant="default"
                                      >
                                        <CheckCircle className="w-4 h-4 mr-1" />
                                        Mark as Delivered
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>

                        {order.status !== ORDER_STATUSES.SHIPPED && order.status !== ORDER_STATUSES.DELIVERED && order.status !== ORDER_STATUSES.COMPLETED && (
                          <Button
                            onClick={() => openFulfillmentModal(order)}
                            size="sm"
                            variant="default"
                          >
                            <Truck className="w-4 h-4 mr-1" />
                            Ship
                          </Button>
                        )}

                        {order.status === ORDER_STATUSES.SHIPPED && order.tracking_number && (
                          <Button
                            onClick={() => updateOrderStatus(order.id, ORDER_STATUSES.DELIVERED)}
                            size="sm"
                            variant="outline"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Mark Delivered
                          </Button>
                        )}

                        {order.tracking_number && (
                          <Button
                            onClick={() => window.open(`https://auspost.com.au/mypost/track/#/details/${order.tracking_number}`, '_blank')}
                            size="sm"
                            variant="ghost"
                          >
                            <Package className="w-4 h-4 mr-1" />
                            Track
                          </Button>
                        )}

                        <AddressLabel order={order} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {filteredOrders.length === 0 && (
              <div className="text-center py-12">
                <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium mb-2">No orders found</h3>
                <p className="text-gray-500">
                  {searchTerm || statusFilter !== 'all'
                    ? 'Try adjusting your filters'
                    : 'Orders will appear here when customers make purchases'
                  }
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Fulfillment Modal */}
        <Dialog open={fulfillmentModalOpen} onOpenChange={setFulfillmentModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">
                Fulfill Order #{selectedOrder?.id.slice(-8)}
              </DialogTitle>
            </DialogHeader>

            {selectedOrder && (
              <div className="space-y-6">
                {/* Order Summary */}
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Customer Information
                    </h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="font-medium">{selectedOrder.customer_first_name} {selectedOrder.customer_last_name}</p>
                      <p className="text-sm text-gray-600">{selectedOrder.customer_email}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Shipping Address
                    </h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm">
                        {selectedOrder.shipping_address_line1}<br/>
                        {selectedOrder.shipping_city}, {selectedOrder.shipping_state} {selectedOrder.shipping_postcode}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <ShoppingBag className="w-4 h-4" />
                      Items Ordered
                    </h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      {orderItems[selectedOrder.id] ? (
                        <div className="space-y-2">
                          {orderItems[selectedOrder.id].map((item) => (
                            <div key={item.id} className="flex justify-between items-center">
                              <span className="text-sm">{item.product_name} x{item.quantity}</span>
                              <span className="text-sm font-medium">{formatCurrency(item.product_price * item.quantity)}</span>
                            </div>
                          ))}
                          <Separator className="my-2" />
                          <div className="flex justify-between items-center font-semibold">
                            <span>Total</span>
                            <span>{formatCurrency(selectedOrder.total)}</span>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-600">Loading items...</p>
                      )}
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Tracking Number Input */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="trackingNumber" className="text-base font-semibold">
                      Australia Post Tracking Number *
                    </Label>
                    <Input
                      id="trackingNumber"
                      type="text"
                      placeholder="e.g., 7XX XXX XXX XXX AU"
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      className="mt-2"
                      disabled={submitting}
                    />
                    <p className="text-sm text-gray-600 mt-1">
                      Enter the tracking number from Australia Post. This will be included in the shipping confirmation email.
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={closeFulfillmentModal}
                    disabled={submitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleFulfillOrder}
                    disabled={!trackingNumber.trim() || submitting}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {submitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Truck className="w-4 h-4 mr-2" />
                        Mark as Fulfilled & Send Email
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}