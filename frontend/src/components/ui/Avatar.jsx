export function Avatar({ initials, tone = 'sage', size = 'normal', className = '' }) {
  return (
    <span className={`avatar avatar-${tone} avatar-${size} ${className}`} aria-hidden="true">
      {initials}
    </span>
  )
}

