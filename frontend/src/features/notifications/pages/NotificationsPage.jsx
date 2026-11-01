import { useEffect, useState } from 'react'
import AppHeader from '../../../components/layout/AppHeader'
import AppSidebar from '../../../components/layout/AppSidebar'
import { Avatar } from '../../../components/ui/Avatar'
import { Icon } from '../../../components/ui/Icon'
import { getNotifications, markAllNotificationsRead, markNotificationRead } from '../data/notificationsApi'

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([])
  const [filter, setFilter] = useState('all')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const unreadCount = notifications.filter((item) => item.unread).length
  const visibleNotifications = notifications.filter((item) => filter === 'all' || item.unread)

  useEffect(() => {
    let active = true
    getNotifications()
      .then((items) => {
        if (active) setNotifications(items.map((item) => ({
          ...item,
          actor: item.actorUserId ? `Nexora member ${item.actorUserId}` : 'Nexora',
          initials: item.actorUserId ? `N${String(item.actorUserId).slice(-1)}` : 'NX',
          tone: 'sage',
          unread: !item.read,
          time: item.createdAt ? new Date(item.createdAt).toLocaleString() : '',
          detail: '',
        })))
      })
      .catch((requestError) => {
        if (active) setError(requestError.response?.data?.error || 'Could not load notifications.')
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })
    return () => { active = false }
  }, [])

  async function markAllRead() {
    try {
      await markAllNotificationsRead()
      setNotifications((current) => current.map((item) => ({ ...item, unread: false })))
    } catch (requestError) {
      setError(requestError.response?.data?.error || 'Could not mark notifications as read.')
    }
  }

  async function markRead(notificationId) {
    try {
      await markNotificationRead(notificationId)
      setNotifications((current) => current.map((item) => item.id === notificationId ? { ...item, unread: false } : item))
    } catch (requestError) {
      setError(requestError.response?.data?.error || 'Could not mark this notification as read.')
    }
  }

  return (
    <div className="app-shell">
      <AppHeader />
      <div className="app-layout">
        <AppSidebar />
        <main className="social-column">
          <div className="social-page-heading notification-page-heading">
            <div><span className="section-kicker">A LITTLE NUDGE FROM YOUR CIRCLE</span><h1>Notifications</h1><p>See what’s happening with the people and posts you care about.</p></div>
            <button className="notification-mark-all" onClick={markAllRead} disabled={!unreadCount}>
              <Icon name="check" size={15} /> Mark all as read
            </button>
          </div>
          {error && <p className="composer-error" role="alert">{error}</p>}
          {isLoading && <p role="status">Loading your notifications…</p>}
          <div className="notification-tabs" role="tablist" aria-label="Notification filter">
            <button className={filter === 'all' ? 'notification-tab active' : 'notification-tab'} onClick={() => setFilter('all')} role="tab" aria-selected={filter === 'all'}>All <span>{notifications.length}</span></button>
            <button className={filter === 'unread' ? 'notification-tab active' : 'notification-tab'} onClick={() => setFilter('unread')} role="tab" aria-selected={filter === 'unread'}>Unread <span>{unreadCount}</span></button>
          </div>
          <section className="notification-list" aria-label="Your notifications">
            {visibleNotifications.length ? visibleNotifications.map((item) => (
              <article className={`notification-item${item.unread ? ' notification-unread' : ''}`} key={item.id}>
                <Avatar initials={item.initials} tone={item.tone} size="large" />
                <span className={`notification-type-icon notification-type-${item.type?.startsWith('connection') ? 'connection' : item.type}`}>
                  <Icon name={item.type?.startsWith('connection') ? 'users' : item.type === 'comment' ? 'comment' : 'heart'} size={14} />
                </span>
                <div className="notification-copy">
                  <p><strong>{item.actor}</strong> {item.message}</p>
                  {item.detail && <blockquote>{item.detail}</blockquote>}
                  <span>{item.time}</span>
                </div>
                {item.unread && <button className="notification-unread-dot" onClick={() => markRead(item.id)} aria-label={`Mark ${item.actor}'s notification as read`} title="Mark as read" />}
              </article>
            )) : (
              <div className="social-empty notification-empty"><span><Icon name="bell" size={19} /></span><strong>You’re all caught up</strong><p>No unread notifications at the moment.</p></div>
            )}
          </section>
        </main>
        <aside className="right-rail social-rail">
          <section className="rail-card social-rail-card">
            <span className="section-kicker">GOOD TO KNOW</span>
            <h2>{unreadCount ? `${unreadCount} things to catch up on.` : 'You’re up to date.'}</h2>
            <p>We’ll keep the little updates here so you can check in when it suits you.</p>
          </section>
        </aside>
      </div>
    </div>
  )
}
