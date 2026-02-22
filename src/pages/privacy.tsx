import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export function PrivacyPage() {
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
        <h1 className="text-3xl font-bold">Privacy Policy</h1>
        <p className="mt-2 text-sm text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>

        <div className="mt-12 space-y-8 prose prose-custom max-w-none">
          <section>
            <h2 className="text-xl font-semibold">Data we collect</h2>
            <p className="text-muted-foreground mt-2">
              We collect account information (email, name), usage data (curricula, progress, study sessions), and technical data (IP, device) to operate and improve the service.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold">How we use data</h2>
            <p className="text-muted-foreground mt-2">
              We use your data to provide the service, personalize recommendations, send reminders, and improve our AI. We anonymize data for analytics and model training.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold">Retention</h2>
            <p className="text-muted-foreground mt-2">
              We retain your data while your account is active. After deletion, we remove personal data within 30 days, except where required by law.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold">Your rights</h2>
            <p className="text-muted-foreground mt-2">
              You may access, correct, export, or delete your data. Contact us to exercise these rights or submit an access request.
            </p>
          </section>
        </div>
      </main>
    </div>
  )
}
