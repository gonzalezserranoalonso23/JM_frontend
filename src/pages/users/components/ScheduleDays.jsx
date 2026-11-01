import { WEEK_DAYS } from '../schedule'

const ScheduleDays = ({ schedule }) => (
  <ul className="divide-y">
    {WEEK_DAYS.map(([day, label]) => {
      const row = schedule?.[day]
      const works = Boolean(row?.enabled && row.start && row.end)
      return (
        <li
          key={day}
          className="flex items-center justify-between gap-4 py-2.5 text-sm"
        >
          <span className="font-medium">{label}</span>
          <span className={works ? undefined : 'text-muted-foreground'}>
            {works ? `${row.start} – ${row.end}` : 'No trabaja'}
          </span>
        </li>
      )
    })}
  </ul>
)

export default ScheduleDays
