'use client';

import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Chrome } from 'lucide-react'; // Using Chrome icon for Google

export function LoginForm() {
  const { signInWithGoogle, loading } = useAuth();

  return (
    <div className="space-y-6">
      <Button
        onClick={signInWithGoogle}
        disabled={loading}
        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
        size="lg"
      >
        <Chrome className="mr-2 h-5 w-5" />
        {loading ? 'Signing in...' : 'Sign in with Google'}
      </Button>
    </div>
  );
}
