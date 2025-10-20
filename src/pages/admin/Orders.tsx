import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ArrowLeft, Search, Package, Eye, CheckCircle, MessageCircle } from 'lucide-react'

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
    } catch (error) {
      console.error('Error updating order status:', error)
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
      case 'pending': return 'outline' as const  // Yellow
      case 'paid': return 'default' as const     // Green
      case 'fulfilled': return 'secondary' as const // Blue
      default: return 'outline' as const
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
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
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="fulfilled">Fulfilled</SelectItem>
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
                                <div className="flex items-center gap-4">
                                  <Badge className={getStatusColor(order.status)}>
                                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                  </Badge>
                                  {order.status !== 'fulfilled' && (
                                    <Button
                                      onClick={() => updateOrderStatus(order.id, 'fulfilled')}
                                      size="sm"
                                    >
                                      <CheckCircle className="w-4 h-4 mr-1" />
                                      Mark as Fulfilled
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>

                        {order.status !== 'fulfilled' && (
                          <Button
                            onClick={() => updateOrderStatus(order.id, 'fulfilled')}
                            size="sm"
                            variant="default"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Fulfill
                          </Button>
                        )}
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
      </div>
    </div>
  )
}