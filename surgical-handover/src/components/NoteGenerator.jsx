import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { buildFullPrompt } from '../utils/noteBuilder'
import { formatNote, getApiKey } from '../utils/deepseekClient'

export default function NoteGenerator({ patient, initialUpdate, onSaveNote }) {
  const [roughNote, setRoughNote] = useState('')
  const [generatedNote, setGeneratedNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const outputRef = useRef(null)
  const hasKey = Boolean(getApiKey())

  async function generateNote() {
    const input = roughNote.trim()
    if (!input) { setError('Please paste a clinical note first.'); return }
    setError('')
    setLoading(true)
    try {
      const patientContext = patient ? buildFullPrompt(patient, null) : ''
      const note = await formatNote(input, patientContext || undefined)
      setGeneratedNote(note)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function copyToClipboard() {
    try {
      await navigator.clipboard.writeText(generatedNote)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      outputRef.current?.select()
      document.execCommand('copy')
    }
  }

  function clearAll() {
    setRoughNote('')
    setGeneratedNote('')
    setError('')
  }

  return (
    <div className="space-y-4">
      {/* Warning banner */}
      <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-xl">
        <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-2.194-.833-2.964 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
        <p className="text-xs text-amber-800 font-medium">
          Review before pasting into an official medical document. AI may make errors — always verify clinical facts.
        </p>
      </div>

      {/* No API key notice */}
      {!hasKey && (
        <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-xl">
          <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-xs text-blue-800 font-medium">
            Add your DeepSeek API key in{' '}
            <Link to="/settings" className="underline">Settings</Link>{' '}
            to enable AI note formatting.
          </p>
        </div>
      )}

      {/* Input area */}
      <div>
        <label className="label text-slate-600">Paste rough note here</label>
        <textarea
          className="input-field font-mono text-sm"
          rows={10}
          value={roughNote}
          onChange={e => setRoughNote(e.target.value)}
          placeholder={`Paste your rough ward note here, e.g.:\n\nJacqueline\n46 y/o progress note. Presented with sudden-onset severe abdominal pain...\nO: BP 150/90, HR 76, afebrile...\nLabs: WBC 10.4, Lipase >300...\nPlan: Losec, Perfalgan, I/O chart...`}
          spellCheck={false}
        />
        <p className="mt-1 text-xs text-slate-400">{roughNote.length} characters</p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
      )}

      {/* Action buttons */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={generateNote}
          disabled={loading || !roughNote.trim() || !hasKey}
          className="btn-primary"
        >
          {loading ? (
            <>
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              Formatting...
            </>
          ) : '✨ Generate Note'}
        </button>
        <button onClick={clearAll} className="btn-ghost text-slate-500">
          Clear
        </button>
      </div>

      {/* Output */}
      {generatedNote && (
        <div className="mt-2">
          <div className="flex items-center justify-between mb-2">
            <label className="label text-slate-600 mb-0">Generated Note</label>
            <div className="flex gap-2">
              <button onClick={copyToClipboard} className={`btn-primary text-xs ${copied ? 'bg-emerald-600 hover:bg-emerald-700' : ''}`}>
                {copied ? '✓ Copied!' : '📋 Copy'}
              </button>
              {onSaveNote && (
                <button onClick={() => onSaveNote(generatedNote)} className="btn-secondary text-xs">
                  Save to Patient
                </button>
              )}
            </div>
          </div>
          <textarea
            ref={outputRef}
            className="input-field note-output bg-slate-900 text-emerald-400 border-slate-700"
            rows={25}
            value={generatedNote}
            onChange={e => setGeneratedNote(e.target.value)}
            spellCheck={false}
          />
          {/* Sticky copy at bottom on mobile */}
          <div className="sticky bottom-16 md:bottom-4 mt-2 flex justify-end">
            <button onClick={copyToClipboard} className={`btn-primary shadow-lg ${copied ? 'bg-emerald-600 hover:bg-emerald-700' : ''}`}>
              {copied ? '✓ Copied to Clipboard!' : '📋 Copy to Clipboard'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
