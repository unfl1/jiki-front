import { router } from 'expo-router';

import { SignupScreen as SignupForm } from '@/features/auth/components/SignupScreen';

export default function SignupScreen() {
  return <SignupForm onCompleted={() => router.replace('/login')} onBack={() => router.back()} />;
}
