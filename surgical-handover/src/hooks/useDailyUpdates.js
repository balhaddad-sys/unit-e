import { useState, useEffect } from 'react'

function loadKey(key) {
  try { return JSON.parse(localStorage.getItem(key) ?? 'null') ?? [] }
  catch { return [] }
}
function saveKey(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)) } catch {}
}

export function useDailyUpdates(patientId) {
  const key = `ue:updates:${patientId}`
  const [updates, setUpdates] = useState(() => patientId ? loadKey(key) : [])

  useEffect(() => {
    if (!patientId) { setUpdates([]); return }
    setUpdates(loadKey(key))
  }, [patientId])

  function persist(list) { saveKey(key, list); setUpdates(list) }

  function addUpdate(data) {
    const u = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    }
    const next = [u, ...updates]
    persist(next)
    return u
  }

  function updateUpdate(updateId, data) {
    persist(updates.map(u => u.id === updateId ? { ...u, ...data } : u))
  }

  function deleteUpdate(updateId) {
    persist(updates.filter(u => u.id !== updateId))
  }

  return { updates, loading: false, error: null, addUpdate, updateUpdate, deleteUpdate }
}
