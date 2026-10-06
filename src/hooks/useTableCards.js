/* global requestAnimationFrame, cancelAnimationFrame, MutationObserver */
import { useEffect } from 'react'

// On mobile the CSS renders each table row as a card; each cell needs its
// column header as a data-label to know what it represents.
const labelTables = () => {
  document.querySelectorAll('table.table-minimal').forEach((table) => {
    const headers = Array.from(table.querySelectorAll('thead th')).map((th) =>
      th.textContent.trim()
    )

    table.querySelectorAll('tbody tr').forEach((row) => {
      let column = 0
      Array.from(row.children).forEach((cell) => {
        if (cell.tagName !== 'TD') return
        const span = cell.colSpan || 1
        const label = span === 1 ? headers[column] : ''

        if (label) cell.dataset.label = label
        else delete cell.dataset.label

        if (cell.querySelector('.btn-action')) cell.dataset.actions = 'true'
        else delete cell.dataset.actions

        column += span
      })
    })
  })
}

const useTableCards = () => {
  useEffect(() => {
    let frame = null
    const schedule = () => {
      if (frame) return
      frame = requestAnimationFrame(() => {
        frame = null
        labelTables()
      })
    }

    labelTables()
    const observer = new MutationObserver(schedule)
    observer.observe(document.body, { childList: true, subtree: true })

    return () => {
      observer.disconnect()
      if (frame) cancelAnimationFrame(frame)
    }
  }, [])
}

export default useTableCards
