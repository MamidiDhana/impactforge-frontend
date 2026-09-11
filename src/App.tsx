import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ProblemProvider } from './context/ProblemContext'
import { HEIProvider } from './context/HEIContext'
import { FacultyProvider } from './context/FacultyContext'
import { PartnerProvider } from './context/PartnerContext'
import { AdminProvider } from './context/AdminContext'
import { NotificationProvider } from './context/NotificationContext'
import { AppRoutes } from './routes/AppRoutes'
import { ErrorBoundary } from './components/common/ErrorBoundary'

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <ProblemProvider>
            <HEIProvider>
              <FacultyProvider>
                <PartnerProvider>
                  <AdminProvider>
                    <NotificationProvider>
                      <AppRoutes />
                    </NotificationProvider>
                  </AdminProvider>
                </PartnerProvider>
              </FacultyProvider>
            </HEIProvider>
          </ProblemProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  )
}

export default App
