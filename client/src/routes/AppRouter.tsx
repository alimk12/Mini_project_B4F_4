import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Loading from '../components/common/Loading';
import { useAuth } from '../context/AuthContext';
import SignInPage from '../pages/Auth/SignInPage';
import SignUpPage from '../pages/Auth/SignUpPage';
import AttemptsPage from '../pages/instructor/Attempts/AttemptsPage';
import TestEditorPage from '../pages/instructor/TestEditor/TestEditorPage';
import TestManagementPage from '../pages/instructor/TestManagement/TestManagementPage';
import NotFoundPage from '../pages/NotFound/NotFoundPage';
import AttemptPage from '../pages/student/Attempt/AttemptPage';
import MyResultsPage from '../pages/student/MyResults/MyResultsPage';
import MyTestsPage from '../pages/student/MyTests/MyTestsPage';
import TestIntroPage from '../pages/student/TestIntro/TestIntroPage';
import RequireRole from './RequireRole';

function HomeRedirect() {
  const { user, isAuthReady } = useAuth();
  if (!isAuthReady) return <Loading />;
  if (!user) return <Navigate to="/sign-in" replace />;
  return <Navigate to={user.role === 'INSTRUCTOR' ? '/instructor/tests' : '/student/tests'} replace />;
}

const instructor = (el: JSX.Element) => <RequireRole role="INSTRUCTOR">{el}</RequireRole>;
const student = (el: JSX.Element) => <RequireRole role="STUDENT">{el}</RequireRole>;

export default function AppRouter() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomeRedirect />} />
        <Route path="/sign-in" element={<SignInPage />} />
        <Route path="/sign-up" element={<SignUpPage />} />
        <Route path="/instructor/tests" element={instructor(<TestManagementPage />)} />
        <Route path="/instructor/tests/:testId" element={instructor(<TestEditorPage />)} />
        <Route path="/instructor/attempts" element={instructor(<AttemptsPage />)} />
        <Route path="/student/tests" element={student(<MyTestsPage />)} />
        <Route path="/student/tests/:testId" element={student(<TestIntroPage />)} />
        <Route path="/student/attempts/:attemptId" element={student(<AttemptPage />)} />
        <Route path="/student/results" element={student(<MyResultsPage />)} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
