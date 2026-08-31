import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct
} from '@/services/products.services'

export const useGetProducts = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['Products'],
    queryFn: getProducts
  })
  return { data, isLoading, isError }
}
export const useGetProduct = (id) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['Product', id],
    queryFn: () => getProduct(id)
  })
  return { data, isLoading, isError }
}

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
