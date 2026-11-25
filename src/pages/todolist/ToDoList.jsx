import PageShell from '@/components/templates/PageShell'
import { useMemo, useState } from 'react'
import { jwtDecode } from 'jwt-decode'
import toast from 'react-hot-toast'
import { hasFullAccess } from '@/auth/access'
import { useAuthStore } from '@/store/auth'
import {
  useGetPendingTasks,
  useGetCompletedTasks,
  useCreateTask,
  useUpdateTask,
  useDeleteTask
} from '@/features/tasks.features'
import { useGetAssignableUsers, useIsAdmin } from '@/features/users.features'
import Skeleton from '@/components/atoms/skeleton'
import { Button } from '@/components/atoms/button'
import { Input } from '@/components/atoms/input'
import { Textarea } from '@/components/atoms/textarea'
import { Badge } from '@/components/atoms/badge'
import {
  Card,
  CardHeader,
  CardDescription,
  CardContent
} from '@/components/atoms/card'
import InfiniteScrollFooter from '@/components/molecules/InfiniteScrollFooter'
import { cn } from '@/lib/utils'
import { taskUserId } from './task'

const selectClass =
  'h-10 min-w-0 max-w-full w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 [&>option]:bg-popover [&>option]:text-popover-foreground'

const priorityLabel = { low: 'Baja', medium: 'Media', high: 'Alta' }
const priorityBorder = {
  low: 'border-l-muted-foreground',
  medium: 'border-l-amber-400',
  high: 'border-l-destructive'
}
const priorityBadge = {
  low: 'text-muted-foreground',
  medium: 'text-amber-400',
  high: 'text-destructive'
}

export const TaskBoard = () => {
  const [activeTab, setActiveTab] = useState('pending')
  const {
    tasks: pendingTasks,
    total: pendingCount,
    isLoading: loadingPending,
    fetchNextPage: fetchNextPending,
    hasNextPage: hasNextPending,
    isFetchingNextPage: fetchingNextPending
  } = useGetPendingTasks()
  const {
    tasks: completedTasks,
    total: completedCount,
    isLoading: loadingCompleted,
    fetchNextPage: fetchNextCompleted,
    hasNextPage: hasNextCompleted,
    isFetchingNextPage: fetchingNextCompleted
  } = useGetCompletedTasks(activeTab === 'completed')
  const isAdmin = useIsAdmin()
  const fullAccess = hasFullAccess(isAdmin)
  const { data: users } = useGetAssignableUsers(fullAccess)
  const createTask = useCreateTask()
  const updateTask = useUpdateTask()
  const deleteTask = useDeleteTask()
  const token = useAuthStore((state) => state.auth)
  const userId = useMemo(() => {
    if (!token) return ''
    try {
      return String(jwtDecode(token).id || '')
    } catch {
      return ''
    }
  }, [token])

  const canManageTask = (task) =>
    fullAccess ||
    taskUserId(task.createdBy) === userId ||
    taskUserId(task.assignedTo) === userId

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState('medium')
  const [assignedTo, setAssignedTo] = useState('')

  const handleCreateTask = (e) => {
    e.preventDefault()
    if (!title.trim()) {
      toast.error('Ingresa un título para el pendiente')
      return
    }

    createTask.mutate(
      {
        title: title.trim(),
        description: description.trim(),
        priority,
        assignedTo: assignedTo || null
      },
      {
        onSuccess: () => {
          setTitle('')
          setDescription('')
          setPriority('medium')
          setAssignedTo('')
        }
      }
    )
  }

  const handleCompleteTask = (taskId) => {
    updateTask.mutate({
      id: taskId,
      data: { status: 'completed' }
    })
  }

  const handleReactivateTask = (taskId) => {
    updateTask.mutate({
      id: taskId,
      data: { status: 'pending' }
    })
  }

  const handleAssignTask = (taskId, assignedTo) => {
    updateTask.mutate({
      id: taskId,
      data: { assignedTo: assignedTo || null }
    })
  }

  const handleDeleteTask = (taskId) => {
    if (window.confirm('¿Eliminar este pendiente?')) {
      deleteTask.mutate(taskId)
    }
  }

  return (
    <Card as="section" className="min-w-0 overflow-hidden" aria-labelledby="tasks-title">
      <CardHeader className="min-w-0 px-4 pt-4 sm:px-6 sm:pt-6">
        <h1 id="tasks-title" className="text-2xl font-semibold">
          Pendientes
        </h1>
        <CardDescription>Gestiona los pendientes</CardDescription>
      </CardHeader>
      <CardContent className="flex min-w-0 flex-col gap-4 px-4 sm:gap-6 sm:px-6">
        {/* Create task form */}
        <section
          className="min-w-0 rounded-lg border p-3 sm:p-4"
          aria-labelledby="new-task-title"
        >
          <h2 id="new-task-title" className="mb-3 text-sm font-semibold">
            Crear pendiente
          </h2>
          <form onSubmit={handleCreateTask} className="flex flex-col gap-3">
            <div
              className={cn(
                'grid min-w-0 grid-cols-1 gap-3',
                fullAccess
                  ? 'lg:grid-cols-[2fr_1fr_1fr_auto]'
                  : 'lg:grid-cols-[2fr_1fr_auto]'
              )}
            >
              <Input
                type="text"
                placeholder="Título del pendiente *"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={createTask.isPending}
              />
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className={selectClass}
                disabled={createTask.isPending}
              >
                <option value="low">Baja</option>
                <option value="medium">Media</option>
                <option value="high">Alta</option>
              </select>
              {fullAccess && (
                <select
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  className={selectClass}
                  disabled={createTask.isPending}
                  aria-label="Asignar a"
                >
                  <option value="">Sin asignar</option>
                  {users?.map((user) => (
                    <option key={user._id} value={user._id}>
                      {user.fullName || user.username}
                    </option>
                  ))}
                </select>
              )}
              <Button type="submit" disabled={createTask.isPending}>
                {createTask.isPending ? '...' : '+ Agregar'}
              </Button>
            </div>

            <Textarea
              placeholder="Descripción del pendiente (opcional)"
              aria-label="Descripción del pendiente"
              className="min-h-20 resize-y text-sm placeholder:text-muted-foreground"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="2"
              disabled={createTask.isPending}
            />
          </form>
        </section>

        {/* Tabs */}
        <nav
          aria-label="Estado de los pendientes"
          className="flex min-w-0 flex-wrap gap-2 border-b pb-2"
        >
          <Button
            variant={activeTab === 'pending' ? 'secondary' : 'ghost'}
            className="min-w-0 flex-1 px-2 text-xs sm:flex-none sm:px-4 sm:text-sm"
            onClick={() => setActiveTab('pending')}
          >
            Pendientes ({pendingCount})
          </Button>
          <Button
            variant={activeTab === 'completed' ? 'secondary' : 'ghost'}
            className="min-w-0 flex-1 px-2 text-xs sm:flex-none sm:px-4 sm:text-sm"
            onClick={() => setActiveTab('completed')}
          >
            Completadas{completedTasks ? ` (${completedCount})` : ''}
          </Button>
        </nav>

        {loadingPending || (activeTab === 'completed' && loadingCompleted) ? (
          <div
            role="status"
            aria-label="Cargando"
            className="flex flex-col gap-3"
          >
            {Array.from({ length: 3 }, (_, index) => (
              <div key={index} className="rounded-lg border border-l-4 p-4">
                <Skeleton className="h-5 w-1/2" />
                <Skeleton className="mt-3 h-4 w-full" />
                <Skeleton className="mt-2 h-4 w-2/3" />
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Pending tasks */}
            {activeTab === 'pending' &&
              (pendingTasks && pendingTasks.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {pendingTasks.map((task) => (
                    <article
                      key={task._id}
                      className={cn(
                        'rounded-lg border border-l-4 bg-card p-4',
                        priorityBorder[task.priority]
                      )}
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex flex-1 flex-wrap items-center gap-3">
                          <h2 className="font-semibold">{task.title}</h2>
                          <Badge
                            variant="outline"
                            className={cn(
                              'uppercase',
                              priorityBadge[task.priority]
                            )}
                          >
                            {priorityLabel[task.priority] || 'Alta'}
                          </Badge>
                        </div>
                        {canManageTask(task) && (
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="text-emerald-400"
                              onClick={() => handleCompleteTask(task._id)}
                              title="Marcar como completada"
                            >
                              ✓
                            </Button>
                            <Button
                              variant="destructive"
                              size="icon"
                              onClick={() => handleDeleteTask(task._id)}
                              title="Eliminar"
                            >
                              ✕
                            </Button>
                          </div>
                        )}
                      </div>

                      {task.description && (
                        <p className="my-3 text-sm text-muted-foreground">
                          {task.description}
                        </p>
                      )}

                      <div className="mt-4 grid gap-3 text-xs text-muted-foreground sm:flex sm:flex-wrap sm:items-center sm:gap-4">
                        <small className="min-w-0">
                          Por:{' '}
                          <strong>
                            {task.createdBy?.username || 'Usuario'}
                          </strong>
                        </small>
                        <small className="flex min-w-0 flex-col items-start gap-1 sm:flex-row sm:items-center sm:gap-2">
                          Asignada a:{' '}
                          {fullAccess && canManageTask(task) ? (
                            <select
                              value={task.assignedTo?._id || ''}
                              onChange={(e) =>
                                handleAssignTask(task._id, e.target.value)
                              }
                              className={cn(
                                selectClass,
                                'w-full sm:h-8 sm:w-auto sm:max-w-[15rem]'
                              )}
                              aria-label="Reasignar pendiente"
                            >
                              <option value="">Sin asignar</option>
                              {users?.map((user) => (
                                <option key={user._id} value={user._id}>
                                  {user.fullName || user.username}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <strong>
                              {task.assignedTo?.fullName ||
                                task.assignedTo?.username ||
                                'Sin asignar'}
                            </strong>
                          )}
                        </small>
                        <small className="min-w-0">
                          {new Date(task.createdAt).toLocaleDateString()}
                        </small>
                      </div>
                    </article>
                  ))}
                  <InfiniteScrollFooter
                    hasNextPage={hasNextPending}
                    isFetchingNextPage={fetchingNextPending}
                    fetchNextPage={fetchNextPending}
                  />
                </div>
              ) : (
                <div className="py-8 text-center text-muted-foreground">
                  <p className="mb-1 text-lg font-medium">
                    ✓ ¡No hay pendientes!
                  </p>
                  <small>Todos los pendientes están completados</small>
                </div>
              ))}

            {/* Completed tasks */}
            {activeTab === 'completed' &&
              (completedTasks && completedTasks.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {completedTasks.map((task) => (
                    <article
                      key={task._id}
                      className="rounded-lg border border-l-4 border-l-emerald-400 bg-card p-4"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex flex-1 items-center gap-3">
                          <h2 className="font-semibold text-muted-foreground line-through">
                            {task.title}
                          </h2>
                        </div>
                        {canManageTask(task) && (
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleReactivateTask(task._id)}
                              title="Reactivar"
                            >
                              ↺
                            </Button>
                            <Button
                              variant="destructive"
                              size="icon"
                              onClick={() => handleDeleteTask(task._id)}
                              title="Eliminar"
                            >
                              ✕
                            </Button>
                          </div>
                        )}
                      </div>

                      {task.description && (
                        <p className="my-3 text-sm text-muted-foreground line-through">
                          {task.description}
                        </p>
                      )}

                      <div className="mt-4 grid gap-3 text-xs text-muted-foreground sm:flex sm:flex-wrap sm:gap-4">
                        <small className="min-w-0">
                          Por:{' '}
                          <strong>
                            {task.createdBy?.username || 'Usuario'}
                          </strong>
                        </small>
                        {task.assignedTo && (
                          <small className="min-w-0">
                            Asignada a:{' '}
                            <strong>{task.assignedTo.username}</strong>
                          </small>
                        )}
                        <small className="min-w-0">
                          Completada por:{' '}
                          <strong>
                            {task.completedBy?.username || 'Usuario'}
                          </strong>
                        </small>
                        <small>
                          {new Date(task.completedAt).toLocaleDateString()}
                        </small>
                      </div>
                    </article>
                  ))}
                  <InfiniteScrollFooter
                    hasNextPage={hasNextCompleted}
                    isFetchingNextPage={fetchingNextCompleted}
                    fetchNextPage={fetchNextCompleted}
                  />
                </div>
              ) : (
                <div className="py-8 text-center text-muted-foreground">
                  <p className="text-lg font-medium">
                    No hay pendientes completados aún
                  </p>
                </div>
              ))}
          </>
        )}
      </CardContent>
    </Card>
  )
}

const ToDoList = () => (
  <PageShell>
    <TaskBoard />
  </PageShell>
)

export default ToDoList
