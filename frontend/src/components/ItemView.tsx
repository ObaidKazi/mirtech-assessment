'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatDate } from '@/lib/utils'
import { apiClient } from '@/lib/api'
import { ArrowLeft, Star, Package, User, ShoppingCart } from 'lucide-react'
import Link from 'next/link'

interface ItemViewProps {
  id: string
  type: 'products' | 'users' | 'orders'
}

export function ItemView({ id, type }: ItemViewProps) {
  const [item, setItem] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchItem = async () => {
      setLoading(true)
      setError(null)
      
      try {
        let data
        switch (type) {
          case 'products':
            data = await apiClient.getProduct(parseInt(id))
            break
          case 'users':
            // Use the proper getUser method instead of filtering
            data = await apiClient.getUser(parseInt(id))
            break
          case 'orders':
            // Use the proper getOrder method instead of filtering
            data = await apiClient.getOrder(parseInt(id))
            break
          default:
            throw new Error('Invalid item type')
        }
        
        if (!data) {
          throw new Error('Item not found')
        }
        
        setItem(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch item')
      } finally {
        setLoading(false)
      }
    }

    fetchItem()
  }, [id, type])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded animate-pulse" />
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 rounded animate-pulse" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !item) {
    return (
      <div className="space-y-6">
        <Link href="/">
          <Button variant="outline" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Table
          </Button>
        </Link>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <p className="text-red-800">{error || 'Item not found'}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const renderProductView = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/">
          <Button variant="outline" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Table
          </Button>
        </Link>
        <Badge variant={item.is_active ? "default" : "secondary"}>
          {item.is_active ? 'Active' : 'Inactive'}
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">{item.name}</CardTitle>
              <CardDescription className="text-lg font-semibold text-green-600">
                {formatCurrency(item.price)}
              </CardDescription>
            </div>
            <Package className="h-8 w-8 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Product Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">ID:</span>
                    <span>{item.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Category:</span>
                    <span>{item.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Brand:</span>
                    <span>{item.brand}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Stock:</span>
                    <span>{item.stock_quantity} units</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Rating:</span>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span>{item.rating?.toFixed(1) || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Timestamps</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Created:</span>
                    <span>{formatDate(item.created_at)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Updated:</span>
                    <span>{formatDate(item.updated_at)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {item.description && (
            <div>
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {item.description}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )

  const renderUserView = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/">
          <Button variant="outline" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Table
          </Button>
        </Link>
        <Badge variant={item.is_active ? "default" : "secondary"}>
          {item.is_active ? 'Active' : 'Inactive'}
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">
                {item.first_name} {item.last_name}
              </CardTitle>
              <CardDescription>{item.email}</CardDescription>
            </div>
            <User className="h-8 w-8 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Contact Information</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">ID:</span>
                    <span>{item.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Email:</span>
                    <span>{item.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Phone:</span>
                    <span>{item.phone || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Location</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">City:</span>
                    <span>{item.city}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Country:</span>
                    <span>{item.country}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Joined:</span>
                    <span>{formatDate(item.created_at)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {item.address && (
            <div>
              <h3 className="font-semibold mb-2">Address</h3>
              <p className="text-sm text-muted-foreground">
                {item.address}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )

  const renderOrderView = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/">
          <Button variant="outline" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Table
          </Button>
        </Link>
        <Badge variant="outline">{item.status}</Badge>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">Order #{item.id}</CardTitle>
              <CardDescription>
                {formatDate(item.order_date)}
              </CardDescription>
            </div>
            <ShoppingCart className="h-8 w-8 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Order Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Order ID:</span>
                    <span>{item.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">User ID:</span>
                    <span>{item.user_id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Product ID:</span>
                    <span>{item.product_id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Quantity:</span>
                    <span>{item.quantity}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Pricing</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Unit Price:</span>
                    <span>{formatCurrency(item.unit_price)}</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span>Total Amount:</span>
                    <span>{formatCurrency(item.total_amount)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {(item.user || item.product) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
              {item.user && (
                <div>
                  <h3 className="font-semibold mb-2">Customer</h3>
                  <div className="space-y-1 text-sm">
                    <p>{item.user.first_name} {item.user.last_name}</p>
                    <p className="text-muted-foreground">{item.user.email}</p>
                  </div>
                </div>
              )}
              
              {item.product && (
                <div>
                  <h3 className="font-semibold mb-2">Product</h3>
                  <div className="space-y-1 text-sm">
                    <p>{item.product.name}</p>
                    <p className="text-muted-foreground">{item.product.category}</p>
                    <p className="text-muted-foreground">{formatCurrency(item.product.price)}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )

  switch (type) {
    case 'products':
      return renderProductView()
    case 'users':
      return renderUserView()
    case 'orders':
      return renderOrderView()
    default:
      return <div>Invalid item type</div>
  }
}