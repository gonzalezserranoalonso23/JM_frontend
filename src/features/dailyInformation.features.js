import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import {
  createDailyInformation,
  deleteDailyInformation,
  getDailyInformations,
  updateDailyInformation
} from '@/services/dailyInformation.services'

const queryKey = ['DailyInformation']

export const useGetDailyInformations = () =>
  useQuery({ queryKey, queryFn: getDailyInformations })

export const useCreateDailyInformation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createDailyInformation,
    onSuccess: () => {
      toast.success('Información diaria creada')
      queryClient.invalidateQueries({ queryKey })
    }
  })
}

export const useUpdateDailyInformation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateDailyInformation,
    onSuccess: () => {
      toast.success('Información diaria actualizada')
      queryClient.invalidateQueries({ queryKey })
    }
  })
}

export const useDeleteDailyInformation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteDailyInformation,
    onSuccess: () => {
      toast.success('Información diaria eliminada')
      queryClient.invalidateQueries({ queryKey })
    }
  })
}
