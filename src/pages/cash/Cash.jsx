import { useState } from 'react'
import { Input } from '@/components/ui/input'

const DENOMINATIONS = [1000, 500, 200, 100, 50, 20, 10, 5, 2, 1, 0.5]

const formatAmount = (amount) =>
  amount.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })

const formatDenomination = (value) =>
  value < 1 ? `$${value.toFixed(2)}` : `$${value.toLocaleString('es-MX')}`

const Cash = () => {
  const [quantities, setQuantities] = useState({})

  const handleChange = (denomination, value) =>
    setQuantities((prev) => ({ ...prev, [denomination]: value }))

  const getQuantity = (denomination) =>
    Math.max(0, Math.floor(Number(quantities[denomination]) || 0))

  const total = DENOMINATIONS.reduce(
    (sum, denomination) => sum + denomination * getQuantity(denomination),
    0
  )

  return (
    <div className="bg-light py-6">
      <div className="page-content-shell mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <section className="section-container" aria-labelledby="cash-title">
          <header className="section-header">
            <h1 id="cash-title" className="section-title">
              Calcular caja
            </h1>
            <button
              type="button"
              className="btn-custom btn-primary-custom"
              onClick={() => setQuantities({})}
            >
              Limpiar
            </button>
          </header>
          <div className="table-wrapper overflow-x-hidden">
            <table className="table-minimal table-static !w-full table-fixed">
              <thead>
                <tr>
                  <th className="w-[30%]">Denominación</th>
                  <th className="w-[34%] text-center">Cantidad</th>
                  <th className="w-[36%] text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {DENOMINATIONS.map((denomination) => (
                  <tr key={denomination}>
                    <td>
                      <strong>{formatDenomination(denomination)}</strong>
                    </td>
                    <td className="text-center">
                      <Input
                        type="number"
                        inputMode="numeric"
                        min="0"
                        step="1"
                        placeholder="0"
                        className="mx-auto h-9 w-full max-w-28 px-2 text-center"
                        aria-label={`Cantidad de ${formatDenomination(denomination)}`}
                        value={quantities[denomination] ?? ''}
                        onChange={(e) =>
                          handleChange(denomination, e.target.value)
                        }
                      />
                    </td>
                    <td className="text-right">
                      {formatAmount(denomination * getQuantity(denomination))}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={2} className="text-right">
                    <strong>Total en caja</strong>
                  </td>
                  <td className="text-right">
                    <strong>{formatAmount(total)}</strong>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </section>
      </div>
    </div>
  )
}

export default Cash
