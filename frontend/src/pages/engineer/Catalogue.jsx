import { useState } from 'react';
import Navbar from '../../components/layout/Navbar';
import Sidebar from '../../components/layout/Sidebar';
import Card from '../../components/ui/Card';

const placeholderModels = [
  { id: 1, name: 'Diagnostic Assistant v2', description: 'AI model for preliminary diagnosis based on symptom analysis and patient history.', status: 'active', accuracy: 94.2, type: 'Classification' },
  { id: 2, name: 'Medical Image Analyzer', description: 'Deep learning model for analyzing X-ray and MRI images for anomaly detection.', status: 'active', accuracy: 91.7, type: 'Computer Vision' },
  { id: 3, name: 'Health Record Summarizer', description: 'NLP model that generates concise summaries of patient health records.', status: 'active', accuracy: 88.9, type: 'NLP' },
  { id: 4, name: 'Medication Interaction Checker', description: 'Checks for potential adverse interactions between prescribed medications.', status: 'inactive', accuracy: 96.1, type: 'Classification' },
  { id: 5, name: 'Predictive Analytics v1', description: 'Forecasts patient health risks based on historical vitals and lifestyle data.', status: 'active', accuracy: 85.3, type: 'Regression' },
  { id: 6, name: 'Symptom Checker Lite', description: 'Lightweight model for quick symptom triage and recommendations.', status: 'inactive', accuracy: 79.8, type: 'Classification' },
];

export default function EngineerCatalogue() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [models] = useState(placeholderModels);

  return (
    <div className="flex min-h-screen">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex flex-1 flex-col">
        <Navbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-y-auto p-6">
          <h1 className="mb-6 text-2xl font-bold text-gray-900">AI Model Catalogue</h1>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
            {models.map((model) => (
              <Card key={model.id}>
                <div className="flex flex-col h-full">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100 text-primary-600">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        model.status === 'active'
                          ? 'bg-accent-100 text-accent-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {model.status}
                    </span>
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900">{model.name}</h3>
                  <p className="mt-1 flex-1 text-sm text-gray-500">{model.description}</p>

                  <div className="mt-4 flex items-center gap-4 border-t border-gray-100 pt-4">
                    <div>
                      <p className="text-xs text-gray-400">Accuracy</p>
                      <p className="text-lg font-bold text-primary-600">{model.accuracy}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Type</p>
                      <p className="text-sm font-medium text-gray-700">{model.type}</p>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
