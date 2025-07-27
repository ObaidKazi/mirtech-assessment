'use client'

import React, { useState, useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { Search, Filter, X } from 'lucide-react'
import { debounce } from '@/lib/utils'

type DataType = 'products' | 'users' | 'orders'

interface SearchFiltersProps {
  onFiltersChange: (filters: any) => void
  categories?: string[]
  brands?: string[]
  cities?: string[]
  countries?: string[]
  statuses?: string[]
  loading?: boolean
  dataType: DataType
}

export function SearchFilters({ 
  onFiltersChange, 
  categories = [], 
  brands = [], 
  cities = [],
  countries = [],
  statuses = [],
  loading = false,
  dataType 
}: SearchFiltersProps) {
  // Dynamic initial filters based on data type
  const getInitialFilters = () => {
    const baseFilters = {
      sort_by: 'id',
      sort_order: 'asc',
      search:'',
      category:'',
      brand:'',
      min_price:'',
      max_price:'',
      city:'',
      country:'',
      status:'',
      user_id:''
    }
    
    switch (dataType) {
      case 'products':
        return {
          ...baseFilters,
          search: '',
          category: '',
          brand: '',
          min_price: '',
          max_price: ''
        }
      case 'users':
        return {
          ...baseFilters,
          search: '',
          city: '',
          country: ''
        }
      case 'orders':
        return {
          ...baseFilters,
          user_id: '',
          status: ''
        }
      default:
        return baseFilters
    }
  }

  const [filters, setFilters] = useState(getInitialFilters())
  const [showAdvanced, setShowAdvanced] = useState(false)

  // Reset filters when dataType changes
  React.useEffect(() => {
    const newFilters = getInitialFilters()
    setFilters(newFilters)
    onFiltersChange(newFilters)
  }, [dataType])

  const debouncedOnFiltersChange = useCallback(
    debounce((newFilters: any) => {
      onFiltersChange(newFilters)
    }, 300),
    [onFiltersChange]
  )

  const updateFilters = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    debouncedOnFiltersChange(newFilters)
  }

  const clearFilters = () => {
    const clearedFilters = getInitialFilters()
    setFilters(clearedFilters)
    onFiltersChange(clearedFilters)
  }

  const hasActiveFilters = Object.entries(filters).some(([key, value]) => 
    value !== '' && key !== 'sort_by' && key !== 'sort_order'
  )

  // Get sort options based on data type
  const getSortOptions = () => {
    switch (dataType) {
      case 'products':
        return [
          { value: 'id|asc', label: 'ID (Ascending)' },
          { value: 'id|desc', label: 'ID (Descending)' },
          { value: 'name|asc', label: 'Name (A-Z)' },
          { value: 'name|desc', label: 'Name (Z-A)' },
          { value: 'price|asc', label: 'Price (Low to High)' },
          { value: 'price|desc', label: 'Price (High to Low)' },
          { value: 'rating|desc', label: 'Rating (High to Low)' },
          { value: 'created_at|desc', label: 'Newest First' }
        ]
      case 'users':
        return [
          { value: 'id|asc', label: 'ID (Ascending)' },
          { value: 'id|desc', label: 'ID (Descending)' },
          { value: 'first_name|asc', label: 'First Name (A-Z)' },
          { value: 'first_name|desc', label: 'First Name (Z-A)' },
          { value: 'last_name|asc', label: 'Last Name (A-Z)' },
          { value: 'last_name|desc', label: 'Last Name (Z-A)' },
          { value: 'email|asc', label: 'Email (A-Z)' },
          { value: 'created_at|desc', label: 'Newest First' }
        ]
      case 'orders':
        return [
          { value: 'id|asc', label: 'ID (Ascending)' },
          { value: 'id|desc', label: 'ID (Descending)' },
          { value: 'order_date|desc', label: 'Newest Orders' },
          { value: 'order_date|asc', label: 'Oldest Orders' },
          { value: 'total_amount|desc', label: 'Amount (High to Low)' },
          { value: 'total_amount|asc', label: 'Amount (Low to High)' },
          { value: 'status|asc', label: 'Status (A-Z)' }
        ]
      default:
        return [{ value: 'id|asc', label: 'ID (Ascending)' }]
    }
  }

  // Get search placeholder based on data type
  const getSearchPlaceholder = () => {
    switch (dataType) {
      case 'products':
        return 'Search products, brands, descriptions...'
      case 'users':
        return 'Search users by name, email...'
      case 'orders':
        return 'Search orders...'
      default:
        return 'Search...'
    }
  }

  return (
    <Card className="border-0 shadow-md">
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Search Bar - Show for products and users only */}
          {(dataType === 'products' || dataType === 'users') && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                placeholder={getSearchPlaceholder()}
                value={filters.search || ''}
                onChange={(e) => updateFilters('search', e.target.value)}
                className="pl-11 h-12 text-base border-gray-200 focus:border-blue-500 focus:ring-blue-500 bg-white"
                disabled={loading}
              />
            </div>
          )}

          {/* Quick Filters Row */}
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700 min-w-fit">Filters:</span>
            </div>
            
            {/* Product-specific filters */}
            {dataType === 'products' && (
              <>
                <Select value={filters.category || 'all'} onValueChange={(value) => updateFilters('category', value === 'all' ? '' : value)}>
                  <SelectTrigger className="w-[200px] border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={filters.brand || 'all'} onValueChange={(value) => updateFilters('brand', value === 'all' ? '' : value)}>
                  <SelectTrigger className="w-[200px] border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                    <SelectValue placeholder="All Brands" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Brands</SelectItem>
                    {brands.map((brand) => (
                      <SelectItem key={brand} value={brand}>
                        {brand}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </>
            )}

            {/* User-specific filters */}
            {dataType === 'users' && (
              <>
                <Select value={filters.city || 'all'} onValueChange={(value) => updateFilters('city', value === 'all' ? '' : value)}>
                  <SelectTrigger className="w-[200px] border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                    <SelectValue placeholder="All Cities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Cities</SelectItem>
                    {cities.map((city) => (
                      <SelectItem key={city} value={city}>
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={filters.country || 'all'} onValueChange={(value) => updateFilters('country', value === 'all' ? '' : value)}>
                  <SelectTrigger className="w-[200px] border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                    <SelectValue placeholder="All Countries" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Countries</SelectItem>
                    {countries.map((country) => (
                      <SelectItem key={country} value={country}>
                        {country}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </>
            )}

            {/* Order-specific filters */}
            {dataType === 'orders' && (
              <>
                <div className="space-y-2">
                  <Input
                    type="number"
                    placeholder="User ID"
                    value={filters.user_id || ''}
                    onChange={(e) => updateFilters('user_id', e.target.value)}
                    disabled={loading}
                    className="w-[200px] border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <Select value={filters.status || 'all'} onValueChange={(value) => updateFilters('status', value === 'all' ? '' : value)}>
                  <SelectTrigger className="w-[200px] border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    {statuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </>
            )}

            {/* Sort dropdown - common for all data types */}
            <Select value={`${filters.sort_by}|${filters.sort_order}`} onValueChange={(value) => {
              const [sort_by, sort_order] = value.split('|')
              const newFilters = { 
                ...filters, 
                sort_by: sort_by || 'id', 
                sort_order: sort_order || 'asc' 
              }
              setFilters(newFilters)
              debouncedOnFiltersChange(newFilters)
            }}>
              <SelectTrigger className="w-[200px] border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                {getSortOptions().map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Advanced filters button - only for products */}
            {dataType === 'products' && (
              <Button
                variant="outline"
                size="default"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-2 border-gray-200 hover:bg-gray-50"
              >
                <Filter className="h-4 w-4" />
                Advanced
              </Button>
            )}

            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="default"
                onClick={clearFilters}
                className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <X className="h-4 w-4" />
                Clear All
              </Button>
            )}
          </div>

          {/* Advanced Filters - only for products */}
          {showAdvanced && dataType === 'products' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-200">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Minimum Price</label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={filters.min_price || ''}
                  onChange={(e) => updateFilters('min_price', e.target.value)}
                  disabled={loading}
                  className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Maximum Price</label>
                <Input
                  type="number"
                  placeholder="1000.00"
                  value={filters.max_price || ''}
                  onChange={(e) => updateFilters('max_price', e.target.value)}
                  disabled={loading}
                  className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}