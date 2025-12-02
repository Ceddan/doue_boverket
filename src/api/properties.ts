import type { Property } from '@/types/property'

export async function fetchProperties(): Promise<Property[]> {
  // Static JSON file - no backend needed
  const response = await fetch('/api/properties.json')
  if (!response.ok) {
    throw new Error('Failed to fetch properties')
  }
  return response.json()
}
