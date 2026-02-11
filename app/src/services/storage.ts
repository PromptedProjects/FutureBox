import * as SecureStore from 'expo-secure-store';

const KEYS = {
  TOKEN: 'fb_session_token',
  HOST: 'fb_host',
} as const;

export async function saveToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(KEYS.TOKEN, token);
}

export async function getToken(): Promise<string | null> {
  return SecureStore.getItemAsync(KEYS.TOKEN);
}

export async function saveHost(host: string): Promise<void> {
  await SecureStore.setItemAsync(KEYS.HOST, host);
}

export async function getHost(): Promise<string | null> {
  return SecureStore.getItemAsync(KEYS.HOST);
}

export async function clearAll(): Promise<void> {
  await Promise.all([
    SecureStore.deleteItemAsync(KEYS.TOKEN),
    SecureStore.deleteItemAsync(KEYS.HOST),
  ]);
}
