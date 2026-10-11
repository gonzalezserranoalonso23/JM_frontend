import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './dialog'

const Harness = ({ onClose }) => {
  const [open, setOpen] = useState(true)
  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v)
        if (!v) onClose()
      }}
    >
      <DialogContent aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>Titulo</DialogTitle>
        </DialogHeader>
        <input aria-label="campo" />
        contenido
      </DialogContent>
    </Dialog>
  )
}

describe('Dialog', () => {
  afterEach(() => vi.restoreAllMocks())

  it('no se cierra al hacer clic fuera', async () => {
    const onClose = vi.fn()
    const user = userEvent.setup({ pointerEventsCheck: 0 })
    render(<Harness onClose={onClose} />)
    await user.click(document.body)
    expect(onClose).not.toHaveBeenCalled()
    expect(screen.getByText('contenido')).toBeInTheDocument()
  })

  it('Escape cierra sin preguntar si no hay cambios', async () => {
    const onClose = vi.fn()
    const confirm = vi.spyOn(window, 'confirm')
    const user = userEvent.setup({ pointerEventsCheck: 0 })
    render(<Harness onClose={onClose} />)
    await user.keyboard('{Escape}')
    expect(confirm).not.toHaveBeenCalled()
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('con cambios pide confirmación y respeta la cancelación', async () => {
    const onClose = vi.fn()
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false)
    const user = userEvent.setup({ pointerEventsCheck: 0 })
    render(<Harness onClose={onClose} />)
    await user.type(screen.getByLabelText('campo'), 'abc')
    await user.keyboard('{Escape}')
    await user.click(screen.getByRole('button', { name: /cerrar/i }))
    expect(confirm).toHaveBeenCalledTimes(2)
    expect(onClose).not.toHaveBeenCalled()

    confirm.mockReturnValue(true)
    await user.click(screen.getByRole('button', { name: /cerrar/i }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('se cierra con la tacha', async () => {
    const onClose = vi.fn()
    const user = userEvent.setup({ pointerEventsCheck: 0 })
    render(<Harness onClose={onClose} />)
    await user.click(screen.getByRole('button', { name: /cerrar/i }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
