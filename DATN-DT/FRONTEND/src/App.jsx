import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';

// User Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Pitches from './pages/Pitches';
import PitchDetail from './pages/PitchDetail';
import MyBookings from './pages/MyBookings';
import Profile from './pages/Profile';

// Admin Pages
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminPitches from './pages/admin/AdminPitches';
import AdminBookings from './pages/admin/AdminBookings';
import AdminUsers from './pages/admin/AdminUsers';
import AdminStats from './pages/admin/AdminStats';

function AppLayout({ children }) {
  return <><Navbar />{children}</>;
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
          {/* ── Auth (no navbar) ─────────────────── */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* ── Public (with navbar) ─────────────── */}
          <Route path="/" element={<AppLayout><Home /></AppLayout>} />
          <Route path="/pitches" element={<AppLayout><Pitches /></AppLayout>} />
          <Route path="/pitches/:id" element={<AppLayout><PitchDetail /></AppLayout>} />

          {/* ── Protected user routes ─────────────── */}
          <Route path="/my-bookings" element={
            <AppLayout><PrivateRoute><MyBookings /></PrivateRoute></AppLayout>
          } />
          <Route path="/profile" element={
            <AppLayout><PrivateRoute><Profile /></PrivateRoute></AppLayout>
          } />

          {/* ── Admin routes (role=admin) ─────────── */}
          <Route path="/admin" element={
            <PrivateRoute roles={['admin']}>
              <AdminLayout><AdminDashboard /></AdminLayout>
            </PrivateRoute>
          } />
          <Route path="/admin/pitches" element={
            <PrivateRoute roles={['admin']}>
              <AdminLayout><AdminPitches /></AdminLayout>
            </PrivateRoute>
          } />
          <Route path="/admin/bookings" element={
            <PrivateRoute roles={['admin']}>
              <AdminLayout><AdminBookings /></AdminLayout>
            </PrivateRoute>
          } />
          <Route path="/admin/users" element={
            <PrivateRoute roles={['admin']}>
              <AdminLayout><AdminUsers /></AdminLayout>
            </PrivateRoute>
          } />
          <Route path="/admin/stats" element={
            <PrivateRoute roles={['admin']}>
              <AdminLayout><AdminStats /></AdminLayout>
            </PrivateRoute>
          } />

          {/* ── 404 ─────────────────────────────── */}
          <Route path="*" element={
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
          } />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
