import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { ScreenContainer, Button } from '../../src/components';
import { Colors, FontSize, FontWeight, Spacing, Radius } from '../../src/constants';
import type { Reward } from '../../src/types';

// Temporary placeholder — will be replaced by backend response after quest completion
const PLACEHOLDER_REWARD: Reward = {
  id: 'r1',
  assignmentId: '',
  xpEarned: 50,
  streakBonus: 10,
  levelUp: false,
  newLevel: null,
  message: 'Great job! Keep the momentum going.',
};

export default function RewardReveal() {
  const { assignmentId } = useLocalSearchParams<{ assignmentId: string }>();
  const router = useRouter();

  // TODO: Fetch actual reward from Supabase based on completed assignment
  const reward = { ...PLACEHOLDER_REWARD, assignmentId: assignmentId ?? '' };

  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, []);

  const handleDone = () => {
    router.replace('/(tabs)/home');
  };

  const totalXp = reward.xpEarned + reward.streakBonus;

  return (
    <ScreenContainer>
      <View style={styles.content}>
        <View style={styles.celebration}>
          <Text style={styles.emoji}>🎉</Text>
          <Text style={styles.title}>Quest Complete!</Text>
          <Text style={styles.message}>{reward.message}</Text>
        </View>

        <View style={styles.rewardCard}>
          <RewardRow label="XP Earned" value={`+${reward.xpEarned}`} />
          {reward.streakBonus > 0 && (
            <RewardRow label="Streak Bonus" value={`+${reward.streakBonus}`} highlight />
          )}
          <View style={styles.divider} />
          <RewardRow label="Total XP" value={`+${totalXp}`} bold />
          {reward.levelUp && reward.newLevel && (
            <View style={styles.levelUp}>
              <Text style={styles.levelUpText}>
                LEVEL UP! You're now Level {reward.newLevel}
              </Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.footer}>
        <Button title="Back to Quests" onPress={handleDone} />
      </View>
    </ScreenContainer>
  );
}

function RewardRow({
  label,
  value,
  highlight = false,
  bold = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  bold?: boolean;
}) {
  return (
    <View style={rowStyles.row}>
      <Text style={[rowStyles.label, bold && rowStyles.bold]}>{label}</Text>
      <Text
        style={[
          rowStyles.value,
          highlight && rowStyles.highlight,
          bold && rowStyles.bold,
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

const rowStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
  },
  label: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
  },
  value: {
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    fontWeight: FontWeight.semibold,
  },
  highlight: {
    color: Colors.success,
  },
  bold: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
});

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  celebration: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  emoji: {
    fontSize: 64,
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  message: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  rewardCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    padding: Spacing.xl,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.sm,
  },
  levelUp: {
    marginTop: Spacing.md,
    backgroundColor: Colors.brand + '20',
    borderRadius: Radius.md,
    padding: Spacing.md,
    alignItems: 'center',
  },
  levelUpText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.brand,
  },
  footer: {
    paddingVertical: Spacing.md,
  },
});
