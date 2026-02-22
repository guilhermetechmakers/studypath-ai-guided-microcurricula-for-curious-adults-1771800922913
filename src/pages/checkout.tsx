import { useState } from 'react'
import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const plans = [
  { id: 'free', name: 'Free', price: 0, features: ['3 curricula', 'Basic export', 'Community support'] },
  { id: 'pro', name: 'Pro', price: 12, features: ['Unlimited curricula', 'PDF/MD/CSV export', 'AI Q&A', 'Priority support'], popular: true },
]

export function CheckoutPage() {
  const [selectedPlan, setSelectedPlan] = useState('pro')

  return (
    <div className="space-y-8 animate-in max-w-4xl">
      <div>
        <h1 className="text-2xl font-semibold">Upgrade</h1>
        <p className="text-muted-foreground mt-1">Choose a plan that fits your learning goals</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {plans.map((p) => (
          <Card
            key={p.id}
            className={`cursor-pointer transition-all ${
              selectedPlan === p.id ? 'border-accent ring-2 ring-accent/20' : 'hover:border-accent/50'
            }`}
            onClick={() => setSelectedPlan(p.id)}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle>{p.name}</CardTitle>
                {p.popular && (
                  <span className="text-xs px-2 py-0.5 rounded bg-accent/10 text-accent">Popular</span>
                )}
              </div>
              <CardDescription>
                ${p.price}/month
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 mb-4">
                {p.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-secondary shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button
                variant={selectedPlan === p.id ? 'default' : 'secondary'}
                className="w-full"
              >
                {selectedPlan === p.id ? 'Selected' : 'Select'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payment</CardTitle>
          <CardDescription>Enter your payment details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="card">Card number</Label>
            <Input id="card" placeholder="4242 4242 4242 4242" className="mt-2" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="exp">Expiry</Label>
              <Input id="exp" placeholder="MM/YY" className="mt-2" />
            </div>
            <div>
              <Label htmlFor="cvc">CVC</Label>
              <Input id="cvc" placeholder="123" className="mt-2" />
            </div>
          </div>
          <Button className="w-full">Subscribe</Button>
        </CardContent>
      </Card>
    </div>
  )
}
