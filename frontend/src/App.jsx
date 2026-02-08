import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { GameProvider } from './context/GameContext';
import ProtectedRoute from './components/ProtectedRoute';
import BottomNav from './components/BottomNav';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Quests from './pages/Quests';
import Leaderboard from './pages/Leaderboard';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <GameProvider>
          <Toaster position="top-center" />

          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <>
                    <Dashboard />
                    <BottomNav />
                  </>
                </ProtectedRoute>
              }
            />
            <Route
              path="/quests"
              element={
                <ProtectedRoute>
                  <>
                    <Quests />
                    <BottomNav />
                  </>
                </ProtectedRoute>
              }
            />
            <Route
              path="/leaderboard"
              element={
                <ProtectedRoute>
                  <>
                    <Leaderboard />
                    <BottomNav />
                  </>
                </ProtectedRoute>
              }
            />

            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </GameProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
