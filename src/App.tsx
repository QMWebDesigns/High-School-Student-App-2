import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navigation from './components/Layout/Navigation';
import Login from './components/Auth/Login';
import AdminDashboard from './components/Admin/AdminDashboard';
import StudentDashboard from './components/Student/StudentDashboard';
import SurveyForm from './components/Survey/SurveyForm';
import ProtectedRoute from './components/Common/ProtectedRoute';
import LoadingScreen from './components/Common/LoadingScreen';
import ErrorBoundary from './components/Common/ErrorBoundary';
import StyleGuide from './components/StyleGuide';

const AppRoutes: React.FC = () => {
  const { currentUser, isUserAdmin, loading } = useAuth();

  // Show loading screen while checking authentication
  if (loading) {
    return <LoadingScreen message="Initializing Digital Library..." />;
  }

  // Redirect authenticated users to their appropriate dashboard
  const getDefaultRoute = () => {
    if (!currentUser) return '/login';
    return isUserAdmin ? '/admin' : '/student';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <Navigation />
      <Routes>
        <Route path="/login" element={
          currentUser ? <Navigate to={getDefaultRoute()} replace /> : <Login />
        } />
        
        <Route path="/admin" element={
          <ProtectedRoute requireAdmin>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/student" element={
          <ProtectedRoute>
            <StudentDashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/survey" element={<SurveyForm />} />
        <Route path="/style-guide" element={<StyleGuide />} />
        
        <Route path="/" element={<Navigate to={getDefaultRoute()} replace />} />
      </Routes>
    </div>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <Router>
            <AppRoutes />
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;