import { fireEvent, render, screen, act } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import FormFilter from './FormFilter'

describe('FormFilter', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('updates immediately when its parent already debounces the search', () => {
    const onChange = vi.fn()
    render(<FormFilter value="" onChange={onChange} delay={0} />)

    fireEvent.change(screen.getByRole('searchbox'), {
      target: { value: 'arroz' }
    })

    expect(onChange).toHaveBeenCalledWith('arroz')
  })

  it('debounces search input by the configured delay', () => {
    vi.useFakeTimers()
    const onChange = vi.fn()
    render(<FormFilter value="" onChange={onChange} delay={300} />)

    fireEvent.change(screen.getByRole('searchbox'), {
      target: { value: 'arroz' }
    })

    expect(onChange).not.toHaveBeenCalled()
    act(() => vi.advanceTimersByTime(299))
    expect(onChange).not.toHaveBeenCalled()
    act(() => vi.advanceTimersByTime(1))
    expect(onChange).toHaveBeenCalledWith('arroz')
  })
})
