import { router } from 'expo-router';

import { LoginScreen as LoginForm } from '@/features/auth/components/LoginScreen';
import { useAuth } from '@/providers/AuthProvider';

export default function LoginScreen() {
  const { signIn } = useAuth();
  return <LoginForm onLogin={signIn} onOpenSignup={() => router.push('/signup')} />;
}
