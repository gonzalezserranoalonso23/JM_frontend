import { useState } from 'react'
import toast from 'react-hot-toast'
import { Banknote, Coins, Download, Minus, Plus, RotateCcw } from 'lucide-react'
import { Button } from '@/components/atoms/button'
import { Card } from '@/components/atoms/card'
import { Input } from '@/components/atoms/input'
import {
  countedBreakdown,
  countedTotal,
  DENOMINATIONS,
  formatAmount,
  formatDenomination,
  quantityOf
} from '@/utils/cash'

const CashRow = ({ denomination, quantity, onChange, onStep }) => (
  <div className="grid grid-cols-[minmax(0,1fr)_8rem_minmax(4.5rem,auto)] items-center gap-2 border-b border-border py-2 last:border-b-0 sm:grid-cols-[minmax(0,1fr)_9rem_minmax(5rem,auto)]">
    <div className="flex min-w-0 items-center gap-2">
      <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-accent text-accent-foreground">
        {denomination >= 20 ? <Banknote className="size-4" aria-hidden="true" /> : <Coins className="size-4" aria-hidden="true" />}
      </span>
      <strong className="truncate text-sm">{formatDenomination(denomination)}</strong>
    </div>
    <div className="flex h-9 items-center justify-between rounded-md border border-input bg-input/30">
      <button type="button" className="flex size-9 shrink-0 items-center justify-center text-muted-foreground" aria-label={`Quitar uno de ${formatDenomination(denomination)}`} disabled={!quantity} onClick={() => onStep(-1)}>
        <Minus className="size-4" aria-hidden="true" />
      </button>
      <Input type="number" inputMode="numeric" min="0" step="1" className="h-8 min-w-0 border-0 bg-transparent px-0 text-center text-sm shadow-none focus-visible:ring-0" aria-label={`Cantidad de ${formatDenomination(denomination)}`} value={quantity} onChange={(event) => onChange(event.target.value)} />
      <button type="button" className="flex size-9 shrink-0 items-center justify-center text-muted-foreground hover:text-primary" aria-label={`Agregar uno de ${formatDenomination(denomination)}`} onClick={() => onStep(1)}>
        <Plus className="size-4" aria-hidden="true" />
      </button>
    </div>
    <span className="text-right text-xs tabular-nums text-muted-foreground sm:text-sm">{formatAmount(denomination * quantityOf({ [denomination]: quantity }, denomination))}</span>
  </div>
)

const Cash = () => {
  const [quantities, setQuantities] = useState({})
  const [isDownloading, setIsDownloading] = useState(false)
  const total = countedTotal(DENOMINATIONS, quantities)
  const breakdown = countedBreakdown(DENOMINATIONS, quantities)

  const changeQuantity = (denomination, value) =>
    setQuantities((current) => ({ ...current, [denomination]: value }))

  const stepQuantity = (denomination, difference) =>
    setQuantities((current) => {
      const next = Math.max(0, quantityOf(current, denomination) + difference)
      return { ...current, [denomination]: next ? String(next) : '' }
    })

  const exportPdf = async () => {
    setIsDownloading(true)
    try {
      const { jsPDF } = await import('jspdf')
      const pdf = new jsPDF()
      const date = new Intl.DateTimeFormat('es-MX', { dateStyle: 'long', timeStyle: 'short' }).format(new Date())
      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(18)
      pdf.text('JM Panel - Caja', 14, 18)
      pdf.setFont('helvetica', 'normal')
      pdf.setFontSize(10)
      pdf.text(`Fecha: ${date}`, 14, 28)
      pdf.text(`Total: ${formatAmount(total)}`, 14, 36)
      let y = 50
      pdf.setFont('helvetica', 'bold')
      pdf.text('Denominación', 14, y)
      pdf.text('Cantidad', 105, y)
      pdf.text('Subtotal', 160, y)
      pdf.setFont('helvetica', 'normal')
      DENOMINATIONS.forEach((denomination) => {
        const quantity = quantityOf(quantities, denomination)
        if (!quantity) return
        y += 8
        pdf.text(formatDenomination(denomination), 14, y)
        pdf.text(String(quantity), 105, y)
        pdf.text(formatAmount(denomination * quantity), 160, y)
      })
      y += 14
      pdf.text(`Piezas: ${breakdown.units} | Billetes: ${breakdown.bills} | Monedas: ${breakdown.coins}`, 14, y)
      pdf.save(`JM-caja-${new Date().toISOString().slice(0, 10)}.pdf`)
      toast.success('PDF descargado')
    } catch {
      toast.error('No se pudo generar el PDF')
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <section aria-labelledby="cash-title" className="mx-auto grid w-full max-w-5xl gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(16rem,0.8fr)]">
      <Card as="section" className="gap-3 p-4 sm:p-6">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <h1 id="cash-title" className="text-xl font-semibold">Caja</h1>
          <Button type="button" variant="outline" onClick={() => setQuantities({})}>
            <RotateCcw aria-hidden="true" /> Limpiar
          </Button>
        </header>
        <div className="grid grid-cols-[minmax(0,1fr)_8rem_minmax(4.5rem,auto)] gap-2 border-y border-border py-2 text-[10px] font-semibold uppercase text-muted-foreground sm:grid-cols-[minmax(0,1fr)_9rem_minmax(5rem,auto)]">
          <span>Denominación</span><span className="text-center">Cantidad</span><span className="text-right">Subtotal</span>
        </div>
        <div>{DENOMINATIONS.map((denomination) => <CashRow key={denomination} denomination={denomination} quantity={quantities[denomination] || ''} onChange={(value) => changeQuantity(denomination, value)} onStep={(difference) => stepQuantity(denomination, difference)} />)}</div>
      </Card>
      <Card as="section" className="gap-4 p-4 sm:p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Total contado</h2>
        <p className="text-3xl font-bold tabular-nums">{formatAmount(total)}</p>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between"><dt className="text-muted-foreground">Piezas</dt><dd>{breakdown.units}</dd></div>
          <div className="flex justify-between"><dt className="text-muted-foreground">Billetes</dt><dd>{breakdown.bills}</dd></div>
          <div className="flex justify-between"><dt className="text-muted-foreground">Monedas</dt><dd>{breakdown.coins}</dd></div>
        </dl>
        <Button type="button" className="w-full" onClick={exportPdf} disabled={!breakdown.units || isDownloading}>
          <Download aria-hidden="true" /> {isDownloading ? 'Generando PDF...' : 'Exportar a PDF'}
        </Button>
      </Card>
    </section>
  )
}

export default Cash
