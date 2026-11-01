import { Link, NavLink } from 'react-router'
import { Avatar } from '../ui/Avatar'
import { Icon } from '../ui/Icon'
import { useAuth } from '../../features/auth/data/useAuth'

export default function AppSidebar() {
  const { user, signOut } = useAuth()
  const initials = user.name.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase()

  return (
    <aside className="app-sidebar">
      <Link to="/profile" className="sidebar-profile">
        <Avatar initials={initials} tone="sage" size="large" />
        <div><strong>{user.name}</strong><span>{user.email}</span></div>
        <Icon name="chevron" size={16} />
      </Link>
      <span className="sidebar-label">YOUR SPACE</span>
      <nav className="sidebar-nav" aria-label="Main app navigation">
        <NavLink to="/home" className={({ isActive }) => `sidebar-link${isActive ? ' sidebar-link-active' : ''}`}>
          <Icon name="home" /> Home <span className="nav-indicator" />
        </NavLink>
        <NavLink to="/profile" className={({ isActive }) => `sidebar-link${isActive ? ' sidebar-link-active' : ''}`}>
          <Icon name="user" /> My profile
        </NavLink>
        <NavLink to="/connections" className={({ isActive }) => `sidebar-link${isActive ? ' sidebar-link-active' : ''}`}>
          <Icon name="users" /> Connections
        </NavLink>
        <NavLink to="/notifications" className={({ isActive }) => `sidebar-link${isActive ? ' sidebar-link-active' : ''}`}>
          <Icon name="bell" /> Notifications
        </NavLink>
        <NavLink to="/saved" className={({ isActive }) => `sidebar-link${isActive ? ' sidebar-link-active' : ''}`}>
          <Icon name="bookmark" /> Saved
        </NavLink>
      </nav>
      <span className="sidebar-label sidebar-label-explore">EXPLORE</span>
      <nav className="sidebar-nav" aria-label="Explore navigation">
        <NavLink to="/discover" className={({ isActive }) => `sidebar-link${isActive ? ' sidebar-link-active' : ''}`}>
          <Icon name="compass" /> Discover
        </NavLink>
      </nav>
      <div className="sidebar-prompt">
        <span><Icon name="sparkle" size={16} /></span>
        <strong>Good things grow together.</strong>
        <p>Make today a little more connected.</p>
        <Link to="/home#feed-composer">Start a conversation <Icon name="arrow" size={14} /></Link>
      </div>
      <button type="button" className="sidebar-back" onClick={signOut}><Icon name="chevron" size={15} /> Sign out</button>
    </aside>
  )
}
