import { useContext } from 'react'
import { FeedContext } from './FeedContext'

export function useFeed() {
  const context = useContext(FeedContext)

  if (!context) {
    throw new Error('useFeed must be used within a FeedProvider.')
  }

  return context
}
