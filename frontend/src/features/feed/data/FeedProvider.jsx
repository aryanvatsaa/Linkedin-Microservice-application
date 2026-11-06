import { useEffect, useState } from 'react'
import { FeedContext } from './FeedContext'
import { getFeedPage } from './postsApi'
import { formatPost } from './postFormatting'
import { useAuth } from '../../auth/data/useAuth'
import { getDirectory } from '../../discover/data/discoverApi'
import { useToast } from '../../../app/useToast'

const EMPTY_DIRECTORY = []

export default function FeedProvider({ children }) {
  const { user } = useAuth()
  const notify = useToast()
  const [feedState, setFeedState] = useState({
    userId: null,
    posts: [],
    directory: [],
    loadError: '',
    page: 0,
    hasNext: false,
  })

  useEffect(() => {
    if (!user) return undefined

    let active = true
    getFeedPage()
      .then((items) => {
        if (active) setFeedState((current) => {
          const isSameUser = String(current.userId) === String(user.id)
          const directory = isSameUser ? current.directory : []
          return {
            userId: user.id,
            posts: items.content.map((post) => formatPost(post, user, directory)),
            directory,
            loadError: '',
            page: items.page,
            hasNext: items.hasNext,
          }
        })
      })
      .catch((error) => {
        if (active) {
          setFeedState({
            userId: user.id,
            posts: [],
            directory: [],
            loadError: error.response?.data?.error || error.response?.data?.message || 'Could not load your posts. Please try again.',
            page: 0,
            hasNext: false,
          })
        }
      })
    getDirectory()
      .then((directory) => {
        if (active) setFeedState((current) => {
          const isSameUser = String(current.userId) === String(user.id)
          const posts = isSameUser ? current.posts : []
          return {
            userId: user.id,
            directory,
            posts: posts.map((post) => formatPost(post, user, directory)),
            loadError: isSameUser ? current.loadError : '',
            page: isSameUser ? current.page : 0,
            hasNext: isSameUser ? current.hasNext : false,
          }
        })
      })
      .catch(() => {
        if (active) {
          notify('Could not load community member names. Please try again.', 'error')
          setFeedState((current) => {
            const isSameUser = String(current.userId) === String(user.id)
            return {
              userId: user.id,
              posts: isSameUser ? current.posts : [],
              directory: isSameUser ? current.directory : [],
              loadError: isSameUser
                ? current.loadError || 'Could not load community member names. Please try again.'
                : 'Could not load community member names. Please try again.',
              page: isSameUser ? current.page : 0,
              hasNext: isSameUser ? current.hasNext : false,
            }
          })
        }
      })

    return () => { active = false }
  }, [user, notify])

  const isCurrentUserState = user && String(feedState.userId) === String(user.id)
  const posts = isCurrentUserState ? feedState.posts : []
  const directory = isCurrentUserState ? feedState.directory : EMPTY_DIRECTORY
  const loadError = isCurrentUserState ? feedState.loadError : ''
  const feedPage = isCurrentUserState ? feedState.page : 0
  const hasNext = isCurrentUserState ? feedState.hasNext : false
  const isLoading = Boolean(user && !isCurrentUserState)

  function setPosts(update) {
    setFeedState((current) => {
      const currentPosts = String(current.userId) === String(user?.id) ? current.posts : []
      return {
        userId: user?.id ?? null,
        posts: typeof update === 'function' ? update(currentPosts) : update,
        directory: current.directory,
        loadError: current.loadError,
        page: current.page,
        hasNext: current.hasNext,
      }
    })
  }

  function setFeedPagination(page, nextPageAvailable) {
    setFeedState((current) => ({
      ...current,
      userId: user?.id ?? null,
      page,
      hasNext: nextPageAvailable,
    }))
  }

  function setLoadError(error) {
    setFeedState((current) => ({
      userId: user?.id ?? null,
      posts: String(current.userId) === String(user?.id) ? current.posts : [],
      directory: current.directory,
      loadError: error,
      page: current.page,
      hasNext: current.hasNext,
    }))
  }

  return (
    <FeedContext.Provider value={{
      posts, setPosts, isLoading, loadError, setLoadError, directory, feedPage, hasNext, setFeedPagination,
    }}>
      {children}
    </FeedContext.Provider>
  )
}
