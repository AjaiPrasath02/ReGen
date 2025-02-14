import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, userRole, account } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (!account) {
    return <Navigate to="/connect-wallet" />;
  }

  if (!allowedRoles.includes(userRole)) {
    return <Navigate to="/unauthorized" />;
  }

  return children;
};

export default ProtectedRoute;