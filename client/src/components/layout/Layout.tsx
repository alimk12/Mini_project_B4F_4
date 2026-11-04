import { Outlet, useMatch } from 'react-router-dom';
import Navbar from './Navbar';
import './Layout.css';

export default function Layout() {
  // The attempt page runs in full screen with its own header, so the navbar is hidden there.
  const inAttempt = useMatch('/student/attempts/:attemptId');
  return (
    <div className="layout">
      {!inAttempt && <Navbar />}
      <div className="layout__content">
        <Outlet />
      </div>
    </div>
  );
}
