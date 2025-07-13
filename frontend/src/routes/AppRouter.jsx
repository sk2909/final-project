import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/layout/Layout';
import LoadingSpinner from '../components/ui/LoadingSpinner';


// Pages
import LandingPage from '../pages/LandingPage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import AdminDashboard from '../pages/AdminDashboard';
import StudentDashboard from '../pages/StudentDashboard';
import ExamAttemptPage from '../pages/ExamAttemptPage';
import ResultPage from '../pages/ResultPage';
import QuestionBankPage from '../pages/QuestionBankPage';
import AnalyticsPage from '../pages/AnalyticsPage';
import ExamManagementPage from '../pages/ExamManagementPage';
import UserManagementPage from '../pages/UserManagementPage';
import EnhancedAnalyticsPage from '../pages/EnhancedAnalyticsPage';
import ProfilePage from '../pages/ProfilePage';
import AddQuestionsToExamPage from '../pages/AddQuestionsToExamPage';
import MyExamsPage from '../pages/MyExamsPage';
import ExamQuestionsPage from '../pages/ExamQuestionsPage';
import ManageUsersPage from '../pages/ManageUsersPage';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Normalize role to lowercase for comparison
  const userRole = user.role?.toLowerCase();

  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    return <Navigate to={userRole === 'admin' ? '/admin' : '/dashboard'} replace />;
  }

  return children;
};

const PublicRoute = ({ children }) => {
  const { user } = useAuth();

  // Normalize role to lowercase for comparison
  const userRole = user?.role?.toLowerCase();

  if (user) {
    return <Navigate to={userRole === 'admin' ? '/admin' : '/dashboard'} replace />;
  }

  return children;
};

const AppRouter = () => {
  return (
    <Router>
      <Layout>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route 
            path="/login" 
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            } 
          />
          <Route 
            path="/register" 
            element={
              <PublicRoute>
                <RegisterPage />
              </PublicRoute>
            } 
          />

          {/* Admin Routes */}
          <Route path="/admin" element={
  <ProtectedRoute allowedRoles={['admin']}>
    <AdminDashboard />
  </ProtectedRoute>
} />
          <Route 
            path="/admin/exams" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <ExamManagementPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/questions" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <QuestionBankPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/users" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <UserManagementPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/analytics" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <EnhancedAnalyticsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/exams/:examId/add-questions" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AddQuestionsToExamPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/manage-users" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <ManageUsersPage />
              </ProtectedRoute>
            } 
          />

          {/* Student Routes */}
          <Route path="/dashboard" element={
  <ProtectedRoute allowedRoles={['student']}>
    <StudentDashboard />
  </ProtectedRoute>
} />
          
          <Route
  path="/profile"
  element={
    <ProtectedRoute allowedRoles={['student', 'admin', 'examiner']}>
      <ProfilePage />
    </ProtectedRoute>
  }
/>
          <Route 
            path="/my-exams" 
            element={
              <ProtectedRoute>
                <MyExamsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/my-exams/:examId" 
            element={
              <ProtectedRoute>
                <ExamQuestionsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard/results"
            element={
              <ProtectedRoute>
                <AnalyticsPage />
              </ProtectedRoute>
            }
          />

          {/* Shared Routes (both admin and student) */}
          <Route 
            path="/exam/:examId" 
            element={
              <ProtectedRoute>
                <ExamAttemptPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/result" 
            element={
              <ProtectedRoute>
                <ResultPage />
              </ProtectedRoute>
            } 
          />

          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default AppRouter;