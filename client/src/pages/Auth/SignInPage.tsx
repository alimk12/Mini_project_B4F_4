import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// PLACEHOLDER (Phase 0). Owner: Ali. Spec: TASKS.md Task 1, Part B.
// The two buttons only exist so everyone can open every placeholder route against the stub backend.
export default function SignInPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const go = async (email: string) => {
    if (await signIn({ email, password: 'stub' })) navigate('/');
  };
  return (
    <main style={{ padding: '2rem' }}>
      <h1>Sign in</h1>
      <p>Placeholder — Ali builds this page (TASKS.md Task 1, Part B).</p>
      <button type="button" onClick={() => go('instructor@b4f.local')}>Stub sign in as instructor</button>{' '}
      <button type="button" onClick={() => go('lina@b4f.local')}>Stub sign in as student</button>
    </main>
  );
}
