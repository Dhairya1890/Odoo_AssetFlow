import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Login from './pages/Auth/Login'
import MainLayout from './components/layout/MainLayout'
import ProtectedRoute from './components/layout/ProtectedRoute'
import Dashboard from './pages/Dashboard/Dashboard'
import Assets from './pages/Assets/Assets'
import Allocations from './pages/Allocations/Allocations'
import Bookings from './pages/Bookings/Bookings'
import Maintenance from './pages/Maintenance/Maintenance'
import Settings from './pages/Settings/Settings'

function App() {
  return (
    <>
      <Toaster position="top-right"
        toastOptions={{
          style: {
            background: '#1e1e2f',
            color: '#fff',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          },
        }}
      />
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/" element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            
            <Route path="assets" element={<Assets />} />
            <Route path="allocations" element={<Allocations />} />
            <Route path="bookings" element={<Bookings />} />
            <Route path="maintenance" element={<Maintenance />} />
            <Route path="audits" element={<div className="text-on-surface text-xl p-8">Audits Page (Coming Soon)</div>} />
            <Route path="reports" element={<div className="text-on-surface text-xl p-8">Reports Page (Coming Soon)</div>} />
            <Route path="settings" element={<Settings />} />
          </Route>
          
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </>
  )
}

export default App
