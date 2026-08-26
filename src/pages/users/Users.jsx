import Navigate from '../../ui/Navigate'
import SectionUsers from './SectionUsers'

const Users = () => {
  return (
    <>
      <Navigate />
      <div className="min-h-screen bg-light pt-20">
        <div className="max-w-6xl mx-auto px-4">
          <SectionUsers />
        </div>
      </div>
    </>
  )
}

export default Users
