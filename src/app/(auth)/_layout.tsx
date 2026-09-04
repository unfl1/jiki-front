import { Redirect, Stack } from 'expo-router';

import { useAuth } from '@/providers/AuthProvider';

export default function AuthLayout() {
  const { session, isLoading } = useAuth();
  if (isLoading) return null;
  if (session) return <Redirect href="/home" />;
  return <Stack screenOptions={{ headerShown: false }} />;
}
