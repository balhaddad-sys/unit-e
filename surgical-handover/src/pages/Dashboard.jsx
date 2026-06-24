import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { usePatients } from '../hooks/usePatients'
import PatientCard from '../components/PatientCard'
import WardFilter from '../components/WardFilter'
import ExportModal from '../components/ExportModal'

function SearchIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  )
}

export default function Dashboard({ user }) {
  const { patients, loading, error, setPatientStatus, deletePatient } = usePatients(user?.uid)
  const [search, setSearch] = useState('')
  const [activeWard, setActiveWard] = useState('All')
  const [showStatus, setShowStatus] = useState('active')
  const [showExport, setShowExport] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(null)

  const filtered = useMemo(() => {
    let list = patients.filter(p => p.status === showStatus)
    if (activeWard !== 'All') {
      list = list.filter(p => (p.ward || 'Unassigned') === activeWard)
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(p =>
        [p.name, p.ward, p.bed, p.primaryDiagnosis, p.consultant]
          .some(f => f?.toLowerCase().includes(q))
      )
    }
    return list
  }, [patients, showStatus, activeWard, search])

  const wardCounts = useMemo(() => {
    const active = patients.filter(p => p.status === showStatus)
    return active.reduce((acc, p) => {
      const w = p.ward || 'Unassigned'
      acc[w] = (acc[w] || 0) + 1
      return acc
    }, {})
  }, [patients, showStatus])

  const activePatients = patients.filter(p => p.status === 'active')

  async function handleDelete(patientId) {
    await deletePatient(patientId)
    setConfirmDelete(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-hospital-200 border-t-hospital-600 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-500">Loading patients...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 pb-24 md:pb-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Patients</h1>
          <p className="text-sm text-slate-500">{activePatients.length} active</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowExport(true)} className="btn-secondary text-xs px-3 py-2">
            Export
          </button>
          <Link to="/patients/add" className="btn-primary text-sm px-3 py-2">
            + Add
          </Link>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          className="input-field pl-9"
          placeholder="Search name, ward, bed, diagnosis, consultant..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Status toggle */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setShowStatus('active')}
          className={showStatus === 'active' ? 'tab-btn-active' : 'tab-btn-inactive'}
        >
          Active
        </button>
        <button
          onClick={() => setShowStatus('discharged')}
          className={showStatus === 'discharged' ? 'tab-btn-active' : 'tab-btn-inactive'}
        >
          Discharged
        </button>
      </div>

      {/* Ward filter */}
      <div className="mb-5">
        <WardFilter activeWard={activeWard} onChange={setActiveWard} counts={wardCounts} />
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 mb-4">{error}</div>
      )}

      {/* Patient grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <p className="text-slate-500 font-medium">No patients found</p>
          <p className="text-sm text-slate-400 mt-1">
            {search ? 'Try a different search term' : 'Add your first patient to get started'}
          </p>
          {!search && (
            <Link to="/patients/add" className="btn-primary mt-4 inline-flex">Add Patient</Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(patient => (
            <div key={patient.id} className="relative group/card">
              <PatientCard patient={patient} lastUpdate={null} />
              {/* Quick actions on hover */}
              <div className="absolute top-2 right-2 hidden group-hover/card:flex gap-1 z-10">
                <Link to={`/patients/${patient.id}/edit`}
                  className="p-1.5 bg-white rounded-lg shadow text-slate-500 hover:text-hospital-600 border border-slate-200"
                  title="Edit patient"
                  onClick={e => e.stopPropagation()}
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </Link>
                <button
                  onClick={e => { e.preventDefault(); setPatientStatus(patient.id, patient.status === 'active' ? 'discharged' : 'active') }}
                  className="p-1.5 bg-white rounded-lg shadow text-slate-500 hover:text-emerald-600 border border-slate-200"
                  title={patient.status === 'active' ? 'Mark discharged' : 'Mark active'}
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </button>
                <button
                  onClick={e => { e.preventDefault(); setConfirmDelete(patient.id) }}
                  className="p-1.5 bg-white rounded-lg shadow text-slate-500 hover:text-red-600 border border-slate-200"
                  title="Delete patient"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete confirmation */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-2.194-.833-2.964 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="font-semibold text-slate-900 mb-2">Delete Patient?</h3>
            <p className="text-sm text-slate-500 mb-5">This will permanently delete the patient and all their daily updates.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 btn-secondary">Cancel</button>
              <button onClick={() => handleDelete(confirmDelete)} className="flex-1 btn-danger">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Export modal */}
      {showExport && (
        <ExportModal
          allActivePatients={activePatients.map(p => ({ patient: p, updates: [] }))}
          onClose={() => setShowExport(false)}
        />
      )}
    </div>
  )
}
