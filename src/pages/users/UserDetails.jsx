import { Card } from '@/components/ui/card'
const UserDetails = () => {
  return (
    <div className="py-6">
      <div className="page-content-shell">
        <Card
          role="region"
          aria-labelledby="user-details-title"
          className="gap-4 p-4 sm:p-6"
        >
          <h1 id="user-details-title" className="text-xl font-semibold">
            Detalle de usuario
          </h1>
        </Card>
      </div>
    </div>
  )
}

export default UserDetails
