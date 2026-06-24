import { calcPOD } from './podCalculator'

function ts(firebaseTs) {
  if (!firebaseTs) return 'N/A'
  const d = firebaseTs?.toDate ? firebaseTs.toDate() : new Date(firebaseTs)
  if (isNaN(d.getTime())) return 'N/A'
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

function formatSinglePatient(patient, updates = []) {
  const pod = calcPOD(patient.operationDate)
  const separator = '─'.repeat(60)
  const lines = [
    separator,
    `${patient.name?.toUpperCase() || 'UNKNOWN PATIENT'}`,
    `${patient.age || '?'}y ${patient.sex || ''} | ${patient.ward || 'Ward ?'}, Bed ${patient.bed || '?'} | ${patient.consultant || '?'}`,
    `Dx: ${patient.primaryDiagnosis || 'Not documented'}`,
    patient.secondaryDiagnoses ? `Secondary: ${patient.secondaryDiagnoses}` : '',
    `Admitted: ${ts(patient.admissionDate)} | Op: ${patient.operation || 'N/A'} (${ts(patient.operationDate)}) | POD: ${pod !== null ? pod : 'N/A'}`,
    patient.operativeFindings ? `Operative findings: ${patient.operativeFindings}` : '',
    `Drain: ${patient.drainInserted ? 'Yes' : 'No'}`,
    patient.antibiotics ? `Antibiotics: ${patient.antibiotics}` : '',
    patient.regularMedications ? `Medications: ${patient.regularMedications}` : '',
    patient.backgroundHistory ? `Background: ${patient.backgroundHistory}` : '',
    '',
  ].filter(l => l !== null && l !== undefined && (l !== '' || true))

  if (updates.length > 0) {
    lines.push('DAILY UPDATES:')
    updates.forEach((u, i) => {
      lines.push(`\n[${ts(u.createdAt || u.date)} — POD ${u.pod ?? '?'}]`)
      if (u.generatedNote) {
        lines.push(u.generatedNote)
      } else {
        if (u.subjectiveSymptoms) lines.push(`S: ${u.subjectiveSymptoms}`)
        if (u.labs) lines.push(`Labs: ${u.labs}`)
        if (u.assessment) lines.push(`A: ${u.assessment}`)
        if (u.plan) lines.push(`P: ${u.plan}`)
        if (u.closingTasks) lines.push(`Closing: ${u.closingTasks}`)
      }
    })
  }

  return lines.join('\n')
}

export function exportSinglePatient(patient, updates = []) {
  const text = formatSinglePatient(patient, updates)
  downloadText(text, `${patient.name || 'patient'}-handover-${today()}.txt`)
}

export function exportAllActivePatients(patientsWithUpdates) {
  const header = `SURGICAL UNIT E — HANDOVER DOCUMENT\n${new Date().toLocaleDateString('en-GB', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}\n${'═'.repeat(60)}\n\n`
  const body = patientsWithUpdates
    .map(({ patient, updates }) => formatSinglePatient(patient, updates))
    .join('\n\n')
  const text = header + body
  downloadText(text, `unit-e-handover-${today()}.txt`)
  return text
}

export function copyToClipboard(text) {
  return navigator.clipboard.writeText(text)
}

function downloadText(text, filename) {
  const blob = new Blob([text], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function today() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
