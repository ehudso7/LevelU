import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '../../src/components';
import { Colors, FontSize, FontWeight, Spacing, Radius } from '../../src/constants';
import type { DailyAssignment, Quest, QuestDifficulty } from '../../src/types';

// Temporary placeholder assignments — will be replaced by Supabase query
const PLACEHOLDER_ASSIGNMENTS: (DailyAssignment & { quest: Quest })[] = [
  {
    id: '1',
    userId: '',
    questId: 'q1',
    assignedDate: new Date().toISOString().split('T')[0],
    slotNumber: 1,
    assignmentType: 'daily',
    status: 'pending',
    startedAt: null,
    completedAt: null,
    expiresAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    quest: {
      id: 'q1',
      title: 'Take a 10-minute walk',
      description: 'Get outside and walk for at least 10 minutes. Fresh air does wonders.',
      category: 'spark',
      difficulty: 'easy',
      xpReward: 30,
      estimatedMinutes: 10,
      proofType: 'photo',
      proofPrompt: 'Snap something interesting you saw on your walk.',
      archetypeId: null,
      tags: ['fitness', 'mindfulness'],
      firstWeekOk: true,
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  },
  {
    id: '2',
    userId: '',
    questId: 'q2',
    assignedDate: new Date().toISOString().split('T')[0],
    slotNumber: 2,
    assignmentType: 'daily',
    status: 'pending',
    startedAt: null,
    completedAt: null,
    expiresAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    quest: {
      id: 'q2',
      title: 'Read for 15 minutes',
      description: 'Pick up a book — physical or digital — and read for at least 15 uninterrupted minutes.',
      category: 'momentum',
      difficulty: 'easy',
      xpReward: 40,
      estimatedMinutes: 15,
      proofType: 'photo',
      proofPrompt: 'Show what you\'re reading.',
      archetypeId: null,
      tags: ['learning', 'reading'],
      firstWeekOk: true,
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  },
  {
    id: '3',
    userId: '',
    questId: 'q3',
    assignedDate: new Date().toISOString().split('T')[0],
    slotNumber: 3,
    assignmentType: 'daily',
    status: 'pending',
    startedAt: null,
    completedAt: null,
    expiresAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    quest: {
      id: 'q3',
      title: 'Send a genuine compliment',
      description: 'Text, call, or tell someone in person something you appreciate about them.',
      category: 'social',
      difficulty: 'medium',
      xpReward: 55,
      estimatedMinutes: 5,
      proofType: 'text_note',
      proofPrompt: null,
      archetypeId: null,
      tags: ['kindness', 'connection'],
      firstWeekOk: true,
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  },
];

export default function HomeScreen() {
  const router = useRouter();

  const handleQuestPress = (assignment: DailyAssignment & { quest: Quest }) => {
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
              <View style={[styles.difficultyBadge, difficultyColor(item.quest.difficulty)]}>
                <Text style={styles.difficultyText}>{item.quest.difficulty}</Text>
              </View>
              <Text style={styles.xp}>+{item.quest.xpReward} XP</Text>
            </View>
            <Text style={styles.cardTitle}>{item.quest.title}</Text>
            <Text style={styles.cardDescription} numberOfLines={2}>
              {item.quest.description}
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

function difficultyColor(difficulty: QuestDifficulty) {
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
