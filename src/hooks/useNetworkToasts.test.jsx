import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render } from '@testing-library/react'

vi.mock('react-hot-toast', () => ({
  toast: Object.assign(vi.fn(), {
    error: vi.fn(),
    success: vi.fn(),
    dismiss: vi.fn()
  })
}))

import { toast } from 'react-hot-toast'
import useNetworkToasts from './useNetworkToasts'

const Harness = () => {
  useNetworkToasts()
  return null
}

describe('useNetworkToasts', () => {
  beforeEach(() => vi.clearAllMocks())

  it('muestra un toast rojo persistente al perder la conexión', () => {
    render(<Harness />)
    window.dispatchEvent(new Event('offline'))
    expect(toast.error).toHaveBeenCalledWith(
      'Sin conexión a internet',
      expect.objectContaining({
        duration: Infinity,
        style: expect.objectContaining({ background: '#dc2626' })
      })
    )
  })

  it('al volver muestra un toast verde de 3 segundos y quita el rojo', () => {
    render(<Harness />)
    window.dispatchEvent(new Event('online'))
    expect(toast.dismiss).toHaveBeenCalledWith('network-offline')
    expect(toast.success).toHaveBeenCalledWith(
      'Regresó la conexión',
      expect.objectContaining({
        duration: 3000,
        style: expect.objectContaining({ background: '#16a34a' })
      })
    )
  })
})
