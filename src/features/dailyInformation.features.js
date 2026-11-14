import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient
} from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import {
  createDailyInformation,
  deleteDailyInformation,
  getDailyInformationByDate,
  getDailyInformationsPage,
  updateDailyInformation
} from '@/services/dailyInformation.services'
import { isoDay } from '@/utils/dateDisplay'

const queryKey = ['DailyInformation']
const PAGE = 20

const asPages = (current) =>
  Array.isArray(current?.pages) ? current.pages : null

const dayKey = (date) => [
  ...queryKey,
  'day',
  isoDay(date) || String(date || '')
]

const writeDaily = (queryClient, saved) => {
  const { _id } = saved ?? {}
  if (!_id) return
  queryClient.setQueryData(dayKey(saved.date), saved)

  for (const [key, current] of queryClient.getQueriesData({
    queryKey: [...queryKey, 'pages']
  })) {
    const pages = asPages(current)
    if (!pages) continue
    let found = false
    const nextPages = pages.map((page) => ({
      ...page,
      data: (page.data || []).map((row) => {
        if (row._id !== _id) return row
        found = true
        return saved
      })
    }))
    const search = key[2] || ''
    if (!found && !search && nextPages[0]) {
      nextPages[0] = {
        ...nextPages[0],
        data: [saved, ...(nextPages[0].data || [])],
        total: (nextPages[0].total || 0) + 1
      }
    }
    queryClient.setQueryData(key, { ...current, pages: nextPages })
  }
}

const dropDaily = (queryClient, id) => {
  for (const [key, current] of queryClient.getQueriesData({ queryKey })) {
    if (key[1] === 'day' && current?._id === id) {
      queryClient.setQueryData(key, null)
    }
    const pages = asPages(current)
    if (!pages) continue
    const removed = pages.some((page) =>
      (page.data || []).some((row) => row._id === id)
    )
    queryClient.setQueryData(key, {
      ...current,
      pages: pages.map((page) => ({
        ...page,
        data: (page.data || []).filter((row) => row._id !== id),
        total: removed ? Math.max(0, (page.total || 0) - 1) : page.total
      }))
    })
  }
}

const confirmDaily = (queryClient) => {
  queryClient.invalidateQueries({ queryKey })
}

export const useGetDailyInformation = (date) =>
  useQuery({
    queryKey: dayKey(date),
    queryFn: ({ signal }) => getDailyInformationByDate(date, signal),
    enabled: Boolean(date)
  })

export const useGetDailyInformationPages = (search = '') =>
  useInfiniteQuery({
    queryKey: [...queryKey, 'pages', search],
    queryFn: ({ pageParam, signal }) =>
      getDailyInformationsPage({
        page: pageParam,
        limit: PAGE,
        search,
        signal
      }),
    placeholderData: keepPreviousData,
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.hasNextPage ? lastPage.page + 1 : undefined
  })

export const useCreateDailyInformation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createDailyInformation,
    onSuccess: (saved) => {
      toast.success('Información diaria creada')
      writeDaily(queryClient, saved)
      confirmDaily(queryClient)
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
      confirmDaily(queryClient)
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
      confirmDaily(queryClient)
    }
  })
}
