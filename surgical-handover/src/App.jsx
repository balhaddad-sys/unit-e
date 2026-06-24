import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import PatientDetail from './pages/PatientDetail'
import AddPatient from './pages/AddPatient'
import EditPatient from './pages/EditPatient'
import GenerateNote from './pages/GenerateNote'

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 bg-hospital-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
          <span className="text-white text-lg font-bold">UE</span>
        </div>
        <div className="w-8 h-8 border-4 border-hospital-200 border-t-hospital-600 rounded-full animate-spin mx-auto" />
      </div>
    </div>
  )
}

function AuthedApp({ user }) {
  return (
    <Layout user={user}>
      <Routes>
        <Route path="/" element={<Dashboard user={user} />} />
        <Route path="/patients/add" element={<AddPatient user={user} />} />
        <Route path="/patients/:patientId" element={<PatientDetail user={user} />} />
        <Route path="/patients/:patientId/edit" element={<EditPatient user={user} />} />
        <Route path="/generate" element={<GenerateNote user={user} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  )
}

export default function App() {
  const { user, loading } = useAuth()

  if (loading) return <LoadingScreen />

  return (
    <BrowserRouter>
      {user ? <AuthedApp user={user} /> : <Login />}
    </BrowserRouter>
  )
}
