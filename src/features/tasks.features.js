import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getPendingTasks,
  getCompletedTasks,
  createTask,
  updateTask,
  deleteTask
} from '@/services/tasks.services'
import toast from 'react-hot-toast'
import { notifyError } from '@/libs/handleErrors'

export const useGetPendingTasks = () => {
  return useQuery({
    queryKey: ['pendingTasks'],
    queryFn: getPendingTasks,
    staleTime: 1000 * 60 * 5,
    refetchInterval: 1000 * 60,
    refetchIntervalInBackground: true
  })
}

export const useGetCompletedTasks = () => {
  return useQuery({
    queryKey: ['completedTasks'],
    queryFn: getCompletedTasks,
    staleTime: 1000 * 60 * 5
  })
}

export const useCreateTask = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      toast.success('Tarea creada exitosamente')
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['pendingTasks'] })
    },
    onError: (error) => {
      notifyError(error, 'Error al crear la tarea')
    }
  })
}

export const useUpdateTask = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }) => updateTask(id, data),
    onSuccess: () => {
      toast.success('Tarea actualizada exitosamente')
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['pendingTasks'] })
      queryClient.invalidateQueries({ queryKey: ['completedTasks'] })
    },
    onError: (error) => {
      notifyError(error, 'Error al actualizar la tarea')
    }
  })
}

export const useDeleteTask = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteTask,
    onSuccess: () => {
      toast.success('Tarea eliminada exitosamente')
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['pendingTasks'] })
      queryClient.invalidateQueries({ queryKey: ['completedTasks'] })
    },
    onError: (error) => {
      notifyError(error, 'Error al eliminar la tarea')
    }
  })
}
