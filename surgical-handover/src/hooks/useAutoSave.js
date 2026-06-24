import { useEffect, useCallback } from 'react'

export function useAutoSave(key, value, delay = 800) {
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(`autosave:${key}`, JSON.stringify(value))
      } catch {
        // localStorage full — silently ignore
      }
    }, delay)
    return () => clearTimeout(timer)
  }, [key, value, delay])
}

export function loadAutoSave(key) {
  try {
    const raw = localStorage.getItem(`autosave:${key}`)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function clearAutoSave(key) {
  try {
    localStorage.removeItem(`autosave:${key}`)
  } catch {
    // ignore
  }
}

export function useAutoSaveField(key) {
  const save = useCallback((value) => {
    try {
      localStorage.setItem(`autosave:${key}`, JSON.stringify(value))
    } catch {
      // ignore
    }
  }, [key])

  return { save, load: () => loadAutoSave(key), clear: () => clearAutoSave(key) }
}
