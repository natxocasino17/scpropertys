import { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { NotConfigured } from '../../pages/admin/NotConfigured'
import { Spinner } from '../ui/Spinner'

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading, configured } = useAuth()

  if (!configured) return <NotConfigured />
  if (loading)
    return (
      <div className="grid min-h-screen place-items-center bg-ink">
        <Spinner />
      </div>
    )
  if (!user) return <Navigate to="/admin/login" replace />
  return <>{children}</>
}
