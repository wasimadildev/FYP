import { useState, useEffect } from 'react';
import api from '../../lib/api';
import Navbar from '../../components/layout/Navbar';
import Sidebar from '../../components/layout/Sidebar';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import toast from 'react-hot-toast';

export default function DoctorPatientList() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientRecords, setPatientRecords] = useState([]);
  const [recordsModal, setRecordsModal] = useState(false);
  const [recordsLoading, setRecordsLoading] = useState(false);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const res = await api.get('/doctor/patients');
      setPatients(res.data.patients || []);
    } catch {
      toast.error('Failed to load patients');
    } finally {
      setLoading(false);
    }
  };

  const viewRecords = async (patient) => {
    setSelectedPatient(patient);
    setRecordsModal(true);
    setRecordsLoading(true);
    try {
      const res = await api.get(`/doctor/patients/${patient.id}/records`);
      setPatientRecords(res.data.records || []);
    } catch (err) {
      if (err.response?.status === 403) {
        setPatientRecords([]);
        toast.error('No consent granted to view records');
      } else {
        toast.error('Failed to load records');
      }
    } finally {
      setRecordsLoading(false);
    }
  };

  const requestAccess = async (patientId) => {
    try {
      await api.post('/consent/request', { patientId });
      toast.success('Access request sent');
    } catch {
      toast.error('Failed to request access');
    }
  };

  const filteredPatients = patients.filter(
    (p) =>
      `${p.firstName} ${p.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
      p.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex min-h-screen">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex flex-1 flex-col">
        <Navbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-y-auto p-6">
          <h1 className="mb-6 text-2xl font-bold text-gray-900">Patients</h1>

          <div className="mb-6">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search patients by name or email..."
              className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => <div key={i} className="h-16 animate-pulse rounded-xl bg-gray-200" />)}
            </div>
          ) : filteredPatients.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 p-12">
              <p className="text-gray-500">{search ? 'No patients match your search' : 'No patients assigned yet'}</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Patient</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Last Visit</th>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {filteredPatients.map((patient) => (
                    <tr key={patient.id} className="hover:bg-gray-50">
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-sm font-medium text-primary-700">
                            {patient.firstName?.charAt(0)}{patient.lastName?.charAt(0)}
                          </div>
                          <span className="text-sm font-medium text-gray-900">
                            {patient.firstName} {patient.lastName}
                          </span>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{patient.email}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {patient.lastVisit ? new Date(patient.lastVisit).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="secondary" onClick={() => viewRecords(patient)}>
                            View Records
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => requestAccess(patient.id)}>
                            Request Access
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <Modal
            isOpen={recordsModal}
            onClose={() => setRecordsModal(false)}
            title={selectedPatient ? `${selectedPatient.firstName} ${selectedPatient.lastName}'s Records` : 'Records'}
            size="lg"
          >
            {recordsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => <div key={i} className="h-16 animate-pulse rounded-lg bg-gray-200" />)}
              </div>
            ) : patientRecords.length === 0 ? (
              <div className="py-8 text-center text-gray-500">
                No records available. Request access from the patient.
              </div>
            ) : (
              <div className="space-y-3">
                {patientRecords.map((record) => (
                  <div key={record.id} className="rounded-lg border border-gray-100 p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-gray-900 capitalize">{record.category?.replace('-', ' ')}</p>
                        <p className="text-sm text-gray-500">{new Date(record.createdAt).toLocaleDateString()}</p>
                        {record.description && <p className="mt-1 text-sm text-gray-600">{record.description}</p>}
                      </div>
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">{record.fileType}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Modal>
        </main>
      </div>
    </div>
  );
}
