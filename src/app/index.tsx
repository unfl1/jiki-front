import { Redirect } from 'expo-router';

import { useAuth } from '@/providers/AuthProvider';

export default function IndexRoute() {
  const { session, isLoading } = useAuth();
  if (isLoading) return null;
  return <Redirect href={session ? '/home' : '/login'} />;
}
