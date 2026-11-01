import { Link } from 'react-router'

export function Brand({ light = false }) {
  return (
    <Link className={`brand${light ? ' brand-light' : ''}`} to="/" aria-label="Nexora home">
      <span className="brand-mark" aria-hidden="true">
        <span />
        <span />
      </span>
      <span>Nexora</span>
    </Link>
  )
}

