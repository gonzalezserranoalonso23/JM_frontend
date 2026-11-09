import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import DataList, { Column } from './DataList'

describe('DataList', () => {
  it('pinta el valor fijo y la fórmula de cada renglón', () => {
    render(
      <DataList
        rows={[{ _id: '1', name: 'Abarrotes' }]}
        rowKey={(row) => row._id}
        total={1}
      >
        <Column header="Categoría" primary>
          {(row) => row.name}
        </Column>
        <Column header="Nota">Fija</Column>
      </DataList>
    )

    expect(screen.getAllByText('Abarrotes').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Fija').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Total: 1').length).toBeGreaterThan(0)
  })
})
