import { calcPOD } from './podCalculator'

function ts(firebaseTs) {
  if (!firebaseTs) return ''
  const d = firebaseTs?.toDate ? firebaseTs.toDate() : new Date(firebaseTs)
  if (isNaN(d.getTime())) return ''
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function buildContextPrompt(patient) {
  if (!patient) return ''
  const pod = calcPOD(patient.operationDate)
  const lines = [
    `Patient: ${patient.name || 'Unknown'}`,
    `Age/Sex: ${patient.age || '?'} years old, ${patient.sex || '?'}`,
    patient.nationality ? `Nationality: ${patient.nationality}` : '',
    `Ward: ${patient.ward || 'Unassigned'}, Bed: ${patient.bed || 'N/A'}`,
    `Consultant: ${patient.consultant || 'Not documented'}`,
    `Primary diagnosis: ${patient.primaryDiagnosis || 'Not documented'}`,
    patient.secondaryDiagnoses ? `Secondary diagnoses: ${patient.secondaryDiagnoses}` : '',
    patient.admissionDate ? `Admission date: ${ts(patient.admissionDate)}` : '',
    patient.operation ? `Operation: ${patient.operation}` : '',
    patient.operationDate ? `Operation date: ${ts(patient.operationDate)}` : '',
    pod !== null ? `POD: ${pod}` : '',
    patient.operativeFindings ? `Operative findings: ${patient.operativeFindings}` : '',
    `Drain inserted: ${patient.drainInserted ? 'Yes' : 'No'}`,
    patient.antibiotics ? `Antibiotics: ${patient.antibiotics}` : '',
    patient.regularMedications ? `Regular medications: ${patient.regularMedications}` : '',
    patient.backgroundHistory ? `Background history: ${patient.backgroundHistory}` : '',
  ]
  return lines.filter(Boolean).join('\n')
}

export function buildUpdatePrompt(update) {
  if (!update) return ''
  const lines = [
    update.date ? `Date: ${ts(update.date)}` : '',
    update.pod !== undefined ? `POD: ${update.pod}` : '',
    update.subjectiveSymptoms ? `Subjective symptoms: ${update.subjectiveSymptoms}` : '',
    update.painStatus ? `Pain: ${update.painStatus}` : '',
    update.nauseaVomiting ? `Nausea/vomiting: ${update.nauseaVomiting}` : '',
    update.dietTolerance ? `Diet tolerance: ${update.dietTolerance}` : '',
    update.bowelMotion ? `Bowel motion: ${update.bowelMotion}` : '',
    update.flatus ? `Flatus: ${update.flatus}` : '',
    update.ambulation ? `Ambulation: ${update.ambulation}` : '',
    update.fever ? `Fever: ${update.fever}` : '',
    update.desaturation ? `Desaturation: ${update.desaturation}` : '',
    update.oxygenRequirement ? `Oxygen requirement: ${update.oxygenRequirement}` : '',
    update.hypotension ? `Hypotension: ${update.hypotension}` : '',
    update.tachycardia ? `Tachycardia: ${update.tachycardia}` : '',
    update.icuReview ? `ICU review: ${update.icuReview}` : '',
    update.metCall ? `MET call: ${update.metCall}` : '',
    update.newImaging ? `New imaging: ${update.newImaging}` : '',
    update.newProcedure ? `New procedure: ${update.newProcedure}` : '',
    update.drainOutput ? `Drain output: ${update.drainOutput}` : '',
    update.drainCharacter ? `Drain character: ${update.drainCharacter}` : '',
    update.inputOutput ? `Input/output: ${update.inputOutput}` : '',
    update.labs ? `Labs: ${update.labs}` : '',
    update.assessment ? `Assessment: ${update.assessment}` : '',
    update.plan ? `Plan: ${update.plan}` : '',
    update.closingTasks ? `Closing tasks: ${update.closingTasks}` : '',
  ]
  return lines.filter(Boolean).join('\n')
}

export function buildFullPrompt(patient, update) {
  const ctx = buildContextPrompt(patient)
  const upd = buildUpdatePrompt(update)
  return [ctx, upd].filter(Boolean).join('\n\n')
}
