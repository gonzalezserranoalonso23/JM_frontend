import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const FormFilter = ({
  id = 'filter-query',
  label = 'Buscar',
  placeholder = 'Buscar...',
  value,
  onChange,
  children
}) => (
  <form
    className="mb-6 grid gap-4 sm:flex sm:flex-wrap sm:items-end [&>*]:w-full sm:[&>*]:w-auto sm:[&>*]:min-w-52 sm:[&>*]:max-w-sm sm:[&>*]:flex-1"
    role="search"
    aria-label={label}
    onSubmit={(event) => event.preventDefault()}
  >
    <div className="grid gap-2">
      <Label htmlFor={id} className="mb-0">
        {label}
      </Label>
      <Input
        id={id}
        type="search"
        placeholder={placeholder}
        autoComplete="off"
        enterKeyHint="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
    {children}
  </form>
)

export default FormFilter
