import PageShell from '@/components/templates/PageShell'
import { useState } from 'react'
import toast from 'react-hot-toast'
import {
  Banknote,
  Coins,
  Download,
  LockKeyhole,
  Minus,
  Plus,
  RotateCcw,
  Wallet
} from 'lucide-react'
import { Button } from '@/components/atoms/button'
import { Card } from '@/components/atoms/card'
import { Input } from '@/components/atoms/input'
import { Label } from '@/components/atoms/label'
import {
  useOpenVault,
  useSaveVault,
  useVaultUpdatedAt
} from '@/features/denominations.features'
import { hasFullAccess } from '@/auth/access'
import { useGetCurrentUser, useRoleName } from '@/features/users.features'
import {
  DENOMINATIONS,
  countedBreakdown,
  countedRows,
  countedTotal,
  draftFromVault,
  formatAmount,
  formatDenomination,
  formatUpdatedAt,
  quantityOf
} from '@/utils/cash'

const CashColumnHeadings = () => (
  <div className="cash-column-headings grid grid-cols-[minmax(0,1fr)_9.5rem_minmax(3.5rem,0.6fr)] items-center gap-2 border-y border-border py-2.5 text-[9px] font-bold uppercase tracking-[0.12em] text-muted-foreground sm:gap-3">
    <span>Denominación</span>
    <span className="text-center">Cantidad</span>
    <span className="text-right">Subtotal</span>
  </div>
)

const CashDenominationRow = ({
  denomination,
  count,
  quantity,
  inputLabel,
  onChange,
  onStep
}) => (
  <div className="cash-denomination-row grid grid-cols-[minmax(0,1fr)_9.5rem_minmax(3.5rem,0.6fr)] items-center gap-2 py-3 sm:gap-3">
    <div className="flex min-w-0 items-center gap-2.5">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-[9px] bg-accent text-accent-foreground">
        {denomination >= 20 ? (
          <Banknote className="size-4" aria-hidden="true" />
        ) : (
          <Coins className="size-4" aria-hidden="true" />
        )}
      </span>
      <span className="flex min-w-0 flex-col gap-0.5">
        <strong className="truncate text-sm font-semibold">
          {formatDenomination(denomination)}
        </strong>
        <small className="text-[10px] text-muted-foreground">
          {denomination >= 20 ? 'Billete' : 'Moneda'}
        </small>
      </span>
    </div>
    <div className="cash-quantity-control flex h-11 items-center justify-between rounded-[8px] border border-input bg-input/30">
      <button
        type="button"
        className="cash-step-button flex size-11 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
        aria-label={`Quitar uno de ${formatDenomination(denomination)}`}
        disabled={count === 0}
        onClick={() => onStep(-1)}
      >
        <Minus className="size-4" aria-hidden="true" />
      </button>
      <Input
        type="number"
        inputMode="numeric"
        min="0"
        step="1"
        placeholder="0"
        className="cash-quantity-input h-10 w-[60px] min-w-[60px] border-0 bg-transparent px-0 py-0 text-center text-sm tabular-nums shadow-none focus-visible:border-0 focus-visible:ring-0 dark:bg-transparent"
        aria-label={inputLabel}
        value={quantity}
        onChange={(event) => onChange(event.target.value)}
      />
      <button
        type="button"
        className="cash-step-button flex size-11 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-primary"
        aria-label={`Agregar uno de ${formatDenomination(denomination)}`}
        onClick={() => onStep(1)}
      >
        <Plus className="size-4" aria-hidden="true" />
      </button>
    </div>
    <span className="text-right text-xs tabular-nums text-muted-foreground sm:text-sm">
      {formatAmount(denomination * count)}
    </span>
  </div>
)

const Calculator = () => {
  const [quantities, setQuantities] = useState({})
  const [isDownloading, setIsDownloading] = useState(false)
  const { data: currentUser } = useGetCurrentUser()
  const userName =
    currentUser?.fullName || currentUser?.username || 'Usuario no identificado'

  const handleChange = (denomination, value) => {
    setQuantities((prev) => ({ ...prev, [denomination]: value }))
  }

  const handleStep = (denomination, difference) => {
    setQuantities((prev) => {
      const quantity = quantityOf(prev, denomination)
      const next = Math.max(0, quantity + difference)
      return { ...prev, [denomination]: next > 0 ? String(next) : '' }
    })
  }

  const total = countedTotal(DENOMINATIONS, quantities)
  const breakdown = countedBreakdown(DENOMINATIONS, quantities)
  const printDate = new Intl.DateTimeFormat('es-MX', {
    dateStyle: 'long',
    timeStyle: 'short'
  }).format(new Date())

  const handleDownload = async () => {
    setIsDownloading(true)
    try {
      const { jsPDF } = await import('jspdf')
      const pdf = new jsPDF()
      const now = new Date()
      const filename = `JM-Cash-out-${now.toISOString().slice(0, 10)}.pdf`

      pdf.setFillColor(228, 49, 58)
      pdf.rect(0, 0, 210, 36, 'F')
      pdf.setTextColor(255, 255, 255)
      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(19)
      pdf.text('JM Cash-out', 14, 17)
      pdf.setFont('helvetica', 'normal')
      pdf.setFontSize(10)
      pdf.text('Desglose de efectivo / MXN', 14, 27)

      pdf.setTextColor(55, 55, 55)
      pdf.setFontSize(10)
      pdf.text(`Fecha: ${printDate}`, 14, 48)
      pdf.text(`Usuario: ${userName}`, 14, 54)
      pdf.setFont('helvetica', 'bold')
      pdf.text('CANTIDAD CONTADA', 14, 62)
      pdf.setFontSize(18)
      pdf.text(formatAmount(total), 14, 72)

      let y = 88
      pdf.setFillColor(38, 38, 38)
      pdf.rect(14, y - 6, 182, 10, 'F')
      pdf.setTextColor(255, 255, 255)
      pdf.setFontSize(9)
      pdf.text('DENOMINACIÓN', 18, y)
      pdf.text('CANTIDAD', 118, y, { align: 'right' })
      pdf.text('SUBTOTAL', 192, y, { align: 'right' })

      pdf.setFont('helvetica', 'normal')
      pdf.setTextColor(55, 55, 55)
      y += 12

      DENOMINATIONS.forEach((denomination) => {
        const count = quantityOf(quantities, denomination)
        if (!count) return

        pdf.text(formatDenomination(denomination), 18, y)
        pdf.text(String(count), 118, y, { align: 'right' })
        pdf.text(formatAmount(denomination * count), 192, y, {
          align: 'right'
        })
        y += 9
      })

      pdf.setDrawColor(220, 220, 220)
      pdf.line(14, y, 196, y)
      y += 9
      pdf.setFont('helvetica', 'bold')
      pdf.text(
        `Piezas: ${breakdown.units}  |  Billetes: ${breakdown.bills}  |  Monedas: ${breakdown.coins}`,
        18,
        y
      )

      pdf.save(filename)
      toast.success('PDF descargado')
    } catch {
      toast.error('No se pudo generar el PDF')
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <div className="cash-calculator-layout grid items-start gap-4 sm:grid-cols-[minmax(0,1.4fr)_minmax(17rem,1fr)]">
      <Card
        as="section"
        className="gap-0 p-4 sm:p-5"
        aria-labelledby="calculator-title"
      >
        <header className="mb-4 flex items-center justify-between gap-3">
          <h1
            id="calculator-title"
            className="text-xl font-bold tracking-tight"
          >
            Desglose de efectivo
          </h1>
          <Button
            type="button"
            variant="outline"
            onClick={() => setQuantities({})}
            className="shrink-0"
          >
            <RotateCcw aria-hidden="true" />
            Limpiar
          </Button>
        </header>
        <CashColumnHeadings />
        <div className="divide-y divide-border">
          {DENOMINATIONS.map((denomination) => (
            <CashDenominationRow
              key={denomination}
              denomination={denomination}
              count={quantityOf(quantities, denomination)}
              quantity={quantities[denomination] ?? ''}
              inputLabel={`Cantidad de ${formatDenomination(denomination)}`}
              onChange={(value) => handleChange(denomination, value)}
              onStep={(difference) => handleStep(denomination, difference)}
            />
          ))}
        </div>
        <footer className="flex flex-wrap items-center justify-between gap-2 pt-3 text-[10px] text-muted-foreground">
          <span>Los cambios se calculan al instante</span>
          <span>{DENOMINATIONS.length} denominaciones</span>
        </footer>
      </Card>
      <Card
        as="aside"
        className="calculator-summary-card cash-total-card gap-0 overflow-hidden px-[22px] pt-[22px] pb-[17px]"
        aria-labelledby="cash-total-title"
      >
        <header className="flex items-center gap-3">
          <span className="flex size-[30px] items-center justify-center rounded-[9px] border border-primary/30 bg-accent text-accent-foreground">
            <Wallet className="size-4" aria-hidden="true" />
          </span>
          <h2
            id="cash-total-title"
            className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground"
          >
            Total contado
          </h2>
        </header>
        <p className="mt-[17px] mb-[2px] text-[30px] leading-9 font-bold tracking-[-0.06em] text-foreground">
          {formatAmount(total)}
        </p>
        <p className="text-[11px] leading-[15px] text-muted-foreground">
          Pesos mexicanos
        </p>
        <div className="mt-[17px] mb-[10px] border-t border-white/10" />
        <dl>
          {[
            ['Unidades en total', breakdown.units],
            ['Billetes', breakdown.bills],
            ['Monedas', breakdown.coins]
          ].map(([label, count]) => (
            <div
              key={label}
              className="flex items-center justify-between py-1 text-[11px] leading-[15px]"
            >
              <dt className="text-muted-foreground">{label}</dt>
              <dd className="font-semibold tabular-nums text-foreground">
                {count}
              </dd>
            </div>
          ))}
        </dl>
          <Button
            type="button"
            variant="default"
            className="mt-[17px] h-[42px] w-full rounded-[9px] bg-[#ed0011] font-bold text-white hover:bg-[#cf0010] disabled:opacity-80 dark:bg-[#ed0011] dark:hover:bg-[#cf0010]"
            onClick={handleDownload}
            disabled={!breakdown.units || isDownloading}
          >
            <Download aria-hidden="true" />
            {isDownloading ? 'Generando PDF...' : 'Descargar PDF'}
          </Button>
      </Card>
    </div>
  )
}

const Vault = () => {
  const openVault = useOpenVault()
  const saveVault = useSaveVault()
  const { data: latest } = useVaultUpdatedAt()
  const [secret, setSecret] = useState('')
  const [secretReady, setSecretReady] = useState(false)
  const [vault, setVault] = useState(null)
  const [draft, setDraft] = useState({})

  const rows = vault?.denominations ?? []
  const updatedAt = vault?.updatedAt || latest?.updatedAt
  const draftTotal = countedRows(rows, draft)
  const breakdown = countedBreakdown(
    rows.map((item) => item.value),
    draft
  )

  const handleOpen = (event) => {
    event.preventDefault()
    if (!secret.trim()) {
      toast.error('Escribe la clave de la caja fuerte')
      return
    }
    openVault.mutate(secret, {
      onSuccess: (data) => {
        setVault(data)
        setDraft(draftFromVault(data))
      }
    })
  }

  const handleSave = (event) => {
    event.preventDefault()
    const quantities = rows.map((item) => ({
      value: item.value,
      quantity: quantityOf(draft, item.value)
    }))
    saveVault.mutate(
      { secret, quantities },
      {
        onSuccess: (data) => {
          setVault(data)
          setDraft(draftFromVault(data))
        }
      }
    )
  }

  const handleStep = (value, difference) => {
    setDraft((prev) => {
      const quantity = quantityOf(prev, value)
      const next = Math.max(0, quantity + difference)
      return { ...prev, [value]: next > 0 ? String(next) : '' }
    })
  }

  const handleClose = () => {
    setVault(null)
    setDraft({})
    setSecret('')
    setSecretReady(false)
  }

  let secretType = 'text'
  if (secretReady) secretType = 'password'

  let openLabel = 'Abrir'
  if (openVault.isPending) openLabel = 'Abriendo...'
  let saveLabel = 'Guardar'
  if (saveVault.isPending) saveLabel = 'Guardando...'

  let updated = null
  if (updatedAt) {
    updated = (
      <p className="ml-auto text-right text-[11px] text-muted-foreground">
        Última actualización: {formatUpdatedAt(updatedAt)}
      </p>
    )
  }

  return (
    <div className="cash-calculator-layout grid items-start gap-4 sm:grid-cols-[minmax(0,1.4fr)_minmax(17rem,1fr)]">
      <Card
        as="section"
        className="gap-0 p-4 sm:p-5"
        aria-labelledby="vault-title"
      >
        <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-[9px] bg-accent text-accent-foreground">
              <LockKeyhole className="size-4" aria-hidden="true" />
            </span>
            <h2 id="vault-title" className="text-xl font-bold tracking-tight">
              Caja fuerte
            </h2>
          </div>
          {updated}
        </header>
        {vault ? (
          <form
            id="vault-save-form"
            onSubmit={handleSave}
            className="flex flex-col gap-4"
          >
            <div>
              <CashColumnHeadings />
              <div className="divide-y divide-border">
                {rows.map((item) => (
                  <CashDenominationRow
                    key={item.value}
                    denomination={item.value}
                    count={quantityOf(draft, item.value)}
                    quantity={draft[item.value] ?? ''}
                    inputLabel={`Piezas de ${formatDenomination(item.value)} en caja fuerte`}
                    onChange={(value) =>
                      setDraft((prev) => ({ ...prev, [item.value]: value }))
                    }
                    onStep={(difference) => handleStep(item.value, difference)}
                  />
                ))}
              </div>
            </div>
          </form>
        ) : (
          <form
            onSubmit={handleOpen}
            className="flex flex-col gap-3 sm:max-w-sm"
          >
            <div className="flex flex-col gap-2">
              <Label htmlFor="vault-secret">Clave</Label>
              <Input
                id="vault-secret"
                type={secretType}
                autoComplete="off"
                readOnly={!secretReady}
                onFocus={() => setSecretReady(true)}
                value={secret}
                onChange={(event) => setSecret(event.target.value)}
              />
            </div>
            <Button type="submit" disabled={openVault.isPending}>
              {openLabel}
            </Button>
          </form>
        )}
      </Card>
      <Card
        as="aside"
        className="calculator-summary-card cash-total-card gap-0 overflow-hidden px-[22px] pt-[22px] pb-[17px]"
        aria-labelledby="vault-total-title"
      >
        <header className="flex items-center gap-3">
          <span className="flex size-[30px] items-center justify-center rounded-[9px] border border-primary/30 bg-accent text-accent-foreground">
            <Wallet className="size-4" aria-hidden="true" />
          </span>
          <h2
            id="vault-total-title"
            className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground"
          >
            Total en caja fuerte
          </h2>
        </header>
        {vault ? (
          <>
            <p className="mt-[17px] mb-[2px] text-[30px] leading-9 font-bold tracking-[-0.06em] text-foreground">
              {formatAmount(draftTotal)}
            </p>
            <p className="text-[11px] leading-[15px] text-muted-foreground">
              Pesos mexicanos
            </p>
            <div className="mt-[17px] mb-[10px] border-t border-white/10" />
            <dl>
              {[
                ['Unidades en total', breakdown.units],
                ['Billetes', breakdown.bills],
                ['Monedas', breakdown.coins]
              ].map(([label, count]) => (
                <div
                  key={label}
                  className="flex items-center justify-between py-1 text-[11px] leading-[15px]"
                >
                  <dt className="text-muted-foreground">{label}</dt>
                  <dd className="font-semibold tabular-nums text-foreground">
                    {count}
                  </dd>
                </div>
              ))}
            </dl>
            <Button
              type="submit"
              form="vault-save-form"
              disabled={saveVault.isPending}
              className="mt-[17px] h-[42px] w-full rounded-[9px] font-bold"
            >
              {saveLabel}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="mt-2 h-[42px] w-full rounded-[9px] font-bold"
              onClick={handleClose}
            >
              Cerrar caja
            </Button>
          </>
        ) : (
          <>
            <p className="mt-[17px] mb-[2px] text-[24px] leading-8 font-bold tracking-tight text-foreground">
              Bloqueada
            </p>
            <p className="text-[11px] leading-[15px] text-muted-foreground">
              Abre la caja fuerte para consultar el total y las denominaciones.
            </p>
          </>
        )}
      </Card>
    </div>
  )
}

const StaffCash = () => (
  <PageShell className="cash-page-shell">
    <Calculator />
  </PageShell>
)

const AdminCash = () => (
  <PageShell className="cash-page-shell">
    <div className="space-y-6">
      <Calculator />
      <div className="cash-vault-card">
        <Vault />
      </div>
    </div>
  </PageShell>
)

const Cash = () => {
  const roleName = useRoleName()

  if (hasFullAccess(roleName)) return <AdminCash />

  return <StaffCash />
}

export default Cash
