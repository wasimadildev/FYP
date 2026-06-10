import { useState, useEffect } from 'react';
import api from '../../lib/api';
import Navbar from '../../components/layout/Navbar';
import Sidebar from '../../components/layout/Sidebar';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import toast from 'react-hot-toast';

export default function PatientMedications() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addModal, setAddModal] = useState(false);
  const [form, setForm] = useState({
    name: '',
    dosage: '',
    frequency: '',
    times: '',
    notes: '',
  });

  useEffect(() => {
    fetchMedications();
  }, []);

  const fetchMedications = async () => {
    try {
      const res = await api.get('/medications');
      setMedications(res.data.medications || []);
    } catch {
      toast.error('Failed to load medications');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await api.post('/medications', form);
      toast.success('Medication added');
      setAddModal(false);
      setForm({ name: '', dosage: '', frequency: '', times: '', notes: '' });
      fetchMedications();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add medication');
    }
  };

  const handleMarkInactive = async (id) => {
    try {
      await api.put(`/medications/${id}`, { active: false });
      toast.success('Medication marked as inactive');
      fetchMedications();
    } catch {
      toast.error('Failed to update medication');
    }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const activeMedications = medications.filter((m) => m.active !== false);
  const inactiveMedications = medications.filter((m) => m.active === false);

  return (
    <div className="flex min-h-screen">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex flex-1 flex-col">
        <Navbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Medications</h1>
            <Button onClick={() => setAddModal(true)}>Add Medication</Button>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => <div key={i} className="h-24 animate-pulse rounded-xl bg-gray-200" />)}
            </div>
          ) : (
            <>
              {activeMedications.length > 0 && (
                <div className="mb-8">
                  <h2 className="mb-4 text-lg font-semibold text-gray-900">Current Medications</h2>
                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    {activeMedications.map((med) => (
                      <Card key={med.id}>
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-medium text-gray-900">{med.name}</h3>
                            <div className="mt-2 space-y-1 text-sm text-gray-500">
                              <p>Dosage: {med.dosage}</p>
                              <p>Frequency: {med.frequency}</p>
                              {med.times && <p>Times: {med.times}</p>}
                              {med.notes && <p className="italic">{med.notes}</p>}
                            </div>
                          </div>
                          <Button size="sm" variant="ghost" onClick={() => handleMarkInactive(med.id)}>
                            Mark Inactive
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {inactiveMedications.length > 0 && (
                <div>
                  <h2 className="mb-4 text-lg font-semibold text-gray-900">Past Medications</h2>
                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    {inactiveMedications.map((med) => (
                      <Card key={med.id} className="opacity-60">
                        <div>
                          <h3 className="font-medium text-gray-900 line-through">{med.name}</h3>
                          <div className="mt-2 space-y-1 text-sm text-gray-500">
                            <p>Dosage: {med.dosage}</p>
                            <p>Frequency: {med.frequency}</p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {medications.length === 0 && (
                <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 p-12">
                  <p className="text-gray-500">No medications recorded</p>
                  <Button onClick={() => setAddModal(true)} className="mt-4" variant="secondary">
                    Add your first medication
                  </Button>
                </div>
              )}
            </>
          )}

          <Modal isOpen={addModal} onClose={() => setAddModal(false)} title="Add Medication">
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Medication Name</label>
                <input name="name" type="text" required value={form.name} onChange={handleChange}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Dosage</label>
                <input name="dosage" type="text" required value={form.dosage} onChange={handleChange} placeholder="e.g., 500mg"
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Frequency</label>
                <select name="frequency" value={form.frequency} onChange={handleChange} required
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500">
                  <option value="">Select...</option>
                  <option value="once-daily">Once Daily</option>
                  <option value="twice-daily">Twice Daily</option>
                  <option value="three-times-daily">Three Times Daily</option>
                  <option value="as-needed">As Needed</option>
                  <option value="weekly">Weekly</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Times</label>
                <input name="times" type="text" value={form.times} onChange={handleChange} placeholder="e.g., Morning, Evening"
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Notes</label>
                <textarea name="notes" value={form.notes} onChange={handleChange} rows={2}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" />
              </div>
              <div className="flex justify-end gap-3">
                <Button type="button" variant="secondary" onClick={() => setAddModal(false)}>Cancel</Button>
                <Button type="submit">Add</Button>
              </div>
            </form>
          </Modal>
        </main>
      </div>
    </div>
  );
}
