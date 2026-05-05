import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { motion } from 'motion/react';
import { Zap } from 'lucide-react';

// Lazy loading components
const LandingPage = lazy(() => import('./pages/LandingPage'));
const AuthPage = lazy(() => import('./pages/AuthPage'));
const DashboardOverview = lazy(() => import('./pages/DashboardOverview'));
const CreateRace = lazy(() => import('./pages/CreateRace'));
const SubscriptionPlans = lazy(() => import('./pages/SubscriptionPlans'));
const RaceDetail = lazy(() => import('./pages/RaceDetail'));
const RaceParticipants = lazy(() => import('./pages/RaceParticipants'));
const ProfileSettings = lazy(() => import('./pages/ProfileSettings'));
const DashboardFinances = lazy(() => import('./pages/DashboardFinances'));
const RaceEnrollment = lazy(() => import('./pages/RaceEnrollment'));
const RegistrationStatus = lazy(() => import('./pages/RegistrationStatus'));
const TrainingGenerator = lazy(() => import('./pages/TrainingGenerator'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const TrainerDashboard = lazy(() => import('./pages/TrainerDashboard'));
const RunnerDashboard = lazy(() => import('./pages/RunnerDashboard'));
const AthletePortal = lazy(() => import('./pages/AthletePortal'));
const TrainerPlans = lazy(() => import('./pages/TrainerPlans'));
const CreateWorkout = lazy(() => import('./pages/CreateWorkout'));
const StudentProfile = lazy(() => import('./pages/StudentProfile'));
const SignupSelection = lazy(() => import('./pages/SignupSelection'));
const DashboardLayout = lazy(() => import('./components/DashboardLayout'));

const LoadingScreen = () => (
  <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-center p-6">
    <motion.div
      animate={{ 
        scale: [1, 1.2, 1],
        rotate: [0, 360, 0]
      }}
      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      className="w-16 h-16 bg-yellow-400 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(250,204,21,0.3)] mb-6 mx-auto"
    >
      <Zap className="text-black w-8 h-8 fill-current" />
    </motion.div>
    <div className="h-1 w-48 bg-slate-900 rounded-full overflow-hidden mx-auto">
      <motion.div 
        animate={{ x: [-200, 200] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        className="h-full w-24 bg-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.5)]"
      />
    </div>
    <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mt-6 italic animate-pulse">Sincronizando Dados...</p>
  </div>
);

const ProtectedRoute = ({ children, role }: { children: React.ReactNode, role?: 'athlete' | 'organizer' }) => {
  const { user, profile } = useAuth();
  
  if (!user) return <Navigate to="/login" replace />;
  
  if (role && profile) {
    const userRole = profile.role || (profile.organizerName ? 'organizer' : 'athlete');
    
    if (userRole !== role) {
      // Redirect to the correct dashboard if role mismatch
      return <Navigate to={userRole === 'organizer' ? '/organizer/dashboard' : '/athlete/dashboard'} replace />;
    }
  }
  
  return <>{children}</>;
};

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <Suspense fallback={<LoadingScreen />}>
          <Routes>
              {/* Public Pages */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<AuthPage mode="login" />} />
              <Route path="/signup" element={<SignupSelection />} />
              <Route path="/signup/athlete" element={<AuthPage mode="register" role="athlete" />} />
              <Route path="/signup/organizer" element={<AuthPage mode="register" role="organizer" />} />
              
              <Route path="/race/:id" element={<RaceEnrollment />} />
              <Route path="/registration/:id" element={<RegistrationStatus />} />
              <Route path="/training-generator" element={<TrainingGenerator />} />
              <Route path="/atleta" element={<AthletePortal />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/dashboard" element={<Navigate to="/admin" replace />} />
              <Route path="/admin/users" element={<Navigate to="/admin" replace />} />
              <Route path="/admin/analytics" element={<Navigate to="/admin" replace />} />

              {/* Athlete Dashboard Branch */}
              <Route path="/athlete" element={
                <ProtectedRoute role="athlete">
                  <DashboardLayout />
                </ProtectedRoute>
              }>
                <Route path="dashboard" element={<RunnerDashboard />} />
                <Route path="races" element={<RunnerDashboard />} />
                <Route path="trainings" element={<RunnerDashboard />} />
                <Route path="consulting" element={<RunnerDashboard />} />
                <Route path="profile" element={<ProfileSettings />} />
              </Route>

              {/* Organizer Dashboard Branch */}
              <Route path="/organizer" element={
                <ProtectedRoute role="organizer">
                  <DashboardLayout />
                </ProtectedRoute>
              }>
                <Route path="dashboard" element={<DashboardOverview />} />
                <Route path="races" element={<DashboardOverview />} />
                <Route path="races/create" element={<CreateRace />} />
                <Route path="plans" element={<SubscriptionPlans />} />
                <Route path="race/:id" element={<RaceDetail />} />
                <Route path="race/:id/participants" element={<RaceParticipants />} />
                <Route path="registrations" element={<DashboardOverview />} />
                <Route path="training-consulting" element={<TrainerDashboard />} />
                <Route path="trainer/plans" element={<TrainerPlans />} />
                <Route path="trainer/workout/new" element={<CreateWorkout />} />
                <Route path="trainer/client/:clientId" element={<StudentProfile />} />
                <Route path="finance" element={<DashboardFinances />} />
                <Route path="settings" element={<ProfileSettings />} />
              </Route>

              {/* Root Dashboard Redirection */}
              <Route path="/dashboard/*" element={<Navigate to="/login" replace />} />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </AuthProvider>
      </Router>
  );
}
