import { useNavigate } from 'react-router-dom'
import PatientForm from '../components/PatientForm'
import { usePatients } from '../hooks/usePatients'
import { clearAutoSave } from '../hooks/useAutoSave'

export default function AddPatient({ user }) {
  const navigate = useNavigate()
  const { addPatient } = usePatients(user?.uid)

  async function handleSubmit(data) {
    const ref = await addPatient(data)
    clearAutoSave('patient-form')
    navigate(`/patients/${ref.id}`)
  }

  return (
    <div className="p-4 pb-24 md:pb-8 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="p-1.5 text-slate-500 hover:text-slate-700">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-xl font-bold text-slate-900">Add Patient</h1>
      </div>
      <div className="card">
        <PatientForm
          onSubmit={handleSubmit}
          onCancel={() => navigate(-1)}
          saveKey="patient-form"
        />
      </div>
    </div>
  )
}
