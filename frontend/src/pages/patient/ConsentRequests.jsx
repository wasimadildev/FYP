import { useState, useEffect } from 'react';
import api from '../../lib/api';
import { useWallet } from '../../hooks/useWallet';
import { grantAccess, revokeAccess } from '../../lib/blockchain';
import Navbar from '../../components/layout/Navbar';
import Sidebar from '../../components/layout/Sidebar';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import toast from 'react-hot-toast';

export default function PatientConsentRequests() {
  const { signer, isConnected, connect } = useWallet();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [grantedDoctors, setGrantedDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [pendingRes, grantedRes] = await Promise.all([
        api.get('/consent/pending'),
        api.get('/consent/granted'),
      ]);
      setPendingRequests(pendingRes.data.requests || []);
      setGrantedDoctors(grantedRes.data.doctors || []);
    } catch {
      toast.error('Failed to load consent data');
    } finally {
      setLoading(false);
    }
  };

  const handleGrant = async (doctorId, doctorAddress) => {
    if (!isConnected) {
      try { await connect(); } catch { toast.error('Please connect your wallet'); return; }
    }
    setProcessingId(doctorId);
    try {
      if (signer && doctorAddress) {
        await grantAccess(signer, doctorAddress);
      }
      await api.post('/consent/grant', { doctorId });
      toast.success('Access granted');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to grant access');
    } finally {
      setProcessingId(null);
    }
  };

  const handleRevoke = async (doctorId, doctorAddress) => {
    if (!isConnected) {
      try { await connect(); } catch { toast.error('Please connect your wallet'); return; }
    }
    setProcessingId(doctorId);
    try {
      if (signer && doctorAddress) {
        await revokeAccess(signer, doctorAddress);
      }
      await api.post('/consent/revoke', { doctorId });
      toast.success('Access revoked');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to revoke access');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex flex-1 flex-col">
        <Navbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-y-auto p-6">
          <h1 className="mb-6 text-2xl font-bold text-gray-900">Consent Management</h1>

          {loading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => <div key={i} className="h-24 animate-pulse rounded-xl bg-gray-200" />)}
            </div>
          ) : (
            <div className="space-y-8">
              <div>
                <h2 className="mb-4 text-lg font-semibold text-gray-900">Pending Access Requests</h2>
                {pendingRequests.length === 0 ? (
                  <div className="rounded-xl border-2 border-dashed border-gray-300 p-8 text-center text-gray-500">
                    No pending requests
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pendingRequests.map((req) => (
                      <Card key={req.id}>
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary-700">
                                Dr
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">
                                  Dr. {req.doctor?.firstName} {req.doctor?.lastName}
                                </p>
                                <p className="text-sm text-gray-500">{req.doctor?.email}</p>
                              </div>
                            </div>
                            <p className="mt-2 text-sm text-gray-500">
                              Requested {new Date(req.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="primary"
                              loading={processingId === req.doctorId}
                              onClick={() => handleGrant(req.doctorId, req.doctor?.walletAddress)}
                            >
                              Grant
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleRevoke(req.doctorId, req.doctor?.walletAddress)}
                            >
                              Deny
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h2 className="mb-4 text-lg font-semibold text-gray-900">Doctors with Access</h2>
                {grantedDoctors.length === 0 ? (
                  <div className="rounded-xl border-2 border-dashed border-gray-300 p-8 text-center text-gray-500">
                    No doctors have access to your records
                  </div>
                ) : (
                  <div className="space-y-3">
                    {grantedDoctors.map((doc) => (
                      <Card key={doc.id}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-100 text-sm font-semibold text-accent-700">
                              Dr
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                Dr. {doc.firstName} {doc.lastName}
                              </p>
                              <p className="text-sm text-gray-500">{doc.email}</p>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="danger"
                            loading={processingId === doc.id}
                            onClick={() => handleRevoke(doc.id, doc.walletAddress)}
                          >
                            Revoke
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
