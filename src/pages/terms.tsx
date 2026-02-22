import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link to="/" className="font-semibold text-xl text-primary">
            StudyPath
          </Link>
          <Link to="/">
            <Button variant="secondary">Back to home</Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16 max-w-3xl">
        <h1 className="text-3xl font-bold">Terms of Service</h1>
        <p className="mt-2 text-sm text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>

        <div className="mt-12 space-y-8 prose prose-custom max-w-none">
          <section>
            <h2 className="text-xl font-semibold">1. Acceptance</h2>
            <p className="text-muted-foreground mt-2">
              By using StudyPath, you agree to these terms. If you do not agree, do not use the service.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold">2. Subscription</h2>
            <p className="text-muted-foreground mt-2">
              Paid plans are billed monthly or annually. You may cancel at any time. Refunds are handled per our refund policy.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold">3. User content</h2>
            <p className="text-muted-foreground mt-2">
              You retain ownership of content you create. You grant us a license to operate the service and improve our AI models with anonymized usage data.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold">4. Liability</h2>
            <p className="text-muted-foreground mt-2">
              StudyPath is provided &quot;as is.&quot; We are not liable for indirect, incidental, or consequential damages. Our total liability is limited to the amount you paid in the past 12 months.
            </p>
          </section>
        </div>
      </main>
    </div>
  )
}
