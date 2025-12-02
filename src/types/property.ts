export interface Property {
  id: number
  fastighetsbeteckning: string
  adress: string | null
  kommun: string
  energiklass: string | null
  datum: string | null
  primarenergital: number | null
  energiprestanda: number | null
  fetched_at: string | null
  // Client-side only
  status?: 'loading' | 'done' | 'error'
}

export interface FetchResponse {
  success: boolean
  energiklass: string | null
  datum: string | null
  primarenergital: number | null
  energiprestanda: number | null
}

export interface ScanParams {
  base_name: string
  start: number
  end: number
  kommun: string
}
