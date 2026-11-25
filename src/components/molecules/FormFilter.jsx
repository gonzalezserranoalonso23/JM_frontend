import { useEffect, useState } from 'react'
import { Input } from '@/components/atoms/input'
import { Label } from '@/components/atoms/label'

const FormFilter = ({
  id = 'filter-query',
  label = 'Buscar',
  placeholder = 'Buscar...',
  value = '',
  onChange,
  delay = 300,
  children
}) => {
  const [draft, setDraft] = useState(value)

  useEffect(() => {
    setDraft(value)
  }, [value])

  useEffect(() => {
    if (draft === value) return undefined
    if (delay <= 0) {
      onChange(draft)
      return undefined
    }
    const timer = setTimeout(() => onChange(draft), delay)
    return () => clearTimeout(timer)
  }, [draft, value, onChange, delay])

  return (
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
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
        />
      </div>
      {children}
    </form>
  )
}

export default FormFilter
