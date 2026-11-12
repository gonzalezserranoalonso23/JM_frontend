import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import RouteErrorBoundary from './RouteErrorBoundary'

const QuietBoom = ({ message }) => {
  throw new Error(message)
}

describe('RouteErrorBoundary', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('shows a retry instead of leaving the screen blank', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    let shouldThrow = true
    const Sometimes = () => {
      if (shouldThrow) throw new Error('boom')
      return <p>Listo</p>
    }

    render(
      <RouteErrorBoundary>
        <Sometimes />
      </RouteErrorBoundary>
    )

    expect(screen.getByRole('alert')).toBeTruthy()
    shouldThrow = false
    await userEvent.click(screen.getByRole('button', { name: 'Reintentar' }))
    expect(screen.getByText('Listo')).toBeTruthy()
  })

  it('reloads when the page script failed to download', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const reload = vi.fn()
    vi.stubGlobal('location', { ...window.location, reload })

    render(
      <RouteErrorBoundary>
        <QuietBoom message="Failed to fetch dynamically imported module" />
      </RouteErrorBoundary>
    )

    await userEvent.click(screen.getByRole('button', { name: 'Reintentar' }))
    expect(reload).toHaveBeenCalledOnce()
  })
})
