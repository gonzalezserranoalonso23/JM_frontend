import PageShell from '@/components/PageShell'
import { useMemo, useState } from 'react'
import { jwtDecode } from 'jwt-decode'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/store/auth'
import {
  useGetPendingTasks,
  useGetCompletedTasks,
  useCreateTask,
  useUpdateTask,
  useDeleteTask
} from '@/features/tasks.features'
import { useGetAssignableUsers } from '@/features/users.features'
import Loading from '@/ui/Loading'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardHeader,
  CardDescription,
  CardContent
} from '@/components/ui/card'
import { cn } from '@/lib/utils'

const selectClass =
  'h-10 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 [&>option]:bg-popover [&>option]:text-popover-foreground'

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

const taskUserId = (value) => {
  if (!value) return ''
  if (typeof value === 'object') return String(value._id || '')
  return String(value)
}

const ToDoList = () => {
  const { data: pendingTasks, isLoading: loadingPending } = useGetPendingTasks()
  const { data: completedTasks, isLoading: loadingCompleted } =
    useGetCompletedTasks()
  const { data: users } = useGetAssignableUsers()
  const createTask = useCreateTask()
  const updateTask = useUpdateTask()
  const deleteTask = useDeleteTask()
  const token = useAuthStore((state) => state.auth)
  const isAdmin = useAuthStore((state) => state.isAdmin)
  const userId = useMemo(() => {
    if (!token) return ''
    try {
      return String(jwtDecode(token).id || '')
    } catch {
      return ''
    }
  }, [token])

  const canManageTask = (task) =>
    isAdmin ||
    taskUserId(task.createdBy) === userId ||
    taskUserId(task.assignedTo) === userId

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState('medium')
  const [assignedTo, setAssignedTo] = useState('')
  const [activeTab, setActiveTab] = useState('pending')

  const handleCreateTask = (e) => {
    e.preventDefault()
    if (!title.trim()) {
      toast.error('Ingresa un título para la tarea')
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
    if (window.confirm('¿Eliminar esta tarea?')) {
      deleteTask.mutate(taskId)
    }
  }

  if (loadingPending || loadingCompleted) return <Loading />

  const pendingCount = pendingTasks?.length || 0
  const completedCount = completedTasks?.length || 0

  return (
    <PageShell>
      <Card role="region" aria-labelledby="tasks-title">
        <CardHeader>
          <h1 id="tasks-title" className="text-2xl font-semibold">
            Tareas Pendientes
          </h1>
          <CardDescription>Gestiona las tareas del sistema</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          {/* Formulario Crear Tarea */}
          <div className="rounded-lg border p-4">
            <h6 className="mb-3 text-sm font-semibold">Crear Nueva Tarea</h6>
            <form onSubmit={handleCreateTask} className="flex flex-col gap-3">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-[2fr_1fr_1fr_auto]">
                <Input
                  type="text"
                  placeholder="Título de la tarea *"
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
                <Button type="submit" disabled={createTask.isPending}>
                  {createTask.isPending ? '...' : '+ Agregar'}
                </Button>
              </div>

              <Textarea
                placeholder="Descripción (opcional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows="2"
                disabled={createTask.isPending}
              />
            </form>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 border-b pb-2">
            <Button
              variant={activeTab === 'pending' ? 'secondary' : 'ghost'}
              onClick={() => setActiveTab('pending')}
            >
              Pendientes ({pendingCount})
            </Button>
            <Button
              variant={activeTab === 'completed' ? 'secondary' : 'ghost'}
              onClick={() => setActiveTab('completed')}
            >
              Completadas ({completedCount})
            </Button>
          </div>

          {/* Tareas Pendientes */}
          {activeTab === 'pending' &&
            (pendingTasks && pendingTasks.length > 0 ? (
              <div className="flex flex-col gap-3">
                {pendingTasks.map((task) => (
                  <div
                    key={task._id}
                    className={cn(
                      'rounded-lg border border-l-4 bg-card p-4',
                      priorityBorder[task.priority]
                    )}
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex flex-1 flex-wrap items-center gap-3">
                        <h5 className="font-semibold">{task.title}</h5>
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

                    <div className="mt-3 flex flex-col gap-1 text-xs text-muted-foreground sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
                      <small>
                        Por:{' '}
                        <strong>{task.createdBy?.username || 'Usuario'}</strong>
                      </small>
                      <small className="flex items-center gap-2">
                        Asignada a:{' '}
                        {canManageTask(task) ? (
                          <select
                            value={task.assignedTo?._id || ''}
                            onChange={(e) =>
                              handleAssignTask(task._id, e.target.value)
                            }
                            className={cn(selectClass, 'h-8 w-auto')}
                            aria-label="Reasignar tarea"
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
                      <small>
                        {new Date(task.createdAt).toLocaleDateString()}
                      </small>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                <p className="mb-1 text-lg font-medium">
                  ✓ ¡No hay tareas pendientes!
                </p>
                <small>Todas las tareas están completadas</small>
              </div>
            ))}

          {/* Tareas Completadas */}
          {activeTab === 'completed' &&
            (completedTasks && completedTasks.length > 0 ? (
              <div className="flex flex-col gap-3">
                {completedTasks.map((task) => (
                  <div
                    key={task._id}
                    className="rounded-lg border border-l-4 border-l-emerald-400 bg-card p-4"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex flex-1 items-center gap-3">
                        <h5 className="font-semibold text-muted-foreground line-through">
                          {task.title}
                        </h5>
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

                    <div className="mt-3 flex flex-col gap-1 text-xs text-muted-foreground sm:flex-row sm:flex-wrap sm:gap-4">
                      <small>
                        Por:{' '}
                        <strong>{task.createdBy?.username || 'Usuario'}</strong>
                      </small>
                      {task.assignedTo && (
                        <small>
                          Asignada a:{' '}
                          <strong>{task.assignedTo.username}</strong>
                        </small>
                      )}
                      <small>
                        Completada por:{' '}
                        <strong>
                          {task.completedBy?.username || 'Usuario'}
                        </strong>
                      </small>
                      <small>
                        {new Date(task.completedAt).toLocaleDateString()}
                      </small>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                <p className="text-lg font-medium">
                  No hay tareas completadas aún
                </p>
              </div>
            ))}
        </CardContent>
      </Card>
    </PageShell>
  )
}

export default ToDoList
