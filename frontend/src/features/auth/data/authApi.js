import apiClient from '../../../api/apiClient'

export async function signUp(credentials) {
  const { data } = await apiClient.post('/users/auth/signup', credentials)
  return data
}

export async function signIn(credentials) {
  const { data } = await apiClient.post('/users/auth/login', credentials)
  return data
}
