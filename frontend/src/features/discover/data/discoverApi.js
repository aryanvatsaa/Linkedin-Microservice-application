import apiClient from '../../../api/apiClient'

export async function getDirectory() {
  const { data } = await apiClient.get('/users/directory')
  return data
}

export async function getConnections() {
  const { data } = await apiClient.get('/connections/core/me')
  return data
}

export async function getOutgoingRequests() {
  const { data } = await apiClient.get('/connections/core/requests/outgoing')
  return data
}

export async function getIncomingRequests() {
  const { data } = await apiClient.get('/connections/core/requests/incoming')
  return data
}

export async function sendConnectionRequest(userId) {
  await apiClient.post(`/connections/core/request/${userId}`)
}
