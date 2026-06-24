const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions'

const SYSTEM_PROMPT = `You are a surgical handover formatting assistant. Convert rough clinical notes into clean, organized SOAP-style surgical progress notes. Preserve all clinical facts exactly. Do not invent information. Do not give new medical advice unless it was included in the user input. If information is missing, write "Not documented." Keep the note concise, professional, and ready to paste into a surgical ward Google Document.`

const FORMAT_TEMPLATE = `Convert the following rough surgical ward note into the required format:

Required format:
[Patient Name]

S:
Subjective history and symptoms.

O:
Objective including general condition, vitals, examination, labs, imaging, drains, input/output, medications, diet, postoperative status.

A:
Clear assessment with age/sex, diagnosis, current clinical status, active issues.

P:
- Bullet-point plan item 1
- Bullet-point plan item 2

Closing / Today's Updates:
- New labs required
- Catheter/drain changes
- New imaging
- Consults
- Diet changes
- Desaturation / fever / hypotension / tachycardia / ICU review / MET call / deterioration if present
- If no deterioration: "No acute deterioration documented."

Rules:
- Preserve ALL clinical facts exactly as written — do not omit any detail.
- Do NOT invent any data not present in the rough note.
- Do NOT remove important negatives (e.g. "no nausea", "afebrile", "soft and lax abdomen").
- Keep abbreviations acceptable for surgical handover (HR, BP, WBC, Hb, POD, etc.).
- If a section has no data, write "Not documented."
- Never give new management advice beyond what was in the input.
- Always include deterioration fields. If none documented, write "No acute deterioration documented." in Closing section.

Rough note:
`

const rateLimitMap = new Map()

function checkRateLimit(ip) {
  const now = Date.now()
  const windowMs = 60 * 1000
  const maxRequests = 10

  if (!rateLimitMap.has(ip)) {
    rateLimitMap.set(ip, [])
  }

  const timestamps = rateLimitMap.get(ip).filter(t => now - t < windowMs)
  timestamps.push(now)
  rateLimitMap.set(ip, timestamps)

  return timestamps.length <= maxRequests
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.socket?.remoteAddress || 'unknown'
  if (!checkRateLimit(ip)) {
    return res.status(429).json({ error: 'Too many requests. Please wait a moment.' })
  }

  const { roughNote, patientContext } = req.body || {}

  if (!roughNote || typeof roughNote !== 'string' || roughNote.trim().length < 10) {
    return res.status(400).json({ error: 'Please provide a clinical note to format.' })
  }

  if (!process.env.DEEPSEEK_API_KEY) {
    return res.status(500).json({ error: 'API key not configured. Contact your administrator.' })
  }

  const noteInput = patientContext
    ? `Patient context:\n${patientContext}\n\nRough note:\n${roughNote}`
    : roughNote

  try {
    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: FORMAT_TEMPLATE + noteInput },
        ],
        max_tokens: 2000,
        temperature: 0.1,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('DeepSeek API error:', response.status, errorData)
      return res.status(502).json({ error: 'AI service error. Please try again.' })
    }

    const data = await response.json()
    const formattedNote = data.choices?.[0]?.message?.content?.trim()

    if (!formattedNote) {
      return res.status(502).json({ error: 'No output from AI. Please try again.' })
    }

    return res.status(200).json({ note: formattedNote })
  } catch (err) {
    console.error('format-note error:', err)
    return res.status(500).json({ error: 'Internal server error. Please try again.' })
  }
}
