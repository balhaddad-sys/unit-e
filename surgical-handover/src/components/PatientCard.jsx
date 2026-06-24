import { Link } from 'react-router-dom'
import { calcPOD, podLabel } from '../utils/podCalculator'

function timeAgo(firebaseTs) {
  if (!firebaseTs) return 'Never'
  const d = firebaseTs?.toDate ? firebaseTs.toDate() : new Date(firebaseTs)
  if (isNaN(d.getTime())) return 'Unknown'
  const now = Date.now()
  const diff = now - d.getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

export default function PatientCard({ patient, lastUpdate }) {
  const pod = calcPOD(patient.operationDate)
  const isActive = patient.status === 'active'

  return (
    <Link to={`/patients/${patient.id}`} className="card hover:shadow-md transition-shadow block group">
      {/* Header row */}
      <div className="flex items-start justify-between mb-2">
        <div className="min-w-0">
          <h3 className="font-semibold text-slate-900 group-hover:text-hospital-700 transition-colors truncate">
            {patient.name || 'Unnamed Patient'}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {patient.age ? `${patient.age}y` : '?y'} {patient.sex || ''}{patient.nationality ? ` · ${patient.nationality}` : ''}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1 ml-2">
          <span className={isActive ? 'badge-active' : 'badge-discharged'}>
            {isActive ? 'Active' : 'Discharged'}
          </span>
          {pod !== null && (
            <span className="badge bg-slate-100 text-slate-600 text-xs">{podLabel(pod)}</span>
          )}
        </div>
      </div>

      {/* Ward/bed/consultant */}
      <div className="flex items-center gap-2 mb-2 flex-wrap">
        {patient.ward && (
          <span className="badge-ward">{patient.ward}</span>
        )}
        {patient.bed && (
          <span className="text-xs text-slate-500">Bed {patient.bed}</span>
        )}
        {patient.consultant && (
          <span className="text-xs text-slate-400 truncate">{patient.consultant}</span>
        )}
      </div>

      {/* Diagnosis */}
      <p className="text-sm text-slate-700 line-clamp-2 mb-2">
        {patient.primaryDiagnosis || <span className="text-slate-400 italic">No diagnosis documented</span>}
      </p>

      {/* Key issue alert */}
      {lastUpdate && (lastUpdate.fever || lastUpdate.desaturation || lastUpdate.hypotension || lastUpdate.tachycardia || lastUpdate.icuReview || lastUpdate.metCall) && (
        <div className="mt-2 p-2 bg-red-50 rounded-lg border border-red-100">
          <p className="text-xs font-semibold text-red-700">
            Alert: {[
              lastUpdate.fever && 'Fever',
              lastUpdate.desaturation && 'Desaturation',
              lastUpdate.hypotension && 'Hypotension',
              lastUpdate.tachycardia && 'Tachycardia',
              lastUpdate.icuReview && 'ICU Review',
              lastUpdate.metCall && 'MET Call',
            ].filter(Boolean).join(' · ')}
          </p>
        </div>
      )}

      {/* Footer */}
      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
        <span className="text-xs text-slate-400">
          Last update: {lastUpdate ? timeAgo(lastUpdate.createdAt) : 'None'}
        </span>
        <svg className="w-4 h-4 text-slate-300 group-hover:text-hospital-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </Link>
  )
}
