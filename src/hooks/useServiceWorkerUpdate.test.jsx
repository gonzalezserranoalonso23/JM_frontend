import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Toaster } from 'react-hot-toast'
import useServiceWorkerUpdate from './useServiceWorkerUpdate'

const Probe = () => {
  useServiceWorkerUpdate()
  return <Toaster />
}

describe('useServiceWorkerUpdate', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    delete navigator.serviceWorker
  })

  it('ofrece actualizar cuando hay una versión en espera', async () => {
    vi.stubEnv('PROD', true)
    const waiting = { postMessage: vi.fn() }
    Object.defineProperty(navigator, 'serviceWorker', {
      configurable: true,
      value: {
        controller: {},
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        register: vi.fn().mockResolvedValue({
          waiting,
          addEventListener: vi.fn()
        })
      }
    })
    render(<Probe />)
    const button = await screen.findByRole('button', { name: 'Actualizar' })
    await userEvent.click(button)
    expect(waiting.postMessage).toHaveBeenCalledWith({ type: 'SKIP_WAITING' })
  })
})
