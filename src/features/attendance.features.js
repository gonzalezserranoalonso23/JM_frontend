import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient
} from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import { notifyError } from '@/libs/handleErrors'
import {
  getMyAttendance,
  getAttendanceDay,
  checkIn,
  checkOut
} from '@/services/attendance.services'

const refreshAttendance = (queryClient) => {
  queryClient.invalidateQueries({ queryKey: ['Attendance'] })
}

export const useMyAttendance = ({ from = '', to = '' } = {}) =>
  useInfiniteQuery({
    queryKey: ['Attendance', 'me', from, to],
    queryFn: ({ pageParam }) => getMyAttendance({ page: pageParam, from, to }),
    placeholderData: keepPreviousData,
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.hasNextPage ? lastPage.page + 1 : undefined
  })

export const useAttendanceDay = (date) =>
  useQuery({
    queryKey: ['Attendance', 'day', date],
    queryFn: () => getAttendanceDay(date),
    enabled: Boolean(date),
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000
  })

export const useCheckIn = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: checkIn,
    onSuccess: () => {
      toast.success('Entrada registrada')
      refreshAttendance(queryClient)
    },
    onError: (error) => notifyError(error, 'No se pudo registrar la entrada')
  })
}

export const useCheckOut = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: checkOut,
    onSuccess: () => {
      toast.success('Salida registrada')
      refreshAttendance(queryClient)
    },
    onError: (error) => notifyError(error, 'No se pudo registrar la salida')
  })
}
