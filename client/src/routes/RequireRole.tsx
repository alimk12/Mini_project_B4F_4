import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import Loading from '../components/common/Loading';
import { useAuth } from '../context/AuthContext';
import { Role } from '../types/common.types';

export default function RequireRole({ role, children }: { role: Role; children: ReactNode }) {
  const { user, isAuthReady } = useAuth();
  if (!isAuthReady) return <Loading />;
  if (!user) {
    return (
      <div className="layout__guard ui-card">
        <h2>Please sign in to continue.</h2>
        <Link to="/sign-in">Go to sign in</Link>
      </div>
    );
  }
  if (user.role !== role) {
    return (
      <div className="layout__guard ui-card">
        <h2>You do not have permission to do this.</h2>
        <Link to="/">Back to home</Link>
      </div>
    );
  }
  return <>{children}</>;
}
