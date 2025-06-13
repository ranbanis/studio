
import Link from 'next/link';

interface LogoProps {
  className?: string;
}

export function Logo({ className }: LogoProps) {
  return (
    <Link href="/input" className={`font-headline text-3xl font-bold text-primary hover:text-accent transition-colors ${className}`}>
      DragonSpend
    </Link>
  );
}
