import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import {
  createDailyInformation,
  deleteDailyInformation,
  getDailyInformations,
  updateDailyInformation
} from '@/services/dailyInformation.services'

const queryKey = ['DailyInformation']
const HOUR = 60 * 60 * 1000

const asRows = (current) => (Array.isArray(current) ? current : [])

const writeDaily = (queryClient, saved) => {
  const { _id } = saved ?? {}
  queryClient.setQueryData(queryKey, (current) => {
    const rows = asRows(current)
    const index = rows.findIndex((row) => row._id === _id)
    if (index < 0) return [...rows, saved]
    const next = [...rows]
    next[index] = saved
    return next
  })
}

const dropDaily = (queryClient, id) => {
  queryClient.setQueryData(queryKey, (current) =>
    asRows(current).filter((row) => row._id !== id)
  )
}

export const useGetDailyInformations = () =>
  useQuery({
    queryKey,
    queryFn: getDailyInformations,
    staleTime: HOUR
  })

export const useCreateDailyInformation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createDailyInformation,
    onSuccess: (saved) => {
      toast.success('Información diaria creada')
      writeDaily(queryClient, saved)
    }
  })
}

export const useUpdateDailyInformation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateDailyInformation,
    onSuccess: (saved) => {
      toast.success('Información diaria actualizada')
      writeDaily(queryClient, saved)
    }
  })
}

export const useDeleteDailyInformation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteDailyInformation,
    onSuccess: (_saved, id) => {
      toast.success('Información diaria eliminada')
      dropDaily(queryClient, id)
    }
  })
}
