import { router } from 'expo-router';

/** Goes back when possible; otherwise lands on Home (e.g. after a deep link or web refresh). */
export function goBackOrHome() {
  if (router.canGoBack()) router.back();
  else router.replace('/(tabs)/index');
}
