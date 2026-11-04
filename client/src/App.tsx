import { BrowserRouter } from 'react-router-dom';
import { AttemptProvider } from './context/AttemptContext';
import { AuthProvider } from './context/AuthContext';
import { InstructorAttemptsProvider } from './context/InstructorAttemptsContext';
import { InstructorTestsProvider } from './context/InstructorTestsContext';
import { StudentTestsProvider } from './context/StudentTestsContext';
import AppRouter from './routes/AppRouter';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <InstructorTestsProvider>
          <InstructorAttemptsProvider>
            <StudentTestsProvider>
              <AttemptProvider>
                <AppRouter />
              </AttemptProvider>
            </StudentTestsProvider>
          </InstructorAttemptsProvider>
        </InstructorTestsProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
