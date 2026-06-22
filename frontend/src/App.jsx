import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider }  from './context/AuthContext';
import { TimerProvider } from './context/TimerContext';
import ProtectedRoute    from './components/ProtectedRoute/ProtectedRoute';
import Layout            from './components/Layout/Layout';

import Login        from './pages/Login/Login';
import Register     from './pages/Register/Register';
import Dashboard    from './pages/Dashboard/Dashboard';
import Clients      from './pages/Clients/Clients';
import ClientDetail from './pages/ClientDetail/ClientDetail';
import Projects     from './pages/Projects/Projects';
import ProjectDetail from './pages/ProjectDetail/ProjectDetail';
import Tasks        from './pages/Tasks/Tasks';
import TimeTracking from './pages/TimeTracking/TimeTracking';
import Invoices     from './pages/Invoices/Invoices';
import InvoiceDetail from './pages/InvoiceDetail/InvoiceDetail';
import Settings     from './pages/Settings/Settings';
import AdminDashboard from './pages/AdminDashboard/AdminDashboard';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <TimerProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                fontFamily: 'Inter, sans-serif',
                fontSize: '0.875rem',
                borderRadius: '0.5rem',
                boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)',
              },
              success: {
                iconTheme: {
                  primary: '#10B981',
                  secondary: '#fff'
                }
              },
              error: {
                iconTheme: {
                  primary: '#EF4444',
                  secondary: '#fff'
                }
              },
            }}
          />
          <Routes>
            <Route path="/login"    element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/admin"    element={<AdminDashboard />} />
            
            <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route index              element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard"   element={<Dashboard />} />
              <Route path="clients"     element={<Clients />} />
              <Route path="clients/:id" element={<ClientDetail />} />
              <Route path="projects"    element={<Projects />} />
              <Route path="projects/:id" element={<ProjectDetail />} />
              <Route path="tasks"       element={<Tasks />} />
              <Route path="time-tracking" element={<TimeTracking />} />
              <Route path="invoices"    element={<Invoices />} />
              <Route path="invoices/:id" element={<InvoiceDetail />} />
              <Route path="settings"    element={<Settings />} />
            </Route>

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </TimerProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
