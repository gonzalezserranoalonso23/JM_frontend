import Navigate from '../../ui/Navigate'
import SectionProducts from './components/SectionProducts'

const Products = () => {
  return (
    <>
      <Navigate />
      <div className="min-h-screen bg-light pt-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="section-container mb-6">
            <SectionProducts />
          </div>
        </div>
      </div>
    </>
  )
}

export default Products
