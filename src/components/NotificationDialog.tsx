import { Link } from 'react-router-dom'
import { Notification } from '../services/notificationService'

type NotificationDialogProps = {
  notification: Notification | null
  onClose: () => void
}

function NotificationDialog({ notification, onClose }: NotificationDialogProps) {
  if (!notification) {
    return null
  }

  return (
    <div className="notification-dialog-overlay" role="dialog" aria-modal="true" aria-label="Nowe powiadomienie">
      <div className="notification-dialog">
        <div className="notification-dialog-top">
          <strong>Nowe powiadomienie</strong>
          <button type="button" onClick={onClose} className="notification-dialog-close">
            Zamknij
          </button>
        </div>

        <h3 className="font-bold text-lg mt-2">{notification.title}</h3>
        <p className="text-sm text-gray-600 mt-1">{notification.message}</p>

        <div className="notification-dialog-actions">
          <Link
            to={`/notifications/${notification.id}`}
            className="notification-dialog-link"
            onClick={onClose}
          >
            Otworz szczegoly
          </Link>
          <button type="button" onClick={onClose} className="notification-dialog-button">
            Pozniej
          </button>
        </div>
      </div>
    </div>
  )
}

export default NotificationDialog
