import Navigate from '../../ui/Navigate'
import SectionCategories from './components/SectionCategories'

const Categories = () => {
  return (
    <>
      <Navigate />
      <div className="min-h-screen bg-light pt-20">
        <div className="max-w-5xl mx-auto px-4">
          <div className="section-container">
            <SectionCategories />
          </div>
        </div>
      </div>
    </>
  )
}

export default Categories
