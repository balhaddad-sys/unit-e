import { useState, useEffect } from 'react'

const SETTINGS_KEY = 'ue:settings'

function loadSettings() {
  try { return JSON.parse(localStorage.getItem(SETTINGS_KEY) ?? '{}') } catch { return {} }
}
function saveSettings(s) {
  try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(s)) } catch {}
}

export default function Settings() {
  const [settings, setSettings] = useState(() => loadSettings())
  const [showKey, setShowKey] = useState(false)
  const [saved, setSaved] = useState(false)
  const [cleared, setCleared] = useState(false)

  function handleSave(e) {
    e.preventDefault()
    saveSettings(settings)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function handleClearData() {
    if (!confirm('This will permanently delete all patients and daily updates stored on this device. Continue?')) return
    Object.keys(localStorage)
      .filter(k => k.startsWith('ue:'))
      .forEach(k => localStorage.removeItem(k))
    saveSettings({})
    setSettings({})
    setCleared(true)
    setTimeout(() => setCleared(false), 3000)
  }

  function handleExportData() {
    const data = {}
    Object.keys(localStorage)
      .filter(k => k.startsWith('ue:'))
      .forEach(k => { data[k] = localStorage.getItem(k) })
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `unit-e-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  function handleImportData(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result)
        if (!confirm(`Import ${Object.keys(data).length} items? This will overwrite existing data.`)) return
        Object.entries(data).forEach(([k, v]) => localStorage.setItem(k, v))
        const newSettings = loadSettings()
        setSettings(newSettings)
        alert('Data imported successfully. Refresh the page to see changes.')
      } catch {
        alert('Invalid backup file.')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  return (
    <div className="p-4 pb-24 md:pb-8 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900">Settings</h1>
        <p className="text-sm text-slate-500 mt-1">Configure the app. All data is stored locally on this device.</p>
      </div>

      {/* AI Settings */}
      <div className="card mb-4">
        <h2 className="font-semibold text-slate-800 mb-4">AI Note Formatter</h2>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="label">DeepSeek API Key</label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                className="input-field pr-12 font-mono text-sm"
                placeholder="sk-..."
                value={settings.deepseekKey || ''}
                onChange={e => setSettings(s => ({ ...s, deepseekKey: e.target.value }))}
                autoComplete="off"
                spellCheck={false}
              />
              <button
                type="button"
                onClick={() => setShowKey(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showKey ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            <p className="mt-1.5 text-xs text-slate-400">
              Get a key at <span className="font-mono">platform.deepseek.com</span>. Stored locally on this device only.
            </p>
          </div>
          <button type="submit" className={`btn-primary ${saved ? 'bg-emerald-600 hover:bg-emerald-700' : ''}`}>
            {saved ? '✓ Saved' : 'Save Settings'}
          </button>
        </form>
      </div>

      {/* Data Management */}
      <div className="card">
        <h2 className="font-semibold text-slate-800 mb-4">Data Management</h2>
        <p className="text-sm text-slate-500 mb-4">
          All patient data is stored in your browser's local storage — never on any server.
          Export a backup before clearing or switching devices.
        </p>

        {cleared && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-sm text-emerald-700">
            All data cleared successfully.
          </div>
        )}

        <div className="space-y-3">
          <button onClick={handleExportData} className="btn-secondary w-full justify-center">
            Export Backup (JSON)
          </button>
          <label className="btn-secondary w-full justify-center cursor-pointer">
            Import Backup
            <input type="file" accept=".json" className="hidden" onChange={handleImportData} />
          </label>
          <button
            onClick={handleClearData}
            className="w-full px-4 py-2.5 rounded-xl border border-red-200 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            Clear All Data
          </button>
        </div>
      </div>

      {/* About */}
      <div className="mt-4 p-4 rounded-xl border border-slate-200 bg-white">
        <p className="text-xs text-slate-400 text-center">
          Surgical Unit E Handover Assistant · Data stays on your device
        </p>
      </div>
    </div>
  )
}
