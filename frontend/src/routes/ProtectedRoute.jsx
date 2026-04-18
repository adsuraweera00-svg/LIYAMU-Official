import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ roles }) => {
  const { auth } = useAuth();
  if (!auth) return <Navigate to="/auth" replace />;
  if (roles && !roles.includes(auth.role)) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
};

export default ProtectedRoute;
