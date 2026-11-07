import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { Avatar } from '../ui/Avatar'
import { Brand } from '../ui/Brand'
import { Icon } from '../ui/Icon'
import { ThemeToggle } from '../ui/ThemeToggle'
import { useAuth } from '../../features/auth/data/useAuth'
import { getProfile } from '../../features/profile/data/profileApi'
import { useFeed } from '../../features/feed/data/useFeed'
import { useNotifications } from '../../features/notifications/data/useNotifications'

export default function AppHeader() {
  const { user } = useAuth()
  const { posts, directory, isLoading: isFeedLoading } = useFeed()
  const { unreadCount } = useNotifications()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false)
  const initials = user.name.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase()
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [profile, setProfile] = useState(null)
  const [profileError, setProfileError] = useState('')
  const profileMenuRef = useRef(null)
  const searchRef = useRef(null)
  const searchInputRef = useRef(null)
  const profileSummary = profile || user
  const skills = Array.isArray(profileSummary.skills) ? profileSummary.skills.filter(Boolean) : []
  const interests = Array.isArray(profileSummary.interests) ? profileSummary.interests.filter(Boolean) : []
  const isProfileLoading = isProfileOpen && !profile && !profileError
  const searchResults = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase()
    if (!normalizedQuery) return { people: [], posts: [] }

    const people = directory.filter((person) => [
      person.name,
      person.headline,
      person.location,
      ...(person.interests || []),
      ...(person.skills || []),
    ].filter(Boolean).join(' ').toLocaleLowerCase().includes(normalizedQuery)
      && String(person.id) !== String(user.id)).slice(0, 4)
    const matchingPosts = posts.filter((post) => (
      `${post.name} ${post.content}`.toLocaleLowerCase().includes(normalizedQuery)
    )).slice(0, 4)
    return { people, posts: matchingPosts }
  }, [query, directory, posts, user.id])
  const hasSearchResults = searchResults.people.length > 0 || searchResults.posts.length > 0

  function navigateToSearch(tab = 'people') {
    const normalizedQuery = query.trim()
    if (!normalizedQuery) return
    const params = new URLSearchParams({ query: normalizedQuery, tab })
    navigate(`/discover?${params.toString()}`)
    setIsSearchFocused(false)
    setIsMobileSearchOpen(false)
    searchInputRef.current?.blur()
  }

  useEffect(() => {
    if (!isProfileOpen) return undefined

    function dismissOnOutsideClick(event) {
      if (!profileMenuRef.current?.contains(event.target)) setIsProfileOpen(false)
    }

    function dismissOnEscape(event) {
      if (event.key === 'Escape') setIsProfileOpen(false)
    }

    document.addEventListener('pointerdown', dismissOnOutsideClick)
    document.addEventListener('keydown', dismissOnEscape)
    return () => {
      document.removeEventListener('pointerdown', dismissOnOutsideClick)
      document.removeEventListener('keydown', dismissOnEscape)
    }
  }, [isProfileOpen])

  useEffect(() => {
    function dismissSearchOnOutsideClick(event) {
      if (!searchRef.current?.contains(event.target)) {
        setIsSearchFocused(false)
        setIsMobileSearchOpen(false)
      }
    }

    function focusSearchShortcut(event) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        if (window.matchMedia('(max-width: 620px)').matches) {
          setIsMobileSearchOpen(true)
          setIsSearchFocused(true)
          requestAnimationFrame(() => searchInputRef.current?.focus())
        } else {
          searchInputRef.current?.focus()
        }
      }
    }

    document.addEventListener('pointerdown', dismissSearchOnOutsideClick)
    document.addEventListener('keydown', focusSearchShortcut)
    return () => {
      document.removeEventListener('pointerdown', dismissSearchOnOutsideClick)
      document.removeEventListener('keydown', focusSearchShortcut)
    }
  }, [])

  useEffect(() => {
    if (!isProfileOpen) return undefined
    let active = true

    getProfile()
      .then((profileData) => {
        if (active) setProfile(profileData)
      })
      .catch((requestError) => {
        if (active) setProfileError(requestError.response?.data?.error || 'Could not load your profile details.')
      })

    return () => { active = false }
  }, [isProfileOpen])

  return (
    <header className="app-header">
      <div className="app-header-inner">
        <Brand />
        <div className={`app-search-container${isMobileSearchOpen ? ' app-search-open' : ''}`} ref={searchRef}>
          <button
            type="button"
            className="app-search-mobile-trigger"
            aria-label="Open search"
            onClick={() => {
              setIsMobileSearchOpen(true)
              setIsSearchFocused(true)
              requestAnimationFrame(() => searchInputRef.current?.focus())
            }}
          >
            <Icon name="search" size={19} />
          </button>
          <label className="app-search">
            <Icon name="search" size={19} />
            <input
              ref={searchInputRef}
              type="search"
              aria-label="Search people and posts"
              placeholder="Search people, ideas, and more"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onKeyDown={(event) => {
                if (event.key === 'Escape') {
                  setIsSearchFocused(false)
                  setIsMobileSearchOpen(false)
                  searchInputRef.current?.blur()
                }
                if (event.key === 'Enter') navigateToSearch('people')
              }}
            />
            <kbd>⌘ K</kbd>
          </label>
          {isMobileSearchOpen && (
            <button type="button" className="app-search-close" aria-label="Close search" onClick={() => {
              setIsSearchFocused(false)
              setIsMobileSearchOpen(false)
              searchInputRef.current?.blur()
            }}>
              <Icon name="x" size={17} />
            </button>
          )}
          {isSearchFocused && query.trim() && (
            <div className="app-search-results" role="region" aria-label="Search suggestions">
              {searchResults.people.length > 0 && (
                <div className="app-search-result-group">
                  <span className="app-search-result-label">PEOPLE</span>
                  {searchResults.people.map((person) => (
                    <Link
                      className="app-search-result"
                      key={person.id}
                      to={`/discover?${new URLSearchParams({ query: query.trim(), tab: 'people' })}`}
                      onClick={() => setIsSearchFocused(false)}
                    >
                      <Avatar initials={person.name.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase()} imageUrl={person.profilePhotoUrl} tone="sage" size="small" />
                      <span><strong>{person.name}</strong><small>{person.headline || person.location || 'Nexora member'}</small></span>
                    </Link>
                  ))}
                </div>
              )}
              {searchResults.posts.length > 0 && (
                <div className="app-search-result-group">
                  <span className="app-search-result-label">POSTS</span>
                  {searchResults.posts.map((post) => (
                    <Link
                      className="app-search-result app-search-post-result"
                      key={post.id}
                      to={`/discover?${new URLSearchParams({ query: query.trim(), tab: 'posts' })}`}
                      onClick={() => setIsSearchFocused(false)}
                    >
                      <Avatar initials={post.initials} imageUrl={post.imageUrl} tone={post.tone || 'sage'} size="small" />
                      <span><strong>{post.name}</strong><small>{post.content}</small></span>
                    </Link>
                  ))}
                </div>
              )}
              {!hasSearchResults && (
                <p className="app-search-no-results">{isFeedLoading ? 'Loading people and posts…' : 'No matches in your loaded people or posts.'}</p>
              )}
              <button className="app-search-view-all" type="button" onClick={() => navigateToSearch('people')}>
                View all results <Icon name="arrow" size={14} />
              </button>
            </div>
          )}
        </div>
        <nav className="app-header-actions" aria-label="Account navigation">
          <ThemeToggle />
          <Link className="header-icon-button notification-header-link" to="/notifications" aria-label={unreadCount ? `Notifications, ${unreadCount} unread` : 'Notifications'}>
            <Icon name="bell" />
            {unreadCount > 0 && <span className="notification-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>}
          </Link>
          <div className="header-profile" ref={profileMenuRef}>
            <button
              type="button"
              className="header-profile-trigger"
              aria-label={`Profile details for ${user.name}`}
              aria-expanded={isProfileOpen}
              aria-controls="header-profile-popover"
              onClick={() => {
                setProfileError('')
                setIsProfileOpen((open) => !open)
              }}
            >
              <Avatar initials={initials} imageUrl={user.profilePhotoUrl} tone="sage" size="small" />
            </button>
            {isProfileOpen && (
              <section className="header-profile-popover" id="header-profile-popover" aria-label="Your profile summary">
                <div className="profile-popover-identity">
                  <Avatar initials={initials} imageUrl={user.profilePhotoUrl} tone="sage" size="large" />
                  <div>
                    <strong>{user.name}</strong>
                    <span>{profileSummary.headline || user.email}</span>
                  </div>
                </div>
                {profileSummary.location && (
                  <p className="profile-popover-location"><Icon name="map" size={14} />{profileSummary.location}</p>
                )}
                <div className="profile-popover-section">
                  <span className="profile-popover-label">ABOUT ME</span>
                  <p className="profile-popover-about">{profileSummary.about || 'Add a few words to introduce yourself.'}</p>
                </div>
                {skills.length > 0 && (
                  <div className="profile-popover-section">
                    <span className="profile-popover-label">SKILLS</span>
                    <div className="profile-popover-tags">
                      {skills.slice(0, 4).map((skill) => <span key={skill}>{skill}</span>)}
                      {skills.length > 4 && <span>+{skills.length - 4}</span>}
                    </div>
                  </div>
                )}
                {interests.length > 0 && (
                  <div className="profile-popover-section">
                    <span className="profile-popover-label">INTERESTS</span>
                    <div className="profile-popover-tags">
                      {interests.slice(0, 3).map((interest) => <span key={interest}>{interest}</span>)}
                    </div>
                  </div>
                )}
                {isProfileLoading && <p className="profile-popover-status" role="status">Refreshing your profile…</p>}
                {profileError && <p className="profile-popover-status profile-popover-error" role="alert">{profileError}</p>}
                <Link className="profile-popover-link" to="/profile" onClick={() => setIsProfileOpen(false)}>
                  View full profile <Icon name="arrow" size={14} />
                </Link>
              </section>
            )}
          </div>
        </nav>
      </div>
    </header>
  )
}
