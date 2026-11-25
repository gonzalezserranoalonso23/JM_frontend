import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
  useQuery
} from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import {
  getProductsPage,
  createProduct,
  updateProduct,
  deleteProduct
} from '@/services/products.services'
import {
  applyProductUpdate,
  prependProduct,
  removeProduct,
  withRelations
} from '@/features/liveCache'

// A save updates the list at once. Between visits it is not requested again.
export const useGetProductPages = (search = '') =>
  useInfiniteQuery({
    queryKey: ['Products', 'pages', search],
    queryFn: ({ pageParam, signal }) =>
      getProductsPage({ page: pageParam, limit: 20, search, signal }),
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000,
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.hasNextPage ? lastPage.page + 1 : undefined
  })

export const useSearchProducts = (search = '') =>
  useQuery({
    queryKey: ['Products', 'lookup', search],
    queryFn: ({ signal }) =>
      getProductsPage({ page: 1, limit: 10, search, signal }),
    enabled: search.length > 0,
    placeholderData: keepPreviousData
  })

const catalogsOf = (queryClient) => ({
  suppliers: queryClient.getQueryData(['Suppliers']),
  categories: queryClient.getQueryData(['Categories'])
})

const writeProductCaches = (queryClient, update) => {
  for (const key of ['Products', 'ProductLookup']) {
    queryClient.setQueriesData({ queryKey: [key] }, update)
  }
}

const confirmProductQueries = (queryClient) => {
  queryClient.invalidateQueries({ queryKey: ['Products'] })
  queryClient.invalidateQueries({ queryKey: ['ProductLookup'] })
}

const refreshProducts = (queryClient, updated) => {
  if (updated?._id) {
    const catalogs = catalogsOf(queryClient)
    writeProductCaches(queryClient, (current) =>
      applyProductUpdate(current, updated, catalogs)
    )
  }
  confirmProductQueries(queryClient)
}

export const useDeleteProduct = () => {
  const queryClient = useQueryClient()
  const mutationDelete = useMutation({
    mutationFn: deleteProduct,
    onSuccess: (_result, id) => {
      toast.success('Producto borrado exitosamente!')
      writeProductCaches(queryClient, (current) => removeProduct(current, id))
      confirmProductQueries(queryClient)
    }
  })
  return mutationDelete
}

export const useUpdateProduct = () => {
  const queryClient = useQueryClient()
  const mutationUpdate = useMutation({
    mutationFn: updateProduct,
    onSuccess: (updated) => {
      toast.success('Producto actualizado exitosamente!')
      refreshProducts(queryClient, updated)
    }
  })
  return mutationUpdate
}

export const useCreateProduct = () => {
  const queryClient = useQueryClient()
  const mutationCreate = useMutation({
    mutationFn: createProduct,
    onSuccess: (created) => {
      toast.success('Producto creado exitosamente!')
      const product = withRelations(created, catalogsOf(queryClient))
      for (const [queryKey, current] of queryClient.getQueriesData({
        queryKey: ['Products', 'pages']
      })) {
        if (queryKey[2]) continue
        queryClient.setQueryData(queryKey, prependProduct(current, product))
      }
      queryClient.setQueryData(['ProductLookup'], (current) =>
        prependProduct(current, product)
      )
      confirmProductQueries(queryClient)
    }
  })
  return mutationCreate
}
