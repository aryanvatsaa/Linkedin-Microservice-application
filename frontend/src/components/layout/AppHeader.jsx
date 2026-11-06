import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import { Avatar } from '../ui/Avatar'
import { Brand } from '../ui/Brand'
import { Icon } from '../ui/Icon'
import { ThemeToggle } from '../ui/ThemeToggle'
import { useAuth } from '../../features/auth/data/useAuth'
import { getProfile } from '../../features/profile/data/profileApi'

export default function AppHeader() {
  const { user } = useAuth()
  const initials = user.name.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase()
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [profile, setProfile] = useState(null)
  const [profileError, setProfileError] = useState('')
  const profileMenuRef = useRef(null)
  const profileSummary = profile || user
  const skills = Array.isArray(profileSummary.skills) ? profileSummary.skills.filter(Boolean) : []
  const interests = Array.isArray(profileSummary.interests) ? profileSummary.interests.filter(Boolean) : []
  const isProfileLoading = isProfileOpen && !profile && !profileError

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
        <label className="app-search">
          <Icon name="search" size={19} />
          <input aria-label="Search Nexora" placeholder="Search people, ideas, and more" />
          <kbd>⌘ K</kbd>
        </label>
        <nav className="app-header-actions" aria-label="Account navigation">
          <ThemeToggle />
          <Link className="header-icon-button" to="/notifications" aria-label="Notifications"><Icon name="bell" /></Link>
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
