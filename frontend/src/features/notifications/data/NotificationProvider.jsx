import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../auth/data/useAuth'
import { getNotifications, markAllNotificationsRead, markNotificationRead } from './notificationsApi'
import { NotificationContext } from './NotificationContext'

function formatNotifications(items) {
  return items.map((item) => ({
    ...item,
    actor: item.actorUserId ? `Nexora member ${item.actorUserId}` : 'Nexora',
    initials: item.actorUserId ? `N${String(item.actorUserId).slice(-1)}` : 'NX',
    tone: 'sage',
    unread: !item.read,
    time: item.createdAt ? new Date(item.createdAt).toLocaleString() : '',
    detail: '',
  }))
}

function getErrorMessage(error, fallback) {
  return error.response?.data?.error || error.response?.data?.message || fallback
}

export default function NotificationProvider({ children }) {
  const { user } = useAuth()
  const userId = user?.id
  const [state, setState] = useState({ userId: null, notifications: [], error: '' })
  const isCurrentUserState = userId != null && String(state.userId) === String(userId)
  const notifications = useMemo(
    () => isCurrentUserState ? state.notifications : [],
    [isCurrentUserState, state.notifications],
  )
  const unreadCount = notifications.filter((item) => item.unread).length

  useEffect(() => {
    if (userId == null) return undefined
    let active = true

    function loadNotifications() {
      getNotifications()
        .then((items) => {
          if (active) setState({ userId, notifications: formatNotifications(items), error: '' })
        })
        .catch((error) => {
          if (active) setState((current) => ({
            userId,
            notifications: String(current.userId) === String(userId) ? current.notifications : [],
            error: getErrorMessage(error, 'Could not load notifications.'),
          }))
        })
    }

    function refreshOnFocus() {
      if (document.visibilityState === 'visible') loadNotifications()
    }

    loadNotifications()
    const intervalId = window.setInterval(loadNotifications, 60000)
    window.addEventListener('focus', refreshOnFocus)
    return () => {
      active = false
      window.clearInterval(intervalId)
      window.removeEventListener('focus', refreshOnFocus)
    }
  }, [userId])

  const markRead = useCallback(async (notificationId) => {
    try {
      await markNotificationRead(notificationId)
      setState((current) => ({
        ...current,
        error: '',
        notifications: current.notifications.map((item) => (
          item.id === notificationId ? { ...item, unread: false } : item
        )),
      }))
      return true
    } catch (error) {
      setState((current) => ({ ...current, error: getErrorMessage(error, 'Could not mark this notification as read.') }))
      return false
    }
  }, [])

  const markAllRead = useCallback(async () => {
    try {
      await markAllNotificationsRead()
      setState((current) => ({
        ...current,
        error: '',
        notifications: current.notifications.map((item) => ({ ...item, unread: false })),
      }))
      return true
    } catch (error) {
      setState((current) => ({ ...current, error: getErrorMessage(error, 'Could not mark notifications as read.') }))
      return false
    }
  }, [])

  const value = useMemo(() => ({
    notifications,
    unreadCount,
    error: isCurrentUserState ? state.error : '',
    isLoading: Boolean(user && !isCurrentUserState),
    markRead,
    markAllRead,
  }), [notifications, unreadCount, isCurrentUserState, state.error, user, markRead, markAllRead])

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>
}
