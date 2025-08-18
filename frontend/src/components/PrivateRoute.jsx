import { Navigate, useLocation } from 'react-router-dom'; // New import
import { useAuth } from '../contexts/AuthContext';

export default function PrivateRoute({ children, roles }) {
  const { user, ready } = useAuth();
  const location = useLocation(); // New hook to get the current URL

  if (!ready) return <div className="p-4">Loading...</div>;

  // THE FIX IS HERE: If the user is not logged in...
  if (!user) {
    // ...redirect them to the login page, but also pass the location they were
    // trying to get to in the 'state'.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles && roles.length > 0 && !roles.includes(user.role)) {
    return <div className="p-4 text-danger">Forbidden (role)</div>;
  }

  return children;
}
