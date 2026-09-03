import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Redirect } from 'expo-router';

import { getSession, Session } from '../auth/tokenStorage';

export default function IndexRoute() {
  const [session, setSession] = useState<Session | null | undefined>(undefined);

  useEffect(() => {
    void getSession().then(setSession);
  }, []);

  if (session === undefined) {
    return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc' }}><ActivityIndicator size="large" color="#2563eb" /></View>;
  }

  return <Redirect href={session ? '/home' : '/login'} />;
}
