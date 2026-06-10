import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { WalletProvider } from './context/WalletContext';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import PatientDashboard from './pages/patient/Dashboard';
import PatientRecords from './pages/patient/Records';
import PatientVitals from './pages/patient/Vitals';
import PatientAppointments from './pages/patient/Appointments';
import PatientAIChat from './pages/patient/AIChat';
import PatientConsentRequests from './pages/patient/ConsentRequests';
import PatientMedications from './pages/patient/Medications';
import DoctorDashboard from './pages/doctor/Dashboard';
import DoctorPatientList from './pages/doctor/PatientList';
import DoctorVideoConsult from './pages/doctor/VideoConsult';
import EngineerCatalogue from './pages/engineer/Catalogue';
import AdminUserVerification from './pages/admin/UserVerification';
import { useAuth } from './hooks/useAuth';

function ProtectedRoute({ children, roles }) {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user?.role)) {
    return <Navigate to={`/${user?.role}`} replace />;
  }

  return children;
}

function AppLayout({ children, role }) {
  return <div className="flex min-h-screen">{children}</div>;
}

function PatientLayout() {
  return (
    <Routes>
      <Route index element={<PatientDashboard />} />
      <Route path="records" element={<PatientRecords />} />
      <Route path="vitals" element={<PatientVitals />} />
      <Route path="appointments" element={<PatientAppointments />} />
      <Route path="ai-chat" element={<PatientAIChat />} />
      <Route path="consent" element={<PatientConsentRequests />} />
      <Route path="medications" element={<PatientMedications />} />
    </Routes>
  );
}

function DoctorLayout() {
  return (
    <Routes>
      <Route index element={<DoctorDashboard />} />
      <Route path="patients" element={<DoctorPatientList />} />
      <Route path="video-consult/:appointmentId?" element={<DoctorVideoConsult />} />
    </Routes>
  );
}

function EngineerLayout() {
  return (
    <Routes>
      <Route index element={<EngineerCatalogue />} />
    </Routes>
  );
}

function AdminLayout() {
  return (
    <Routes>
      <Route index element={<AdminUserVerification />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <WalletProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/patient/*"
            element={
              <ProtectedRoute roles={['patient']}>
                <PatientLayout />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor/*"
            element={
              <ProtectedRoute roles={['doctor']}>
                <DoctorLayout />
              </ProtectedRoute>
            }
          />
          <Route
            path="/engineer/*"
            element={
              <ProtectedRoute roles={['engineer']}>
                <EngineerLayout />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute roles={['admin']}>
                <AdminLayout />
              </ProtectedRoute>
            }
          />
        </Routes>
      </WalletProvider>
    </AuthProvider>
  );
}
