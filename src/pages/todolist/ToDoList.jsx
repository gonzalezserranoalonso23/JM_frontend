import { useState } from 'react'
import Navigate from '../../ui/Navigate'
import {
  useGetPendingTasks,
  useGetCompletedTasks,
  useCreateTask,
  useUpdateTask,
  useDeleteTask
} from '../../features/tasks.features'
import Loading from '../../ui/Loading'
import './styles/todolist.css'

const ToDoList = () => {
  const { data: pendingTasks, isLoading: loadingPending } = useGetPendingTasks()
  const { data: completedTasks, isLoading: loadingCompleted } =
    useGetCompletedTasks()
  const createTask = useCreateTask()
  const updateTask = useUpdateTask()
  const deleteTask = useDeleteTask()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState('medium')
  const [activeTab, setActiveTab] = useState('pending')

  const handleCreateTask = (e) => {
    e.preventDefault()
    if (!title.trim()) {
      alert('Ingresa un título para la tarea')
      return
    }

    createTask.mutate(
      {
        title: title.trim(),
        description: description.trim(),
        priority
      },
      {
        onSuccess: () => {
          setTitle('')
          setDescription('')
          setPriority('medium')
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

  const handleDeleteTask = (taskId) => {
    if (window.confirm('¿Eliminar esta tarea?')) {
      deleteTask.mutate(taskId)
    }
  }

  if (loadingPending || loadingCompleted) return <Loading />

  const pendingCount = pendingTasks?.length || 0
  const completedCount = completedTasks?.length || 0

  return (
    <>
      <Navigate />
      <div className="todolist-wrapper">
        <div className="section-container todolist-shell">
          {/* Header */}
          <div className="section-header">
            <div>
              <h4 className="section-title">Tareas Pendientes</h4>
              <p className="section-subtitle">
                Gestiona las tareas del sistema
              </p>
            </div>
          </div>

          {/* Formulario Crear Tarea */}
          <div className="todolist-form-section">
            <h6 className="form-subtitle">Crear Nueva Tarea</h6>
            <form onSubmit={handleCreateTask} className="todolist-form">
              <div className="form-row">
                <input
                  type="text"
                  placeholder="Título de la tarea *"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="form-control"
                  disabled={createTask.isPending}
                />
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="form-select"
                  disabled={createTask.isPending}
                >
                  <option value="low">Baja</option>
                  <option value="medium">Media</option>
                  <option value="high">Alta</option>
                </select>
                <button
                  type="submit"
                  className="btn-custom btn-primary-custom"
                  disabled={createTask.isPending}
                >
                  {createTask.isPending ? '...' : '+ Agregar'}
                </button>
              </div>

              <textarea
                placeholder="Descripción (opcional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="form-control"
                rows="2"
                disabled={createTask.isPending}
              />
            </form>
          </div>

          {/* Tabs */}
          <div className="todolist-tabs">
            <button
              className={`tab-button ${activeTab === 'pending' ? 'active' : ''}`}
              onClick={() => setActiveTab('pending')}
            >
              Pendientes ({pendingCount})
            </button>
            <button
              className={`tab-button ${activeTab === 'completed' ? 'active' : ''}`}
              onClick={() => setActiveTab('completed')}
            >
              Completadas ({completedCount})
            </button>
          </div>

          {/* Tareas Pendientes */}
          {activeTab === 'pending' && (
            <div className="todolist-content">
              {pendingTasks && pendingTasks.length > 0 ? (
                <div className="tasks-list">
                  {pendingTasks.map((task) => (
                    <div
                      key={task._id}
                      className={`task-item task-${task.priority}`}
                    >
                      <div className="task-header">
                        <div className="task-title-section">
                          <h5 className="task-title">{task.title}</h5>
                          <span
                            className={`priority-badge priority-${task.priority}`}
                          >
                            {task.priority === 'low'
                              ? 'Baja'
                              : task.priority === 'medium'
                                ? 'Media'
                                : 'Alta'}
                          </span>
                        </div>
                        <div className="task-actions">
                          <button
                            className="btn-action btn-success-sm"
                            onClick={() => handleCompleteTask(task._id)}
                            title="Marcar como completada"
                          >
                            ✓
                          </button>
                          <button
                            className="btn-action btn-danger-sm"
                            onClick={() => handleDeleteTask(task._id)}
                            title="Eliminar"
                          >
                            ✕
                          </button>
                        </div>
                      </div>

                      {task.description && (
                        <p className="task-description">{task.description}</p>
                      )}

                      <div className="task-meta">
                        <small>
                          Por:{' '}
                          <strong>
                            {task.createdBy?.username || 'Usuario'}
                          </strong>
                        </small>
                        <small>
                          {new Date(task.createdAt).toLocaleDateString()}
                        </small>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <p>✓ ¡No hay tareas pendientes!</p>
                  <small>Todas las tareas están completadas</small>
                </div>
              )}
            </div>
          )}

          {/* Tareas Completadas */}
          {activeTab === 'completed' && (
            <div className="todolist-content">
              {completedTasks && completedTasks.length > 0 ? (
                <div className="tasks-list">
                  {completedTasks.map((task) => (
                    <div key={task._id} className="task-item task-completed">
                      <div className="task-header">
                        <div className="task-title-section">
                          <h5 className="task-title task-done">{task.title}</h5>
                        </div>
                        <div className="task-actions">
                          <button
                            className="btn-action btn-info-sm"
                            onClick={() => handleReactivateTask(task._id)}
                            title="Reactivar"
                          >
                            ↺
                          </button>
                          <button
                            className="btn-action btn-danger-sm"
                            onClick={() => handleDeleteTask(task._id)}
                            title="Eliminar"
                          >
                            ✕
                          </button>
                        </div>
                      </div>

                      {task.description && (
                        <p className="task-description task-done">
                          {task.description}
                        </p>
                      )}

                      <div className="task-meta">
                        <small>
                          Por:{' '}
                          <strong>
                            {task.createdBy?.username || 'Usuario'}
                          </strong>
                        </small>
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
                <div className="empty-state">
                  <p>No hay tareas completadas aún</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default ToDoList
