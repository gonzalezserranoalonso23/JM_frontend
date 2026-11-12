import PageShell from '@/components/templates/PageShell'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { Button } from '@/components/atoms/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/atoms/card'
import { Input } from '@/components/atoms/input'
import { Label } from '@/components/atoms/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/atoms/table'
import {
  useOpenVault,
  useSaveVault,
  useVaultUpdatedAt
} from '@/features/denominations.features'
import { hasFullAccess } from '@/auth/access'
import { useRoleName } from '@/features/users.features'
import {
  DENOMINATIONS,
  countedRows,
  countedTotal,
  draftFromVault,
  formatAmount,
  formatDenomination,
  formatUpdatedAt,
  quantityOf
} from '@/utils/cash'

const Calculator = () => {
  const [quantities, setQuantities] = useState({})

  const handleChange = (denomination, value) =>
    setQuantities((prev) => ({ ...prev, [denomination]: value }))

  const total = countedTotal(DENOMINATIONS, quantities)

  return (
    <Card as="section" aria-labelledby="calculator-title">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>
          <h1 id="calculator-title" className="text-xl font-bold">
            Calculadora de caja
          </h1>
        </CardTitle>
        <Button
          type="button"
          variant="outline"
          onClick={() => setQuantities({})}
        >
          Limpiar
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 xl:hidden">
          {DENOMINATIONS.map((denomination) => (
            <Card key={denomination} className="py-3">
              <CardContent className="grid grid-cols-[1fr_6rem_1fr] items-center gap-3 px-4">
                <strong>{formatDenomination(denomination)}</strong>
                <Input
                  type="number"
                  inputMode="numeric"
                  min="0"
                  step="1"
                  placeholder="0"
                  className="h-9 w-full px-2 text-center"
                  aria-label={`Cantidad de ${formatDenomination(denomination)}`}
                  value={quantities[denomination] ?? ''}
                  onChange={(event) =>
                    handleChange(denomination, event.target.value)
                  }
                />
                <span className="text-right text-sm">
                  {formatAmount(
                    denomination * quantityOf(quantities, denomination)
                  )}
                </span>
              </CardContent>
            </Card>
          ))}
          <Card className="bg-muted/30 py-3">
            <CardContent className="flex items-center justify-between px-4">
              <strong>Total en caja</strong>
              <strong>{formatAmount(total)}</strong>
            </CardContent>
          </Card>
        </div>
        <div className="hidden overflow-x-hidden rounded-lg border xl:block">
          <Table className="table-fixed">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[30%]">Denominación</TableHead>
                <TableHead className="w-[34%] text-center">Cantidad</TableHead>
                <TableHead className="w-[36%] text-right">Subtotal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {DENOMINATIONS.map((denomination) => (
                <TableRow key={denomination}>
                  <TableCell>
                    <strong>{formatDenomination(denomination)}</strong>
                  </TableCell>
                  <TableCell className="text-center">
                    <Input
                      type="number"
                      inputMode="numeric"
                      min="0"
                      step="1"
                      placeholder="0"
                      className="mx-auto h-9 w-full max-w-28 px-2 text-center"
                      aria-label={`Cantidad de ${formatDenomination(denomination)}`}
                      value={quantities[denomination] ?? ''}
                      onChange={(event) =>
                        handleChange(denomination, event.target.value)
                      }
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    {formatAmount(
                      denomination * quantityOf(quantities, denomination)
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            <tfoot className="border-t bg-muted/50 font-medium">
              <TableRow>
                <TableCell colSpan={2} className="text-right">
                  <strong>Total en caja</strong>
                </TableCell>
                <TableCell className="text-right">
                  <strong>{formatAmount(total)}</strong>
                </TableCell>
              </TableRow>
            </tfoot>
          </Table>
        </div>
      </CardContent>
    </Card>
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
      <p className="text-sm text-muted-foreground">
        Última actualización: {formatUpdatedAt(updatedAt)}
      </p>
    )
  }

  let form = (
    <form onSubmit={handleOpen} className="flex flex-col gap-3 sm:max-w-sm">
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
  )
  if (vault) {
    form = (
      <form onSubmit={handleSave} className="flex flex-col gap-4">
        <div className="space-y-3 xl:hidden">
          {rows.map((item) => (
            <Card key={item.value} className="py-3">
              <CardContent className="grid grid-cols-[1fr_6rem_1fr] items-center gap-3 px-4">
                <strong>{formatDenomination(item.value)}</strong>
                <Input
                  type="number"
                  inputMode="numeric"
                  min="0"
                  step="1"
                  placeholder="0"
                  className="h-9 w-full px-2 text-center"
                  aria-label={`Piezas de ${formatDenomination(item.value)} en caja fuerte`}
                  value={draft[item.value] ?? ''}
                  onChange={(event) =>
                    setDraft((prev) => ({
                      ...prev,
                      [item.value]: event.target.value
                    }))
                  }
                />
                <span className="text-right text-sm">
                  {formatAmount(item.value * quantityOf(draft, item.value))}
                </span>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="hidden overflow-x-hidden rounded-lg border xl:block">
          <Table className="table-fixed">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[30%]">Denominación</TableHead>
                <TableHead className="w-[34%] text-center">Cantidad</TableHead>
                <TableHead className="w-[36%] text-right">Subtotal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((item) => (
                <TableRow key={item.value}>
                  <TableCell>
                    <strong>{formatDenomination(item.value)}</strong>
                  </TableCell>
                  <TableCell className="text-center">
                    <Input
                      type="number"
                      inputMode="numeric"
                      min="0"
                      step="1"
                      placeholder="0"
                      className="mx-auto h-9 w-full max-w-28 px-2 text-center"
                      aria-label={`Piezas de ${formatDenomination(item.value)} en caja fuerte`}
                      value={draft[item.value] ?? ''}
                      onChange={(event) =>
                        setDraft((prev) => ({
                          ...prev,
                          [item.value]: event.target.value
                        }))
                      }
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    {formatAmount(item.value * quantityOf(draft, item.value))}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <strong>Total en caja fuerte: {formatAmount(draftTotal)}</strong>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cerrar
            </Button>
            <Button type="submit" disabled={saveVault.isPending}>
              {saveLabel}
            </Button>
          </div>
        </div>
      </form>
    )
  }

  return (
    <Card as="section" aria-labelledby="vault-title">
      <CardHeader className="gap-2">
        <CardTitle>
          <h2 id="vault-title" className="text-xl font-bold">
            Caja fuerte
          </h2>
        </CardTitle>
        {updated}
      </CardHeader>
      <CardContent>{form}</CardContent>
    </Card>
  )
}

const StaffCash = () => (
  <PageShell>
    <Calculator />
  </PageShell>
)

const AdminCash = () => (
  <PageShell>
    <div className="flex flex-col gap-6">
      <Calculator />
      <Vault />
    </div>
  </PageShell>
)

const Cash = () => {
  const roleName = useRoleName()

  if (hasFullAccess(roleName)) return <AdminCash />

  return <StaffCash />
}

export default Cash
