import { AuthProvider, DataProvider, useAuth } from './context';
import { Login } from './components/Login';
import { StudentView } from './components/StudentView';
import { AdminView } from './components/AdminView';

const AppContent: React.FC = () => {
  const { user } = useAuth();

  if (!user) return <Login />;
  if (user.role === 'admin') return <AdminView />;
  return <StudentView />;
};

export function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <AppContent />
      </DataProvider>
    </AuthProvider>
  );
}
