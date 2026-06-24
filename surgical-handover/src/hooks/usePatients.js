import { useState, useEffect } from 'react'
import {
  collection, onSnapshot, addDoc, updateDoc, deleteDoc,
  doc, serverTimestamp, query, orderBy,
} from 'firebase/firestore'
import { db } from '../firebase'

function patientsRef(uid) {
  return collection(db, 'users', uid, 'patients')
}

export function usePatients(uid) {
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!uid) return
    const q = query(patientsRef(uid), orderBy('createdAt', 'desc'))
    const unsub = onSnapshot(
      q,
      (snap) => {
        setPatients(snap.docs.map(d => ({ id: d.id, ...d.data() })))
        setLoading(false)
      },
      (err) => {
        console.error('usePatients error:', err)
        setError(err.message)
        setLoading(false)
      },
    )
    return unsub
  }, [uid])

  async function addPatient(data) {
    return addDoc(patientsRef(uid), {
      ...data,
      status: 'active',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
  }

  async function updatePatient(patientId, data) {
    return updateDoc(doc(db, 'users', uid, 'patients', patientId), {
      ...data,
      updatedAt: serverTimestamp(),
    })
  }

  async function deletePatient(patientId) {
    return deleteDoc(doc(db, 'users', uid, 'patients', patientId))
  }

  async function setPatientStatus(patientId, status) {
    return updateDoc(doc(db, 'users', uid, 'patients', patientId), {
      status,
      updatedAt: serverTimestamp(),
    })
  }

  return { patients, loading, error, addPatient, updatePatient, deletePatient, setPatientStatus }
}
