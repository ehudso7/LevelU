import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { ScreenContainer, Button } from '../../src/components';
import { Colors, FontSize, FontWeight, Spacing, Radius } from '../../src/constants';
import { setOnboardingComplete } from '../../src/lib/storage';
import { useAuthStore } from '../../src/features/auth';

export default function StarterPack() {
  const router = useRouter();
  const { setIsOnboarded } = useAuthStore();

  const handleComplete = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Mark onboarding as complete
    await setOnboardingComplete();
    setIsOnboarded(true);

    // Navigate to home — replace stack so user can't go back to onboarding
    router.replace('/(tabs)/home');
  };

  return (
    <ScreenContainer>
      <View style={styles.content}>
        <Text style={styles.title}>Your Starter Pack</Text>
        <Text style={styles.subtitle}>
          Here's what you're getting to kick things off.
        </Text>

        <View style={styles.packCard}>
          <Text style={styles.packEmoji}>🎒</Text>
          <Text style={styles.packTitle}>Day 1 Kit</Text>
          <View style={styles.packItems}>
            <Text style={styles.packItem}>3 daily quests tailored to your vibes</Text>
            <Text style={styles.packItem}>XP tracking from the start</Text>
            <Text style={styles.packItem}>Streak counter activated</Text>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <Button title="Let's Go!" onPress={handleComplete} />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingTop: Spacing.xxl,
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    marginBottom: Spacing.xl,
    lineHeight: 22,
  },
  packCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
  },
  packEmoji: {
    fontSize: 48,
    marginBottom: Spacing.md,
  },
  packTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.lg,
  },
  packItems: {
    gap: Spacing.md,
    width: '100%',
  },
  packItem: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    lineHeight: 22,
    paddingLeft: Spacing.md,
  },
  footer: {
    paddingVertical: Spacing.md,
  },
});
