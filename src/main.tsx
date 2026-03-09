import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'
import App from './App'
import Home from './pages/Home'
import SobreNosotros from './pages/SobreNosotros'
import Multimedia from './pages/Multimedia'
import Mensajes from './pages/Mensajes'
import Eventos from './pages/Eventos'
import Blog from './pages/Blog'
import Ministerios from './pages/Ministerios'
import Donaciones from './pages/Donaciones'
import Contacto from './pages/Contacto'
import Oracion from './pages/Oracion'
import Estudios from './pages/Estudios'
import LectorEstudio from './pages/LectorEstudio'
import ErrorBoundary from './components/ErrorBoundary'
import NotFound from './pages/NotFound'
import AdminLogin from './pages/admin/Login'
import AdminDashboard from './pages/admin/Dashboard'
import CalendarAdmin from './pages/admin/Calendar'
import MediaAdmin from './pages/admin/Media'
import DonacionesAdmin from './pages/admin/DonacionesAdmin'
import TransmisionesAdmin from './pages/admin/TransmisionesAdmin'
import Biblia from './pages/Biblia'
import Transmisiones from './pages/Transmisiones'
import { AuthProvider } from './context/AuthContext'
import { NotificationProvider } from './context/NotificationContext'
import ProtectedRoute from './routes/ProtectedRoute'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <ErrorBoundary />,
    children: [
      { index: true, element: <Home /> },
      { path: 'sobre-nosotros', element: <SobreNosotros /> },
      { path: 'multimedia', element: <Multimedia /> },
      { path: 'mensajes', element: <Mensajes /> },
      { path: 'eventos', element: <Eventos /> },
      { path: 'blog', element: <Blog /> },
      { path: 'ministerios', element: <Ministerios /> },
      { path: 'donaciones', element: <Donaciones /> },
      { path: 'contacto', element: <Contacto /> },
      { path: 'oracion', element: <Oracion /> },
      { path: 'transmisiones', element: <Transmisiones /> },
      { path: 'estudios', element: <Estudios /> },
      { path: 'estudios/:slug', element: <LectorEstudio />, errorElement: <ErrorBoundary /> },
      { path: 'biblia', element: <Biblia /> },
      { path: 'admin/login', element: <AdminLogin /> },
      {
        path: 'admin',
        element: (
          <ProtectedRoute roles={['admin', 'editor']}>
            <AdminDashboard />
          </ProtectedRoute>
        )
      },
      {
        path: 'admin/calendario',
        element: (
          <ProtectedRoute roles={['admin', 'editor']}>
            <CalendarAdmin />
          </ProtectedRoute>
        )
      },
      {
        path: 'admin/multimedia',
        element: (
          <ProtectedRoute roles={['admin', 'editor']}>
            <MediaAdmin />
          </ProtectedRoute>
        )
      },
      {
        path: 'admin/donaciones',
        element: (
          <ProtectedRoute roles={['admin', 'editor']}>
            <DonacionesAdmin />
          </ProtectedRoute>
        )
      },
      {
        path: 'admin/transmisiones',
        element: (
          <ProtectedRoute roles={['admin', 'editor']}>
            <TransmisionesAdmin />
          </ProtectedRoute>
        )
      },
      { path: '*', element: <NotFound /> }
    ]
  }
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <NotificationProvider>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </NotificationProvider>
  </React.StrictMode>
)
