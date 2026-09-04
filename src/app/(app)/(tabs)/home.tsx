import { router } from 'expo-router';

import { PromiseDashboardScreen } from '@/features/promises/components/PromiseDashboardScreen';

export default function HomeRoute() {
  return <PromiseDashboardScreen onOpenCreate={() => router.push('/promises/create')} />;
}
