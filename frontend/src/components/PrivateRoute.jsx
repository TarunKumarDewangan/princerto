import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function PrivateRoute({ children, roles }) {
  const { user, ready } = useAuth();

  if (!ready) return <div className="p-4">Loading...</div>;

  // THE CHANGE IS HERE: Redirect to '/login' instead of '/'
  if (!user) return <Navigate to="/login" replace />;

  if (roles && roles.length > 0 && !roles.includes(user.role)) {
    return <div className="p-4 text-danger">Forbidden (role)</div>;
  }
  return children;
}
