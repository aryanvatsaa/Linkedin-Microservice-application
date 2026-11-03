import { useEffect, useState } from 'react'
import AppHeader from '../../../components/layout/AppHeader'
import AppSidebar from '../../../components/layout/AppSidebar'
import { Icon } from '../../../components/ui/Icon'
import PostCard from '../../feed/components/PostCard'
import { useFeed } from '../../feed/data/useFeed'
import { createComment, getSavedPosts, setPostLiked, setPostSaved } from '../../feed/data/postsApi'
import { formatComment, formatPost } from '../../feed/data/postFormatting'
import { useAuth } from '../../auth/data/useAuth'

export default function SavedPage() {
  const { user } = useAuth()
  const { setPosts, directory } = useFeed()
  const [savedPosts, setSavedPosts] = useState([])
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let active = true
    getSavedPosts()
      .then((items) => {
        if (active) setSavedPosts(items.map((post) => formatPost(post, user, directory)))
      })
      .catch((requestError) => {
        if (active) setError(requestError.response?.data?.error || 'Could not load your saved posts.')
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })
    return () => { active = false }
  }, [user, directory])

  function updatePosts(postId, update) {
    setPosts((current) => current.map((post) => post.id === postId ? { ...post, ...update } : post))
  }

  async function removeSavedPost(postId) {
    try {
      await setPostSaved(postId, false)
      setSavedPosts((current) => current.filter((post) => post.id !== postId))
    } catch (requestError) {
      setError(requestError.response?.data?.error || 'Could not remove this saved post.')
      return false
    }
    updatePosts(postId, { saved: false })
    return true
  }

  async function toggleLike(postId) {
    const post = savedPosts.find((item) => item.id === postId)
    if (!post) return
    try {
      await setPostLiked(postId, !post.liked)
      const update = { liked: !post.liked, likes: post.likes + (post.liked ? -1 : 1) }
      updatePosts(postId, update)
      setSavedPosts((current) => current.map((item) => item.id === postId ? { ...item, ...update } : item))
      return true
    } catch (requestError) {
      setError(requestError.response?.data?.error || 'Could not update this appreciation.')
      return false
    }
  }

  async function addComment(postId, text) {
    try {
      const comment = formatComment(await createComment(postId, text), user, directory)
      const updatePost = (post) => post.id === postId
        ? { ...post, commentItems: [...(post.commentItems ?? []), comment], comments: (post.comments ?? 0) + 1 }
        : post
      setPosts((current) => current.map(updatePost))
      setSavedPosts((current) => current.map(updatePost))
      return true
    } catch (requestError) {
      setError(requestError.response?.data?.error || 'Could not post this comment.')
      return false
    }
  }

  return (
    <div className="app-shell">
      <AppHeader />
      <div className="app-layout">
        <AppSidebar />
        <main className="social-column">
          <div className="social-page-heading">
            <div><span className="section-kicker">KEEP THE GOOD ONES CLOSE</span><h1>Saved posts</h1><p>Little ideas and conversations you wanted to come back to.</p></div>
          </div>
          {error && <p className="composer-error" role="alert">{error}</p>}
          {isLoading && <p role="status">Loading your saved posts…</p>}
          {savedPosts.length ? (
            <section className="saved-posts-list">
              {savedPosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onToggleLike={toggleLike}
                  onToggleSave={removeSavedPost}
                  onAddComment={addComment}
                />
              ))}
            </section>
          ) : (
            !isLoading && <div className="social-empty saved-empty">
              <span><Icon name="bookmark" size={20} /></span>
              <strong>Nothing saved just yet</strong>
              <p>Save a post when you come across something you want to revisit.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
