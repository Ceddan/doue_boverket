import type { Property, FetchResponse, ScanParams } from '@/types/property'

export async function fetchProperties(): Promise<Property[]> {
  const response = await fetch('/api/properties')
  if (!response.ok) {
    throw new Error('Failed to fetch properties')
  }
  return response.json()
}

export async function fetchPropertyData(params: {
  id: number
  kommun: string
  fastighet: string
}): Promise<FetchResponse> {
  const response = await fetch('/api/fetch', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  })
  if (!response.ok) {
    throw new Error('Failed to fetch property data')
  }
  return response.json()
}

export async function* scanProperties(params: ScanParams): AsyncGenerator<string> {
  const response = await fetch('/api/scan', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  })

  if (!response.ok || !response.body) {
    throw new Error('Failed to start scan')
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()

  try {
    while (true) {
      const { value, done } = await reader.read()
      if (done) break

      const text = decoder.decode(value)
      const lines = text.split('\n').filter(Boolean)
      for (const line of lines) {
        yield line
      }
    }
  } finally {
    reader.releaseLock()
  }
}
