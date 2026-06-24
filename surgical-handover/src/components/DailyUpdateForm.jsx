import { useState } from 'react'
import { useAutoSave, loadAutoSave } from '../hooks/useAutoSave'
import { calcPOD } from '../utils/podCalculator'

const DIET_OPTIONS = ['NBM', 'Sips only', 'Clear fluids', 'Soft diet', 'Normal diet', 'Fat-free diet', 'Low-residue diet']
const BOOL_OPTIONS = ['No', 'Yes']
const AMBULATION_OPTIONS = ['Not ambulating', 'Assisted', 'Independent']
const PAIN_OPTIONS = ['No pain', 'Mild', 'Moderate', 'Severe', 'On analgesia']

function TextField({ label, value, onChange, placeholder, rows = 2, className = '' }) {
  return (
    <div className={className}>
      <label className="label">{label}</label>
      <textarea className="input-field" rows={rows} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  )
}

function SelectField({ label, value, onChange, options, className = '' }) {
  return (
    <div className={className}>
      <label className="label">{label}</label>
      <select className="select-field" value={value} onChange={e => onChange(e.target.value)}>
        <option value="">—</option>
        {options.map(o => <option key={o}>{o}</option>)}
      </select>
    </div>
  )
}

function TextInput({ label, value, onChange, placeholder, className = '' }) {
  return (
    <div className={className}>
      <label className="label">{label}</label>
      <input className="input-field" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  )
}

const EMPTY = {
  date: new Date().toISOString().slice(0, 10),
  pod: '',
  subjectiveSymptoms: '', painStatus: '', nauseaVomiting: '',
  dietTolerance: '', bowelMotion: '', flatus: '', ambulation: '',
  fever: '', desaturation: '', oxygenRequirement: '',
  hypotension: '', tachycardia: '', icuReview: '', metCall: '',
  newImaging: '', newProcedure: '',
  drainOutput: '', drainCharacter: '', inputOutput: '',
  labs: '', assessment: '', plan: '', closingTasks: '',
}

export default function DailyUpdateForm({ patient, saveKey, onSubmit, onCancel, onGenerateNote, generating = false }) {
  const [form, setForm] = useState(() => loadAutoSave(saveKey) || {
    ...EMPTY,
    pod: patient?.operationDate ? (calcPOD(patient.operationDate) ?? '') : '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useAutoSave(saveKey, form)

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }))
  }

  const hasDeterioration = form.fever || form.desaturation || form.hypotension || form.tachycardia || form.icuReview || form.metCall

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await onSubmit({ ...form, pod: form.pod !== '' ? Number(form.pod) : null })
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

      {/* Date + POD */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Date</label>
          <input className="input-field" type="date" value={form.date} onChange={e => set('date', e.target.value)} />
        </div>
        <div>
          <label className="label">POD</label>
          <input className="input-field" type="number" min="0" value={form.pod} onChange={e => set('pod', e.target.value)} placeholder="e.g. 1" />
        </div>
      </div>

      {/* Subjective */}
      <fieldset>
        <legend className="section-header">Subjective</legend>
        <div className="space-y-3">
          <TextField label="Symptoms / Complaints" value={form.subjectiveSymptoms} onChange={v => set('subjectiveSymptoms', v)} placeholder="e.g. Complaining of mild epigastric pain, improved from yesterday" rows={3} />
          <div className="grid grid-cols-2 gap-3">
            <SelectField label="Pain" value={form.painStatus} onChange={v => set('painStatus', v)} options={PAIN_OPTIONS} />
            <SelectField label="Nausea / Vomiting" value={form.nauseaVomiting} onChange={v => set('nauseaVomiting', v)} options={BOOL_OPTIONS} />
            <SelectField label="Diet Tolerance" value={form.dietTolerance} onChange={v => set('dietTolerance', v)} options={DIET_OPTIONS} />
            <SelectField label="Bowel Motion" value={form.bowelMotion} onChange={v => set('bowelMotion', v)} options={BOOL_OPTIONS} />
            <SelectField label="Flatus" value={form.flatus} onChange={v => set('flatus', v)} options={BOOL_OPTIONS} />
            <SelectField label="Ambulation" value={form.ambulation} onChange={v => set('ambulation', v)} options={AMBULATION_OPTIONS} />
          </div>
        </div>
      </fieldset>

      {/* Objective data */}
      <fieldset>
        <legend className="section-header">Objective</legend>
        <div className="space-y-3">
          <TextField label="Labs" value={form.labs} onChange={v => set('labs', v)} placeholder="e.g. WBC 12.4, CRP 45, Hb 108, Cr 68" rows={3} />
          <div className="grid grid-cols-2 gap-3">
            <TextInput label="Drain Output" value={form.drainOutput} onChange={v => set('drainOutput', v)} placeholder="e.g. 40 mL" />
            <TextInput label="Drain Character" value={form.drainCharacter} onChange={v => set('drainCharacter', v)} placeholder="e.g. Serous" />
            <TextInput label="Input / Output" value={form.inputOutput} onChange={v => set('inputOutput', v)} placeholder="e.g. In 1200 mL / Out 900 mL" />
          </div>
        </div>
      </fieldset>

      {/* Deterioration — highlighted section */}
      <fieldset className={`p-4 rounded-xl border-2 ${hasDeterioration ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-slate-50'}`}>
        <legend className={`text-xs font-bold uppercase tracking-widest mb-3 ${hasDeterioration ? 'text-red-600' : 'text-slate-400'}`}>
          {hasDeterioration ? '⚠ Deterioration / Alerts' : 'Deterioration / Alerts'}
        </legend>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <TextInput label="Fever" value={form.fever} onChange={v => set('fever', v)} placeholder="e.g. 38.5°C" />
          <TextInput label="Desaturation" value={form.desaturation} onChange={v => set('desaturation', v)} placeholder="e.g. SpO2 88% on RA" />
          <TextInput label="O2 Requirement" value={form.oxygenRequirement} onChange={v => set('oxygenRequirement', v)} placeholder="e.g. 4L via NC" />
          <TextInput label="Hypotension" value={form.hypotension} onChange={v => set('hypotension', v)} placeholder="e.g. BP 88/60" />
          <TextInput label="Tachycardia" value={form.tachycardia} onChange={v => set('tachycardia', v)} placeholder="e.g. HR 118" />
          <SelectField label="ICU Review" value={form.icuReview} onChange={v => set('icuReview', v)} options={BOOL_OPTIONS} />
          <SelectField label="MET Call" value={form.metCall} onChange={v => set('metCall', v)} options={BOOL_OPTIONS} />
          <TextInput label="New Imaging" value={form.newImaging} onChange={v => set('newImaging', v)} placeholder="e.g. CT abdomen ordered" />
          <TextInput label="New Procedure" value={form.newProcedure} onChange={v => set('newProcedure', v)} placeholder="e.g. Drain repositioned" />
        </div>
      </fieldset>

      {/* Assessment & Plan */}
      <fieldset>
        <legend className="section-header">Assessment & Plan</legend>
        <div className="space-y-3">
          <TextField label="Assessment" value={form.assessment} onChange={v => set('assessment', v)} placeholder="e.g. Post-op day 2 after open appendicectomy, recovering well" rows={3} />
          <TextField label="Plan" value={form.plan} onChange={v => set('plan', v)} placeholder="- Continue antibiotics&#10;- Allow soft diet&#10;- Monitor drain&#10;- Remove urinary catheter" rows={5} />
          <TextField label="Closing Tasks" value={form.closingTasks} onChange={v => set('closingTasks', v)} placeholder="e.g. Full labs tomorrow, surgical review in AM, wean O2" rows={3} />
        </div>
      </fieldset>

      {/* Actions */}
      <div className="flex flex-wrap gap-3 pt-2 border-t border-slate-200 sticky bottom-16 md:bottom-0 bg-white py-3 -mx-4 px-4 md:mx-0 md:px-0">
        {onGenerateNote && (
          <button type="button" onClick={() => onGenerateNote(form)} disabled={generating} className="btn-primary">
            {generating ? (
              <>
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Generating...
              </>
            ) : '✨ Generate Note'}
          </button>
        )}
        <button type="submit" disabled={submitting} className="btn-secondary">
          {submitting ? 'Saving...' : 'Save Update'}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn-ghost">Cancel</button>
        )}
      </div>
    </form>
  )
}
