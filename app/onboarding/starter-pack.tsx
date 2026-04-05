import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { ScreenContainer, Button } from '../../src/components';
import { Colors, FontSize, FontWeight, Spacing, Radius } from '../../src/constants';
import { useOnboardingBootstrap } from '../../src/features/auth';
import { getCachedJson, CacheKeys } from '../../src/lib/storage';
import * as Localization from 'expo-localization';

export default function StarterPack() {
  const router = useRouter();
  const bootstrap = useOnboardingBootstrap();
  const [error, setError] = useState<string | null>(null);

  const handleComplete = async () => {
    setError(null);

    // Gather cached onboarding selections
    const vibes = await getCachedJson<string[]>(CacheKeys.ONBOARDING_VIBES);
    const duration = await getCachedJson<string>(CacheKeys.ONBOARDING_DURATION);

    // Get device timezone
    const timezone = Localization.getCalendars()[0]?.timeZone ?? 'UTC';

    bootstrap.mutate(
      {
        timezone,
        preferredVibe: vibes?.[0] ?? 'adventure',
        preferredQuestDuration: duration ?? 'steady',
        starterPack: 'spark',
      },
      {
        onSuccess: () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          router.replace('/(tabs)/home');
        },
        onError: (err) => {
          setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
        },
      },
    );
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
            <PackItem text="3 daily quests tailored to your vibes" />
            <PackItem text="XP tracking from the start" />
            <PackItem text="Streak counter activated" />
          </View>
        </View>

        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
      </View>

      <View style={styles.footer}>
        <Button
          title="Let's Go!"
          onPress={handleComplete}
          loading={bootstrap.isPending}
        />
      </View>
    </ScreenContainer>
  );
}

function PackItem({ text }: { text: string }) {
  return (
    <View style={styles.packItemRow}>
      <Text style={styles.packCheck}>✓</Text>
      <Text style={styles.packItemText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, paddingTop: Spacing.xxl },
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
  packEmoji: { fontSize: 48, marginBottom: Spacing.md },
  packTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.lg,
  },
  packItems: { gap: Spacing.md, width: '100%' },
  packItemRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  packCheck: { color: Colors.success, fontSize: FontSize.lg, fontWeight: FontWeight.bold },
  packItemText: { fontSize: FontSize.md, color: Colors.textSecondary, lineHeight: 22, flex: 1 },
  errorBox: {
    marginTop: Spacing.lg,
    backgroundColor: Colors.error + '20',
    borderRadius: Radius.md,
    padding: Spacing.md,
  },
  errorText: { color: Colors.error, fontSize: FontSize.sm, textAlign: 'center' },
  footer: { paddingVertical: Spacing.md },
});
