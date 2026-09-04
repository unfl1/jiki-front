import { router } from 'expo-router';

import { PromiseCreateScreen } from '@/features/promises/components/PromiseCreateScreen';

export default function PromiseCreateRoute() {
  return <PromiseCreateScreen onCompleted={() => router.replace('/home')} onCancel={() => router.back()} />;
}
