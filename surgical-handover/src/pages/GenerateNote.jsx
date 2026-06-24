import NoteGenerator from '../components/NoteGenerator'

export default function GenerateNote({ user }) {
  return (
    <div className="p-4 pb-24 md:pb-8 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900">Quick Note Generator</h1>
        <p className="text-sm text-slate-500 mt-1">Paste any rough clinical note and get a clean SOAP-format handover note.</p>
      </div>
      <div className="card">
        <NoteGenerator />
      </div>
    </div>
  )
}
