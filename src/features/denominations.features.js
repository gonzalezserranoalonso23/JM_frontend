import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import {
  getVaultUpdatedAt,
  openVault,
  saveVault
} from '@/services/denominations.services'

export const useVaultUpdatedAt = () =>
  useQuery({
    queryKey: ['VaultUpdatedAt'],
    queryFn: getVaultUpdatedAt,
    staleTime: 30 * 1000
  })

const vaultError = (error) =>
  toast.error(error.response?.data?.message || 'No se pudo abrir la caja fuerte')

export const useOpenVault = () =>
  useMutation({
    mutationFn: openVault,
    onError: vaultError
  })

export const useSaveVault = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: saveVault,
    onSuccess: (data) => {
      toast.success('Caja fuerte actualizada')
      queryClient.setQueryData(['VaultUpdatedAt'], { updatedAt: data.updatedAt })
    },
    onError: (error) =>
      toast.error(
        error.response?.data?.message || 'No se pudo guardar la caja fuerte'
      )
  })
}
