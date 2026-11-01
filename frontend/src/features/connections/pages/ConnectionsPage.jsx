import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import AppHeader from '../../../components/layout/AppHeader'
import AppSidebar from '../../../components/layout/AppSidebar'
import { Avatar } from '../../../components/ui/Avatar'
import { Icon } from '../../../components/ui/Icon'
import { acceptConnectionRequest, getConnections, getIncomingRequests, rejectConnectionRequest } from '../data/connectionsApi'

function mapPerson(person) {
  const name = person.name || 'Nexora member'
  return {
    id: person.userId,
    name,
    initials: name.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase(),
    tone: 'sage',
    role: person.headline || 'Nexora member',
    mutuals: '',
    note: '',
  }
}

export default function ConnectionsPage() {
  const [requests, setRequests] = useState([])
  const [connections, setConnections] = useState([])
  const [query, setQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    Promise.all([getIncomingRequests(), getConnections()])
      .then(([incoming, connected]) => {
        if (!active) return
        setRequests(incoming.map(mapPerson))
        setConnections(connected.map(mapPerson))
      })
      .catch((requestError) => {
        if (active) setError(requestError.response?.data?.error || 'Could not load your connections.')
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })
    return () => { active = false }
  }, [])

  async function acceptRequest(request) {
    try {
      await acceptConnectionRequest(request.id)
      setConnections((current) => [request, ...current])
      setRequests((current) => current.filter((item) => item.id !== request.id))
    } catch (requestError) {
      setError(requestError.response?.data?.error || 'Could not accept this request.')
    }
  }

  async function ignoreRequest(requestId) {
    try {
      await rejectConnectionRequest(requestId)
      setRequests((current) => current.filter((item) => item.id !== requestId))
    } catch (requestError) {
      setError(requestError.response?.data?.error || 'Could not dismiss this request.')
    }
  }

  const filteredConnections = connections.filter((person) =>
    `${person.name} ${person.role}`.toLowerCase().includes(query.toLowerCase()),
  )

  return (
    <div className="app-shell">
      <AppHeader />
      <div className="app-layout">
        <AppSidebar />
        <main className="social-column">
          <div className="social-page-heading">
            <div><span className="section-kicker">PEOPLE MAKE THE PLACE</span><h1>Your connections</h1><p>Keep up with people you’ve welcomed into your circle.</p></div>
            <Link className="button button-dark social-heading-action" to="/discover"><Icon name="plus" size={16} /> Find people</Link>
          </div>
          {error && <p className="composer-error" role="alert">{error}</p>}
          {isLoading && <p role="status">Loading your connections…</p>}

          <section className="social-section-card">
            <div className="social-section-heading">
              <div><h2>Connection requests</h2><span>{requests.length ? `${requests.length} waiting to meet you` : 'You’re all caught up'}</span></div>
            </div>
            {requests.length ? (
              <div className="connection-request-list">
                {requests.map((person) => (
                  <article className="connection-request" key={person.id}>
                    <Avatar initials={person.initials} tone={person.tone} size="large" />
                    <div className="connection-person-copy">
                      <strong>{person.name}</strong><span>{person.role}</span>
                    </div>
                    <div className="connection-request-actions">
                      <button className="button button-dark" onClick={() => acceptRequest(person)}><Icon name="check" size={15} /> Accept</button>
                      <button className="connection-dismiss" onClick={() => ignoreRequest(person.id)}>Not now</button>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="social-empty"><span><Icon name="check" size={19} /></span><strong>No requests right now</strong><p>When someone wants to connect, you’ll find it here.</p></div>
            )}
          </section>

          <section className="social-section-card">
            <div className="social-section-heading connections-list-heading">
              <div><h2>People you know</h2><span>{connections.length} connections</span></div>
              <label className="social-search"><Icon name="search" size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Find someone" aria-label="Search connections" /></label>
            </div>
            {filteredConnections.length ? (
              <div className="connection-grid">
                {filteredConnections.map((person) => (
                  <article className="person-tile" key={person.id}>
                    <Avatar initials={person.initials} tone={person.tone} size="large" />
                    <div><strong>{person.name}</strong><span>{person.role}</span></div>
                    <span className="person-profile-link" aria-hidden="true"><Icon name="arrow" size={16} /></span>
                  </article>
                ))}
              </div>
            ) : <p className="social-no-results">No connections match that search.</p>}
          </section>
        </main>
        <aside className="right-rail social-rail">
          <section className="rail-card social-rail-card">
            <span className="section-kicker">A GOOD LITTLE REMINDER</span>
            <h2>Connections grow one conversation at a time.</h2>
            <p>Reach out, share something you care about, and see what happens next.</p>
            <Link className="rail-text-link" to="/home#feed-composer">Start a conversation <Icon name="arrow" size={14} /></Link>
          </section>
        </aside>
      </div>
    </div>
  )
}
