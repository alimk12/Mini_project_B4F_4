import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const LINKS = {
  INSTRUCTOR: [
    { to: '/instructor/tests', label: 'Tests' },
    { to: '/instructor/attempts', label: 'Attempts' },
  ],
  STUDENT: [
    { to: '/student/tests', label: 'My Tests' },
    { to: '/student/results', label: 'My Results' },
  ],
};

export default function Navbar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  return (
    <header className="layout__nav">
      <nav className="layout__nav-inner">
        <Link to="/" className="layout__brand">
          <span className="layout__brand-mark">B4F</span> Assessment
        </Link>
        <div className="layout__links">
          {user && LINKS[user.role].map((l) => (
            <NavLink key={l.to} to={l.to} className={({ isActive }) => `layout__link${isActive ? ' layout__link--active' : ''}`}>
              {l.label}
            </NavLink>
          ))}
        </div>
        {user && (
          <div className="layout__user">
            <span>{user.fullName} <span className="layout__role">· {user.role === 'INSTRUCTOR' ? 'Instructor' : 'Student'}</span></span>
            <button type="button" className="layout__signout" onClick={() => { signOut(); navigate('/sign-in'); }}>Sign out</button>
          </div>
        )}
      </nav>
    </header>
  );
}
