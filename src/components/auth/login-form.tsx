'use client';

import { Button } from '@/components/ui/button';
import { Chrome } from 'lucide-react'; 

export function LoginForm() {
  // const { signInWithGoogle, loading } = useAuth(); // signInWithGoogle is no longer used

  return (
    <div className="space-y-6 text-center">
      <p className="text-muted-foreground">Sign-in is currently unavailable.</p>
      {/* 
      <Button
        onClick={signInWithGoogle}
        disabled={true} // Or remove entirely if login is permanently disabled
        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
        size="lg"
      >
        <Chrome className="mr-2 h-5 w-5" />
        Sign in with Google
      </Button> 
      */}
    </div>
  );
}
