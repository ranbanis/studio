
'use client';

import type { ReactNode } from 'react';
import { useState, useEffect } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut as firebaseSignOut, type User } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { AuthContext } from '@/contexts/auth-context';
import { usePathname, useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      await signInWithPopup(auth, googleProvider);
      // onAuthStateChanged will handle setUser and redirect
    } catch (error) {
      console.error("Error signing in with Google: ", error);
      let errorTitle = "Sign-In Error";
      let errorMessage = "An unexpected error occurred during Google Sign-In.";

      if (error instanceof Error) {
        const firebaseError = error as any; // Cast to any to check for 'code'
        if (firebaseError.code) {
          errorMessage = `Google Sign-In failed: ${firebaseError.message} (Code: ${firebaseError.code})`;
          if (firebaseError.code === 'auth/unauthorized-domain') {
            errorTitle = "Unauthorized Domain";
            const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'your-app-domain';
            console.error(`CRITICAL: The domain '${currentOrigin}' is not authorized for Firebase Authentication. Please add it to your Firebase project's 'Authorized domains' list in Authentication -> Sign-in method.`);
            errorMessage = `The domain '${currentOrigin}' is not authorized. Please go to your Firebase project console -> Authentication -> Sign-in method, and add this domain to the 'Authorized domains' list. The original error was: ${firebaseError.message}`;
          }
        } else {
          errorMessage = `Google Sign-In failed: ${error.message}`;
        }
      }
      toast({
        title: errorTitle,
        description: errorMessage,
        variant: "destructive",
        duration: 9000, // Keep message longer for unauthorized domain
      });
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      await firebaseSignOut(auth);
      router.push('/login');
    } catch (error) {
      console.error("Error signing out: ", error);
      toast({
        title: "Sign-Out Error",
        description: error instanceof Error ? error.message : "An unexpected error occurred.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };
  
  const unprotectedPaths = ['/login'];
  const isProtectedPath = !unprotectedPaths.includes(pathname);

  useEffect(() => {
    if (!loading) {
      if (!user && isProtectedPath) {
        router.push('/login');
      } else if (user && pathname === '/login') {
        router.push('/dashboard');
      }
    }
  }, [user, loading, router, pathname, isProtectedPath]);


  if (loading && isProtectedPath) {
     return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }


  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
