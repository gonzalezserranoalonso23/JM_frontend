import SectionProducts from './components/SectionProducts'

const Products = () => {
  return (
    <>
      <div className="bg-light py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 page-content-shell">
          <div className="section-container mb-6">
            <SectionProducts />
          </div>
        </div>
      </div>
    </>
  )
}

export default Products
