import { Link } from 'react-router-dom'

type UnreadNotificationsCounterProps = {
  unreadCount: number
}

function UnreadNotificationsCounter({ unreadCount }: UnreadNotificationsCounterProps) {
  return (
    <Link to="/notifications" className="notification-counter-link" title="Powiadomienia">
      <span className="notification-counter-label">Powiadomienia</span>
      <span className="notification-counter-badge">{unreadCount}</span>
    </Link>
  )
}

export default UnreadNotificationsCounter
