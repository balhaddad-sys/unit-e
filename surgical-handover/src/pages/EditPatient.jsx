import { useNavigate, useParams } from 'react-router-dom'
import PatientForm from '../components/PatientForm'
import { usePatients } from '../hooks/usePatients'

export default function EditPatient({ user }) {
  const { patientId } = useParams()
  const navigate = useNavigate()
  const { patients, updatePatient } = usePatients(user?.uid)
  const patient = patients.find(p => p.id === patientId)

  async function handleSubmit(data) {
    await updatePatient(patientId, data)
    navigate(`/patients/${patientId}`)
  }

  if (!patient && patients.length > 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-slate-500">Patient not found.</p>
      </div>
    )
  }

  return (
    <div className="p-4 pb-24 md:pb-8 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="p-1.5 text-slate-500 hover:text-slate-700">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-xl font-bold text-slate-900">Edit Patient</h1>
      </div>
      <div className="card">
        {patient ? (
          <PatientForm
            initialData={patient}
            onSubmit={handleSubmit}
            onCancel={() => navigate(`/patients/${patientId}`)}
            saveKey={`patient-edit-${patientId}`}
          />
        ) : (
          <div className="py-8 text-center">
            <div className="w-8 h-8 border-4 border-hospital-200 border-t-hospital-600 rounded-full animate-spin mx-auto" />
          </div>
        )}
      </div>
    </div>
  )
}
