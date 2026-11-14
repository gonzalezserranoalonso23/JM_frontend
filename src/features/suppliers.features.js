import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
  useQuery
} from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import { notifyError } from '@/libs/handleErrors'
import {
  getSuppliers,
  getSuppliersPage,
  createSupplier,
  updateSupplier,
  deleteSupplier
} from '@/services/suppliers.services'

const refreshSupplierUse = (queryClient) => {
  queryClient.invalidateQueries({ queryKey: ['Suppliers'] })
  queryClient.invalidateQueries({ queryKey: ['Products'] })
  queryClient.invalidateQueries({ queryKey: ['LowStockProducts'] })
}

export const useGetSuppliers = ({ enabled = true } = {}) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['Suppliers'],
    queryFn: getSuppliers,
    enabled,
    staleTime: 60 * 60 * 1000,
    gcTime: 60 * 60 * 1000
  })
  return { data, isLoading, isError }
}

export const useGetSupplierPages = (search = '') =>
  useInfiniteQuery({
    queryKey: ['Suppliers', 'pages', search],
    queryFn: ({ pageParam }) =>
      getSuppliersPage({ page: pageParam, limit: 20, search }),
    initialPageParam: 1,
    placeholderData: keepPreviousData,
    getNextPageParam: (lastPage) =>
      lastPage.hasNextPage ? lastPage.page + 1 : undefined
  })

export const useDeleteSupplier = () => {
  const queryClient = useQueryClient()
  const mutationDelete = useMutation({
    mutationFn: deleteSupplier,
    onSuccess: () => {
      toast.success('Proveedor borrado exitosamente!')
      refreshSupplierUse(queryClient)
    }
  })
  return mutationDelete
}

export const useUpdateSupplier = () => {
  const queryClient = useQueryClient()
  const mutationUpdate = useMutation({
    mutationFn: updateSupplier,
    onSuccess: () => {
      toast.success('Proveedor actualizado exitosamente!')
      refreshSupplierUse(queryClient)
    },
    onError: (error) => {
      notifyError(error, 'Error al actualizar el proveedor')
    }
  })
  return mutationUpdate
}

export const useCreateSupplier = () => {
  const queryClient = useQueryClient()
  const mutationCreate = useMutation({
    mutationFn: createSupplier,
    onSuccess: () => {
      toast.success('Proveedor creado exitosamente!')
      queryClient.invalidateQueries({ queryKey: ['Suppliers'] })
    },
    onError: (error) => {
      notifyError(error, 'Error al crear el proveedor')
    }
  })
  return mutationCreate
}
