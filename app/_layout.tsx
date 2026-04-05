import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PostHogProvider } from 'posthog-react-native';
import { queryClient } from '../src/lib/query';
import { initSentry } from '../src/lib/sentry';
import { getPostHogConfig } from '../src/lib/posthog';
import { supabase } from '../src/lib/supabase';
import { useAuthStore } from '../src/features/auth';
import { isOnboardingComplete } from '../src/lib/storage';
import { Colors } from '../src/constants';

// Initialize Sentry as early as possible
initSentry();

function AuthBootstrap({ children }: { children: React.ReactNode }) {
  const { setSession, setIsLoading, setIsOnboarded } = useAuthStore();

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Check onboarding state
    isOnboardingComplete().then((complete) => {
      setIsOnboarded(complete);
      setIsLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, [setSession, setIsLoading, setIsOnboarded]);

  return <>{children}</>;
}

export default function RootLayout() {
  const postHogConfig = getPostHogConfig();

  const content = (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <AuthBootstrap>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: Colors.bg },
              animation: 'slide_from_right',
            }}
          />
          <StatusBar style="light" />
        </AuthBootstrap>
      </QueryClientProvider>
    </SafeAreaProvider>
  );

  // Wrap in PostHog if configured
  if (postHogConfig) {
    return (
      <PostHogProvider
        apiKey={postHogConfig.apiKey}
        options={{ host: postHogConfig.host }}
      >
        {content}
      </PostHogProvider>
    );
  }

  return content;
}
