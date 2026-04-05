import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScreenContainer, Button } from '../../src/components';
import { Colors, FontSize, FontWeight, Spacing, Radius } from '../../src/constants';

export default function QuestDetail() {
  const { assignmentId } = useLocalSearchParams<{ assignmentId: string }>();
  const router = useRouter();

  // TODO: Fetch assignment from Supabase using assignmentId
  // Placeholder until backend is wired
  const assignment = {
    id: assignmentId,
    title: 'Take a 10-minute walk',
    description:
      'Get outside and walk for at least 10 minutes. Fresh air does wonders. Take a photo of something interesting you see along the way.',
    category: 'fitness',
    difficulty: 'easy' as const,
    xpReward: 50,
    timeEstimate: '10 min',
  };

  const handleStartQuest = () => {
    router.push(`/quest/${assignmentId}-active`);
  };

  return (
    <ScreenContainer>
      <View style={styles.content}>
        <TouchableBack onPress={() => router.back()} />

        <View style={styles.hero}>
          <Text style={styles.category}>{assignment.category.toUpperCase()}</Text>
          <Text style={styles.title}>{assignment.title}</Text>
          <Text style={styles.description}>{assignment.description}</Text>
        </View>

        <View style={styles.metaRow}>
          <MetaItem label="Difficulty" value={assignment.difficulty} />
          <MetaItem label="XP Reward" value={`+${assignment.xpReward}`} />
          <MetaItem label="Time" value={assignment.timeEstimate} />
        </View>
      </View>

      <View style={styles.footer}>
        <Button title="Start Quest" onPress={handleStartQuest} />
        <Button title="Back" variant="ghost" onPress={() => router.back()} />
      </View>
    </ScreenContainer>
  );
}

function TouchableBack({ onPress }: { onPress: () => void }) {
  const { TouchableOpacity, Text } = require('react-native');
  return (
    <TouchableOpacity onPress={onPress} style={{ paddingVertical: Spacing.md }}>
      <Text style={{ color: Colors.brandLight, fontSize: FontSize.md }}>← Back</Text>
    </TouchableOpacity>
  );
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={metaStyles.item}>
      <Text style={metaStyles.value}>{value}</Text>
      <Text style={metaStyles.label}>{label}</Text>
    </View>
  );
}

const metaStyles = StyleSheet.create({
  item: {
    flex: 1,
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.md,
    padding: Spacing.md,
    alignItems: 'center',
  },
  value: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
    textTransform: 'capitalize',
  },
  label: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
});

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingTop: Spacing.md,
  },
  hero: {
    paddingVertical: Spacing.lg,
  },
  category: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: Colors.brand,
    letterSpacing: 2,
    marginBottom: Spacing.sm,
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  description: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    lineHeight: 24,
  },
  metaRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  footer: {
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
  },
});
