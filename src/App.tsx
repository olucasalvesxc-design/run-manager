import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import LandingPage from './pages/LandingPage';
import DashboardLayout from './components/DashboardLayout';
import DashboardOverview from './pages/DashboardOverview';
import ProfileSettings from './pages/ProfileSettings';
import { Dumbbell } from 'lucide-react';
import AthletePortal from './pages/AthletePortal';
import TrainerDashboard from './pages/TrainerDashboard';
import CreateWorkout from './pages/CreateWorkout';
import StudentProfile from './pages/StudentProfile';
import AdminDashboard from './pages/AdminDashboard';
import RunnerDashboard from './pages/RunnerDashboard';
import CreateRace from './pages/CreateRace';
import RaceParticipants from './pages/RaceParticipants';
import RaceDetail from './pages/RaceDetail';
import SubscriptionPlans from './pages/SubscriptionPlans';
import TrainerPlans from './pages/TrainerPlans';
import DashboardFinances from './pages/DashboardFinances';
import RegistrationStatus from './pages/RegistrationStatus';
import RaceEnrollment from './pages/RaceEnrollment';
import SignupSelection from './pages/SignupSelection';
import AuthPage from './pages/AuthPage';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#05070A] flex flex-col items-center justify-center">
        <div className="w-16 h-16 bg-[#3B82F6] rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(59,130,246,0.3)] mb-6 mx-auto">
          <Dumbbell className="w-8 h-8 text-white animate-pulse" />
        </div>
        <div className="w-48 h-1.5 bg-white/5 rounded-full overflow-hidden">
          <div 
            className="h-full w-24 bg-[#3B82F6] shadow-[0_0_15px_rgba(59,130,246,0.5)] animate-[loading_1.5s_infinite_ease-in-out]"
            style={{
              animation: 'loading 1.5s infinite ease-in-out'
            }}
          />
        </div>
        <style>{`
          @keyframes loading {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(200%); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/atleta" element={<AthletePortal />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/register" element={<SignupSelection />} />
        <Route path="/plans" element={<SubscriptionPlans />} />
        <Route path="/trainer-plans" element={<TrainerPlans />} />
        <Route path="/race/:raceId" element={<RaceEnrollment />} />
        <Route path="/registration/:registrationId" element={<RegistrationStatus />} />
        
        <Route 
          path="/dashboard/*" 
          element={user ? <DashboardLayout /> : <Navigate to="/login" />}
        >
          <Route index element={<DashboardOverview />} />
          <Route path="overview" element={<DashboardOverview />} />
          <Route path="profile" element={<ProfileSettings />} />
          <Route path="settings" element={<ProfileSettings />} />
          
          {/* Athlete/Runner Specific Routes */}
          <Route path="runner" element={<RunnerDashboard />} />
          <Route path="finances" element={<DashboardFinances />} />
          <Route path="plans" element={<TrainerPlans />} />
          
          {/* Trainer Specific Routes */}
          <Route path="trainer" element={<TrainerDashboard />} />
          <Route path="trainer/workout/new" element={<CreateWorkout />} />
          <Route path="trainer/client/:clientId" element={<StudentProfile />} />
          
          {/* Race Management Routes */}
          <Route path="races" element={<RunnerDashboard />} /> {/* Fallback or list */}
          <Route path="races/create" element={<CreateRace />} />
          <Route path="races/:raceId" element={<RaceDetail />} />
          <Route path="races/:raceId/participants" element={<RaceParticipants />} />

          {/* Admin Specific Routes */}
          <Route path="admin" element={<AdminDashboard />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
