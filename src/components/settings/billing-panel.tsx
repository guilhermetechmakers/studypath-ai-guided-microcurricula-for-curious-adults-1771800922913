import { Link } from 'react-router-dom'
import { Download, CreditCard } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useSubscription, useInvoices } from '@/hooks/use-settings'
import { Skeleton } from '@/components/ui/skeleton'

export function BillingPanel() {
  const { data: subscription, isLoading: subLoading } = useSubscription()
  const { data: invoices, isLoading: invoicesLoading } = useInvoices()

  if (subLoading || !subscription) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48 w-full" />
      </div>
    )
  }

  const planId = subscription.planId ?? 'free'
  const isPaid = planId !== 'free'

  return (
    <div className="space-y-6 animate-in-up">
      <div>
        <h1 className="text-2xl font-semibold">Billing & Subscription</h1>
        <p className="text-muted-foreground mt-1">
          Manage your plan and payment methods
        </p>
      </div>

      <Card className="border-accent/20 bg-gradient-to-br from-accent/5 to-transparent">
        <CardHeader>
          <CardTitle>Current plan</CardTitle>
          <CardDescription>
            {isPaid
              ? `Your ${planId.charAt(0).toUpperCase() + planId.slice(1)} subscription`
              : 'Upgrade for unlimited curricula and advanced features'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-semibold capitalize">{planId}</span>
            {!isPaid && (
              <Button asChild>
                <Link to="/dashboard/checkout">Upgrade</Link>
              </Button>
            )}
          </div>
          {isPaid && subscription.currentPeriodEnd && (
            <p className="text-sm text-muted-foreground">
              Next billing: {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
            </p>
          )}
          {isPaid && subscription.cancelAtPeriodEnd && (
            <p className="text-sm text-amber-600">
              Subscription will cancel at end of period
            </p>
          )}
        </CardContent>
      </Card>

      {isPaid && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment method
            </CardTitle>
            <CardDescription>
              Update your card or billing details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="secondary" asChild>
              <Link to="/dashboard/checkout">Update payment method</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Invoices</CardTitle>
          <CardDescription>
            Download past invoices and receipts
          </CardDescription>
        </CardHeader>
        <CardContent>
          {invoicesLoading ? (
            <Skeleton className="h-24 w-full" />
          ) : invoices && invoices.length > 0 ? (
            <ul className="space-y-3">
              {invoices.map((inv) => (
                <li
                  key={inv.id}
                  className="flex items-center justify-between py-2 border-b border-border last:border-0"
                >
                  <div>
                    <p className="font-medium">
                      {new Date(inv.createdAt).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      ${(inv.amount / 100).toFixed(2)} {inv.currency.toUpperCase()}
                    </p>
                  </div>
                  {inv.pdfUrl && (
                    <Button variant="ghost" size="sm" asChild>
                      <a href={inv.pdfUrl} download target="_blank" rel="noreferrer">
                        <Download className="h-4 w-4 mr-1" />
                        PDF
                      </a>
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground py-4">
              No invoices yet
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
