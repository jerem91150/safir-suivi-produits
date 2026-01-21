import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, Spin } from 'antd';
import frFR from 'antd/locale/fr_FR';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import FichesList from './pages/FichesList';
import FicheDetail from './pages/FicheDetail';
import FicheForm from './pages/FicheForm';
import Users from './pages/Users';
import Settings from './pages/Settings';
import Developer from './pages/Developer';
import { antdTheme } from './theme/colors';

// Composant de chargement
const LoadingScreen: React.FC = () => (
  <div style={{
    height: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#f0f2f5'
  }}>
    <Spin size="large" />
  </div>
);

// Composant de protection des routes
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Composant pour les routes d'édition (nécessite canEdit)
const EditorRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { canEdit, loading } = useAuth();

  if (loading) {
    return <div>Chargement...</div>;
  }

  if (!canEdit) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

// Composant pour les routes admin (nécessite isAdmin)
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAdmin, loading } = useAuth();

  if (loading) {
    return <div>Chargement...</div>;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<FichesList />} />
        <Route path="fiches/:id" element={<FicheDetail />} />
        <Route
          path="fiches/new"
          element={
            <EditorRoute>
              <FicheForm />
            </EditorRoute>
          }
        />
        <Route
          path="fiches/:id/edit"
          element={
            <EditorRoute>
              <FicheForm />
            </EditorRoute>
          }
        />
        <Route
          path="users"
          element={
            <AdminRoute>
              <Users />
            </AdminRoute>
          }
        />
        <Route
          path="settings"
          element={
            <AdminRoute>
              <Settings />
            </AdminRoute>
          }
        />
        <Route
          path="developer"
          element={
            <AdminRoute>
              <Developer />
            </AdminRoute>
          }
        />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <ConfigProvider locale={frFR} theme={antdTheme}>
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </ConfigProvider>
  );
}

export default App;
