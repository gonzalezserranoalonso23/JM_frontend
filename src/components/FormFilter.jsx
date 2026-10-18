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
    className="mb-6 flex flex-wrap items-end gap-4"
    role="search"
    aria-label={label}
    onSubmit={(event) => event.preventDefault()}
  >
    <div className="flex min-w-[200px] max-w-[400px] flex-1 flex-col gap-2">
      <Label htmlFor={id} className="mb-0">
        {label}
      </Label>
      <Input
        id={id}
        type="search"
        placeholder={placeholder}
        autoComplete="off"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
    {children}
  </form>
)

export default FormFilter
