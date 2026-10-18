import { Card, CardHeader } from '@/components/ui/card'

const ToDoListDetails = () => {
  return (
    <div className="py-6">
      <div className="page-content-shell">
        <Card role="region" aria-labelledby="task-details-title">
          <CardHeader>
            <h1 id="task-details-title" className="text-2xl font-semibold">
              Detalle de tarea
            </h1>
          </CardHeader>
        </Card>
      </div>
    </div>
  )
}

export default ToDoListDetails
