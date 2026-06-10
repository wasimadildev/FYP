const openai = require('../openai');

const SAFETY_SYSTEM_PROMPT = 'You are a medical AI assistant. Always prioritize patient safety. Do not provide definitive diagnoses or prescribe medications. Always recommend consulting a qualified healthcare professional.';

async function chat(conversation) {
  const messages = [
    { role: 'system', content: SAFETY_SYSTEM_PROMPT },
    ...conversation.map((m) => ({ role: m.role, content: m.content })),
  ];
  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages,
    max_tokens: 1024,
    temperature: 0.7,
  });
  return response.choices[0].message.content;
}

async function summarize(text) {
  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      { role: 'system', content: 'Summarize the following medical records concisely for a doctor.' },
      { role: 'user', content: text },
    ],
    max_tokens: 512,
    temperature: 0.3,
  });
  return response.choices[0].message.content;
}

async function analyzeSymptoms(symptoms) {
  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content: 'Based on the symptoms described, suggest possible medical specialties a patient should consult. List only the specialties, no disclaimers.',
      },
      { role: 'user', content: symptoms },
    ],
    max_tokens: 256,
    temperature: 0.3,
  });
  return response.choices[0].message.content;
}

async function analyzeVitals(vitalsData) {
  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content: 'Analyze the following patient vitals and flag any anomalies or concerns. Provide a brief clinical assessment.',
      },
      { role: 'user', content: JSON.stringify(vitalsData) },
    ],
    max_tokens: 512,
    temperature: 0.3,
  });
  return response.choices[0].message.content;
}

module.exports = { chat, summarize, analyzeSymptoms, analyzeVitals };
