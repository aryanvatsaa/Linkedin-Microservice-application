import apiClient from '../../../api/apiClient'

export async function getConnections() {
  const { data } = await apiClient.get('/connections/core/me')
  return data
}

export async function getIncomingRequests() {
  const { data } = await apiClient.get('/connections/core/requests/incoming')
  return data
}

export async function getOutgoingRequests() {
  const { data } = await apiClient.get('/connections/core/requests/outgoing')
  return data
}

export async function cancelOutgoingRequest(userId) {
  await apiClient.delete(`/connections/core/requests/outgoing/${userId}`)
}

export async function acceptConnectionRequest(userId) {
  await apiClient.post(`/connections/core/accept/${userId}`)
}

export async function rejectConnectionRequest(userId) {
  await apiClient.post(`/connections/core/reject/${userId}`)
}

export async function removeConnection(userId) {
  await apiClient.delete(`/connections/core/${userId}`)
}
