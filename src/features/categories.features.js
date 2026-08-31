import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory
} from '@/services/categories.services'

export const useGetCategories = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['Categories'],
    queryFn: getCategories
  })
  return { data, isLoading, isError }
}
export const useGetCategory = (id) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['Category', id],
    queryFn: () => getCategory(id)
  })
  return { data, isLoading, isError }
}

export const useDeleteCategory = () => {
  const queryClient = useQueryClient()
  const mutationDelete = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      toast.success('Categoría borrada exitosamente!')
      queryClient.invalidateQueries({ queryKey: ['Categories'] })
    }
  })
  return mutationDelete
}

export const useUpdateCategory = () => {
  const queryClient = useQueryClient()
  const mutationUpdate = useMutation({
    mutationFn: updateCategory,
    onSuccess: () => {
      toast.success('Categoría actualizada exitosamente!')
      queryClient.invalidateQueries({ queryKey: ['Categories'] })
    }
  })
  return mutationUpdate
}

export const useCreateCategory = () => {
  const queryClient = useQueryClient()
  const mutationCreate = useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      toast.success('Categoría creada exitosamente!')
      queryClient.invalidateQueries({ queryKey: ['Categories'] })
    }
  })
  return mutationCreate
}
