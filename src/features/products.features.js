import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
  useQuery
} from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import {
  getProducts,
  getProductsPage,
  createProduct,
  updateProduct,
  deleteProduct
} from '@/services/products.services'

// El stock cambia con cada movimiento: aquí siempre se revalida al montar y al
// volver a la pestaña, y los modales vuelven a pedirlo al abrirse (refetch).
// Con `poll` activo (modal abierto) se refresca cada 10 s para ver movimientos de otros usuarios.
export const useGetProducts = ({ poll = false } = {}) => {
  const { data, isLoading, isError, isFetching, refetch } = useQuery({
    queryKey: ['Products'],
    queryFn: getProducts,
    refetchInterval: poll ? 30000 : false,
    staleTime: 30 * 1000,
    refetchOnMount: true,
    refetchOnWindowFocus: false
  })
  return { data, isLoading, isError, isFetching, refetch }
}

export const useGetProductPages = (search = '') =>
  useInfiniteQuery({
    queryKey: ['Products', 'pages', search],
    queryFn: ({ pageParam }) =>
      getProductsPage({ page: pageParam, limit: 20, search }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.hasNextPage ? lastPage.page + 1 : undefined
  })

export const useSearchProducts = (search = '') =>
  useQuery({
    queryKey: ['Products', 'lookup', search],
    queryFn: () => getProductsPage({ page: 1, limit: 10, search }),
    enabled: search.length > 0,
    placeholderData: keepPreviousData
  })

// Primera página del catálogo, o el resultado de lo que se escribe en el combobox.
export const useProductLookup = (search = '', enabled = true) =>
  useQuery({
    queryKey: ['Products', 'combobox', search],
    queryFn: () => getProductsPage({ page: 1, limit: 20, search }),
    enabled,
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000
  })

export const useDeleteProduct = () => {
  const queryClient = useQueryClient()
  const mutationDelete = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      toast.success('Producto borrado exitosamente!')
      queryClient.invalidateQueries({ queryKey: ['Products'] })
    }
  })
  return mutationDelete
}

export const useUpdateProduct = () => {
  const queryClient = useQueryClient()
  const mutationUpdate = useMutation({
    mutationFn: updateProduct,
    onSuccess: () => {
      toast.success('Producto actualizado exitosamente!')
      queryClient.invalidateQueries({ queryKey: ['Products'] })
    }
  })
  return mutationUpdate
}

export const useCreateProduct = () => {
  const queryClient = useQueryClient()
  const mutationCreate = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      toast.success('Producto creado exitosamente!')
      queryClient.invalidateQueries({ queryKey: ['Products'] })
    }
  })
  return mutationCreate
}
