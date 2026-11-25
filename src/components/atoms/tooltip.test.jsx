import { describe, expect, it, vi, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from './tooltip'
import { Button } from './button'

const originalMatchMedia = window.matchMedia

describe('Tooltip', () => {
  afterEach(() => {
    window.matchMedia = originalMatchMedia
  })

  it('en pantalla táctil el click llega al botón', async () => {
    window.matchMedia = (query) => ({
      matches: String(query).includes('pointer: coarse'),
      addEventListener() {},
      removeEventListener() {},
      addListener() {},
      removeListener() {}
    })
    const onClick = vi.fn()
    const user = userEvent.setup()
    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button onClick={onClick}>Editar</Button>
          </TooltipTrigger>
          <TooltipContent>Editar registro</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Editar' }))
    expect(onClick).toHaveBeenCalledTimes(1)
  })
})
