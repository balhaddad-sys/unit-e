import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import PatientDetail from './pages/PatientDetail'
import AddPatient from './pages/AddPatient'
import EditPatient from './pages/EditPatient'
import GenerateNote from './pages/GenerateNote'
import Settings from './pages/Settings'

export default function App() {
  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/patients/add" element={<AddPatient />} />
          <Route path="/patients/:patientId" element={<PatientDetail />} />
          <Route path="/patients/:patientId/edit" element={<EditPatient />} />
          <Route path="/generate" element={<GenerateNote />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </HashRouter>
  )
}
