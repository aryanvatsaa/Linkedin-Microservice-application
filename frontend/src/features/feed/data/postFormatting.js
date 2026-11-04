function findAuthor(userId, directory) {
  return directory.find((person) => Number(person.id) === Number(userId))
}

export function formatPostTime(createdAtValue, now = Date.now()) {
  const createdAt = new Date(createdAtValue)
  if (Number.isNaN(createdAt.getTime())) return ''

  const elapsedMinutes = Math.max(0, Math.floor((now - createdAt.getTime()) / 60000))
  if (elapsedMinutes < 1) return 'Just now'
  if (elapsedMinutes < 60) return `${elapsedMinutes}m`
  if (elapsedMinutes < 1440) return `${Math.floor(elapsedMinutes / 60)}h`
  if (elapsedMinutes < 10080) return `${Math.floor(elapsedMinutes / 1440)}d`
  return createdAt.toLocaleDateString()
}

export function formatComment(comment, user, directory = []) {
  const isOwnComment = Number(comment.userId) === Number(user.id)
  const author = findAuthor(comment.userId, directory)
  const name = isOwnComment ? user.name : comment.authorName || author?.name || `Nexora member ${comment.userId}`
  return {
    ...comment,
    name,
    initials: name.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase(),
    imageUrl: isOwnComment ? user.profilePhotoUrl : author?.profilePhotoUrl,
    tone: 'sage',
    text: comment.content || '',
  }
}

export function formatPost(post, user, directory = []) {
  const isOwnPost = Number(post.userId) === Number(user.id)
  const author = findAuthor(post.userId, directory)
  const name = isOwnPost ? user.name : post.authorName || author?.name || `Nexora member ${post.userId}`
  const initials = name.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase()
  const commentItems = (post.commentItems ?? []).map((comment) => formatComment(comment, user, directory))
  const headline = isOwnPost ? user.headline : post.authorHeadline || author?.headline
  return {
    ...post,
    id: String(post.id),
    name,
    initials,
    imageUrl: isOwnPost ? user.profilePhotoUrl : author?.profilePhotoUrl,
    tone: 'sage',
    role: headline || (isOwnPost ? 'Your community' : 'In your community'),
    time: formatPostTime(post.createdAt),
    content: post.content || '',
    likes: post.likes || 0,
    comments: Number(post.comments) || commentItems.length,
    liked: Boolean(post.liked),
    commentItems,
    saved: Boolean(post.saved),
  }
}
