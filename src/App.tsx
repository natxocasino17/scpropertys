import { lazy, Suspense } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ScrollToTop } from './components/layout/ScrollToTop'
import { ProtectedRoute } from './components/admin/ProtectedRoute'
import { Spinner } from './components/ui/Spinner'

import HomePage from './pages/HomePage'
import PropertiesPage from './pages/PropertiesPage'
import ContactPage from './pages/ContactPage'
import NotFoundPage from './pages/NotFoundPage'

// Detail page pulls in Leaflet → load it on demand.
const PropertyDetailPage = lazy(() => import('./pages/PropertyDetailPage'))

// Admin section is split out of the public bundle entirely.
const AdminLoginPage = lazy(() => import('./pages/admin/AdminLoginPage'))
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage'))
const AdminPropertyFormPage = lazy(() => import('./pages/admin/AdminPropertyFormPage'))
const AdminLeadsPage = lazy(() => import('./pages/admin/AdminLeadsPage'))

function Loader() {
  return (
    <div className="grid min-h-screen place-items-center bg-ink">
      <Spinner />
    </div>
  )
}

function Page({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  )
}

export default function App() {
  const location = useLocation()
  return (
    <>
      <ScrollToTop />
      <AnimatePresence mode="wait">
        <Suspense fallback={<Loader />}>
          <Routes location={location} key={location.pathname}>
            {/* Public */}
            <Route path="/" element={<Page><HomePage /></Page>} />
            <Route path="/propiedades" element={<Page><PropertiesPage /></Page>} />
            <Route path="/propiedades/:slug" element={<Page><PropertyDetailPage /></Page>} />
            <Route path="/contacto" element={<Page><ContactPage /></Page>} />

            {/* Admin */}
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/properties/new"
              element={
                <ProtectedRoute>
                  <AdminPropertyFormPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/properties/:id"
              element={
                <ProtectedRoute>
                  <AdminPropertyFormPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/leads"
              element={
                <ProtectedRoute>
                  <AdminLeadsPage />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<Page><NotFoundPage /></Page>} />
          </Routes>
        </Suspense>
      </AnimatePresence>
    </>
  )
}
