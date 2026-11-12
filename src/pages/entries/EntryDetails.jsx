import MovementDetails from '@/components/organisms/MovementDetails'

const EntryDetails = () => (
  <MovementDetails
    listPath="/entries"
    listLabel="Entradas"
    expectIssue={false}
  />
)

export default EntryDetails
