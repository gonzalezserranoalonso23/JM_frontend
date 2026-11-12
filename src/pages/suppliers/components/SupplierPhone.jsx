import { callHref, whatsappHref } from '@/utils/phone'

const SupplierPhone = ({ phone }) => {
  const value = String(phone || '').trim()
  const call = callHref(value)
  const chat = whatsappHref(value)
  if (!call) return '-'

  return (
    <span className="inline-flex flex-col items-start gap-1">
      <a
        href={call}
        className="text-primary underline-offset-4 hover:underline"
      >
        {value}
      </a>
      {chat && (
        <a
          href={chat}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-primary underline-offset-4 hover:underline xl:hidden"
        >
          WhatsApp
        </a>
      )}
    </span>
  )
}

export default SupplierPhone
