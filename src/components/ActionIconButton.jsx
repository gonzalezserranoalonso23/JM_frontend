import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip'
import { Check, Eye, Pencil, RotateCcw, Trash2, X } from 'lucide-react'

const ICONS = {
  edit: Pencil,
  delete: Trash2,
  activate: Check,
  deactivate: X,
  open: Eye,
  reopen: RotateCcw
}

const VARIANTS = {
  edit: 'btn-info-sm',
  delete: 'btn-danger-sm',
  activate: 'btn-info-sm',
  deactivate: 'btn-info-sm',
  open: 'btn-info-sm',
  reopen: 'btn-info-sm'
}

const ActionIconButton = ({ action, label, className = '', ...props }) => {
  const Icon = ICONS[action]
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className={`btn-action ${VARIANTS[action]} inline-flex items-center justify-center ${className}`}
          aria-label={label}
          {...props}
        >
          <Icon className="h-4 w-4" aria-hidden="true" />
        </button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}

export default ActionIconButton
