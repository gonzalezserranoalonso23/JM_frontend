const STORAGE_KEY = 'jm-theme'

export const getTheme = () => {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'light' ? 'light' : 'dark'
  } catch {
    return 'dark'
  }
}

export const applyTheme = (theme) => {
  const dark = theme !== 'light'
  const root = document.documentElement
  root.classList.toggle('dark', dark)
  root.style.colorScheme = dark ? 'dark' : 'light'
  root.style.backgroundColor = ''
  const color = dark ? '#0a0a0a' : '#ffffff'
  document
    .querySelector('meta[name="theme-color"]:not([media])')
    ?.setAttribute('content', color)
  document
    .querySelector('meta[name="color-scheme"]')
    ?.setAttribute('content', dark ? 'dark' : 'light')
}

export const setTheme = (theme) => {
  const next = theme === 'light' ? 'light' : 'dark'
  try {
    localStorage.setItem(STORAGE_KEY, next)
  } catch {
    // The choice still applies for this visit.
  }
  applyTheme(next)
  return next
}
