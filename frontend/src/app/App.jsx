import { BrowserRouter, Route, Routes } from 'react-router'
import { ThemeProvider } from './ThemeProvider'
import AuthProvider from '../features/auth/data/AuthProvider'
import FeedProvider from '../features/feed/data/FeedProvider'
import RequireAuth from '../components/routing/RequireAuth'
import AuthPage from '../features/auth/pages/AuthPage'
import HomePage from '../features/feed/pages/HomePage'
import ConnectionsPage from '../features/connections/pages/ConnectionsPage'
import NotificationsPage from '../features/notifications/pages/NotificationsPage'
import DiscoverPage from '../features/discover/pages/DiscoverPage'
import SavedPage from '../features/saved/pages/SavedPage'
import ProfilePage from '../features/profile/pages/ProfilePage'
import LandingPage from '../pages/LandingPage'
import '../styles/components.css'
import '../styles/landing.css'
import '../styles/home.css'
import '../styles/auth.css'
import '../styles/profile.css'
import '../styles/theme.css'
import '../styles/social.css'

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <FeedProvider>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<AuthPage mode="login" />} />
            <Route path="/signup" element={<AuthPage mode="signup" />} />
            <Route element={<RequireAuth />}>
              <Route path="/home" element={<HomePage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/connections" element={<ConnectionsPage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/discover" element={<DiscoverPage />} />
              <Route path="/saved" element={<SavedPage />} />
            </Route>
            <Route path="*" element={<LandingPage />} />
          </Routes>
          </FeedProvider>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}
