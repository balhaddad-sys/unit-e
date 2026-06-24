import { useState, useEffect } from 'react'
import {
  collection, onSnapshot, addDoc, updateDoc, deleteDoc,
  doc, serverTimestamp, query, orderBy,
} from 'firebase/firestore'
import { db } from '../firebase'

function updatesRef(uid, patientId) {
  return collection(db, 'users', uid, 'patients', patientId, 'dailyUpdates')
}

export function useDailyUpdates(uid, patientId) {
  const [updates, setUpdates] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!uid || !patientId) return
    const q = query(updatesRef(uid, patientId), orderBy('createdAt', 'desc'))
    const unsub = onSnapshot(
      q,
      (snap) => {
        setUpdates(snap.docs.map(d => ({ id: d.id, ...d.data() })))
        setLoading(false)
      },
      (err) => {
        console.error('useDailyUpdates error:', err)
        setError(err.message)
        setLoading(false)
      },
    )
    return unsub
  }, [uid, patientId])

  async function addUpdate(data) {
    return addDoc(updatesRef(uid, patientId), {
      ...data,
      createdAt: serverTimestamp(),
    })
  }

  async function updateUpdate(updateId, data) {
    return updateDoc(doc(db, 'users', uid, 'patients', patientId, 'dailyUpdates', updateId), data)
  }

  async function deleteUpdate(updateId) {
    return deleteDoc(doc(db, 'users', uid, 'patients', patientId, 'dailyUpdates', updateId))
  }

  return { updates, loading, error, addUpdate, updateUpdate, deleteUpdate }
}
