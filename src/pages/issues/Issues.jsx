import Navigate from '../../ui/Navigate'
import SectionIssues from './components/SectionIssues'

const Issues = () => {
  return (
    <>
      <Navigate />
      <div className="min-h-screen bg-light pt-20">
        <div className="max-w-6xl mx-auto px-4">
          <SectionIssues />
        </div>
      </div>
    </>
  )
}

export default Issues
