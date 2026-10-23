import { Card, CardHeader } from '@/components/ui/card'
import PageShell from '@/components/PageShell'

const PlaceholderPage = ({ title }) => {
  const headingId = `${title.toLowerCase().replace(/\s+/g, '-')}-title`

  return (
    <PageShell>
      <Card role="region" aria-labelledby={headingId}>
        <CardHeader>
          <h1 id={headingId} className="text-2xl font-semibold">
            {title}
          </h1>
        </CardHeader>
      </Card>
    </PageShell>
  )
}

export default PlaceholderPage
