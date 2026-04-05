import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '../../src/components';
import { Colors, FontSize, FontWeight, Spacing, Radius } from '../../src/constants';
import type { Assignment } from '../../src/types';

// Temporary placeholder assignments — will be replaced by Supabase query
const PLACEHOLDER_ASSIGNMENTS: Assignment[] = [
  {
    id: '1',
    questId: 'q1',
    title: 'Take a 10-minute walk',
    description: 'Get outside and walk for at least 10 minutes. Fresh air does wonders.',
    category: 'fitness',
    difficulty: 'easy',
    xpReward: 50,
    dueDate: new Date().toISOString(),
    status: 'pending',
  },
  {
    id: '2',
    questId: 'q2',
    title: 'Read 5 pages of a book',
    description: 'Pick up any book and read at least 5 pages. Physical or digital.',
    category: 'learning',
    difficulty: 'easy',
    xpReward: 40,
    dueDate: new Date().toISOString(),
    status: 'pending',
  },
  {
    id: '3',
    questId: 'q3',
    title: 'Send a genuine compliment',
    description: 'Text, call, or tell someone in person something you appreciate about them.',
    category: 'social',
    difficulty: 'medium',
    xpReward: 75,
    dueDate: new Date().toISOString(),
    status: 'pending',
  },
];

export default function HomeScreen() {
  const router = useRouter();

  const handleQuestPress = (assignment: Assignment) => {
    router.push(`/quest/${assignment.id}`);
  };

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text style={styles.greeting}>Today's Quests</Text>
        <Text style={styles.date}>
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'short',
            day: 'numeric',
          })}
        </Text>
      </View>

      <FlatList
        data={PLACEHOLDER_ASSIGNMENTS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => handleQuestPress(item)}
            activeOpacity={0.7}
          >
            <View style={styles.cardHeader}>
              <View style={[styles.difficultyBadge, difficultyColor(item.difficulty)]}>
                <Text style={styles.difficultyText}>{item.difficulty}</Text>
              </View>
              <Text style={styles.xp}>+{item.xpReward} XP</Text>
            </View>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardDescription} numberOfLines={2}>
              {item.description}
            </Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No quests for today yet.</Text>
          </View>
        }
      />
    </ScreenContainer>
  );
}

function difficultyColor(difficulty: Assignment['difficulty']) {
  switch (difficulty) {
    case 'easy':
      return { backgroundColor: '#00D68F20', borderColor: Colors.success };
    case 'medium':
      return { backgroundColor: '#FFAA0020', borderColor: Colors.warning };
    case 'hard':
      return { backgroundColor: '#FF3D7120', borderColor: Colors.error };
  }
}

const styles = StyleSheet.create({
  header: {
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  greeting: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  date: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  list: {
    gap: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  card: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  difficultyBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.sm,
    borderWidth: 1,
  },
  difficultyText: {
    fontSize: FontSize.xs,
    color: Colors.textPrimary,
    fontWeight: FontWeight.medium,
    textTransform: 'capitalize',
  },
  xp: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.brand,
  },
  cardTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  cardDescription: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: Spacing.xxl,
  },
  emptyText: {
    fontSize: FontSize.md,
    color: Colors.textMuted,
  },
});
