import { useState, useEffect } from 'react';
import api from '../../lib/api';
import Navbar from '../../components/layout/Navbar';
import Sidebar from '../../components/layout/Sidebar';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import VitalsChart from '../../components/charts/VitalsChart';
import toast from 'react-hot-toast';

export default function PatientVitals() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [latestVitals, setLatestVitals] = useState(null);
  const [historicalVitals, setHistoricalVitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    bloodPressureSystolic: '',
    bloodPressureDiastolic: '',
    heartRate: '',
    temperature: '',
    oxygenSaturation: '',
  });

  useEffect(() => {
    fetchVitals();
  }, []);

  const fetchVitals = async () => {
    try {
      const [latestRes, historyRes] = await Promise.all([
        api.get('/vitals/latest'),
        api.get('/vitals'),
      ]);
      setLatestVitals(latestRes.data.vitals);
      setHistoricalVitals(historyRes.data.vitals || []);
    } catch {
      toast.error('Failed to load vitals');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/vitals', {
        bloodPressureSystolic: Number(form.bloodPressureSystolic),
        bloodPressureDiastolic: Number(form.bloodPressureDiastolic),
        heartRate: Number(form.heartRate),
        temperature: Number(form.temperature),
        oxygenSaturation: Number(form.oxygenSaturation),
      });
      toast.success('Vitals recorded');
      setShowForm(false);
      setForm({ bloodPressureSystolic: '', bloodPressureDiastolic: '', heartRate: '', temperature: '', oxygenSaturation: '' });
      fetchVitals();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save vitals');
    }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  if (loading) {
    return (
      <div className="flex min-h-screen">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex flex-1 flex-col">
          <Navbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
          <main className="flex-1 p-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((i) => <div key={i} className="h-28 animate-pulse rounded-xl bg-gray-200" />)}
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex flex-1 flex-col">
        <Navbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Vitals</h1>
            <Button onClick={() => setShowForm(!showForm)}>
              {showForm ? 'Cancel' : 'Record Vitals'}
            </Button>
          </div>

          {showForm && (
            <Card title="Record Vitals" className="mb-6">
              <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Systolic BP (mmHg)</label>
                  <input name="bloodPressureSystolic" type="number" required value={form.bloodPressureSystolic} onChange={handleChange}
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Diastolic BP (mmHg)</label>
                  <input name="bloodPressureDiastolic" type="number" required value={form.bloodPressureDiastolic} onChange={handleChange}
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Heart Rate (bpm)</label>
                  <input name="heartRate" type="number" required value={form.heartRate} onChange={handleChange}
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Temperature (°C)</label>
                  <input name="temperature" type="number" step="0.1" required value={form.temperature} onChange={handleChange}
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">O2 Saturation (%)</label>
                  <input name="oxygenSaturation" type="number" required value={form.oxygenSaturation} onChange={handleChange}
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" />
                </div>
                <div className="flex items-end">
                  <Button type="submit" className="w-full">Save</Button>
                </div>
              </form>
            </Card>
          )}

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <div className="text-center">
                <p className="text-sm text-gray-500">Systolic BP</p>
                <p className={`text-2xl font-bold ${latestVitals?.bloodPressureSystolic > 130 ? 'text-danger-600' : 'text-accent-600'}`}>
                  {latestVitals?.bloodPressureSystolic || '--'}
                </p>
                <p className="text-xs text-gray-400">mmHg</p>
              </div>
            </Card>
            <Card>
              <div className="text-center">
                <p className="text-sm text-gray-500">Diastolic BP</p>
                <p className={`text-2xl font-bold ${latestVitals?.bloodPressureDiastolic > 85 ? 'text-danger-600' : 'text-accent-600'}`}>
                  {latestVitals?.bloodPressureDiastolic || '--'}
                </p>
                <p className="text-xs text-gray-400">mmHg</p>
              </div>
            </Card>
            <Card>
              <div className="text-center">
                <p className="text-sm text-gray-500">Heart Rate</p>
                <p className={`text-2xl font-bold ${latestVitals?.heartRate > 100 || latestVitals?.heartRate < 60 ? 'text-danger-600' : 'text-accent-600'}`}>
                  {latestVitals?.heartRate || '--'}
                </p>
                <p className="text-xs text-gray-400">bpm</p>
              </div>
            </Card>
            <Card>
              <div className="text-center">
                <p className="text-sm text-gray-500">Temperature</p>
                <p className={`text-2xl font-bold ${latestVitals?.temperature > 37.5 ? 'text-danger-600' : 'text-accent-600'}`}>
                  {latestVitals?.temperature || '--'}°
                </p>
                <p className="text-xs text-gray-400">Celsius</p>
              </div>
            </Card>
          </div>

          <div className="mt-6">
            <Card title="Vitals History">
              <VitalsChart vitalsData={historicalVitals} />
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
