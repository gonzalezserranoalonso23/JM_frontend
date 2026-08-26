import Navigate from '../../ui/Navigate'
import ReportsSalesAndMovements from './components/ReportsSalesAndMovements'

const Reports = () => {
  return (
    <>
      <Navigate />
      <div className="min-h-screen bg-light pt-20">
        <div className="max-w-6xl mx-auto px-4">
          <ReportsSalesAndMovements />
        </div>
      </div>
    </>
  )
}

export default Reports
