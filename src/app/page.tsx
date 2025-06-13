
import { redirect } from 'next/navigation';

export default function HomePage() {
  redirect('/input');
  // This component will not render anything as redirect() is called.
  // It's good practice for redirect() to be the last thing in a Server Component path.
}
