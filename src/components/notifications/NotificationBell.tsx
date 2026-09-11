import { useState } from 'react'
import { Bell } from 'lucide-react'
import { useNotifications } from '../../context/NotificationContext'
import { NotificationCenter } from './NotificationCenter'

interface NotificationBellProps {
  className?: string
  onClick?: () => void
}

export function NotificationBell({ className = '', onClick }: NotificationBellProps) {
  const { unreadCount } = useNotifications()
  const [isOpen, setIsOpen] = useState(false)

  const handleClick = () => {
    if (onClick) {
      onClick()
    } else {
      setIsOpen((prev) => !prev)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        aria-label={
          unreadCount > 0
            ? `${unreadCount} unread notification${unreadCount === 1 ? '' : 's'}`
            : 'Notifications'
        }
        className={`relative rounded-xl p-2 text-slate-500 hover:bg-slate-100 hover:text-[#12365a] transition ${className}`}
      >
        <Bell size={19} />
        {unreadCount > 0 && (
          <span
            className="absolute right-1 top-1 grid min-w-4 place-items-center rounded-full bg-rose-600 px-1 text-[10px] font-extrabold leading-4 text-white shadow-xs animate-in zoom-in-50"
            title={`${unreadCount} unread update${unreadCount === 1 ? '' : 's'}`}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Render the slide-over notification center when opened */}
      <NotificationCenter open={isOpen} onClose={() => setIsOpen(false)} />
    </>
  )
}
