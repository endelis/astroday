// Root page — redirects to login. AuthGuard on dashboard handles authenticated redirects.
import { redirect } from 'next/navigation';

export default function Home() {
  redirect('/login');
}
