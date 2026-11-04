import apiClient from '../../../api/apiClient'

export async function getFeed(scope = 'for-you') {
  const { data } = await apiClient.get('/posts/core/feed', { params: { scope } })
  return data
}

export async function createPost(content, file) {
  const payload = new FormData()
  payload.append('post', new Blob([JSON.stringify({ content })], { type: 'application/json' }))
  if (file) payload.append('file', file)

  const { data } = await apiClient.post('/posts/core', payload)
  return data
}

export async function setPostLiked(postId, liked) {
  const method = liked ? 'post' : 'delete'
  await apiClient[method](`/posts/likes/${postId}`)
}

export async function createComment(postId, content) {
  const { data } = await apiClient.post(`/posts/comments/${postId}`, { content })
  return data
}

export async function getSavedPosts() {
  const { data } = await apiClient.get('/posts/saved')
  return data
}

export async function setPostSaved(postId, saved) {
  const method = saved ? 'post' : 'delete'
  await apiClient[method](`/posts/saved/${postId}`)
}
