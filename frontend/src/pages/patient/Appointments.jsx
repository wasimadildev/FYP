import { useState, useEffect } from 'react';
import api from '../../lib/api';
import { useWallet } from '../../hooks/useWallet';
import { createAppointmentEscrow } from '../../lib/blockchain';
import Navbar from '../../components/layout/Navbar';
import Sidebar from '../../components/layout/Sidebar';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import toast from 'react-hot-toast';

export default function PatientAppointments() {
  const { signer, isConnected, connect } = useWallet();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingModal, setBookingModal] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [bookForm, setBookForm] = useState({ doctorId: '', date: '', time: '' });
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const res = await api.get('/appointments');
      setAppointments(res.data.appointments || []);
    } catch {
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const openBookingModal = async () => {
    try {
      const res = await api.get('/doctors');
      setDoctors(res.data.doctors || []);
      setBookingModal(true);
    } catch {
      toast.error('Failed to load doctors');
    }
  };

  const handleBook = async (e) => {
    e.preventDefault();
    if (!isConnected) {
      try {
        await connect();
      } catch {
        toast.error('Please connect your wallet');
        return;
      }
    }

    setBooking(true);
    try {
      const appointmentDate = new Date(`${bookForm.date}T${bookForm.time}`);
      const res = await api.post('/appointments', {
        doctorId: bookForm.doctorId,
        dateTime: appointmentDate.toISOString(),
      });

      if (signer) {
        await createAppointmentEscrow(signer, bookForm.doctorId, res.data.escrowAmount);
      }

      toast.success('Appointment booked!');
      setBookingModal(false);
      setBookForm({ doctorId: '', date: '', time: '' });
      fetchAppointments();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Booking failed');
    } finally {
      setBooking(false);
    }
  };

  const handleCancel = async (id) => {
    try {
      await api.put(`/appointments/${id}/cancel`);
      toast.success('Appointment cancelled');
      fetchAppointments();
    } catch {
      toast.error('Failed to cancel appointment');
    }
  };

  const statusBadge = (status) => {
    const styles = {
      confirmed: 'bg-accent-100 text-accent-700',
      pending: 'bg-yellow-100 text-yellow-700',
      cancelled: 'bg-gray-100 text-gray-600',
      completed: 'bg-primary-100 text-primary-700',
    };
    return styles[status] || 'bg-gray-100 text-gray-600';
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex flex-1 flex-col">
        <Navbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
            <Button onClick={openBookingModal}>Book Appointment</Button>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => <div key={i} className="h-20 animate-pulse rounded-xl bg-gray-200" />)}
            </div>
          ) : appointments.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 p-12">
              <p className="text-gray-500">No appointments</p>
              <Button onClick={openBookingModal} className="mt-4" variant="secondary">Book your first appointment</Button>
            </div>
          ) : (
            <div className="space-y-4">
              {appointments.map((apt) => (
                <Card key={apt.id}>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-gray-900">
                          Dr. {apt.doctor?.firstName} {apt.doctor?.lastName}
                        </h3>
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${statusBadge(apt.status)}`}>
                          {apt.status}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-gray-500">
                        {new Date(apt.dateTime).toLocaleDateString('en-US', {
                          weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
                        })}
                      </p>
                      {apt.notes && <p className="mt-2 text-sm text-gray-600">{apt.notes}</p>}
                    </div>
                    {apt.status === 'confirmed' && (
                      <Button variant="danger" size="sm" onClick={() => handleCancel(apt.id)}>Cancel</Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}

          <Modal isOpen={bookingModal} onClose={() => setBookingModal(false)} title="Book Appointment">
            <form onSubmit={handleBook} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Doctor</label>
                <select
                  required
                  value={bookForm.doctorId}
                  onChange={(e) => setBookForm({ ...bookForm, doctorId: e.target.value })}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                >
                  <option value="">Select a doctor...</option>
                  {doctors.map((doc) => (
                    <option key={doc.id} value={doc.id}>
                      Dr. {doc.firstName} {doc.lastName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Date</label>
                <input
                  type="date"
                  required
                  value={bookForm.date}
                  onChange={(e) => setBookForm({ ...bookForm, date: e.target.value })}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Time</label>
                <input
                  type="time"
                  required
                  value={bookForm.time}
                  onChange={(e) => setBookForm({ ...bookForm, time: e.target.value })}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>
              <div className="flex justify-end gap-3">
                <Button type="button" variant="secondary" onClick={() => setBookingModal(false)}>Cancel</Button>
                <Button type="submit" loading={booking}>Confirm & Pay (Escrow)</Button>
              </div>
            </form>
          </Modal>
        </main>
      </div>
    </div>
  );
}
