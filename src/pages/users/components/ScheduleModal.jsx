import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogFooter,
  DialogTitle
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import ScheduleDays from './ScheduleDays'

const ScheduleModal = ({ user, open, onClose }) => (
  <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>
          Horario de {user?.fullName || user?.username || 'usuario'}
        </DialogTitle>
      </DialogHeader>
      <DialogBody>
        <ScheduleDays schedule={user?.schedule} />
      </DialogBody>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>
          Cerrar
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
)

export default ScheduleModal
