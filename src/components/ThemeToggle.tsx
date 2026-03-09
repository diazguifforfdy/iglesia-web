import { useEffect, useState } from 'react'

export default function ThemeToggle() {
  const [dark, setDark] = useState(false)

  useEffect(() => {
    const mql = window.matchMedia('(prefers-color-scheme: dark)')
    const stored = localStorage.getItem('theme')
    const initial = stored ? stored === 'dark' : mql.matches
    setDark(initial)
  }, [])

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }, [dark])

  return (
    <button
      onClick={() => setDark(v => !v)}
      className="px-3 py-1.5 rounded border text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
      aria-label="Cambiar tema"
    >
      {dark ? 'Claro' : 'Oscuro'}
    </button>
  )
}
