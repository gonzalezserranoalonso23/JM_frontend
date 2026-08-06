import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import {
  getSuppliers,
  getSupplier,
  createSupplier,
  updateSupplier,
  deleteSupplier
} from '../services/suppliers.services'

export const useGetSuppliers = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['Suppliers'],
    queryFn: getSuppliers
  })
  return { data, isLoading, isError }
}
export const useGetSupplier = (id) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['Supplier', id],
    queryFn: () => getSupplier(id)
  })
  return { data, isLoading, isError }
}

export const useDeleteSupplier = () => {
  const queryClient = useQueryClient()
  const mutationDelete = useMutation({
    mutationFn: deleteSupplier,
    onSuccess: () => {
      toast.success('Proveedor borrado exitosamente!')
      queryClient.invalidateQueries({ queryKey: ['Suppliers'] })
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
      queryClient.invalidateQueries({ queryKey: ['Suppliers'] })
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
    }
  })
  return mutationCreate
}
