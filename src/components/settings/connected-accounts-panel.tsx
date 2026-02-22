import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useOAuthConnections } from '@/hooks/use-settings'
import { Skeleton } from '@/components/ui/skeleton'
import { Check } from 'lucide-react'

const PROVIDERS: { id: 'google' | 'apple'; name: string }[] = [
  { id: 'google', name: 'Google' },
  { id: 'apple', name: 'Apple' },
]

export function ConnectedAccountsPanel() {
  const { data: connections, isLoading } = useOAuthConnections()

  const handleConnect = (provider: 'google' | 'apple') => {
    // In production, would redirect to OAuth flow
    window.open(`/api/oauth/connect/${provider}`, '_blank', 'width=500,height=600')
  }

  const handleDisconnect = (_provider: 'google' | 'apple') => {
    // Would call API - for now just show toast
    // disconnectOAuth(provider)
  }

  const isConnected = (provider: 'google' | 'apple') =>
    connections?.some((c) => c.provider === provider) ?? false

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in-up">
      <div>
        <h1 className="text-2xl font-semibold">Connected Accounts</h1>
        <p className="text-muted-foreground mt-1">
          Link social accounts for easier sign-in
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>OAuth providers</CardTitle>
          <CardDescription>
            Connect or disconnect accounts. You need at least one sign-in method.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {PROVIDERS.map((p) => {
            const connected = isConnected(p.id)
            return (
              <div
                key={p.id}
                className="flex items-center justify-between py-3 border-b border-border last:border-0"
              >
                <div className="flex items-center gap-3">
                  <span className="font-medium">{p.name}</span>
                  {connected && (
                    <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-secondary/20 text-secondary">
                      <Check className="h-3 w-3" />
                      Connected
                    </span>
                  )}
                </div>
                <Button
                  variant={connected ? 'secondary' : 'default'}
                  size="sm"
                  onClick={() =>
                    connected ? handleDisconnect(p.id) : handleConnect(p.id)
                  }
                >
                  {connected ? 'Disconnect' : 'Connect'}
                </Button>
              </div>
            )
          })}
        </CardContent>
      </Card>
    </div>
  )
}
