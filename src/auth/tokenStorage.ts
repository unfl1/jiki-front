import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const SESSION_KEY = 'jiki.session';

export type Session = {
  token: string;
  nickname: string;
};

async function readItem(key: string): Promise<string | null> {
  if (Platform.OS === 'web') {
    return typeof window === 'undefined' ? null : window.localStorage.getItem(key);
  }

  return SecureStore.getItemAsync(key);
}

async function writeItem(key: string, value: string): Promise<void> {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(key, value);
    }
    return;
  }

  await SecureStore.setItemAsync(key, value);
}

async function removeItem(key: string): Promise<void> {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(key);
    }
    return;
  }

  await SecureStore.deleteItemAsync(key);
}

export async function getSession(): Promise<Session | null> {
  const rawSession = await readItem(SESSION_KEY);

  if (!rawSession) {
    return null;
  }

  try {
    return JSON.parse(rawSession) as Session;
  } catch {
    await removeItem(SESSION_KEY);
    return null;
  }
}

export async function saveSession(session: Session): Promise<void> {
  await writeItem(SESSION_KEY, JSON.stringify(session));
}

export async function clearSession(): Promise<void> {
  await removeItem(SESSION_KEY);
}
