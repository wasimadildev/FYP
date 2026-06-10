import { useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../lib/api';
import Navbar from '../../components/layout/Navbar';
import Sidebar from '../../components/layout/Sidebar';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import VideoRoom from '../../components/video/VideoRoom';
import toast from 'react-hot-toast';

export default function DoctorVideoConsult() {
  const { appointmentId } = useParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [inputAptId, setInputAptId] = useState(appointmentId || '');
  const [roomName, setRoomName] = useState(null);
  const [token, setToken] = useState(null);
  const [joining, setJoining] = useState(false);
  const [inCall, setInCall] = useState(false);

  const joinRoom = async () => {
    if (!inputAptId.trim()) {
      toast.error('Please enter an appointment ID');
      return;
    }
    setJoining(true);
    try {
      const res = await api.post('/video/token', { appointmentId: inputAptId });
      const { roomName, token } = res.data;
      setRoomName(roomName);
      setToken(token);
      setInCall(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to join video room');
    } finally {
      setJoining(false);
    }
  };

  const handleDisconnect = () => {
    setInCall(false);
    setRoomName(null);
    setToken(null);
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex flex-1 flex-col">
        <Navbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-y-auto p-6">
          <h1 className="mb-6 text-2xl font-bold text-gray-900">Video Consultation</h1>

          {!inCall ? (
            <Card title="Join Video Room" className="mx-auto max-w-lg">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Appointment ID</label>
                  <input
                    type="text"
                    value={inputAptId}
                    onChange={(e) => setInputAptId(e.target.value)}
                    placeholder="Enter appointment ID"
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </div>
                <Button onClick={joinRoom} loading={joining} className="w-full">
                  Join Video Room
                </Button>
              </div>
            </Card>
          ) : (
            <div>
              <p className="mb-4 text-sm text-gray-500">Room: {roomName}</p>
              <VideoRoom roomName={roomName} token={token} onDisconnect={handleDisconnect} />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
