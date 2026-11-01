import apiClient from '../../../api/apiClient'

export async function getProfile() {
  const { data } = await apiClient.get('/users/profile')
  return data
}

export async function updateProfile(profile) {
  const { data } = await apiClient.put('/users/profile', profile)
  return data
}
