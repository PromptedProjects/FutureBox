// Notifications are not supported in Expo Go (SDK 53+).
// These are no-op stubs. Replace with real implementation in a dev build.

export async function requestNotificationPermissions(): Promise<boolean> {
  return false;
}

export async function sendLocalNotification(
  _title: string,
  _body: string,
  _data?: Record<string, unknown>,
) {
  // no-op in Expo Go
}

export function addNotificationResponseListener(
  _handler: (response: unknown) => void,
) {
  return { remove: () => {} };
}
