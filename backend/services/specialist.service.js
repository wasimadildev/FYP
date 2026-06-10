const SYMPTOM_MAP = [
  { keywords: ['chest pain', 'palpitations', 'shortness of breath', 'high blood pressure'], specialty: 'Cardiology' },
  { keywords: ['headache', 'dizziness', 'seizure', 'numbness', 'tremor', 'memory loss'], specialty: 'Neurology' },
  { keywords: ['bone pain', 'joint pain', 'fracture', 'back pain', 'swelling'], specialty: 'Orthopedics' },
  { keywords: ['rash', 'itching', 'skin lesion', 'acne', 'eczema'], specialty: 'Dermatology' },
  { keywords: ['blurred vision', 'eye pain', 'red eye', 'vision loss'], specialty: 'Ophthalmology' },
  { keywords: ['ear pain', 'hearing loss', 'sore throat', 'nasal congestion'], specialty: 'ENT' },
  { keywords: ['abdominal pain', 'nausea', 'vomiting', 'diarrhea', 'constipation'], specialty: 'Gastroenterology' },
  { keywords: ['frequent urination', 'blood in urine', 'kidney pain'], specialty: 'Urology' },
  { keywords: ['cough', 'fever', 'difficulty breathing', 'wheezing', 'chest congestion'], specialty: 'Pulmonology' },
  { keywords: ['fatigue', 'weight loss', 'excessive thirst', 'thyroid'], specialty: 'Endocrinology' },
  { keywords: ['joint swelling', 'muscle pain', 'chronic fatigue'], specialty: 'Rheumatology' },
  { keywords: ['anxiety', 'depression', 'insomnia', 'hallucination', 'mood swings'], specialty: 'Psychiatry' },
  { keywords: ['pregnancy', 'menstrual pain', 'vaginal bleeding'], specialty: 'Gynecology' },
  { keywords: ['allergy', 'runny nose', 'sneezing', 'hives'], specialty: 'Allergology' },
  { keywords: ['cancer', 'tumor', 'lump', 'melanoma'], specialty: 'Oncology' },
  { keywords: ['anemia', 'bruising', 'bleeding'], specialty: 'Hematology' },
  { keywords: ['infection', 'fever', 'inflammation'], specialty: 'Infectious Disease' },
];

function mapSymptomToSpecialty(symptoms) {
  const lower = symptoms.toLowerCase();
  const matched = new Set();
  for (const entry of SYMPTOM_MAP) {
    for (const keyword of entry.keywords) {
      if (lower.includes(keyword)) {
        matched.add(entry.specialty);
        break;
      }
    }
  }
  if (matched.size === 0) {
    return ['General Practice'];
  }
  return Array.from(matched);
}

module.exports = { mapSymptomToSpecialty };
