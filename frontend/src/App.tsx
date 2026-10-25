import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { ResumeProvider } from './context/ResumeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import MainLayout from './layouts/MainLayout';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import ResumeUpload from './pages/ResumeUpload';
import JobMatches from './pages/JobMatches';
import Assessment from './pages/Assessment';
import Login from './pages/Login';
import Register from './pages/Register';
import CreateJob from './pages/CreateJob';
import JobCandidates from './pages/JobCandidates';

// Protected Route check helper
const ProtectedRoute = () => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

// Redirect authenticated users away from landing page to dashboard
const PublicLandingRoute = () => {
  return <LandingPage />;
};

function App() {
  return (
    <AuthProvider>
      <ResumeProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Landing Page */}
            <Route path="/" element={<PublicLandingRoute />} />
            
            {/* Public Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected Workspace Layout */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<MainLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="upload" element={<ResumeUpload />} />
                <Route path="matches" element={<JobMatches />} />
                <Route path="assessment" element={<Assessment />} />
                <Route path="create-job" element={<CreateJob />} />
                <Route path="job-candidates/:jobId" element={<JobCandidates />} />
              </Route>
            </Route>
            
            {/* Catch-all fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ResumeProvider>
    </AuthProvider>
  );
}

export default App;
