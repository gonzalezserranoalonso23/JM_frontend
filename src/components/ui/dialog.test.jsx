import { describe, it, expect, vi } from 'vitest'
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
        contenido
      </DialogContent>
    </Dialog>
  )
}

describe('Dialog', () => {
  it('no se cierra al hacer clic fuera ni con Escape', async () => {
    const onClose = vi.fn()
    const user = userEvent.setup({ pointerEventsCheck: 0 })
    render(<Harness onClose={onClose} />)
    await user.click(document.body)
    await user.keyboard('{Escape}')
    expect(onClose).not.toHaveBeenCalled()
    expect(screen.getByText('contenido')).toBeInTheDocument()
  })

  it('se cierra con la tacha', async () => {
    const onClose = vi.fn()
    const user = userEvent.setup({ pointerEventsCheck: 0 })
    render(<Harness onClose={onClose} />)
    await user.click(screen.getByRole('button', { name: /cerrar/i }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
