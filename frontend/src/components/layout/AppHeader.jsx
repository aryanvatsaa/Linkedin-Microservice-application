import { Link } from 'react-router'
import { Avatar } from '../ui/Avatar'
import { Brand } from '../ui/Brand'
import { Icon } from '../ui/Icon'
import { ThemeToggle } from '../ui/ThemeToggle'
import { useAuth } from '../../features/auth/data/useAuth'

export default function AppHeader() {
  const { user } = useAuth()
  const initials = user.name.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase()

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
          <Avatar initials={initials} imageUrl={user.profilePhotoUrl} tone="sage" size="small" />
        </nav>
      </div>
    </header>
  )
}
