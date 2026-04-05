import * as Sentry from '@sentry/react-native';
import { env } from '../env';

export function initSentry(): void {
  if (!env.EXPO_PUBLIC_SENTRY_DSN) {
    console.log('[LEVEL] Sentry DSN not set — skipping initialization');
    return;
  }

  Sentry.init({
    dsn: env.EXPO_PUBLIC_SENTRY_DSN,
    tracesSampleRate: __DEV__ ? 1.0 : 0.2,
    debug: __DEV__,
    enabled: !__DEV__,
  });
}
