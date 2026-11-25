import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from './button'

describe('Button', () => {
  it('el click no envía el formulario', async () => {
    const onSubmit = vi.fn((event) => event.preventDefault())
    const onClick = vi.fn()
    const user = userEvent.setup()
    render(
      <form onSubmit={onSubmit}>
        <Button onClick={onClick}>Nueva</Button>
      </form>
    )
    await user.click(screen.getByRole('button', { name: 'Nueva' }))
    expect(onClick).toHaveBeenCalledTimes(1)
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('type submit sigue enviando el formulario', async () => {
    const onSubmit = vi.fn((event) => event.preventDefault())
    const user = userEvent.setup()
    render(
      <form onSubmit={onSubmit}>
        <Button type="submit">Guardar</Button>
      </form>
    )
    await user.click(screen.getByRole('button', { name: 'Guardar' }))
    expect(onSubmit).toHaveBeenCalledTimes(1)
  })
})
