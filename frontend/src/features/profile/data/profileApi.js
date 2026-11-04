import apiClient from '../../../api/apiClient'

export async function getProfile() {
  const { data } = await apiClient.get('/users/profile')
  return data
}

export async function updateProfile(profile) {
  const { data } = await apiClient.put('/users/profile', profile)
  return data
}

export async function uploadProfilePhoto(file) {
  const payload = new FormData()
  payload.append('file', file)
  const { data } = await apiClient.post('/uploads/file', payload)
  return data
}

export async function updateProfilePhoto(profilePhotoUrl) {
  const { data } = await apiClient.patch('/users/profile/photo', { profilePhotoUrl })
  return data
}
