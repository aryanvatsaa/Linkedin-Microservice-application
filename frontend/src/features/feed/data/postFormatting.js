export function formatComment(comment, user) {
  const isOwnComment = Number(comment.userId) === Number(user.id)
  const name = isOwnComment ? user.name : `Nexora member ${comment.userId}`
  return {
    ...comment,
    name,
    initials: name.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase(),
    tone: 'sage',
    text: comment.content || '',
  }
}

export function formatPost(post, user) {
  const isOwnPost = Number(post.userId) === Number(user.id)
  const name = isOwnPost ? user.name : post.authorName || `Nexora member ${post.userId}`
  const createdAt = new Date(post.createdAt)
  const elapsedHours = Math.max(0, Math.floor((Date.now() - createdAt.getTime()) / 3600000))
  const initials = name.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase()
  const commentItems = (post.commentItems ?? []).map((comment) => formatComment(comment, user))
  return {
    ...post,
    id: String(post.id),
    name,
    initials,
    tone: 'sage',
    role: isOwnPost ? user.headline || 'Your community' : post.authorHeadline || 'In your community',
    time: Number.isNaN(createdAt.getTime()) ? '' : elapsedHours < 1 ? 'Just now' : `${elapsedHours}h`,
    content: post.content || '',
    likes: post.likes || 0,
    comments: Number(post.comments) || commentItems.length,
    liked: Boolean(post.liked),
    commentItems,
    saved: Boolean(post.saved),
  }
}
