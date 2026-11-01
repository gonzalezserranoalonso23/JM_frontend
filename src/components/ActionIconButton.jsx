import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip'
import {
  Check,
  Clock,
  Eye,
  LogOut,
  Pencil,
  RotateCcw,
  Trash2,
  X
} from 'lucide-react'

const ICONS = {
  edit: Pencil,
  delete: Trash2,
  activate: Check,
  deactivate: X,
  open: Eye,
  reopen: RotateCcw,
  logout: LogOut,
  schedule: Clock
}

const VARIANTS = {
  edit: 'outline',
  delete: 'destructive',
  activate: 'outline',
  deactivate: 'outline',
  open: 'outline',
  reopen: 'outline',
  logout: 'outline',
  schedule: 'outline'
}

const ActionIconButton = ({ action, label, className = '', ...props }) => {
  const Icon = ICONS[action]
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant={VARIANTS[action]}
          size="icon"
          className={className}
          aria-label={label}
          {...props}
        >
          <Icon aria-hidden="true" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}

export default ActionIconButton
