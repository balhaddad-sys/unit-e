import { useState } from 'react'

function load(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key) ?? 'null') ?? fallback }
  catch { return fallback }
}
function save(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)) } catch {}
}

export function usePatients() {
  const [patients, setPatients] = useState(() => load('ue:patients', []))

  function persist(list) { save('ue:patients', list); setPatients(list) }

  function addPatient(data) {
    const p = {
      ...data,
      id: crypto.randomUUID(),
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    persist([p, ...patients])
    return p
  }

  function updatePatient(id, data) {
    persist(patients.map(p => p.id === id ? { ...p, ...data, updatedAt: new Date().toISOString() } : p))
  }

  function deletePatient(id) {
    persist(patients.filter(p => p.id !== id))
    localStorage.removeItem(`ue:updates:${id}`)
  }

  function setPatientStatus(id, status) { updatePatient(id, { status }) }

  return { patients, loading: false, error: null, addPatient, updatePatient, deletePatient, setPatientStatus }
}
