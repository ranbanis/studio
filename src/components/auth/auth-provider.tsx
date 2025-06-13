
'use client';

import type { ReactNode } from 'react';
import { useState, useEffect } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut as firebaseSignOut, type User } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { AuthContext } from '@/contexts/auth-context';
import { usePathname, useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast'; // Added useToast import

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast(); // Initialized useToast

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
      let errorMessage = "An unexpected error occurred during Google Sign-In.";
      if (error instanceof Error) {
        // Firebase errors often have a 'code' property
        const firebaseError = error as any; // Cast to any to check for 'code'
        if (firebaseError.code) {
          errorMessage = `Google Sign-In failed: ${firebaseError.message} (Code: ${firebaseError.code})`;
        } else {
          errorMessage = `Google Sign-In failed: ${error.message}`;
        }
      }
      toast({
        title: "Sign-In Error",
        description: errorMessage,
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      await firebaseSignOut(auth);
      // onAuthStateChanged will handle setUser and redirect
      router.push('/login');
    } catch (error) {
      console.error("Error signing out: ", error);
      toast({ // Added toast for sign-out errors as well for consistency
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
