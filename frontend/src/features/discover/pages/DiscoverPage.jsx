import { useEffect, useMemo, useState } from 'react'
import AppHeader from '../../../components/layout/AppHeader'
import AppSidebar from '../../../components/layout/AppSidebar'
import { Avatar } from '../../../components/ui/Avatar'
import { Icon } from '../../../components/ui/Icon'
import PostCard from '../../feed/components/PostCard'
import { useFeed } from '../../feed/data/useFeed'
import {
  getConnections,
  getDirectory,
  getIncomingRequests,
  getOutgoingRequests,
  sendConnectionRequest,
} from '../data/discoverApi'
import { createComment, setPostLiked, setPostSaved } from '../../feed/data/postsApi'
import { formatComment } from '../../feed/data/postFormatting'
import { useAuth } from '../../auth/data/useAuth'

export default function DiscoverPage() {
  const { user } = useAuth()
  const [query, setQuery] = useState('')
  const [activeTab, setActiveTab] = useState('people')
  const [people, setPeople] = useState([])
  const [connectedIds, setConnectedIds] = useState([])
  const [pendingIds, setPendingIds] = useState([])
  const [incomingIds, setIncomingIds] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const { posts, setPosts } = useFeed()

  useEffect(() => {
    let active = true
    Promise.all([getDirectory(), getConnections(), getOutgoingRequests(), getIncomingRequests()])
      .then(([directory, connections, outgoing, incoming]) => {
        if (!active) return
        setPeople(directory.map((person) => ({
          ...person,
          id: person.id,
          initials: person.name.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase(),
          tone: 'sage',
          role: person.headline || 'Nexora member',
        })))
        setConnectedIds(connections.map((person) => person.userId))
        setPendingIds(outgoing.map((person) => person.userId))
        setIncomingIds(incoming.map((person) => person.userId))
      })
      .catch((requestError) => {
        if (active) setError(requestError.response?.data?.error || 'Could not load discovery right now.')
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })
    return () => { active = false }
  }, [])

  const filteredPeople = useMemo(() => people.filter((person) =>
      `${person.name} ${person.role}`.toLowerCase().includes(query.toLowerCase()),
  ), [people, query])
  const filteredPosts = useMemo(
    () => posts.filter((post) => `${post.name} ${post.content}`.toLowerCase().includes(query.toLowerCase())),
    [posts, query],
  )

  async function requestConnection(personId) {
    try {
      await sendConnectionRequest(personId)
      setPendingIds((current) => [...current, personId])
    } catch (requestError) {
      setError(requestError.response?.data?.error || 'Could not send this connection request.')
    }
  }

  async function toggleLike(postId) {
    const post = posts.find((item) => item.id === postId)
    if (!post) return
    try {
      await setPostLiked(postId, !post.liked)
      setPosts((current) => current.map((item) => item.id === postId
        ? { ...item, liked: !item.liked, likes: item.likes + (item.liked ? -1 : 1) }
        : item))
    } catch (requestError) {
      setError(requestError.response?.data?.error || 'Could not update this appreciation.')
    }
  }

  async function toggleSave(postId) {
    const post = posts.find((item) => item.id === postId)
    if (!post) return
    try {
      await setPostSaved(postId, !post.saved)
      setPosts((current) => current.map((item) => item.id === postId ? { ...item, saved: !post.saved } : item))
    } catch (requestError) {
      setError(requestError.response?.data?.error || 'Could not save this post.')
    }
  }

  async function addComment(postId, text) {
    try {
      const comment = await createComment(postId, text)
      setPosts((current) => current.map((post) => post.id === postId
        ? {
            ...post,
            commentItems: [...(post.commentItems ?? []), formatComment(comment, user)],
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
        <main className="social-column discover-column">
          <div className="social-page-heading">
            <div><span className="section-kicker">A FEW NEW THINGS TO FIND</span><h1>Discover</h1><p>Interesting people and ideas from around Nexora.</p></div>
          </div>
          <label className="discover-search"><Icon name="search" size={19} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Try a name, an interest, or an idea" aria-label="Search people and posts" /><span>⌘ K</span></label>
          {error && <p className="composer-error" role="alert">{error}</p>}
          {isLoading && <p role="status">Finding your Nexora community…</p>}
          <div className="discover-tabs" role="tablist" aria-label="Discover category">
            <button className={activeTab === 'people' ? 'discover-tab active' : 'discover-tab'} role="tab" aria-selected={activeTab === 'people'} onClick={() => setActiveTab('people')}>People <span>{filteredPeople.length}</span></button>
            <button className={activeTab === 'posts' ? 'discover-tab active' : 'discover-tab'} role="tab" aria-selected={activeTab === 'posts'} onClick={() => setActiveTab('posts')}>Posts <span>{filteredPosts.length}</span></button>
          </div>
          {activeTab === 'people' ? (
            <section className="discover-people-grid">
              {filteredPeople.length ? filteredPeople.map((person) => {
                const connected = connectedIds.includes(person.id)
                const pending = pendingIds.includes(person.id)
                const requestedYou = incomingIds.includes(person.id)
                return (
                  <article className="discover-person-card" key={person.name}>
                    <span className="discover-person-decoration" />
                    <Avatar initials={person.initials} tone={person.tone} size="large" />
                    <h2>{person.name}</h2><p>{person.role}</p>
                    <span className="discover-mutuals">{person.headline || 'A member of Nexora'}</span>
                    <button className={connected || pending || requestedYou ? 'discover-connect connected' : 'discover-connect'} disabled={connected || pending || requestedYou} onClick={() => requestConnection(person.id)}>
                      <Icon name={connected ? 'check' : 'plus'} size={15} /> {connected ? 'Connected' : pending ? 'Request sent' : requestedYou ? 'Respond to request' : 'Connect'}
                    </button>
                  </article>
                )
              }) : <div className="social-empty"><strong>No people found</strong><p>Try a different name or interest.</p></div>}
            </section>
          ) : (
            <section className="discover-posts-list">
              {filteredPosts.length ? filteredPosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={{ ...post, saved: posts.find((item) => item.id === post.id)?.saved ?? false }}
                  onToggleLike={toggleLike}
                  onToggleSave={toggleSave}
                  onAddComment={addComment}
                />
              )) : <div className="social-empty"><strong>No posts found</strong><p>Try another search to find a conversation.</p></div>}
            </section>
          )}
        </main>
        <aside className="right-rail social-rail">
          <section className="rail-card social-rail-card">
            <span className="section-kicker">FOLLOW YOUR CURIOSITY</span>
            <h2>Start with something you’re interested in.</h2>
            <p>Search registered Nexora members and posts from your first-degree connections.</p>
          </section>
        </aside>
      </div>
    </div>
  )
}
