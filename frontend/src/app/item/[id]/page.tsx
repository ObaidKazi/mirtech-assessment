import {ItemView} from '@/components/ItemView'

interface PageProps {
  params: Promise<{
    id: string
  }>
  searchParams: Promise<{
    type?: string
  }>
}

export default async function ItemPage({ params, searchParams }: PageProps) {
  // Await the params and searchParams
  const resolvedParams = await params
  const resolvedSearchParams = await searchParams
  
  // Map both singular and plural types to match ItemView component expectations
  const typeMap = {
    'products': 'products',
    'users': 'users',
    'orders': 'orders'
  } as const
  
  const inputType = resolvedSearchParams.type as keyof typeof typeMap || 'product'
  const type = typeMap[inputType] || 'products'
  
  return (
    <ItemView 
      id={resolvedParams.id} 
      type={type}
    />
  )
}