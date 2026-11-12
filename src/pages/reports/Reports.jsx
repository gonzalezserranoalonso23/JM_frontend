import { lazy, Suspense } from 'react'
import PageShell from '@/components/templates/PageShell'
import Loading from '@/components/atoms/Loading'

const ReportsSalesAndMovements = lazy(
  () => import('./components/ReportsSalesAndMovements')
)

const Reports = () => {
  return (
    <PageShell>
      <Suspense fallback={<Loading fullScreen={false} />}>
        <ReportsSalesAndMovements />
      </Suspense>
    </PageShell>
  )
}

export default Reports
