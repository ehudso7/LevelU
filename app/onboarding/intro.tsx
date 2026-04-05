import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer, Button } from '../../src/components';
import { Colors, FontSize, FontWeight, Spacing } from '../../src/constants';
import { supabase } from '../../src/lib/supabase';
import { useAuthStore } from '../../src/features/auth';

export default function OnboardingIntro() {
  const router = useRouter();
  const { session } = useAuthStore();

  const handleGetStarted = async () => {
    // Create anonymous session if none exists
    if (!session) {
      const { error } = await supabase.auth.signInAnonymously();
      if (error) {
        console.error('[LEVEL] Anonymous sign-in failed:', error.message);
        // Continue anyway — onboarding can proceed; auth will retry
      }
    }
    router.push('/onboarding/vibe');
  };

  return (
    <ScreenContainer>
      <View style={styles.content}>
        <View style={styles.hero}>
          <Text style={styles.title}>LEVEL</Text>
          <Text style={styles.subtitle}>Your real-life game begins now.</Text>
          <Text style={styles.description}>
            Complete daily quests, prove it with a photo, and level up your life — one day at a time.
          </Text>
        </View>

        <View style={styles.actions}>
          <Button title="Get Started" onPress={handleGetStarted} />
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: Spacing.xxl,
  },
  hero: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: FontSize.hero,
    fontWeight: FontWeight.bold,
    color: Colors.brand,
    letterSpacing: 6,
    marginBottom: Spacing.md,
  },
  subtitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  description: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: Spacing.lg,
  },
  actions: {
    gap: Spacing.md,
  },
});
