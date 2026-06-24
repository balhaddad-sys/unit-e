import { useState, useEffect } from 'react'
import { useAutoSave, loadAutoSave } from '../hooks/useAutoSave'
import { calcPOD } from '../utils/podCalculator'
import { WARDS } from './WardFilter'

const WARD_OPTIONS = WARDS.filter(w => w !== 'All')
const SEX_OPTIONS = ['Male', 'Female', 'Other']

const EMPTY = {
  name: '', age: '', sex: '', nationality: '', ward: '', bed: '',
  consultant: '', primaryDiagnosis: '', secondaryDiagnoses: '',
  admissionDate: '', operation: '', operationDate: '', pod: '',
  operativeFindings: '', drainInserted: false, antibiotics: '',
  regularMedications: '', backgroundHistory: '',
}

function toDateInput(firebaseTs) {
  if (!firebaseTs) return ''
  const d = firebaseTs?.toDate ? firebaseTs.toDate() : new Date(firebaseTs)
  if (isNaN(d.getTime())) return ''
  return d.toISOString().slice(0, 10)
}

export default function PatientForm({ initialData, onSubmit, onCancel, saveKey = 'patient-form' }) {
  const [form, setForm] = useState(() => {
    if (initialData) {
      return {
        ...EMPTY,
        ...initialData,
        admissionDate: toDateInput(initialData.admissionDate),
        operationDate: toDateInput(initialData.operationDate),
        pod: initialData.pod ?? '',
      }
    }
    return loadAutoSave(saveKey) || EMPTY
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useAutoSave(saveKey, form)

  const autoPOD = form.operationDate ? calcPOD(form.operationDate) : null

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.name.trim()) { setError('Patient name is required.'); return }
    setError('')
    setSubmitting(true)
    try {
      await onSubmit({
        ...form,
        age: form.age ? Number(form.age) : null,
        pod: form.pod !== '' ? Number(form.pod) : (autoPOD ?? null),
        admissionDate: form.admissionDate || null,
        operationDate: form.operationDate || null,
        drainInserted: Boolean(form.drainInserted),
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
      )}

      {/* Patient identity */}
      <fieldset>
        <legend className="section-header">Patient Identity</legend>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="sm:col-span-2">
            <label className="label">Full Name *</label>
            <input className="input-field" value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Jacqueline Doe" required />
          </div>
          <div>
            <label className="label">Age (years)</label>
            <input className="input-field" type="number" min="0" max="150" value={form.age} onChange={e => set('age', e.target.value)} placeholder="46" />
          </div>
          <div>
            <label className="label">Sex</label>
            <select className="select-field" value={form.sex} onChange={e => set('sex', e.target.value)}>
              <option value="">Select sex</option>
              {SEX_OPTIONS.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Nationality</label>
            <input className="input-field" value={form.nationality} onChange={e => set('nationality', e.target.value)} placeholder="e.g. Qatari" />
          </div>
          <div>
            <label className="label">Consultant</label>
            <input className="input-field" value={form.consultant} onChange={e => set('consultant', e.target.value)} placeholder="e.g. Dr. Al-Mansouri" />
          </div>
        </div>
      </fieldset>

      {/* Location */}
      <fieldset>
        <legend className="section-header">Location</legend>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div>
            <label className="label">Ward</label>
            <select className="select-field" value={form.ward} onChange={e => set('ward', e.target.value)}>
              <option value="">Select ward</option>
              {WARD_OPTIONS.map(w => <option key={w}>{w}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Bed</label>
            <input className="input-field" value={form.bed} onChange={e => set('bed', e.target.value)} placeholder="e.g. 14A" />
          </div>
          <div>
            <label className="label">Admission Date</label>
            <input className="input-field" type="date" value={form.admissionDate} onChange={e => set('admissionDate', e.target.value)} />
          </div>
        </div>
      </fieldset>

      {/* Diagnoses */}
      <fieldset>
        <legend className="section-header">Diagnoses</legend>
        <div className="space-y-3">
          <div>
            <label className="label">Primary Diagnosis</label>
            <input className="input-field" value={form.primaryDiagnosis} onChange={e => set('primaryDiagnosis', e.target.value)} placeholder="e.g. Acute biliary pancreatitis" />
          </div>
          <div>
            <label className="label">Secondary Diagnoses</label>
            <textarea className="input-field" rows={2} value={form.secondaryDiagnoses} onChange={e => set('secondaryDiagnoses', e.target.value)} placeholder="e.g. Hypertension, Type 2 Diabetes" />
          </div>
        </div>
      </fieldset>

      {/* Operation */}
      <fieldset>
        <legend className="section-header">Operation</legend>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="label">Operation</label>
            <input className="input-field" value={form.operation} onChange={e => set('operation', e.target.value)} placeholder="e.g. Laparoscopic cholecystectomy" />
          </div>
          <div>
            <label className="label">Operation Date</label>
            <input className="input-field" type="date" value={form.operationDate} onChange={e => set('operationDate', e.target.value)} />
          </div>
          <div>
            <label className="label">POD {autoPOD !== null && form.pod === '' && <span className="text-hospital-600">(auto: {autoPOD})</span>}</label>
            <input className="input-field" type="number" min="0" value={form.pod} onChange={e => set('pod', e.target.value)} placeholder={autoPOD !== null ? `Auto: ${autoPOD}` : 'e.g. 3'} />
          </div>
          <div>
            <label className="label">Drain Inserted</label>
            <div className="flex items-center gap-3 mt-1">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="radio" name="drain" checked={form.drainInserted === true} onChange={() => set('drainInserted', true)} className="text-hospital-600" />
                Yes
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="radio" name="drain" checked={form.drainInserted === false} onChange={() => set('drainInserted', false)} className="text-hospital-600" />
                No
              </label>
            </div>
          </div>
          <div className="sm:col-span-2">
            <label className="label">Operative Findings</label>
            <textarea className="input-field" rows={2} value={form.operativeFindings} onChange={e => set('operativeFindings', e.target.value)} placeholder="e.g. Gangrenous gallbladder, no bile leak, drain placed in Morrison's pouch" />
          </div>
        </div>
      </fieldset>

      {/* Medications */}
      <fieldset>
        <legend className="section-header">Medications</legend>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="label">Antibiotics</label>
            <textarea className="input-field" rows={2} value={form.antibiotics} onChange={e => set('antibiotics', e.target.value)} placeholder="e.g. Augmentin 1.2g IV TDS" />
          </div>
          <div>
            <label className="label">Regular Medications</label>
            <textarea className="input-field" rows={2} value={form.regularMedications} onChange={e => set('regularMedications', e.target.value)} placeholder="e.g. Metformin 500mg BD, Amlodipine 5mg OD" />
          </div>
        </div>
      </fieldset>

      {/* Background */}
      <fieldset>
        <legend className="section-header">Background History</legend>
        <textarea className="input-field" rows={3} value={form.backgroundHistory} onChange={e => set('backgroundHistory', e.target.value)} placeholder="e.g. Known DM2, HTN, previous laparotomy 2019" />
      </fieldset>

      {/* Actions */}
      <div className="flex gap-3 pt-2 border-t border-slate-200">
        <button type="submit" disabled={submitting} className="btn-primary">
          {submitting ? 'Saving...' : initialData ? 'Update Patient' : 'Add Patient'}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn-secondary">
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}
