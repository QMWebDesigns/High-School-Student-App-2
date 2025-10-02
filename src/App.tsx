import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navigation from './components/Layout/Navigation';
import Login from './components/Auth/Login';
import AdminDashboard from './components/Admin/AdminDashboard';
import StudentDashboard from './components/Student/StudentDashboard';
import StudentHome from './components/Student/Home';
import StudentBooks from './components/Student/Books';
import StudentStudyGuides from './components/Student/StudyGuides';
import SurveyForm from './components/Survey/SurveyForm';
import ProtectedRoute from './components/Common/ProtectedRoute';
import LoadingScreen from './components/Common/LoadingScreen';
import ErrorBoundary from './components/Common/ErrorBoundary';
import StyleGuide from './components/StyleGuide';
import LibraryPastPapers from './components/Library/PastPapers';
import LibraryBooks from './components/Library/Books';
import LibraryStudyGuides from './components/Library/StudyGuides';

const AppRoutes: React.FC = () => {
  const { currentUser, isUserAdmin, loading } = useAuth();
  const location = useLocation();

  // Show loading screen while checking authentication
  if (loading) {
    return <LoadingScreen message="Initializing Digital Library..." />;
  }

  // Redirect authenticated users to their appropriate dashboard
  const getDefaultRoute = () => {
    if (!currentUser) return '/login';
    return isUserAdmin ? '/admin' : '/home';
  };

  // Hide navbar on login, admin, and past-papers pages
  const hideGlobalNav = location.pathname === '/login' || 
                       location.pathname.startsWith('/admin') || 
                       location.pathname.startsWith('/past-papers');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-300 px-3 py-2 rounded">Skip to content</a>
      {!hideGlobalNav && <Navigation />}
      <main id="main" role="main">
      <Routes>
        <Route path="/login" element={
          currentUser ? <Navigate to={getDefaultRoute()} replace /> : <Login />
        } />

        <Route path="/admin" element={
          <ProtectedRoute requireAdmin>
            <AdminDashboard />
          </ProtectedRoute>
        } />

        <Route path="/home" element={
          <ProtectedRoute>
            <StudentHome />
          </ProtectedRoute>
        } />

        <Route path="/books" element={
          <ProtectedRoute>
            <StudentBooks />
          </ProtectedRoute>
        } />

        <Route path="/study-guides" element={
          <ProtectedRoute>
            <StudentStudyGuides />
          </ProtectedRoute>
        } />

        <Route path="/past-papers" element={
          <ProtectedRoute>
            <StudentDashboard />
          </ProtectedRoute>
        } />

        <Route path="/library/papers" element={<LibraryPastPapers />} />
        <Route path="/library/books" element={<LibraryBooks />} />
        <Route path="/library/guides" element={<LibraryStudyGuides />} />

        {/* Legacy route for compatibility */}
        <Route path="/student" element={
          <ProtectedRoute>
            <Navigate to="/home" replace />
          </ProtectedRoute>
        } />

        <Route path="/survey" element={<SurveyForm />} />
        <Route path="/style-guide" element={<StyleGuide />} />

        <Route path="/" element={<Navigate to={getDefaultRoute()} replace />} />
      </Routes>
      </main>
    </div>
  );
}
  export default App;
