import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { AuthProvider } from '@/contexts/auth-context'
import { ProtectedRoute } from '@/components/protected-route'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { LandingPage } from '@/pages/landing'
import { LoginPage } from '@/pages/login'
import { SignupPage } from '@/pages/signup'
import { VerifyEmailPage } from '@/pages/verify-email'
import { ForgotPasswordPage } from '@/pages/forgot-password'
import { ResetPasswordPage } from '@/pages/reset-password'
import { DashboardPage } from '@/pages/dashboard'
import { CreateCurriculumPage } from '@/pages/create-curriculum'
import { CurriculumDetailPage } from '@/pages/curriculum-detail'
import { CurriculaListPage } from '@/pages/curricula-list'
import { LessonViewerPage } from '@/pages/lesson-viewer'
import { SearchPage } from '@/pages/search'
import { SchedulerPage } from '@/pages/scheduler'
import { ExportPage } from '@/pages/export'
import { SettingsPage } from '@/pages/settings'
import { CheckoutPage } from '@/pages/checkout'
import { AdminPage } from '@/pages/admin'
import { AboutPage } from '@/pages/about'
import { HelpPage } from '@/pages/help'
import { TermsPage } from '@/pages/terms'
import { PrivacyPage } from '@/pages/privacy'
import { NotFoundPage } from '@/pages/not-found'
import { ErrorPage } from '@/pages/error'

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/help" element={<HelpPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<DashboardPage />} />
              <Route path="create" element={<CreateCurriculumPage />} />
              <Route path="curricula" element={<CurriculaListPage />} />
              <Route path="curricula/:id" element={<CurriculumDetailPage />} />
              <Route path="curricula/:curriculumId/lesson/:lessonId" element={<LessonViewerPage />} />
              <Route path="search" element={<SearchPage />} />
              <Route path="scheduler" element={<SchedulerPage />} />
              <Route path="export" element={<ExportPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="checkout" element={<CheckoutPage />} />
              <Route path="admin" element={<AdminPage />} />
            </Route>

            <Route path="/404" element={<NotFoundPage />} />
            <Route path="/500" element={<ErrorPage onRetry={() => window.location.reload()} />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
        </BrowserRouter>
        <Toaster position="top-right" richColors />
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App
