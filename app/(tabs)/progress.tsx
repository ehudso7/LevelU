import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ScreenContainer } from '../../src/components';
import { Colors, FontSize, FontWeight, Spacing, Radius } from '../../src/constants';
import type { ProgressSnapshot } from '../../src/types';

// Temporary placeholder — will be replaced by Supabase query
const PLACEHOLDER_PROGRESS: ProgressSnapshot = {
  userId: 'placeholder',
  level: 1,
  xp: 0,
  xpToNextLevel: 200,
  streak: 0,
  totalCompleted: 0,
  weeklyCompleted: 0,
};

export default function ProgressScreen() {
  const progress = PLACEHOLDER_PROGRESS;

  const xpPercent = progress.xpToNextLevel > 0
    ? (progress.xp / progress.xpToNextLevel) * 100
    : 0;

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text style={styles.title}>Your Progress</Text>
      </View>

      <View style={styles.levelCard}>
        <Text style={styles.levelLabel}>Level</Text>
        <Text style={styles.levelNumber}>{progress.level}</Text>
        <View style={styles.xpBarOuter}>
          <View style={[styles.xpBarInner, { width: `${xpPercent}%` }]} />
        </View>
        <Text style={styles.xpText}>
          {progress.xp} / {progress.xpToNextLevel} XP
        </Text>
      </View>

      <View style={styles.statsRow}>
        <StatCard label="Streak" value={`${progress.streak} days`} />
        <StatCard label="Completed" value={`${progress.totalCompleted}`} />
        <StatCard label="This Week" value={`${progress.weeklyCompleted}`} />
      </View>
    </ScreenContainer>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  levelCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  levelLabel: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  levelNumber: {
    fontSize: 64,
    fontWeight: FontWeight.bold,
    color: Colors.brand,
    marginBottom: Spacing.md,
  },
  xpBarOuter: {
    width: '100%',
    height: 8,
    backgroundColor: Colors.bgElevated,
    borderRadius: Radius.full,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  xpBarInner: {
    height: '100%',
    backgroundColor: Colors.brand,
    borderRadius: Radius.full,
  },
  xpText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.md,
    padding: Spacing.lg,
    alignItems: 'center',
  },
  statValue: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  statLabel: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
});
