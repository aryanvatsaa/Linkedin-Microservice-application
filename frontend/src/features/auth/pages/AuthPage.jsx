import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import { Brand } from '../../../components/ui/Brand'
import { Icon } from '../../../components/ui/Icon'
import { ThemeToggle } from '../../../components/ui/ThemeToggle'
import { signIn, signUp } from '../data/authApi'
import { useAuth } from '../data/useAuth'
import { useToast } from '../../../app/useToast'

export default function AuthPage({ mode }) {
  const isSignup = mode === 'signup'
  const navigate = useNavigate()
  const location = useLocation()
  const { signIn: saveSession } = useAuth()
  const notify = useToast()
  const [formError, setFormError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const credentials = {
      email: String(formData.get('email')).trim(),
      password: String(formData.get('password')),
    }

    if (credentials.password.length < 8) {
      setFormError('Use at least 8 characters for your password.')
      return
    }

    setFormError('')
    setIsSubmitting(true)
    notify(isSignup ? 'Creating your account…' : 'Signing you in…', 'loading')
    try {
      const authResponse = isSignup
        ? await signUp({ ...credentials, name: String(formData.get('name')).trim() })
        : await signIn(credentials)
      saveSession(authResponse)
      const destination = location.state?.from?.pathname || '/home'
      notify(isSignup ? 'Your account is ready. Welcome to Nexora!' : 'You’re signed in. Welcome back!')
      navigate(destination, { replace: true })
    } catch (error) {
      const message = error.response?.data?.error || error.response?.data?.message || 'We could not complete that request. Please try again.'
      setFormError(message)
      notify(message, 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="auth-page">
      <header className="auth-header">
        <Brand />
        <div className="auth-header-actions">
          <ThemeToggle />
          <Link to="/">Back to home</Link>
        </div>
      </header>
      <section className="auth-content" aria-labelledby="auth-title">
        <div className="auth-card">
          <span className="section-kicker">{isSignup ? 'START WITH A HELLO' : 'WELCOME BACK'}</span>
          <h1 id="auth-title">{isSignup ? 'Make yourself at home.' : 'Good to see you again.'}</h1>
          <p className="auth-intro">
            {isSignup
              ? 'Create an account and start meeting people who make the next step feel possible.'
              : 'Sign in to pick up where you left off.'}
          </p>

          <form className="auth-form" onSubmit={handleSubmit}>
            {isSignup && (
              <label>
                Your name
                <input autoComplete="name" name="name" placeholder="How should we call you?" required />
              </label>
            )}
            <label>
              Email address
              <input
                autoComplete="email"
                name="email"
                placeholder="you@example.com"
                required
                type="email"
              />
            </label>
            <label>
              Password
              <input
                autoComplete={isSignup ? 'new-password' : 'current-password'}
                name="password"
                placeholder="At least 8 characters"
                minLength={8}
                required
                type="password"
              />
            </label>
            {formError && <p className="auth-error" role="alert">{formError}</p>}
            <button className="button button-dark auth-submit" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Please wait…' : isSignup ? 'Create your account' : 'Sign in'} <Icon name="arrow" size={16} />
            </button>
          </form>

          <p className="auth-switch">
            {isSignup ? 'Already have an account?' : 'New to Nexora?'}{' '}
            <Link to={isSignup ? '/login' : '/signup'}>{isSignup ? 'Sign in' : 'Create an account'}</Link>
          </p>
        </div>
        <p className="auth-demo-note">
          <Icon name="check" size={15} />
          Your account is securely handled by Nexora’s user service.
        </p>
      </section>
    </main>
  )
}
