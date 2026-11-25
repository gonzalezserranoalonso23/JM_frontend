import {
  useInfiniteQuery,
  useMutation,
  useQueryClient
} from '@tanstack/react-query'
import {
  getPendingTasks,
  getCompletedTasks,
  createTask,
  updateTask,
  deleteTask
} from '@/services/tasks.services'
import toast from 'react-hot-toast'
import { notifyError } from '@/libs/handleErrors'

const FIVE_MINUTES = 5 * 60 * 1000
const PAGE = 20

const taskList = (query) => {
  const tasks = query.data
    ? query.data.pages.flatMap((page) => page.data || [])
    : undefined
  const total = query.data?.pages?.[0]?.total ?? 0
  return { ...query, tasks, total }
}

// The push covers the app in the background. While the screen is open,
// checking every 5 minutes is enough. Closing the tab stops the interval.
export const useGetPendingTasks = () =>
  taskList(
    useInfiniteQuery({
      queryKey: ['pendingTasks'],
      queryFn: ({ pageParam, signal }) =>
        getPendingTasks({ page: pageParam, limit: PAGE, signal }),
      initialPageParam: 1,
      getNextPageParam: (lastPage) =>
        lastPage?.hasNextPage ? lastPage.page + 1 : undefined,
      staleTime: FIVE_MINUTES,
      refetchInterval: FIVE_MINUTES,
      refetchIntervalInBackground: false
    })
  )

export const useGetCompletedTasks = (enabled = true) =>
  taskList(
    useInfiniteQuery({
      queryKey: ['completedTasks'],
      queryFn: ({ pageParam, signal }) =>
        getCompletedTasks({ page: pageParam, limit: PAGE, signal }),
      enabled,
      initialPageParam: 1,
      getNextPageParam: (lastPage) =>
        lastPage?.hasNextPage ? lastPage.page + 1 : undefined,
      staleTime: FIVE_MINUTES
    })
  )

export const useCreateTask = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      toast.success('Pendiente creado')
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['pendingTasks'] })
    },
    onError: (error) => {
      notifyError(error, 'Error al crear el pendiente')
    }
  })
}

export const useUpdateTask = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }) => updateTask(id, data),
    onSuccess: () => {
      toast.success('Pendiente actualizado')
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['pendingTasks'] })
      queryClient.invalidateQueries({ queryKey: ['completedTasks'] })
    },
    onError: (error) => {
      notifyError(error, 'Error al actualizar el pendiente')
    }
  })
}

export const useDeleteTask = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteTask,
    onSuccess: () => {
      toast.success('Pendiente eliminado')
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['pendingTasks'] })
      queryClient.invalidateQueries({ queryKey: ['completedTasks'] })
    },
    onError: (error) => {
      notifyError(error, 'Error al eliminar el pendiente')
    }
  })
}
