const SETTINGS_KEY = 'ue:settings'
const SYSTEM_PROMPT = `You are a surgical handover formatting assistant. Convert rough clinical notes into clean, organized SOAP-style surgical progress notes. Preserve all clinical facts exactly. Do not invent information. Do not give new medical advice unless it was included in the user input. If information is missing, write "Not documented." Keep the note concise, professional, and ready to paste into a surgical ward Google Document.

Format the output exactly as:
Patient Name: [name or Not documented]
S: [subjective]
O: [objective — vitals, labs, imaging]
A: [assessment]
P:
- [plan bullet]
- [plan bullet]
Closing / Today's Updates:
- [task or update]`

function getSettings() {
  try { return JSON.parse(localStorage.getItem(SETTINGS_KEY) ?? '{}') } catch { return {} }
}

export function getApiKey() {
  return getSettings().deepseekKey || ''
}

export async function formatNote(roughNote, patientContext) {
  const apiKey = getApiKey()
  if (!apiKey) {
    throw new Error('No API key configured. Go to Settings to add your DeepSeek API key.')
  }

  const userContent = patientContext
    ? `Patient context:\n${patientContext}\n\nConvert the following rough surgical ward note into the required format:\n\n${roughNote}`
    : `Convert the following rough surgical ward note into the required format:\n\n${roughNote}`

  const res = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userContent },
      ],
      temperature: 0.2,
      max_tokens: 1500,
    }),
  })

  if (!res.ok) {
    let msg = `DeepSeek API error: ${res.status}`
    try { const j = await res.json(); msg = j?.error?.message || msg } catch {}
    throw new Error(msg)
  }

  const data = await res.json()
  return data.choices?.[0]?.message?.content ?? ''
}
