import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router'
import AppHeader from '../../../components/layout/AppHeader'
import AppSidebar from '../../../components/layout/AppSidebar'
import { Avatar } from '../../../components/ui/Avatar'
import { Icon } from '../../../components/ui/Icon'
import PostCard from '../../feed/components/PostCard'
import { useFeed } from '../../feed/data/useFeed'
import {
  getConnections,
  getIncomingRequests,
  getOutgoingRequests,
  sendConnectionRequest,
} from '../data/discoverApi'
import {
  createComment,
  deleteComment as deleteCommentRequest,
  deletePost as deletePostRequest,
  getFeed,
  setPostLiked,
  setPostSaved,
  updateComment,
  updatePost,
} from '../../feed/data/postsApi'
import { formatComment, formatPost } from '../../feed/data/postFormatting'
import { useAuth } from '../../auth/data/useAuth'
import { useToast } from '../../../app/useToast'

export default function DiscoverPage() {
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const query = searchParams.get('query') || ''
  const [locationFilter, setLocationFilter] = useState('')
  const [skillFilter, setSkillFilter] = useState('')
  const [interestFilter, setInterestFilter] = useState('')
  const activeTab = searchParams.get('tab') === 'posts' ? 'posts' : 'people'
  const [people, setPeople] = useState([])
  const [connectedIds, setConnectedIds] = useState([])
  const [pendingIds, setPendingIds] = useState([])
  const [incomingIds, setIncomingIds] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const { posts, setPosts, directory } = useFeed()
  const [discoveryPosts, setDiscoveryPosts] = useState([])
  const [isLoadingPosts, setIsLoadingPosts] = useState(true)
  const notify = useToast()

  useEffect(() => {
    let active = true
    Promise.all([getConnections(), getOutgoingRequests(), getIncomingRequests()])
      .then(([connections, outgoing, incoming]) => {
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
  }, [directory])

  useEffect(() => {
    let active = true
    getFeed()
      .then((items) => {
        if (active) setDiscoveryPosts(items.map((post) => formatPost(post, user, directory)))
      })
      .catch((requestError) => {
        if (active) setError(requestError.response?.data?.error || 'Could not load posts to discover.')
      })
      .finally(() => {
        if (active) setIsLoadingPosts(false)
      })
    return () => { active = false }
  }, [user, directory])

  const locations = useMemo(
    () => [...new Set(people.map((person) => person.location).filter(Boolean))].sort(),
    [people],
  )
  const skills = useMemo(
    () => [...new Set(people.flatMap((person) => person.skills || []))].sort(),
    [people],
  )
  const interests = useMemo(
    () => [...new Set(people.flatMap((person) => person.interests || []))].sort(),
    [people],
  )
  const filteredPeople = useMemo(() => people.filter((person) => {
    const searchable = [
      person.name,
      person.role,
      person.location,
      ...(person.interests || []),
      ...(person.skills || []),
    ].join(' ').toLowerCase()
    return searchable.includes(query.toLowerCase())
      && (!locationFilter || person.location === locationFilter)
      && (!skillFilter || (person.skills || []).some((skill) => skill.toLowerCase() === skillFilter.toLowerCase()))
      && (!interestFilter || (person.interests || []).some((interest) => interest.toLowerCase() === interestFilter.toLowerCase()))
  }), [people, query, locationFilter, skillFilter, interestFilter])
  const filteredPosts = useMemo(
    () => discoveryPosts.filter((post) => `${post.name} ${post.content}`.toLowerCase().includes(query.toLowerCase())),
    [discoveryPosts, query],
  )

  function updateSearchQuery(nextQuery) {
    setSearchParams((current) => {
      const next = new URLSearchParams(current)
      if (nextQuery) next.set('query', nextQuery)
      else next.delete('query')
      return next
    }, { replace: true })
  }

  function selectTab(tab) {
    setSearchParams((current) => {
      const next = new URLSearchParams(current)
      next.set('tab', tab)
      return next
    }, { replace: true })
  }

  async function requestConnection(personId) {
    notify('Sending connection request…', 'loading')
    try {
      await sendConnectionRequest(personId)
      setPendingIds((current) => [...current, personId])
      notify('Connection request sent.')
    } catch (requestError) {
      const message = requestError.response?.data?.error || 'Could not send this connection request.'
      setError(message)
      notify(message, 'error')
    }
  }

  async function toggleLike(postId) {
    const post = discoveryPosts.find((item) => item.id === postId)
    if (!post) return
    try {
      await setPostLiked(postId, !post.liked)
      const update = (current) => current.map((item) => item.id === postId
        ? { ...item, liked: !item.liked, likes: item.likes + (item.liked ? -1 : 1) }
        : item)
      setPosts(update)
      setDiscoveryPosts(update)
      return true
    } catch (requestError) {
      setError(requestError.response?.data?.error || 'Could not update this appreciation.')
      return false
    }
  }

  async function toggleSave(postId) {
    const post = discoveryPosts.find((item) => item.id === postId)
    if (!post) return
    try {
      await setPostSaved(postId, !post.saved)
      const update = (current) => current.map((item) => item.id === postId ? { ...item, saved: !post.saved } : item)
      setPosts(update)
      setDiscoveryPosts(update)
      return true
    } catch (requestError) {
      setError(requestError.response?.data?.error || 'Could not save this post.')
      return false
    }
  }

  async function addComment(postId, text) {
    try {
      const comment = await createComment(postId, text)
      const update = (current) => current.map((post) => post.id === postId
        ? {
            ...post,
            commentItems: [...(post.commentItems ?? []), formatComment(comment, user, directory)],
            comments: (post.comments ?? 0) + 1,
          }
        : post)
      setPosts(update)
      setDiscoveryPosts(update)
      return true
    } catch (requestError) {
      setError(requestError.response?.data?.error || 'Could not post this comment.')
      return false
    }
  }

  async function deleteOwnPost(postId) {
    try {
      await deletePostRequest(postId)
      const update = (current) => current.filter((post) => post.id !== postId)
      setPosts(update)
      setDiscoveryPosts(update)
      return true
    } catch (requestError) {
      setError(requestError.response?.data?.error || requestError.response?.data?.message || 'Your post could not be deleted. Please try again.')
      return false
    }
  }

  async function editOwnPost(postId, content) {
    try {
      await updatePost(postId, content)
      const update = (current) => current.map((post) => post.id === postId ? { ...post, content } : post)
      setPosts(update)
      setDiscoveryPosts(update)
      return true
    } catch (requestError) {
      setError(requestError.response?.data?.error || requestError.response?.data?.message || 'Your post could not be updated. Please try again.')
      return false
    }
  }

  async function editOwnComment(postId, commentId, content) {
    try {
      const savedComment = await updateComment(commentId, content)
      const update = (current) => current.map((post) => post.id === postId
        ? { ...post, commentItems: post.commentItems.map((comment) => comment.id === commentId
          ? { ...comment, ...savedComment, text: savedComment.content }
          : comment) }
        : post)
      setPosts(update)
      setDiscoveryPosts(update)
      return true
    } catch (requestError) {
      setError(requestError.response?.data?.error || requestError.response?.data?.message || 'Your comment could not be updated. Please try again.')
      return false
    }
  }

  async function deleteOwnComment(postId, commentId) {
    try {
      await deleteCommentRequest(commentId)
      const update = (current) => current.map((post) => post.id === postId
        ? {
            ...post,
            commentItems: post.commentItems.filter((comment) => comment.id !== commentId),
            comments: Math.max(0, post.comments - 1),
          }
        : post)
      setPosts(update)
      setDiscoveryPosts(update)
      return true
    } catch (requestError) {
      setError(requestError.response?.data?.error || requestError.response?.data?.message || 'Your comment could not be deleted. Please try again.')
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
          <label className="discover-search"><Icon name="search" size={19} /><input value={query} onChange={(event) => updateSearchQuery(event.target.value)} placeholder="Try a name, an interest, or an idea" aria-label="Search people and posts" /><span>⌘ K</span></label>
          {activeTab === 'people' && (
            <div className="discover-filters" aria-label="Filter people">
              <label>Location
                <select value={locationFilter} onChange={(event) => setLocationFilter(event.target.value)}>
                  <option value="">All locations</option>
                  {locations.map((location) => <option key={location} value={location}>{location}</option>)}
                </select>
              </label>
              <label>Skill
                <select value={skillFilter} onChange={(event) => setSkillFilter(event.target.value)}>
                  <option value="">All skills</option>
                  {skills.map((skill) => <option key={skill} value={skill}>{skill}</option>)}
                </select>
              </label>
              <label>Interest
                <select value={interestFilter} onChange={(event) => setInterestFilter(event.target.value)}>
                  <option value="">All interests</option>
                  {interests.map((interest) => <option key={interest} value={interest}>{interest}</option>)}
                </select>
              </label>
            </div>
          )}
          {error && <p className="composer-error" role="alert">{error}</p>}
          {(isLoading || isLoadingPosts) && <p role="status">Finding your Nexora community…</p>}
          <div className="discover-tabs" role="tablist" aria-label="Discover category">
            <button className={activeTab === 'people' ? 'discover-tab active' : 'discover-tab'} role="tab" aria-selected={activeTab === 'people'} onClick={() => selectTab('people')}>People <span>{filteredPeople.length}</span></button>
            <button className={activeTab === 'posts' ? 'discover-tab active' : 'discover-tab'} role="tab" aria-selected={activeTab === 'posts'} onClick={() => selectTab('posts')}>Posts <span>{filteredPosts.length}</span></button>
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
                    <Avatar initials={person.initials} imageUrl={person.profilePhotoUrl} tone={person.tone} size="large" />
                    <h2>{person.name}</h2><p>{person.role}</p>
                    <span className="discover-mutuals">
                      {[person.location, ...(person.skills || []).slice(0, 3)].filter(Boolean).join(' · ') || person.headline || 'A member of Nexora'}
                    </span>
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
                  onEdit={editOwnPost}
                  onDelete={deleteOwnPost}
                  onEditComment={editOwnComment}
                  onDeleteComment={deleteOwnComment}
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
