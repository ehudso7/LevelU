import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { ScreenContainer, Button } from '../../src/components';
import { Colors, FontSize, FontWeight, Spacing, Radius } from '../../src/constants';
import type { QuestCompleteResponse } from '../../src/types/api';

export default function RewardReveal() {
  const { assignmentId: rawId, reward: rewardParam } = useLocalSearchParams<{
    assignmentId: string;
    reward?: string;
  }>();
  const router = useRouter();

  // Parse reward data from navigation params
  let rewardData: QuestCompleteResponse | null = null;
  try {
    if (rewardParam) {
      rewardData = JSON.parse(rewardParam);
    }
  } catch {
    // Invalid JSON — will show fallback
  }

  const reward = rewardData?.reward;
  const progress = rewardData?.progress;

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const xpSlideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 80,
          friction: 8,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(xpSlideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Extra haptic for level up
    if (reward?.levelUp) {
      setTimeout(() => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }, 600);
    }
  }, []);

  const handleDone = () => {
    router.replace('/(tabs)/home');
  };

  if (!reward) {
    return (
      <ScreenContainer>
        <View style={styles.content}>
          <View style={styles.celebration}>
            <Text style={styles.emoji}>🎉</Text>
            <Text style={styles.title}>Quest Complete!</Text>
            <Text style={styles.message}>Great job!</Text>
          </View>
        </View>
        <View style={styles.footer}>
          <Button title="Back to Quests" onPress={handleDone} />
        </View>
      </ScreenContainer>
    );
  }

  const xp = reward.xpBreakdown;

  return (
    <ScreenContainer>
      <View style={styles.content}>
        <Animated.View
          style={[
            styles.celebration,
            { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
          ]}
        >
          <Text style={styles.emoji}>{reward.levelUp ? '🚀' : '🎉'}</Text>
          <Text style={styles.title}>
            {reward.levelUp ? 'LEVEL UP!' : 'Quest Complete!'}
          </Text>
          <Text style={styles.questTitle}>{reward.questTitle}</Text>
          <Text style={styles.message}>{reward.message}</Text>
        </Animated.View>

        <Animated.View
          style={[
            styles.rewardCard,
            { opacity: fadeAnim, transform: [{ translateY: xpSlideAnim }] },
          ]}
        >
          <RewardRow label="Base XP" value={`+${xp.base}`} />
          {xp.qualityBonus > 0 && (
            <RewardRow label="Quality Bonus" value={`+${xp.qualityBonus}`} highlight />
          )}
          {xp.streakBonus > 0 && (
            <RewardRow label="Streak Bonus" value={`+${xp.streakBonus}`} highlight />
          )}
          {xp.firstQuestBonus > 0 && (
            <RewardRow label="First of Day" value={`+${xp.firstQuestBonus}`} highlight />
          )}
          {xp.dailyClearBonus > 0 && (
            <RewardRow label="Daily Clear!" value={`+${xp.dailyClearBonus}`} highlight />
          )}
          <View style={styles.divider} />
          <RewardRow label="Total XP" value={`+${xp.total}`} bold />

          {reward.levelUp && reward.newLevel && (
            <View style={styles.levelUpBanner}>
              <Text style={styles.levelUpText}>
                Now Level {reward.newLevel}
              </Text>
            </View>
          )}
        </Animated.View>

        {progress && (
          <View style={styles.progressSnap}>
            <Text style={styles.progressLabel}>
              Level {progress.level} · {progress.xp}/{progress.xpToNextLevel} XP · 🔥 {progress.streak}
            </Text>
          </View>
        )}
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
      <Text style={[rowStyles.label, bold && rowStyles.boldLabel]}>{label}</Text>
      <Text style={[rowStyles.value, highlight && rowStyles.highlight, bold && rowStyles.boldValue]}>
        {value}
      </Text>
    </View>
  );
}

const rowStyles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: Spacing.sm },
  label: { fontSize: FontSize.md, color: Colors.textSecondary },
  value: { fontSize: FontSize.md, color: Colors.textPrimary, fontWeight: FontWeight.semibold },
  highlight: { color: Colors.success },
  boldLabel: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  boldValue: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.brand },
});

const styles = StyleSheet.create({
  content: { flex: 1, justifyContent: 'center' },
  celebration: { alignItems: 'center', marginBottom: Spacing.xl },
  emoji: { fontSize: 72, marginBottom: Spacing.md },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  questTitle: {
    fontSize: FontSize.md,
    color: Colors.brandLight,
    fontWeight: FontWeight.medium,
    marginBottom: Spacing.sm,
  },
  message: { fontSize: FontSize.md, color: Colors.textSecondary, textAlign: 'center' },
  rewardCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    padding: Spacing.xl,
  },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: Spacing.sm },
  levelUpBanner: {
    marginTop: Spacing.md,
    backgroundColor: Colors.brand + '20',
    borderRadius: Radius.md,
    padding: Spacing.md,
    alignItems: 'center',
  },
  levelUpText: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.brand },
  progressSnap: {
    marginTop: Spacing.lg,
    alignItems: 'center',
  },
  progressLabel: { fontSize: FontSize.sm, color: Colors.textMuted },
  footer: { paddingVertical: Spacing.md },
});
