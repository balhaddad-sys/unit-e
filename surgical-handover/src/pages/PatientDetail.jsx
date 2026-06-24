import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { usePatients } from '../hooks/usePatients'
import { useDailyUpdates } from '../hooks/useDailyUpdates'
import DailyUpdateForm from '../components/DailyUpdateForm'
import NoteGenerator from '../components/NoteGenerator'
import ExportModal from '../components/ExportModal'
import { calcPOD, podLabel } from '../utils/podCalculator'
import { buildFullPrompt } from '../utils/noteBuilder'
import { clearAutoSave } from '../hooks/useAutoSave'

function ts(firebaseTs) {
  if (!firebaseTs) return 'N/A'
  const d = firebaseTs?.toDate ? firebaseTs.toDate() : new Date(firebaseTs)
  if (isNaN(d.getTime())) return 'N/A'
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

function InfoRow({ label, value }) {
  if (!value && value !== false) return null
  return (
    <div className="flex gap-3">
      <span className="text-xs text-slate-400 w-32 flex-shrink-0 pt-0.5">{label}</span>
      <span className="text-sm text-slate-800 flex-1">{typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value}</span>
    </div>
  )
}

function UpdateCard({ update, onDelete, onCopyNote }) {
  const [expanded, setExpanded] = useState(false)
  const [copied, setCopied] = useState(false)
  const hasDeterioration = update.fever || update.desaturation || update.hypotension || update.tachycardia || update.icuReview === 'Yes' || update.metCall === 'Yes'

  async function copyNote() {
    const text = update.generatedNote || buildRaw(update)
    await navigator.clipboard.writeText(text).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function buildRaw(u) {
    return [u.assessment && `A: ${u.assessment}`, u.plan && `P:\n${u.plan}`, u.closingTasks && `Closing: ${u.closingTasks}`].filter(Boolean).join('\n\n')
  }

  return (
    <div className={`card ${hasDeterioration ? 'border-red-200' : ''}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-800">{ts(update.createdAt || update.date)}</p>
          <p className="text-xs text-slate-400 mt-0.5">{podLabel(update.pod)}</p>
          {hasDeterioration && (
            <p className="text-xs text-red-600 font-semibold mt-1">⚠ Deterioration documented</p>
          )}
        </div>
        <div className="flex gap-2">
          <button onClick={copyNote} className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-colors ${copied ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
            {copied ? '✓' : '📋'}
          </button>
          <button onClick={() => setExpanded(e => !e)} className="text-xs px-2.5 py-1 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium">
            {expanded ? 'Collapse' : 'Expand'}
          </button>
          <button onClick={onDelete} className="text-xs px-2.5 py-1 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 font-medium">
            Delete
          </button>
        </div>
      </div>

      {expanded && (
        <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
          {update.generatedNote ? (
            <div>
              <p className="text-xs font-semibold text-slate-400 mb-1">Generated Note</p>
              <pre className="note-output bg-slate-900 text-emerald-400 p-3 rounded-lg text-xs overflow-auto max-h-80">{update.generatedNote}</pre>
            </div>
          ) : (
            <>
              {update.subjectiveSymptoms && <InfoRow label="Symptoms" value={update.subjectiveSymptoms} />}
              {update.labs && <InfoRow label="Labs" value={update.labs} />}
              {update.assessment && <InfoRow label="Assessment" value={update.assessment} />}
              {update.plan && <InfoRow label="Plan" value={update.plan} />}
              {update.closingTasks && <InfoRow label="Closing" value={update.closingTasks} />}
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default function PatientDetail({ user }) {
  const { patientId } = useParams()
  const navigate = useNavigate()
  const { patients, updatePatient, setPatientStatus } = usePatients(user?.uid)
  const { updates, addUpdate, deleteUpdate, updateUpdate } = useDailyUpdates(user?.uid, patientId)
  const [activeTab, setActiveTab] = useState('overview')
  const [showAddUpdate, setShowAddUpdate] = useState(false)
  const [showExport, setShowExport] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [noteError, setNoteError] = useState('')

  const patient = patients.find(p => p.id === patientId)
  const pod = patient ? calcPOD(patient.operationDate) : null
  const saveKey = `update-draft-${patientId}`

  if (!patient && patients.length > 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-slate-500">Patient not found.</p>
        <Link to="/" className="btn-primary mt-4 inline-flex">Back to Dashboard</Link>
      </div>
    )
  }

  async function handleAddUpdate(formData) {
    await addUpdate(formData)
    clearAutoSave(saveKey)
    setShowAddUpdate(false)
    setActiveTab('updates')
  }

  async function handleGenerateAndSave(formData) {
    setGenerating(true)
    setNoteError('')
    try {
      const prompt = buildFullPrompt(patient, formData)
      const res = await fetch('/api/format-note', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roughNote: prompt }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to generate note')

      await addUpdate({ ...formData, generatedNote: data.note, rawInput: prompt })
      clearAutoSave(saveKey)
      setShowAddUpdate(false)
      setActiveTab('updates')
    } catch (err) {
      setNoteError(err.message)
    } finally {
      setGenerating(false)
    }
  }

  async function handleSaveNote(note) {
    if (updates.length > 0) {
      await updateUpdate(updates[0].id, { generatedNote: note })
    }
  }

  return (
    <div className="pb-24 md:pb-8 max-w-3xl mx-auto">
      {/* Back + actions header */}
      <div className="sticky top-0 z-20 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between md:top-0">
        <Link to="/" className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Patients
        </Link>
        <div className="flex gap-2">
          <Link to={`/patients/${patientId}/edit`} className="btn-secondary text-xs px-3 py-1.5">Edit</Link>
          <button onClick={() => setShowExport(true)} className="btn-ghost text-xs px-3 py-1.5">Export</button>
        </div>
      </div>

      {/* Patient header */}
      {patient && (
        <div className="p-4">
          <div className="card mb-4">
            <div className="flex items-start justify-between flex-wrap gap-3">
              <div>
                <h1 className="text-xl font-bold text-slate-900">{patient.name}</h1>
                <p className="text-sm text-slate-500 mt-0.5">
                  {patient.age}y {patient.sex}{patient.nationality ? ` · ${patient.nationality}` : ''}
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {patient.ward && <span className="badge-ward">{patient.ward}</span>}
                {patient.bed && <span className="badge bg-slate-100 text-slate-600">Bed {patient.bed}</span>}
                {pod !== null && <span className="badge bg-hospital-100 text-hospital-700">{podLabel(pod)}</span>}
                <span className={patient.status === 'active' ? 'badge-active' : 'badge-discharged'}>
                  {patient.status === 'active' ? 'Active' : 'Discharged'}
                </span>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100">
              <p className="text-sm font-medium text-slate-800">{patient.primaryDiagnosis || <span className="text-slate-400 italic">No diagnosis</span>}</p>
              {patient.consultant && <p className="text-xs text-slate-400 mt-0.5">{patient.consultant}</p>}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1.5 mb-4 overflow-x-auto scrollbar-thin pb-1">
            {['overview', 'updates', 'generate'].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={activeTab === tab ? 'tab-btn-active flex-shrink-0' : 'tab-btn-inactive flex-shrink-0'}>
                {tab === 'overview' ? 'Overview' : tab === 'updates' ? `Updates (${updates.length})` : '✨ Generate Note'}
              </button>
            ))}
          </div>

          {/* Overview tab */}
          {activeTab === 'overview' && (
            <div className="card space-y-2">
              <InfoRow label="Consultant" value={patient.consultant} />
              <InfoRow label="Ward / Bed" value={[patient.ward, patient.bed].filter(Boolean).join(' / ')} />
              <InfoRow label="Admitted" value={ts(patient.admissionDate)} />
              <InfoRow label="Nationality" value={patient.nationality} />
              <InfoRow label="Primary Dx" value={patient.primaryDiagnosis} />
              <InfoRow label="Secondary Dx" value={patient.secondaryDiagnoses} />
              <InfoRow label="Operation" value={patient.operation} />
              <InfoRow label="Op Date" value={ts(patient.operationDate)} />
              <InfoRow label="POD" value={pod !== null ? String(pod) : null} />
              <InfoRow label="Op Findings" value={patient.operativeFindings} />
              <InfoRow label="Drain" value={patient.drainInserted ? 'Yes' : 'No'} />
              <InfoRow label="Antibiotics" value={patient.antibiotics} />
              <InfoRow label="Medications" value={patient.regularMedications} />
              <InfoRow label="Background" value={patient.backgroundHistory} />
              <div className="pt-3 border-t border-slate-100">
                <button
                  onClick={() => setPatientStatus(patientId, patient.status === 'active' ? 'discharged' : 'active')}
                  className={`btn-secondary text-xs ${patient.status === 'active' ? 'text-slate-600' : 'text-emerald-600'}`}
                >
                  {patient.status === 'active' ? 'Mark as Discharged' : 'Mark as Active'}
                </button>
              </div>
            </div>
          )}

          {/* Updates tab */}
          {activeTab === 'updates' && (
            <div>
              {noteError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 mb-4">{noteError}</div>
              )}
              {showAddUpdate ? (
                <div className="card">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-slate-800">Add Daily Update</h3>
                    <button onClick={() => setShowAddUpdate(false)} className="text-slate-400 hover:text-slate-600">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <DailyUpdateForm
                    patient={patient}
                    saveKey={saveKey}
                    onSubmit={handleAddUpdate}
                    onCancel={() => setShowAddUpdate(false)}
                    onGenerateNote={handleGenerateAndSave}
                    generating={generating}
                  />
                </div>
              ) : (
                <button onClick={() => setShowAddUpdate(true)} className="btn-primary w-full mb-4 justify-center">
                  + Add Today's Update
                </button>
              )}

              <div className="space-y-3">
                {updates.length === 0 && !showAddUpdate && (
                  <p className="text-center text-slate-400 text-sm py-8">No updates yet. Add today's update above.</p>
                )}
                {updates.map(u => (
                  <UpdateCard
                    key={u.id}
                    update={u}
                    onDelete={() => deleteUpdate(u.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Generate Note tab */}
          {activeTab === 'generate' && (
            <div className="card">
              <NoteGenerator patient={patient} onSaveNote={handleSaveNote} />
            </div>
          )}
        </div>
      )}

      {/* Export modal */}
      {showExport && patient && (
        <ExportModal
          patient={patient}
          updates={updates}
          allActivePatients={[{ patient, updates }]}
          onClose={() => setShowExport(false)}
        />
      )}
    </div>
  )
}
