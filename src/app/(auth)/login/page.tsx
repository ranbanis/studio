import { LoginForm } from '@/components/auth/login-form';
import { Logo } from '@/components/shared/logo';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-background">
      <div className="absolute top-8 left-8">
        <Logo />
      </div>
      <Card className="w-full max-w-md shadow-2xl" style={{'--card-background': 'hsl(var(--card))', '--card-foreground': 'hsl(var(--card-foreground))'} as React.CSSProperties}>
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-headline text-primary">Welcome to DragonSpend</CardTitle>
          <CardDescription className="text-muted-foreground pt-2">
            Access to DragonSpend is currently managed by your administrator.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>
    </main>
  );
}
