import { Navigate, Route, Routes } from 'react-router-dom';

import { useAuth } from './providers/AuthProvider';
import { DashboardPage } from './pages/DashboardPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';

const LoadingScreen = () => (
  <div className="flex min-h-screen items-center justify-center bg-slate-50">
    <div className="h-12 w-12 animate-spin rounded-full border-4 border-navy border-t-transparent" aria-label="Loading" />
  </div>
);

const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return <LoadingScreen />;
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export const App = () => {
  const { user } = useAuth();

  return (
    <Routes>
      <Route
        path="/"
        element={
          <PrivateRoute>
            <DashboardPage />
          </PrivateRoute>
        }
      />
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />
      <Route path="/register" element={user ? <Navigate to="/" replace /> : <RegisterPage />} />
      <Route path="*" element={<Navigate to={user ? '/' : '/login'} replace />} />
    </Routes>
  );
};
