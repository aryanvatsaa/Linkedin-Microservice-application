import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import AppHeader from '../../../components/layout/AppHeader'
import AppSidebar from '../../../components/layout/AppSidebar'
import { Avatar } from '../../../components/ui/Avatar'
import { Icon } from '../../../components/ui/Icon'
import PostCard from '../components/PostCard'
import { getConnections, getOutgoingRequests, sendConnectionRequest } from '../../discover/data/discoverApi'
import { useFeed } from '../data/useFeed'
import { useAuth } from '../../auth/data/useAuth'
import { createComment, createPost, setPostLiked, setPostSaved } from '../data/postsApi'
import { formatComment, formatPost } from '../data/postFormatting'
import { useToast } from '../../../app/useToast'

export default function HomePage() {
  const { posts, setPosts, isLoading, loadError, setLoadError, directory } = useFeed()
  const { user } = useAuth()
  const notify = useToast()
  const [draft, setDraft] = useState('')
  const [imagePreviewUrl, setImagePreviewUrl] = useState('')
  const [selectedImageFile, setSelectedImageFile] = useState(null)
  const [composerError, setComposerError] = useState('')
  const [suggestedPeople, setSuggestedPeople] = useState([])
  const [connectionError, setConnectionError] = useState('')

  useEffect(() => {
    let active = true
    Promise.all([getConnections(), getOutgoingRequests()])
      .then(([connections, outgoing]) => {
        const unavailableIds = new Set([
          ...connections.map((person) => person.userId),
          ...outgoing.map((person) => person.userId),
        ])
        if (active) setSuggestedPeople(directory
          .filter((person) => !unavailableIds.has(person.id))
          .slice(0, 3)
          .map((person) => ({
            ...person,
            initials: person.name.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase(),
            tone: 'sage',
            role: person.headline || 'Nexora member',
          })))
      })
      .catch((error) => {
        if (active) setConnectionError(error.response?.data?.error || 'Could not load suggestions.')
      })
    return () => { active = false }
  }, [directory])

  async function publishPost(event) {
    event.preventDefault()
    const content = draft.trim()
    if (!content && !imagePreviewUrl) return

    setComposerError('')
    notify(selectedImageFile ? 'Uploading your image and sharing the post…' : 'Sharing your post…', 'loading')
    try {
      const post = await createPost(content, selectedImageFile)
      setPosts((currentPosts) => [formatPost(post, user, directory), ...currentPosts])
      setDraft('')
      setImagePreviewUrl('')
      setSelectedImageFile(null)
      notify('Your post was shared.')
    } catch (error) {
      const message = error.response?.data?.error || error.response?.data?.message || 'Your post could not be shared. Please try again.'
      setComposerError(message)
      notify(message, 'error')
    }
  }

  async function toggleLike(postId) {
    const post = posts.find((item) => item.id === postId)
    if (!post) return

    try {
      await setPostLiked(postId, !post.liked)
      setPosts((currentPosts) => currentPosts.map((item) => (
        item.id === postId
          ? { ...item, liked: !item.liked, likes: item.likes + (item.liked ? -1 : 1) }
          : item
      )))
      return true
    } catch (error) {
      setLoadError(error.response?.data?.error || error.response?.data?.message || 'Your appreciation could not be saved. Please try again.')
      return false
    }
  }

  async function toggleSave(postId) {
    const post = posts.find((item) => item.id === postId)
    if (!post) return
    try {
      await setPostSaved(postId, !post.saved)
      setPosts((currentPosts) => currentPosts.map((item) =>
        item.id === postId ? { ...item, saved: !post.saved } : item,
      ))
      return true
    } catch (error) {
      setLoadError(error.response?.data?.error || error.response?.data?.message || 'This post could not be saved. Please try again.')
      return false
    }
  }

  async function addComment(postId, text) {
    try {
      const comment = await createComment(postId, text)
      setPosts((currentPosts) => currentPosts.map((post) => post.id === postId
        ? {
            ...post,
            commentItems: [...(post.commentItems ?? []), formatComment(comment, user, directory)],
            comments: (post.comments ?? 0) + 1,
          }
        : post))
      return true
    } catch (error) {
      setLoadError(error.response?.data?.error || error.response?.data?.message || 'Your comment could not be posted. Please try again.')
      return false
    }
  }

  function attachImage(event) {
    const [file] = event.target.files ?? []
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setComposerError('Choose an image file to attach.')
      event.target.value = ''
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setComposerError('That image is a little large. Choose one under 5 MB.')
      event.target.value = ''
      return
    }
    setSelectedImageFile(file)
    const reader = new FileReader()
    reader.addEventListener('load', () => {
      if (typeof reader.result === 'string') {
        setImagePreviewUrl(reader.result)
        setComposerError('')
      }
      event.target.value = ''
    }, { once: true })
    reader.addEventListener('error', () => {
      setComposerError('We couldn’t read that image. Please try another one.')
      setSelectedImageFile(null)
      event.target.value = ''
    }, { once: true })
    reader.readAsDataURL(file)
  }

  function removeImage() {
    setImagePreviewUrl('')
    setSelectedImageFile(null)
  }

  async function requestConnection(personId) {
    notify('Sending connection request…', 'loading')
    try {
      await sendConnectionRequest(personId)
      setSuggestedPeople((current) => current.filter((person) => person.id !== personId))
      notify('Connection request sent.')
    } catch (error) {
      const message = error.response?.data?.error || 'Could not send this connection request.'
      setConnectionError(message)
      notify(message, 'error')
    }
  }

  return (
    <div className="app-shell">
      <AppHeader />
      <div className="app-layout">
        <AppSidebar />

        <main className="feed-column" id="feed-composer">
          <div className="feed-heading">
            <div><span className="section-kicker">YOUR LITTLE CORNER OF NEXORA</span><h1>Your community</h1></div>
            <button className="feed-filter">For you <span>⌄</span></button>
          </div>
          <form className="composer-card" onSubmit={publishPost}>
            <div className="composer-top">
              <Avatar initials={user.name.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase()} tone="sage" />
              <label className="sr-only" htmlFor="post-draft">Share an idea with your community</label>
              <textarea
                id="post-draft"
                placeholder={`What’s on your mind, ${user.name.split(' ')[0]}?`}
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                rows="2"
              />
            </div>
            {imagePreviewUrl && (
              <div className="composer-image-preview">
                <img src={imagePreviewUrl} alt="Selected image preview" />
                <button type="button" onClick={removeImage} aria-label="Remove selected image"><Icon name="x" size={17} /></button>
              </div>
            )}
            {composerError && <p className="composer-error" role="alert">{composerError}</p>}
            <div className="composer-bottom">
              <div className="composer-tools">
                <label className="composer-file-label">
                  <Icon name="image" size={18} /> Photo
                  <input type="file" accept="image/*" onChange={attachImage} />
                </label>
                <button type="button"><Icon name="sparkle" size={18} /> Celebrate</button>
              </div>
              <button className="button button-dark composer-submit" type="submit" disabled={!draft.trim() && !imagePreviewUrl}>
                Share <Icon name="arrow" size={15} />
              </button>
            </div>
          </form>
          {loadError && <p className="composer-error" role="alert">{loadError}</p>}
          <div className="feed-notice"><span><Icon name="sparkle" size={15} /></span> A little inspiration from your corner of Nexora</div>
          <div className="posts-list">
            {isLoading && <p role="status">Loading your community posts…</p>}
            {!isLoading && !loadError && posts.length === 0 && (
              <p className="feed-notice">No posts yet. Share the first thought with your community.</p>
            )}
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onToggleLike={toggleLike}
                onToggleSave={toggleSave}
                onAddComment={addComment}
              />
            ))}
          </div>
        </main>

        <aside className="right-rail">
          <section className="rail-card welcome-card">
            <div className="welcome-graphic"><span /><span /><span /></div>
            <span className="section-kicker">A PLACE TO GROW</span>
            <h2>Good to have<br />you here, {user.name.split(' ')[0]}.</h2>
            <p>Your Nexora community is just getting started. Say hello, share an idea, see what grows.</p>
            <div className="welcome-progress"><span /><span>Profile basics <strong>2 of 3</strong></span></div>
            <Link className="rail-text-link" to="/profile">Finish your profile <Icon name="arrow" size={14} /></Link>
          </section>
          <section className="rail-card people-card">
            <div className="rail-heading"><div><span className="section-kicker">YOUR NEXT HELLO</span><h3>People to know</h3></div><Link to="/discover" aria-label="See all suggested people"><Icon name="arrow" size={17} /></Link></div>
            {connectionError && <p className="composer-error" role="alert">{connectionError}</p>}
            {suggestedPeople.map((person) => (
              <div className="suggested-person" key={person.name}>
                <Avatar initials={person.initials} tone={person.tone} />
                <div className="suggested-info"><strong>{person.name}</strong><span>{person.role}</span></div>
                <button
                  className="connect-button"
                  aria-label={`Connect with ${person.name}`}
                  onClick={() => requestConnection(person.id)}
                >
                  <Icon name="plus" size={17} />
                </button>
              </div>
            ))}
            <Link className="rail-text-link" to="/discover">Meet more people <Icon name="arrow" size={14} /></Link>
          </section>
          <div className="rail-footer"><a href="#about">About</a><a href="#about">Community guidelines</a><a href="#about">Privacy</a><span>© 2026 Nexora</span></div>
        </aside>
      </div>
    </div>
  )
}
