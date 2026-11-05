import { useEffect, useState } from 'react'
import { Avatar } from '../../../components/ui/Avatar'
import { Icon } from '../../../components/ui/Icon'
import { useToast } from '../../../app/useToast'
import { useAuth } from '../../auth/data/useAuth'
import { formatPostTime } from '../data/postFormatting'

export default function PostCard({ post, onToggleLike, onToggleSave, onAddComment, onDelete }) {
  const { user } = useAuth()
  const notify = useToast()
  const [now, setNow] = useState(0)
  const [commentsOpen, setCommentsOpen] = useState(false)
  const [commentDraft, setCommentDraft] = useState('')
  const [shareMessage, setShareMessage] = useState('')
  const comments = post.commentItems ?? []
  const postTime = post.createdAt && now ? formatPostTime(post.createdAt, now) : post.time

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 60000)
    return () => window.clearInterval(interval)
  }, [])

  async function submitComment(event) {
    event.preventDefault()
    const text = commentDraft.trim()
    if (!text) return
    notify('Posting your comment…', 'loading')
    try {
      const succeeded = await onAddComment?.(post.id, text)
      if (succeeded === false) {
        notify('Your comment could not be posted. Please try again.', 'error')
        return
      }
      setCommentDraft('')
      setCommentsOpen(true)
      notify('Your comment was posted.')
    } catch {
      notify('Your comment could not be posted. Please try again.', 'error')
    }
  }

  async function toggleLike() {
    const isAppreciating = !post.liked
    notify(isAppreciating ? 'Sending your appreciation…' : 'Updating your appreciation…', 'loading')
    try {
      const succeeded = await onToggleLike?.(post.id)
      notify(succeeded === false
        ? 'Could not update this appreciation. Please try again.'
        : isAppreciating ? 'You appreciated this post.' : 'Appreciation removed.',
      succeeded === false ? 'error' : 'success')
    } catch {
      notify('Could not update this appreciation. Please try again.', 'error')
    }
  }

  async function toggleSave() {
    const isSaving = !post.saved
    notify(isSaving ? 'Saving this post…' : 'Removing this saved post…', 'loading')
    try {
      const succeeded = await onToggleSave?.(post.id)
      notify(succeeded === false
        ? 'Could not update your saved posts. Please try again.'
        : isSaving ? 'Post saved.' : 'Post removed from saved posts.',
      succeeded === false ? 'error' : 'success')
    } catch {
      notify('Could not update your saved posts. Please try again.', 'error')
    }
  }

  async function removePost() {
    if (!window.confirm('Delete this post? This action cannot be undone.')) return

    notify('Deleting your post…', 'loading')
    try {
      const succeeded = await onDelete?.(post.id)
      notify(succeeded === false
        ? 'Your post could not be deleted. Please try again.'
        : 'Your post was deleted.',
      succeeded === false ? 'error' : 'success')
    } catch {
      notify('Your post could not be deleted. Please try again.', 'error')
    }
  }

  async function sharePost() {
    const url = `${window.location.origin}/home#${encodeURIComponent(post.id)}`

    try {
      if (navigator.share) {
        await navigator.share({ title: `${post.name} on Nexora`, url })
        setShareMessage('Link ready to share.')
        notify('Post link shared.')
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url)
        setShareMessage('Post link copied.')
        notify('Post link copied.')
      } else {
        setShareMessage('Sharing isn’t available in this browser.')
        notify('Sharing isn’t available in this browser.', 'error')
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        setShareMessage('Could not share this post right now.')
        notify('Could not share this post right now.', 'error')
      }
    }
  }

  return (
    <article className="feed-post" id={post.id}>
      <div className="post-author-row">
        <Avatar initials={post.initials} imageUrl={post.imageUrl} tone={post.tone} />
        <div className="post-author-info">
          <strong>{post.name}</strong>
          <span>{post.role}</span>
          <span>{postTime} <span className="post-dot">·</span> <Icon name="globe" size={12} /></span>
        </div>
        {onDelete && Number(post.userId) === Number(user?.id) ? (
          <button className="post-delete-button" onClick={removePost} aria-label="Delete your post">Delete</button>
        ) : (
          <button className="post-more" aria-label={`More options for ${post.name}'s post`}>···</button>
        )}
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
        <button className={post.liked ? 'is-liked' : ''} onClick={toggleLike}>
          <Icon name="heart" size={18} /> Appreciate
        </button>
        <button onClick={() => setCommentsOpen((open) => !open)} aria-expanded={commentsOpen}>
          <Icon name="comment" size={18} /> Comment
        </button>
        {onToggleSave && (
          <button className={post.saved ? 'is-saved' : ''} onClick={toggleSave} aria-label={post.saved ? 'Remove from saved' : 'Save post'}>
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
              <Avatar initials={comment.initials} imageUrl={comment.imageUrl} tone={comment.tone} size="small" />
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
