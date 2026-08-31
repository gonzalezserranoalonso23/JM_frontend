import { useGetPendingTasks } from '@/features/tasks.features'
import { Link } from 'react-router-dom'
import './styles/taskWidget.css'

const TaskWidget = () => {
  const { data: pendingTasks } = useGetPendingTasks()

  if (!pendingTasks || pendingTasks.length === 0) {
    return null
  }

  const highPriorityTasks = pendingTasks.filter((t) => t.priority === 'high')
  const mediumPriorityTasks = pendingTasks.filter(
    (t) => t.priority === 'medium'
  )

  return (
    <Link to="/todolist" className="task-widget-link">
      <div className="task-widget-container home-task-widget">
        <div className="widget-header">
          <h6 className="widget-title">Tareas Pendientes</h6>
          <span className="task-count-badge">{pendingTasks.length}</span>
        </div>

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

        <div className="widget-footer">Ver todas las tareas →</div>
      </div>
    </Link>
  )
}

export default TaskWidget
