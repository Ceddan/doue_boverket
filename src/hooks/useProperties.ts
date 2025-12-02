import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchProperties, fetchPropertyData } from '@/api/properties'
import type { Property } from '@/types/property'

export function useProperties() {
  return useQuery({
    queryKey: ['properties'],
    queryFn: fetchProperties,
    staleTime: 30000,
  })
}

export function useFetchProperty() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: fetchPropertyData,
    onMutate: async (params) => {
      await queryClient.cancelQueries({ queryKey: ['properties'] })

      const previousProperties = queryClient.getQueryData<Property[]>(['properties'])

      queryClient.setQueryData<Property[]>(['properties'], (old) =>
        old?.map((p) =>
          p.id === params.id ? { ...p, status: 'loading' as const } : p
        )
      )

      return { previousProperties }
    },
    onSuccess: (data, params) => {
      queryClient.setQueryData<Property[]>(['properties'], (old) =>
        old?.map((p) =>
          p.id === params.id
            ? {
                ...p,
                energiklass: data.energiklass,
                datum: data.datum,
                primarenergital: data.primarenergital,
                energiprestanda: data.energiprestanda,
                fetched_at: new Date().toISOString(),
                status: 'done' as const,
              }
            : p
        )
      )
    },
    onError: (_error, params, context) => {
      if (context?.previousProperties) {
        queryClient.setQueryData(['properties'], context.previousProperties)
      }
      queryClient.setQueryData<Property[]>(['properties'], (old) =>
        old?.map((p) =>
          p.id === params.id ? { ...p, status: 'error' as const } : p
        )
      )
    },
  })
}
