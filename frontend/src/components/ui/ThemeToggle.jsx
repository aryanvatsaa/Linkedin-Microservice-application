import { useContext } from 'react'
import { ThemeContext } from '../../app/ThemeContext'
import { Icon } from './Icon'

export function ThemeToggle() {
  const context = useContext(ThemeContext)
  if (!context) throw new Error('ThemeToggle must be used within a ThemeProvider.')

  const { theme, toggleTheme } = context
  const nextTheme = theme === 'light' ? 'dark' : 'light'

  return (
    <button
      className="theme-toggle"
      type="button"
      aria-label={`Switch to ${nextTheme} mode`}
      title={`Switch to ${nextTheme} mode`}
      onClick={toggleTheme}
    >
      <Icon name={theme === 'light' ? 'moon' : 'sun'} size={18} />
      <span>{theme === 'light' ? 'Dark mode' : 'Light mode'}</span>
    </button>
  )
}
