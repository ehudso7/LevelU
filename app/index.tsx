import { useEffect } from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuthStore } from '../src/features/auth';
import { Colors } from '../src/constants';

/**
 * Root index — routes users based on auth + onboarding state.
 *
 * - Loading → spinner
 * - No session & not onboarded → onboarding/intro
 * - Session exists but not onboarded → onboarding/intro
 * - Onboarded → (tabs)/home
 */
export default function Index() {
  const { session, isLoading, isOnboarded } = useAuthStore();

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={Colors.brand} />
      </View>
    );
  }

  if (!isOnboarded) {
    return <Redirect href="/onboarding/intro" />;
  }

  return <Redirect href="/(tabs)/home" />;
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.bg,
  },
});
