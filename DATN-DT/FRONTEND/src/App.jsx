import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Pitches from './pages/Pitches';
import PitchDetail from './pages/PitchDetail';
import MyBookings from './pages/MyBookings';
import Profile from './pages/Profile';

function AppLayout({ children }) {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
}

function AuthLayout({ children }) {
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: {
              background: '#1e293b',
              color: '#f1f5f9',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '12px',
              fontSize: '0.875rem',
            },
            success: { iconTheme: { primary: '#22c55e', secondary: '#fff' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
          }}
        />
        <Routes>
          {/* Auth pages - no navbar */}
          <Route path="/login" element={<AuthLayout><Login /></AuthLayout>} />
          <Route path="/register" element={<AuthLayout><Register /></AuthLayout>} />
          <Route path="/forgot-password" element={<AuthLayout><ForgotPassword /></AuthLayout>} />

          {/* Main pages - with navbar */}
          <Route path="/" element={<AppLayout><Home /></AppLayout>} />
          <Route path="/pitches" element={<AppLayout><Pitches /></AppLayout>} />
          <Route path="/pitches/:id" element={<AppLayout><PitchDetail /></AppLayout>} />

          {/* Protected routes */}
          <Route
            path="/my-bookings"
            element={
              <AppLayout>
                <PrivateRoute>
                  <MyBookings />
                </PrivateRoute>
              </AppLayout>
            }
          />
          <Route
            path="/profile"
            element={
              <AppLayout>
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              </AppLayout>
            }
          />

          {/* 404 */}
          <Route
            path="*"
            element={
              <AppLayout>
                <div className="page-wrapper">
                  <div className="container">
                    <div className="empty-state" style={{ minHeight: '60vh' }}>
                      <div className="empty-icon">🔍</div>
                      <h2>404 - Không tìm thấy trang</h2>
                      <p>Trang bạn tìm kiếm không tồn tại.</p>
                      <a href="/" className="btn btn-primary btn-lg">🏠 Về trang chủ</a>
                    </div>
                  </div>
                </div>
              </AppLayout>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
