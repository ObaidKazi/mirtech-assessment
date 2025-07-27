'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { VirtualizedTable } from './VirtualizedTable'
import { SearchFilters } from './SearchFilters'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { apiClient } from '@/lib/api'
import { Product, User, Order, PaginatedResponse } from '@/types'
import { Database, Users, ShoppingCart, TrendingUp, Sprout } from 'lucide-react'

type DataType = 'products' | 'users' | 'orders'

interface DataTableProps {
  initialType?: DataType
}

export function DataTable() {
  const [dataType, setDataType] = useState<DataType>('products')
  const [data, setData] = useState<any[]>([])
  const [allData, setAllData] = useState<any[]>([]) // Add this to store unfiltered data
  const [filters, setFilters] = useState<any>({})
  const [pagination, setPagination] = useState({
    page: 1,
    size: 50,
    total: 0,
    pages: 0
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<any>(null)
  const [seeding, setSeeding] = useState(false)

  // Column definitions for different data types
  const columnConfigs = {
    products: [
      { key: 'id', label: 'ID', width: 80 },
      { key: 'name', label: 'Name', width: 250 },
      { key: 'category', label: 'Category', width: 120 },
      { key: 'brand', label: 'Brand', width: 120 },
      { key: 'price', label: 'Price', width: 100 },
      { key: 'stock_quantity', label: 'Stock', width: 80 },
      { key: 'rating', label: 'Rating', width: 100 },
      { key: 'is_active', label: 'Status', width: 100 },
      { key: 'created_at', label: 'Created', width: 150 },
    ],
    users: [
      { key: 'id', label: 'ID', width: 80 },
      { key: 'first_name', label: 'First Name', width: 120 },
      { key: 'last_name', label: 'Last Name', width: 120 },
      { key: 'email', label: 'Email', width: 250 },
      { key: 'city', label: 'City', width: 200 },
      { key: 'country', label: 'Country', width: 200 },
      { key: 'is_active', label: 'Status', width: 100 },
      { key: 'created_at', label: 'Created', width: 150 },
    ],
    orders: [
      { key: 'id', label: 'ID', width: 80 },
      { key: 'user_id', label: 'User ID', width: 80 },
      { key: 'product_id', label: 'Product ID', width: 100 },
      { key: 'quantity', label: 'Qty', width: 150 },
      { key: 'unit_price', label: 'Unit Price', width: 170 },
      { key: 'total_amount', label: 'Total', width: 150 },
      { key: 'status', label: 'Status', width: 150 },
      { key: 'order_date', label: 'Order Date', width: 200 },
    ]
  }

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const params = {
        page: pagination.page,
        size: pagination.size,
        ...filters
      }

      let response: PaginatedResponse<any>
      
      switch (dataType) {
        case 'products':
          response = await apiClient.getProducts(params) as PaginatedResponse<Product>
          break
        case 'users':
          response = await apiClient.getUsers(params) as PaginatedResponse<User>
          break
        case 'orders':
          response = await apiClient.getOrders(params) as PaginatedResponse<Order>
          break
        default:
          throw new Error('Invalid data type')
      }

      setData(response.items)
      
      // Fetch all data for filter options when no filters are applied
      if (Object.keys(filters).length === 0 || (Object.keys(filters).length === 2 && filters.sort_by && filters.sort_order)) {
        setAllData(response.items)
      }
      
      setPagination({
        page: response.page,
        size: response.size,
        total: response.total,
        pages: response.pages
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setData([])
    } finally {
      setLoading(false)
    }
  }, [dataType, pagination.page, pagination.size, filters])

  const fetchStats = useCallback(async () => {
    try {
      const statsData = await apiClient.getStats()
      setStats(statsData)
    } catch (err) {
      console.error('Failed to fetch stats:', err)
    }
  }, [])

  // Add seed data function
  const handleSeedData = async () => {
    setSeeding(true)
    try {
      await apiClient.seedData()
      // Refresh stats and current data after seeding
      await fetchStats()
      await fetchData()
      
      // Refresh the entire page after seeding completes
      window.location.reload()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to seed data')
    } finally {
      setSeeding(false)
    }
  }

  // Check if all data types are empty
  const shouldShowSeedOption = stats && 
    stats.total_products === 0 && 
    stats.total_users === 0 && 
    stats.total_orders === 0

  useEffect(() => {
    fetchData()
  }, [fetchData])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  const handleFiltersChange = (newFilters: any) => {
    setFilters(newFilters)
    setPagination(prev => ({ ...prev, page: 1 })) // Reset to first page
  }

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }))
  }

  const handleDataTypeChange = (newType: DataType) => {
    setDataType(newType)
    setFilters({})
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const getFilterOptions = () => {
    const dataToUse = allData.length > 0 ? allData : data
    
    switch (dataType) {
      case 'products':
        const categories = Array.from(new Set(dataToUse.map(item => item.category))).filter(Boolean)
        const brands = Array.from(new Set(dataToUse.map(item => item.brand))).filter(Boolean)
        return { categories, brands, cities: [], countries: [], statuses: [] }
      
      case 'users':
        const cities = Array.from(new Set(dataToUse.map(item => item.city))).filter(Boolean)
        const countries = Array.from(new Set(dataToUse.map(item => item.country))).filter(Boolean)
        return { categories: [], brands: [], cities, countries, statuses: [] }
      
      case 'orders':
        const statuses = Array.from(new Set(dataToUse.map(item => item.status))).filter(Boolean)
        return { categories: [], brands: [], cities: [], countries: [], statuses }
      
      default:
        return { categories: [], brands: [], cities: [], countries: [], statuses: [] }
    }
  }

  const { categories, brands, cities, countries, statuses } = getFilterOptions()

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
          Assessment API
        </h1>
      </div>

      {/* Seed Data Option - Only show when all data is empty */}
      {shouldShowSeedOption && (
        <Card className="border-2 border-dashed border-orange-200 bg-orange-50">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="p-3 bg-orange-100 rounded-full">
                  <Sprout className="h-8 w-8 text-orange-600" />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  No Data Available
                </h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  It looks like your database is empty. Would you like to populate it with sample data to get started?
                </p>
              </div>
              <Button 
                onClick={handleSeedData}
                disabled={seeding}
                className="bg-orange-600 hover:bg-orange-700 text-white"
              >
                {seeding ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Seeding Data...
                  </>
                ) : (
                  <>
                    <Sprout className="h-4 w-4 mr-2" />
                    Seed Sample Data
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-3 gap-6">
          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Products</CardTitle>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Database className="h-4 w-4 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{stats.total_products?.toLocaleString()}</div>
              <p className="text-sm text-gray-500 mt-1">
                {stats.active_products?.toLocaleString()} active
              </p>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Users</CardTitle>
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="h-4 w-4 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{stats.total_users?.toLocaleString()}</div>
              <p className="text-sm text-gray-500 mt-1">
                {stats.active_users?.toLocaleString()} active
              </p>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Orders</CardTitle>
              <div className="p-2 bg-purple-100 rounded-lg">
                <ShoppingCart className="h-4 w-4 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{stats.total_orders?.toLocaleString()}</div>
              <p className="text-sm text-gray-500 mt-1">
                Across all time
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Data Type Selector */}
      <Card className="border-0 shadow-md">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-xl font-semibold text-gray-900">Data Explorer</CardTitle>
              <CardDescription className="text-gray-600">
                Select a data type to explore and analyze
              </CardDescription>
            </div>
            <Select value={dataType} onValueChange={handleDataTypeChange}>
              <SelectTrigger className="w-[200px] border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="products">📦 Products</SelectItem>
                <SelectItem value="users">👥 Users</SelectItem>
                <SelectItem value="orders">🛒 Orders</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
      </Card>

      {/* Search and Filters */}
      <SearchFilters
        onFiltersChange={handleFiltersChange}
        categories={categories}
        brands={brands}
        cities={cities}
        countries={countries}
        statuses={statuses}
        loading={loading}
        dataType={dataType}
      />

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <p className="text-red-800">Error: {error}</p>
            <Button 
              variant="outline" 
              onClick={fetchData} 
              className="mt-2"
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Data Table */}
      <VirtualizedTable
        data={data}
        columns={columnConfigs[dataType]}
        loading={loading}
        pagination={pagination}
        onPageChange={handlePageChange}
        itemType={dataType}
      />
    </div>
  )
}

// Add this temporarily to test
<div className="bg-red-500 text-white p-4 text-center">
  🔴 If you see this red box, Tailwind is working!
</div>