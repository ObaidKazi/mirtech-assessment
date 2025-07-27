'use client'

import React, { useMemo, useCallback } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDate } from '@/lib/utils'
import { ChevronLeft, ChevronRight, Eye, Star } from 'lucide-react'
import Link from 'next/link'

interface Column {
  key: string
  label: string
  width: number
  render?: (value: any, row: any) => React.ReactNode
}

interface VirtualizedTableProps {
  data: any[]
  columns: Column[]
  loading?: boolean
  pagination?: {
    page: number
    size: number
    total: number
    pages: number
  }
  onPageChange?: (page: number) => void
  itemType?: 'products' | 'users' | 'orders'
}

export function VirtualizedTable({ 
  data, 
  columns, 
  loading = false, 
  pagination, 
  onPageChange,
  itemType = 'products'
}: VirtualizedTableProps) {
  const parentRef = React.useRef<HTMLDivElement>(null)

  const virtualizer = useVirtualizer({
    count: data.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 60, // Row height
    overscan: 10,
  })

  // Responsive column widths with better mobile handling
  const responsiveColumns = useMemo(() => {
    return columns.map(col => ({
      ...col,
      width: Math.max(col.width, 100) // Reduced minimum width for better mobile fit
    }))
  }, [columns])

  const totalWidth = useMemo(() => 
    responsiveColumns.reduce((sum, col) => sum + col.width, 0), 
    [responsiveColumns]
  )

  const renderCell = useCallback((column: Column, row: any) => {
    if (column.render) {
      return column.render(row[column.key], row)
    }

    const value = row[column.key]
    
    // Default rendering based on column key
    switch (column.key) {
      case 'price':
      case 'unit_price':
      case 'total_amount':
        return formatCurrency(value)
      case 'created_at':
      case 'updated_at':
      case 'order_date':
        return formatDate(value)
      case 'rating':
        return (
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span>{value?.toFixed(1) || 'N/A'}</span>
          </div>
        )
      case 'is_active':
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {value ? 'Active' : 'Inactive'}
          </span>
        )
      case 'status':
        const statusColors = {
          pending: 'bg-yellow-100 text-yellow-800',
          processing: 'bg-blue-100 text-blue-800',
          shipped: 'bg-purple-100 text-purple-800',
          delivered: 'bg-green-100 text-green-800',
          cancelled: 'bg-red-100 text-red-800'
        }
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            statusColors[value as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'
          }`}>
            {value}
          </span>
        )
      default:
        return (
          <div className="truncate max-w-[150px] xs:max-w-[200px]" title={value?.toString()}>
            {value?.toString() || 'N/A'}
          </div>
        )
    }
  }, [])

  if (loading) {
    return (
      <Card className="p-6">
        <div className="space-y-4">
          <div className="h-8 bg-gray-200 rounded animate-pulse" />
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
          ))}
        </div>
      </Card>
    )
  }

  return (
    <div className="w-full">
      <Card className="border-0 shadow-md overflow-hidden">
        {/* Mobile-optimized horizontal scroll container */}
        <div className="w-full overflow-x-auto">
          {/* Table Header */}
          <div 
            className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 sticky top-0 z-10"
            style={{ minWidth: Math.max(totalWidth + 80, 600) }}
          >
            <div className="flex">
              {responsiveColumns.map((column) => (
                <div
                  key={column.key}
                  className="px-1 xs:px-2 sm:px-4 py-2 xs:py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-r border-gray-200 last:border-r-0 whitespace-nowrap"
                  style={{ width: column.width, minWidth: column.width }}
                >
                  <div className="truncate">{column.label}</div>
                </div>
              ))}
              <div className="px-1 xs:px-2 sm:px-4 py-2 xs:py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider min-w-[80px] text-center">
                Actions
              </div>
            </div>
          </div>

          {/* Virtualized Table Body */}
          <div
            ref={parentRef}
            className="h-[400px] xs:h-[450px] sm:h-[500px] lg:h-[600px] overflow-auto bg-white"
            style={{ minWidth: Math.max(totalWidth + 80, 600) }}
          >
            <div
              style={{
                height: `${virtualizer.getTotalSize()}px`,
                width: '100%',
                position: 'relative',
              }}
            >
              {virtualizer.getVirtualItems().map((virtualRow) => {
                const row = data[virtualRow.index]
                return (
                  <div
                    key={virtualRow.index}
                    className={`absolute top-0 left-0 w-full flex border-b border-gray-100 hover:bg-blue-50 transition-colors duration-150 ${
                      virtualRow.index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                    }`}
                    style={{
                      height: `${virtualRow.size}px`,
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                  >
                    {responsiveColumns.map((column) => (
                      <div
                        key={column.key}
                        className="px-1 xs:px-2 sm:px-4 py-2 xs:py-3 text-xs sm:text-sm text-gray-900 border-r border-gray-100 last:border-r-0 flex items-center"
                        style={{ width: column.width, minWidth: column.width }}
                      >
                        {renderCell(column, row)}
                      </div>
                    ))}
                    <div className="px-1 xs:px-2 sm:px-4 py-2 xs:py-3 text-sm text-gray-900 min-w-[80px] flex items-center justify-center">
                      <Link href={`/item/${row.id}?type=${itemType}`}>
                        <Button variant="ghost" size="sm" className="hover:bg-blue-100 hover:text-blue-700 p-1 h-7 w-7 xs:h-8 xs:w-8">
                          <Eye className="h-3 w-3 xs:h-4 xs:w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </Card>

      {/* Completely redesigned mobile-first pagination */}
      {pagination && (
        <div className="mt-4">
          <Card className="border-0 shadow-md">
            <div className="bg-white px-2 xs:px-4 sm:px-6 py-3 xs:py-4">
              {/* Mobile pagination - completely visible and functional */}
              <div className="block sm:hidden">
                <div className="text-center mb-3">
                  <p className="text-sm font-medium text-gray-900">
                    Page {pagination.page} of {pagination.pages}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {pagination.total.toLocaleString()} total
                  </p>
                </div>
                <div className="flex justify-center items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange?.(pagination.page - 1)}
                    disabled={pagination.page <= 1}
                    className="flex items-center gap-1 min-w-[70px] h-9 px-2"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span className="text-xs">Prev</span>
                  </Button>
                  
                  <div className="flex items-center gap-1">
                    {/* Show 3 pages max on mobile */}
                    {Array.from({ length: Math.min(3, pagination.pages) }, (_, i) => {
                      let pageNum;
                      if (pagination.pages <= 3) {
                        pageNum = i + 1;
                      } else if (pagination.page === 1) {
                        pageNum = i + 1;
                      } else if (pagination.page === pagination.pages) {
                        pageNum = pagination.pages - 2 + i;
                      } else {
                        pageNum = pagination.page - 1 + i;
                      }
                      
                      if (pageNum < 1 || pageNum > pagination.pages) return null;
                      
                      return (
                        <Button
                          key={pageNum}
                          variant={pageNum === pagination.page ? "default" : "outline"}
                          size="sm"
                          onClick={() => onPageChange?.(pageNum)}
                          className="w-9 h-9 p-0 text-sm"
                        >
                          {pageNum}
                        </Button>
                      )
                    })}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange?.(pagination.page + 1)}
                    disabled={pagination.page >= pagination.pages}
                    className="flex items-center gap-1 min-w-[70px] h-9 px-2"
                  >
                    <span className="text-xs">Next</span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Desktop pagination */}
              <div className="hidden sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing{' '}
                    <span className="font-medium">
                      {((pagination.page - 1) * pagination.size) + 1}
                    </span>{' '}
                    to{' '}
                    <span className="font-medium">
                      {Math.min(pagination.page * pagination.size, pagination.total)}
                    </span>{' '}
                    of{' '}
                    <span className="font-medium">{pagination.total.toLocaleString()}</span>{' '}
                    results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <Button
                      variant="outline"
                      onClick={() => onPageChange?.(pagination.page - 1)}
                      disabled={pagination.page <= 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </Button>
                    
                    {/* Page Numbers */}
                    {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                      const pageNum = Math.max(1, pagination.page - 2) + i
                      if (pageNum > pagination.pages) return null
                      
                      return (
                        <Button
                          key={pageNum}
                          variant={pageNum === pagination.page ? "default" : "outline"}
                          onClick={() => onPageChange?.(pageNum)}
                          className="relative inline-flex items-center px-4 py-2"
                        >
                          {pageNum}
                        </Button>
                      )
                    })}
                    
                    <Button
                      variant="outline"
                      onClick={() => onPageChange?.(pagination.page + 1)}
                      disabled={pagination.page >= pagination.pages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </Button>
                  </nav>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}