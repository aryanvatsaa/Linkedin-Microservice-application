import apiClient from '../../../api/apiClient'

export async function getNotifications() {
  const { data } = await apiClient.get('/notifications/core')
  return data
}

export async function markNotificationRead(notificationId) {
  await apiClient.patch(`/notifications/core/${notificationId}/read`)
}

export async function markAllNotificationsRead() {
  await apiClient.patch('/notifications/core/read-all')
}
