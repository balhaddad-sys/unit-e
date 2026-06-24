import { useState } from 'react'
import { exportSinglePatient, exportAllActivePatients, copyToClipboard } from '../utils/exportPatients'

export default function ExportModal({ patient, updates, allActivePatients, onClose }) {
  const [copied, setCopied] = useState(false)
  const [exporting, setExporting] = useState(false)

  async function handleExportSingle() {
    exportSinglePatient(patient, updates)
    onClose()
  }

  async function handleExportAll() {
    setExporting(true)
    try {
      exportAllActivePatients(allActivePatients)
      onClose()
    } finally {
      setExporting(false)
    }
  }

  async function handleCopyAll() {
    setExporting(true)
    try {
      const text = exportAllActivePatients(allActivePatients)
      await copyToClipboard(text)
      setCopied(true)
      setTimeout(() => { setCopied(false); onClose() }, 1500)
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
        <div className="p-5 border-b border-slate-200">
          <h2 className="font-semibold text-slate-900">Export Options</h2>
          <p className="text-sm text-slate-500 mt-1">Choose what to export</p>
        </div>
        <div className="p-4 space-y-2">
          {patient && (
            <button onClick={handleExportSingle} className="w-full btn-secondary justify-start gap-3 text-left">
              <svg className="w-5 h-5 text-hospital-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <div>
                <p className="font-semibold text-sm">Export {patient.name || 'this patient'}</p>
                <p className="text-xs text-slate-400">Download full patient summary with all updates</p>
              </div>
            </button>
          )}
          {allActivePatients && (
            <>
              <button onClick={handleExportAll} disabled={exporting} className="w-full btn-secondary justify-start gap-3 text-left">
                <svg className="w-5 h-5 text-hospital-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <div>
                  <p className="font-semibold text-sm">Export All Active Patients</p>
                  <p className="text-xs text-slate-400">Download complete handover document (.txt)</p>
                </div>
              </button>
              <button onClick={handleCopyAll} disabled={exporting} className="w-full btn-secondary justify-start gap-3 text-left">
                <svg className="w-5 h-5 text-hospital-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                </svg>
                <div>
                  <p className="font-semibold text-sm">{copied ? '✓ Copied!' : 'Copy All to Clipboard'}</p>
                  <p className="text-xs text-slate-400">Paste directly into Google Docs</p>
                </div>
              </button>
            </>
          )}
        </div>
        <div className="p-4 border-t border-slate-200">
          <button onClick={onClose} className="w-full btn-ghost text-slate-600">Cancel</button>
        </div>
      </div>
    </div>
  )
}
