import Navigate from '../../ui/Navigate'
import SectionOrders from './components/SectionOrders'

const Orders = () => {
  return (
    <>
      <Navigate />
      <div className="min-h-screen bg-light pt-20">
        <div className="max-w-6xl mx-auto px-4">
          <SectionOrders />
        </div>
      </div>
    </>
  )
}

export default Orders
