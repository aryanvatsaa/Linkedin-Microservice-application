export function Avatar({ initials, imageUrl, tone = 'sage', size = 'normal', className = '' }) {
  return (
    <span className={`avatar avatar-${tone} avatar-${size} ${className}`} aria-hidden="true">
      {initials}
      {imageUrl && <img src={imageUrl} alt="" onError={(event) => event.currentTarget.remove()} />}
    </span>
  )
}
