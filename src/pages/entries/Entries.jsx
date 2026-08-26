import Navigate from '../../ui/Navigate'
import SectionEntries from './components/SectionEntries'

const Entries = () => {
  return (
    <>
      <Navigate />
      <div className="min-h-screen bg-light pt-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="mb-6">
            <SectionEntries />
          </div>
        </div>
      </div>
    </>
  )
}

export default Entries
