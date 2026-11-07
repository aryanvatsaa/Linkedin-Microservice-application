const PROFILE_CHECKS = [
  { field: 'headline', label: 'Add a headline' },
  { field: 'about', label: 'Write an about section' },
  { field: 'location', label: 'Add your location' },
  { field: 'interests', label: 'Share your interests' },
  { field: 'skills', label: 'Add your skills' },
  { field: 'experience', label: 'Add your experience' },
  { field: 'education', label: 'Add your education' },
]

function isComplete(value) {
  if (Array.isArray(value)) return value.some((item) => Boolean(String(item).trim()))
  return Boolean(String(value || '').trim())
}

export function getProfileChecklist(profile = {}) {
  return PROFILE_CHECKS.map(({ field, label }) => ({ field, label, complete: isComplete(profile[field]) }))
}

export function getProfileCompletion(profile = {}) {
  const completed = Number(isComplete(profile.name)) + getProfileChecklist(profile).filter((item) => item.complete).length
  return Math.round(completed / (PROFILE_CHECKS.length + 1) * 100)
}
