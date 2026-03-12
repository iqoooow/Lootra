import { redirect } from 'next/navigation';

// Root redirect: / → /uz (default locale)
export default function RootPage() {
  redirect('/uz');
}
