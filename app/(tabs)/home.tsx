import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '../../src/components';
import { Colors, FontSize, FontWeight, Spacing, Radius } from '../../src/constants';
import { useHome } from '../../src/features/home';
import type { ApiAssignmentPayload } from '../../src/types/api';

const DIFFICULTY_COLORS = {
  easy: { bg: '#00D68F20', border: '#00D68F' },
  medium: { bg: '#FFAA0020', border: '#FFAA00' },
  hard: { bg: '#FF3D7120', border: '#FF3D71' },
} as const;

export default function HomeScreen() {
  const router = useRouter();
  const { data, isLoadingFresh, error, refetch, isRefetching } = useHome();

  const handleQuestPress = (assignment: ApiAssignmentPayload) => {
    router.push(`/quest/${assignment.id}`);
  };

  if (isLoadingFresh) {
    return (
      <ScreenContainer>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.brand} />
          <Text style={styles.loadingText}>Loading your quests...</Text>
        </View>
      </ScreenContainer>
    );
  }

  if (error && !data) {
    return (
      <ScreenContainer>
        <View style={styles.centered}>
          <Text style={styles.errorEmoji}>😵</Text>
          <Text style={styles.errorTitle}>Couldn't load quests</Text>
          <Text style={styles.errorMessage}>
            {error instanceof Error ? error.message : 'Something went wrong'}
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </ScreenContainer>
    );
  }

  const assignments = data?.assignments ?? [];
  const progress = data?.progress;

  return (
    <ScreenContainer>
      <FlatList
        data={assignments}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={Colors.brand}
          />
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.greeting}>Today's Quests</Text>
            <Text style={styles.date}>
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'short',
                day: 'numeric',
              })}
            </Text>
            {progress && (
              <View style={styles.streakBar}>
                <Text style={styles.streakText}>
                  Level {progress.level} · {progress.xp}/{progress.xpToNextLevel} XP
                </Text>
                {progress.streak > 0 && (
                  <Text style={styles.streakBadge}>🔥 {progress.streak} day streak</Text>
                )}
              </View>
            )}
          </View>
        }
        renderItem={({ item }) => (
          <AssignmentCard
            assignment={item}
            onPress={() => handleQuestPress(item)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🎯</Text>
            <Text style={styles.emptyText}>No quests for today yet.</Text>
            <Text style={styles.emptySubtext}>Pull down to refresh.</Text>
          </View>
        }
      />
    </ScreenContainer>
  );
}

function AssignmentCard({
  assignment,
  onPress,
}: {
  assignment: ApiAssignmentPayload;
  onPress: () => void;
}) {
  const quest = assignment.quest;
  if (!quest) return null;

  const isCompleted = assignment.status === 'completed';
  const isActive = assignment.status === 'active';
  const diffColors =
    DIFFICULTY_COLORS[quest.difficulty as keyof typeof DIFFICULTY_COLORS] ?? DIFFICULTY_COLORS.easy;

  return (
    <TouchableOpacity
      style={[styles.card, isCompleted && styles.cardCompleted]}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={isCompleted}
    >
      <View style={styles.cardHeader}>
        <View style={[styles.difficultyBadge, { backgroundColor: diffColors.bg, borderColor: diffColors.border }]}>
          <Text style={styles.difficultyText}>{quest.difficulty}</Text>
        </View>
        <View style={styles.cardMeta}>
          {isCompleted && <Text style={styles.completedBadge}>✓ Done</Text>}
          {isActive && <Text style={styles.activeBadge}>In Progress</Text>}
          <Text style={styles.xp}>+{quest.xpReward} XP</Text>
        </View>
      </View>
      <Text style={[styles.cardTitle, isCompleted && styles.cardTitleDone]}>
        {quest.title}
      </Text>
      <Text style={styles.cardDescription} numberOfLines={2}>
        {quest.description}
      </Text>
      <View style={styles.cardFooter}>
        <Text style={styles.timeEstimate}>~{quest.estimatedMinutes} min</Text>
        <Text style={styles.categoryTag}>{quest.category}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: Spacing.lg },
  loadingText: { color: Colors.textSecondary, marginTop: Spacing.md, fontSize: FontSize.md },
  errorEmoji: { fontSize: 48, marginBottom: Spacing.md },
  errorTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.textPrimary, marginBottom: Spacing.sm },
  errorMessage: { fontSize: FontSize.md, color: Colors.textSecondary, textAlign: 'center', marginBottom: Spacing.lg },
  retryButton: { backgroundColor: Colors.brand, borderRadius: Radius.md, paddingVertical: Spacing.sm, paddingHorizontal: Spacing.xl },
  retryText: { color: Colors.textPrimary, fontWeight: FontWeight.semibold, fontSize: FontSize.md },
  header: { paddingTop: Spacing.lg, paddingBottom: Spacing.md },
  greeting: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  date: { fontSize: FontSize.md, color: Colors.textSecondary, marginTop: Spacing.xs },
  streakBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.md,
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.md,
    padding: Spacing.md,
  },
  streakText: { fontSize: FontSize.sm, color: Colors.textSecondary },
  streakBadge: { fontSize: FontSize.sm, color: Colors.warning, fontWeight: FontWeight.semibold },
  list: { gap: Spacing.md, paddingBottom: Spacing.xl },
  card: { backgroundColor: Colors.bgCard, borderRadius: Radius.lg, padding: Spacing.lg },
  cardCompleted: { opacity: 0.6 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  difficultyBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.sm,
    borderWidth: 1,
  },
  difficultyText: { fontSize: FontSize.xs, color: Colors.textPrimary, fontWeight: FontWeight.medium, textTransform: 'capitalize' },
  xp: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.brand },
  completedBadge: { fontSize: FontSize.xs, color: Colors.success, fontWeight: FontWeight.semibold },
  activeBadge: { fontSize: FontSize.xs, color: Colors.warning, fontWeight: FontWeight.semibold },
  cardTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.semibold, color: Colors.textPrimary, marginBottom: Spacing.xs },
  cardTitleDone: { textDecorationLine: 'line-through', color: Colors.textMuted },
  cardDescription: { fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 20, marginBottom: Spacing.sm },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  timeEstimate: { fontSize: FontSize.xs, color: Colors.textMuted },
  categoryTag: { fontSize: FontSize.xs, color: Colors.brandLight, textTransform: 'capitalize' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: Spacing.xxl },
  emptyEmoji: { fontSize: 48, marginBottom: Spacing.md },
  emptyText: { fontSize: FontSize.lg, color: Colors.textSecondary, fontWeight: FontWeight.medium },
  emptySubtext: { fontSize: FontSize.sm, color: Colors.textMuted, marginTop: Spacing.xs },
});
