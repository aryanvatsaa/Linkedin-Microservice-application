import { useEffect, useState } from 'react'
import { FeedContext } from './FeedContext'
import { getFeed } from './postsApi'
import { formatPost } from './postFormatting'
import { useAuth } from '../../auth/data/useAuth'

export default function FeedProvider({ children }) {
  const { user } = useAuth()
  const [feedState, setFeedState] = useState({ userId: null, posts: [], loadError: '' })

  useEffect(() => {
    if (!user) return undefined

    let active = true
    getFeed()
      .then((items) => {
        if (active) setFeedState({
          userId: user.id,
          posts: items.map((post) => formatPost(post, user)),
          loadError: '',
        })
      })
      .catch((error) => {
        if (active) {
          setFeedState({
            userId: user.id,
            posts: [],
            loadError: error.response?.data?.error || error.response?.data?.message || 'Could not load your posts. Please try again.',
          })
        }
      })

    return () => { active = false }
  }, [user])

  const isCurrentUserState = user && String(feedState.userId) === String(user.id)
  const posts = isCurrentUserState ? feedState.posts : []
  const loadError = isCurrentUserState ? feedState.loadError : ''
  const isLoading = Boolean(user && !isCurrentUserState)

  function setPosts(update) {
    setFeedState((current) => {
      const currentPosts = String(current.userId) === String(user?.id) ? current.posts : []
      return {
        userId: user?.id ?? null,
        posts: typeof update === 'function' ? update(currentPosts) : update,
        loadError: current.loadError,
      }
    })
  }

  function setLoadError(error) {
    setFeedState((current) => ({
      userId: user?.id ?? null,
      posts: String(current.userId) === String(user?.id) ? current.posts : [],
      loadError: error,
    }))
  }

  return (
    <FeedContext.Provider value={{ posts, setPosts, isLoading, loadError, setLoadError }}>
      {children}
    </FeedContext.Provider>
  )
}
