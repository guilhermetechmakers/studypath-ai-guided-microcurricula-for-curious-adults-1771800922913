import { Navigate, Routes, Route } from 'react-router-dom'
import { SettingsLayout } from '@/components/settings/settings-layout'
import { ProfilePanel } from '@/components/settings/profile-panel'
import { LearningPreferencesPanel } from '@/components/settings/learning-preferences-panel'
import { AccountSecurityPanel } from '@/components/settings/account-security-panel'
import { ConnectedAccountsPanel } from '@/components/settings/connected-accounts-panel'
import { BillingPanel } from '@/components/settings/billing-panel'
import { ExportImportPanel } from '@/components/settings/export-import-panel'
import { ProgressAnalyticsPanel } from '@/components/settings/progress-analytics-panel'
import { PrivacyPanel } from '@/components/settings/privacy-panel'

export function SettingsPage() {
  return (
    <Routes>
      <Route element={<SettingsLayout />}>
        <Route index element={<Navigate to="profile" replace />} />
        <Route path="profile" element={<ProfilePanel />} />
        <Route path="preferences" element={<LearningPreferencesPanel />} />
        <Route path="security" element={<AccountSecurityPanel />} />
        <Route path="connections" element={<ConnectedAccountsPanel />} />
        <Route path="billing" element={<BillingPanel />} />
        <Route path="export" element={<ExportImportPanel />} />
        <Route path="analytics" element={<ProgressAnalyticsPanel />} />
        <Route path="privacy" element={<PrivacyPanel />} />
      </Route>
    </Routes>
  )
}
