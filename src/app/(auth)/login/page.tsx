
import { Logo } from '@/components/shared/logo';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function LoginPage() {
  // This page is no longer actively used for login if auth is removed.
  // It's kept to prevent build errors if any old links point here,
  // but users should be redirected to /input directly from /app/page.tsx.
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-background">
      <div className="absolute top-8 left-8">
        <Logo />
      </div>
      <Card className="w-full max-w-md shadow-2xl" style={{'--card-background': 'hsl(var(--card))', '--card-foreground': 'hsl(var(--card-foreground))'} as React.CSSProperties}>
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-headline text-primary">DragonSpend</CardTitle>
          <CardDescription className="text-muted-foreground pt-2">
            User login is not required for this application.
            You should be automatically redirected to the expense input page.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-sm text-muted-foreground">
            If you are seeing this page, please try navigating to the main application page.
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
