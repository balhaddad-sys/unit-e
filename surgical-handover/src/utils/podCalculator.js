export function calcPOD(operationDate) {
  if (!operationDate) return null
  const op = operationDate?.toDate ? operationDate.toDate() : new Date(operationDate)
  if (isNaN(op.getTime())) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  op.setHours(0, 0, 0, 0)
  const diffMs = today - op
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  return diffDays >= 0 ? diffDays : null
}

export function podLabel(pod) {
  if (pod === null || pod === undefined) return 'N/A'
  if (pod === 0) return 'POD 0'
  return `POD ${pod}`
}
