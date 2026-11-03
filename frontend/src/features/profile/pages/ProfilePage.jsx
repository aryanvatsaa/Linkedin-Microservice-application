import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router'
import AppHeader from '../../../components/layout/AppHeader'
import AppSidebar from '../../../components/layout/AppSidebar'
import { Avatar } from '../../../components/ui/Avatar'
import { Icon } from '../../../components/ui/Icon'
import PostCard from '../../feed/components/PostCard'
import { useAuth } from '../../auth/data/useAuth'
import { useFeed } from '../../feed/data/useFeed'
import { getProfile, updateProfile } from '../data/profileApi'
import { getConnections } from '../../connections/data/connectionsApi'
import { createComment, setPostLiked } from '../../feed/data/postsApi'
import { formatComment } from '../../feed/data/postFormatting'
import { useToast } from '../../../app/useToast'

export default function ProfilePage() {
  const { user, updateUser } = useAuth()
  const { posts, setPosts, directory } = useFeed()
  const notify = useToast()
  const [profile, setProfile] = useState({
    name: user.name,
    email: user.email,
    headline: user.headline || '',
    about: user.about || '',
    location: user.location || '',
    interests: user.interests || [],
    connectionCount: 0,
  })
  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState(profile)
  const [error, setError] = useState('')
  const [status, setStatus] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const initials = profile.name.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase()
  const completion = Math.round([
    profile.name,
    profile.headline,
    profile.about,
    profile.location,
    profile.interests.length ? 'interests' : '',
  ].filter(Boolean).length / 5 * 100)
  const profilePosts = useMemo(
    () => posts.filter((post) => Number(post.userId) === Number(user.id)),
    [posts, user.id],
  )

  useEffect(() => {
    let active = true
    Promise.all([getProfile(), getConnections()])
      .then(([serverProfile, connections]) => {
        if (!active) return
        const nextProfile = { ...serverProfile, connectionCount: connections.length }
        setProfile(nextProfile)
        setDraft(nextProfile)
        updateUser(serverProfile)
      })
      .catch((requestError) => {
        if (active) setError(requestError.response?.data?.error || 'Could not load your profile.')
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })
    return () => { active = false }
  }, [updateUser])

  async function saveProfile(event) {
    event.preventDefault()
    setError('')
    setStatus('')
    setIsSaving(true)
    notify('Saving your profile…', 'loading')
    try {
      const savedProfile = await updateProfile({
        name: draft.name,
        headline: draft.headline,
        about: draft.about,
        location: draft.location,
        interests: Array.isArray(draft.interests) ? draft.interests : draft.interests.split(','),
      })
      const nextProfile = { ...savedProfile, connectionCount: profile.connectionCount }
      setProfile(nextProfile)
      setDraft(nextProfile)
      updateUser(savedProfile)
      setIsEditing(false)
      setStatus('Your profile has been updated.')
      notify('Your profile has been updated.')
    } catch (requestError) {
      const message = requestError.response?.data?.error || 'Could not save your profile. Please try again.'
      setError(message)
      notify(message, 'error')
    } finally {
      setIsSaving(false)
    }
  }

  function cancelEdit() {
    setDraft(profile)
    setIsEditing(false)
  }

  async function toggleLike(postId) {
    const post = posts.find((item) => item.id === postId)
    if (!post) return
    try {
      await setPostLiked(postId, !post.liked)
      setPosts((currentPosts) => currentPosts.map((item) => item.id === postId
        ? { ...item, liked: !item.liked, likes: item.likes + (item.liked ? -1 : 1) }
        : item))
      return true
    } catch (requestError) {
      setError(requestError.response?.data?.error || 'Could not update this appreciation.')
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
        <main className="profile-column">
          {error && <p className="composer-error" role="alert">{error}</p>}
          {status && <p role="status">{status}</p>}
          {isLoading && <p role="status">Loading your profile…</p>}
          <section className="profile-card">
            <div className="profile-cover">
              <span className="cover-orbit cover-orbit-one" />
              <span className="cover-orbit cover-orbit-two" />
              <span className="cover-sun" />
              <span className="cover-caption">MAKE ROOM<br />FOR WHAT'S NEXT</span>
            </div>
            <div className="profile-main">
              <div className="profile-identity">
                <Avatar initials={initials} tone="sage" size="profile" />
                <div className="profile-actions">
                  <button className="profile-edit-button" onClick={() => setIsEditing(true)}>
                    <Icon name="edit" size={15} /> Edit profile
                  </button>
                </div>
              </div>
              {isEditing ? (
                <form className="profile-edit-form" onSubmit={saveProfile}>
                  <label>
                    Name
                    <input
                      value={draft.name}
                      onChange={(event) => setDraft({ ...draft, name: event.target.value })}
                      required
                    />
                  </label>
                  <label>
                    Headline
                    <input
                      value={draft.headline || ''}
                      onChange={(event) => setDraft({ ...draft, headline: event.target.value })}
                    />
                  </label>
                  <label>
                    Location
                    <input
                      value={draft.location || ''}
                      onChange={(event) => setDraft({ ...draft, location: event.target.value })}
                    />
                  </label>
                  <label>
                    About
                    <textarea
                      rows="4"
                      value={draft.about || ''}
                      onChange={(event) => setDraft({ ...draft, about: event.target.value })}
                    />
                  </label>
                  <label>
                    Interests (comma-separated)
                    <input
                      value={(draft.interests || []).join(', ')}
                      onChange={(event) => setDraft({ ...draft, interests: event.target.value.split(',') })}
                    />
                  </label>
                  <div className="profile-edit-actions">
                    <button className="button button-dark" type="submit" disabled={isSaving}>{isSaving ? 'Saving…' : 'Save changes'}</button>
                    <button className="profile-cancel-button" type="button" onClick={cancelEdit}>Cancel</button>
                  </div>
                </form>
              ) : (
                <>
                  <h1>{profile.name}</h1>
                  <p className="profile-role">{profile.headline || 'Welcome to your Nexora profile.'}</p>
                  <p className="profile-location"><Icon name="map" size={15} /> {profile.location || 'Add your location'} <span>·</span> <a href="#profile-network">{profile.connectionCount} connections</a></p>
                  <div className="profile-completion">
                    <div><strong>{completion === 100 ? 'Your profile is looking good' : `Profile ${completion}% complete`}</strong><span>A little more detail helps people find you.</span></div>
                    <span className="completion-track"><i style={{ width: `${completion}%` }} /></span>
                  </div>
                </>
              )}
            </div>
          </section>

          {!isEditing && (
            <>
              <section className="profile-info-card">
                <div className="profile-section-heading">
                  <div><span className="section-kicker">A LITTLE ABOUT ME</span><h2>About</h2></div>
                  <button className="subtle-icon-button" aria-label="Edit about section" onClick={() => setIsEditing(true)}><Icon name="edit" size={16} /></button>
                </div>
                <p className="profile-about">{profile.about || 'Add a few words to introduce yourself to your community.'}</p>
              </section>
              <section className="profile-info-card" id="profile-network">
                <div className="profile-section-heading">
                  <div><span className="section-kicker">THINGS I LIKE TO TALK ABOUT</span><h2>Interests</h2></div>
                </div>
                <div className="interest-list">
                  {profile.interests.map((interest) => <span key={interest}>{interest}</span>)}
                </div>
              </section>
              <section className="profile-posts">
                <div className="profile-section-heading profile-post-heading">
                  <div><span className="section-kicker">NOTES FROM MY CORNER</span><h2>Recent activity</h2></div>
                  <span className="profile-post-count">{profilePosts.length} posts</span>
                </div>
                {profilePosts.map((post) => <PostCard key={post.id} post={post} onToggleLike={toggleLike} onAddComment={addComment} />)}
                {!profilePosts.length && <p className="social-no-results">Your shared posts will appear here.</p>}
              </section>
            </>
          )}
        </main>
        <aside className="right-rail profile-rail">
          <section className="rail-card profile-connections-card">
            <span className="section-kicker">YOUR NETWORK</span>
            <h2>Good connections<br />make good things happen.</h2>
            <div className="connection-stat"><Icon name="users" size={19} /><strong>{profile.connectionCount}</strong><span>people in your network</span></div>
            <Link className="rail-text-link" to="/connections">See your connections <Icon name="arrow" size={14} /></Link>
          </section>
          <section className="rail-card profile-visibility-card">
            <div className="visibility-icon"><Icon name="globe" size={18} /></div>
            <strong>Your profile, your pace.</strong>
            <p>Your profile details help your Nexora community get to know you.</p>
          </section>
          <div className="rail-footer"><a href="#about">About</a><a href="#about">Community guidelines</a><a href="#about">Privacy</a><span>© 2026 Nexora</span></div>
        </aside>
      </div>
    </div>
  )
}
