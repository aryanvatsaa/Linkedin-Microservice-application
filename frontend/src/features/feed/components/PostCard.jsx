import { useState } from 'react'
import { Avatar } from '../../../components/ui/Avatar'
import { Icon } from '../../../components/ui/Icon'

export default function PostCard({ post, onToggleLike, onToggleSave, onAddComment }) {
  const [commentsOpen, setCommentsOpen] = useState(false)
  const [commentDraft, setCommentDraft] = useState('')
  const [shareMessage, setShareMessage] = useState('')
  const comments = post.commentItems ?? []

  async function submitComment(event) {
    event.preventDefault()
    const text = commentDraft.trim()
    if (!text) return
    const succeeded = await onAddComment?.(post.id, text)
    if (succeeded === false) return
    setCommentDraft('')
    setCommentsOpen(true)
  }

  async function sharePost() {
    const url = `${window.location.origin}/home#${encodeURIComponent(post.id)}`

    try {
      if (navigator.share) {
        await navigator.share({ title: `${post.name} on Nexora`, url })
        setShareMessage('Link ready to share.')
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url)
        setShareMessage('Post link copied.')
      } else {
        setShareMessage('Sharing isn’t available in this browser.')
      }
    } catch (error) {
      if (error.name !== 'AbortError') setShareMessage('Could not share this post right now.')
    }
  }

  return (
    <article className="feed-post" id={post.id}>
      <div className="post-author-row">
        <Avatar initials={post.initials} tone={post.tone} />
        <div className="post-author-info">
          <strong>{post.name}</strong>
          <span>{post.role}</span>
          <span>{post.time} <span className="post-dot">·</span> <Icon name="globe" size={12} /></span>
        </div>
        <button className="post-more" aria-label={`More options for ${post.name}'s post`}>···</button>
      </div>
      <p className="post-content">{post.content}</p>
      {post.art && (
        <div className={`feed-art feed-art-${post.art}`}>
          <span>{post.artCaption}</span>
        </div>
      )}
      {post.imageUrl && <img className="post-image" src={post.imageUrl} alt="Image attached to this post" />}
      <div className="post-stats">
        <span><span className="like-dot">♥</span> {post.likes} appreciations</span>
        <button onClick={() => setCommentsOpen((open) => !open)} aria-expanded={commentsOpen}>
          {post.comments} comments
        </button>
      </div>
      <div className="post-divider" />
      <div className="post-actions">
        <button className={post.liked ? 'is-liked' : ''} onClick={() => onToggleLike(post.id)}>
          <Icon name="heart" size={18} /> Appreciate
        </button>
        <button onClick={() => setCommentsOpen((open) => !open)} aria-expanded={commentsOpen}>
          <Icon name="comment" size={18} /> Comment
        </button>
        {onToggleSave && (
          <button className={post.saved ? 'is-saved' : ''} onClick={() => onToggleSave(post.id)} aria-label={post.saved ? 'Remove from saved' : 'Save post'}>
            <Icon name="bookmark" size={18} /> <span className="save-label">{post.saved ? 'Saved' : 'Save'}</span>
          </button>
        )}
        <button onClick={sharePost}><Icon name="link" size={18} /> Share</button>
      </div>
      {shareMessage && <p className="post-share-status" role="status">{shareMessage}</p>}
      {commentsOpen && (
        <section className="post-comments" aria-label="Comments">
          {comments.map((comment) => (
            <div className="post-comment" key={comment.id}>
              <Avatar initials={comment.initials} tone={comment.tone} size="small" />
              <p><strong>{comment.name}</strong><span>{comment.text}</span></p>
            </div>
          ))}
          <form className="comment-form" onSubmit={submitComment}>
            <label className="sr-only" htmlFor={`comment-${post.id}`}>Write a comment</label>
            <input
              id={`comment-${post.id}`}
              value={commentDraft}
              onChange={(event) => setCommentDraft(event.target.value)}
              placeholder="Add a thoughtful comment..."
            />
            <button type="submit" disabled={!commentDraft.trim()}>Post</button>
          </form>
        </section>
      )}
    </article>
  )
}
