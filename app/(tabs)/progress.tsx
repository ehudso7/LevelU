import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, RefreshControl } from 'react-native';
import { ScreenContainer } from '../../src/components';
import { Colors, FontSize, FontWeight, Spacing, Radius } from '../../src/constants';
import { useProgress } from '../../src/features/progress';

export default function ProgressScreen() {
  const { progress, archetypes, isLoading, refetch } = useProgress();

  if (isLoading) {
    return (
      <ScreenContainer>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.brand} />
        </View>
      </ScreenContainer>
    );
  }

  const level = progress?.level ?? 1;
  const xp = progress?.xp ?? 0;
  const xpToNext = progress?.xpToNextLevel ?? 200;
  const xpPercent = xpToNext > 0 ? Math.min((xp / xpToNext) * 100, 100) : 0;

  return (
    <ScreenContainer>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={false} onRefresh={refetch} tintColor={Colors.brand} />
        }
      >
        <View style={styles.header}>
          <Text style={styles.title}>Your Progress</Text>
        </View>

        <View style={styles.levelCard}>
          <Text style={styles.levelLabel}>Level</Text>
          <Text style={styles.levelNumber}>{level}</Text>
          <View style={styles.xpBarOuter}>
            <View style={[styles.xpBarInner, { width: `${xpPercent}%` }]} />
          </View>
          <Text style={styles.xpText}>
            {xp} / {xpToNext} XP
          </Text>
        </View>

        <View style={styles.statsRow}>
          <StatCard label="Streak" value={`${progress?.streak ?? 0}`} emoji="🔥" />
          <StatCard label="Completed" value={`${progress?.totalCompleted ?? 0}`} emoji="✓" />
          <StatCard label="This Week" value={`${progress?.weeklyCompleted ?? 0}`} emoji="📅" />
        </View>

        {progress?.longestStreak !== undefined && progress.longestStreak > 0 && (
          <View style={styles.longestStreak}>
            <Text style={styles.longestStreakLabel}>Longest Streak</Text>
            <Text style={styles.longestStreakValue}>{progress.longestStreak} days</Text>
          </View>
        )}

        {archetypes.length > 0 && (
          <View style={styles.archetypeSection}>
            <Text style={styles.sectionTitle}>Your Archetypes</Text>
            {archetypes.map((a, i) => (
              <View key={a.archetypeId} style={styles.archetypeRow}>
                <Text style={styles.archetypeEmoji}>{a.emoji}</Text>
                <View style={styles.archetypeInfo}>
                  <Text style={styles.archetypeName}>
                    {a.name}
                    {i === 0 && <Text style={styles.primaryBadge}> (Primary)</Text>}
                  </Text>
                  <Text style={styles.archetypeStat}>
                    {a.questCount} quests · {a.score} XP
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

function StatCard({ label, value, emoji }: { label: string; value: string; emoji: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statEmoji}>{emoji}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { paddingBottom: Spacing.xxl },
  header: { paddingTop: Spacing.lg, paddingBottom: Spacing.lg },
  title: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  levelCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  levelLabel: { fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: Spacing.xs },
  levelNumber: { fontSize: 64, fontWeight: FontWeight.bold, color: Colors.brand, marginBottom: Spacing.md },
  xpBarOuter: {
    width: '100%',
    height: 8,
    backgroundColor: Colors.bgElevated,
    borderRadius: Radius.full,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  xpBarInner: { height: '100%', backgroundColor: Colors.brand, borderRadius: Radius.full },
  xpText: { fontSize: FontSize.sm, color: Colors.textSecondary },
  statsRow: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.lg },
  statCard: {
    flex: 1,
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.md,
    padding: Spacing.lg,
    alignItems: 'center',
  },
  statEmoji: { fontSize: 20, marginBottom: Spacing.xs },
  statValue: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.textPrimary, marginBottom: Spacing.xs },
  statLabel: { fontSize: FontSize.xs, color: Colors.textSecondary },
  longestStreak: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.md,
    padding: Spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  longestStreakLabel: { fontSize: FontSize.md, color: Colors.textSecondary },
  longestStreakValue: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.warning },
  archetypeSection: { marginTop: Spacing.sm },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  archetypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    gap: Spacing.md,
  },
  archetypeEmoji: { fontSize: 28 },
  archetypeInfo: { flex: 1 },
  archetypeName: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.textPrimary },
  primaryBadge: { color: Colors.brand, fontWeight: FontWeight.medium },
  archetypeStat: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
});
