import { useGetPendingTasks } from '@/features/tasks.features'
import { Link } from 'react-router-dom'
import './styles/taskWidget.css'
import Loading from '@/ui/Loading'

const TaskWidget = () => {
  const { data: pendingTasks, isLoading } = useGetPendingTasks()

  if (isLoading) return <Loading fullScreen={false} />

  if (!pendingTasks || pendingTasks.length === 0) {
    return null
  }

  const highPriorityTasks = pendingTasks.filter((t) => t.priority === 'high')
  const mediumPriorityTasks = pendingTasks.filter(
    (t) => t.priority === 'medium'
  )

  return (
    <Link to="/todolist" className="task-widget-link">
      <article className="task-widget-container home-task-widget">
        <header className="widget-header">
          <h2 className="widget-title">Tareas Pendientes</h2>
          <span className="task-count-badge">{pendingTasks.length}</span>
        </header>

        <div className="widget-content">
          {highPriorityTasks.length > 0 && (
            <div className="widget-section">
              <p className="widget-section-title priority-high">
                Alta prioridad: {highPriorityTasks.length}
              </p>
              {highPriorityTasks.slice(0, 2).map((task) => (
                <div key={task._id} className="widget-task">
                  <span className="priority-dot priority-high" />
                  <span className="task-text">{task.title}</span>
                </div>
              ))}
            </div>
          )}

          {mediumPriorityTasks.length > 0 && (
            <div className="widget-section">
              <p className="widget-section-title priority-medium">
                Prioridad media: {mediumPriorityTasks.length}
              </p>
              {mediumPriorityTasks.slice(0, 2).map((task) => (
                <div key={task._id} className="widget-task">
                  <span className="priority-dot priority-medium" />
                  <span className="task-text">{task.title}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <footer className="widget-footer">Ver todas las tareas →</footer>
      </article>
    </Link>
  )
}

export default TaskWidget
