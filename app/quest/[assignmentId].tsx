import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScreenContainer, Button } from '../../src/components';
import { Colors, FontSize, FontWeight, Spacing, Radius } from '../../src/constants';
import { useHome } from '../../src/features/home';
import { useQuestStart } from '../../src/features/quests';

export default function QuestDetail() {
  const { assignmentId } = useLocalSearchParams<{ assignmentId: string }>();
  const router = useRouter();
  const { data: homeData } = useHome();
  const questStart = useQuestStart();

  // Find this assignment from the home payload
  const assignment = homeData?.assignments.find((a) => a.id === assignmentId);
  const quest = assignment?.quest;

  if (!assignment || !quest) {
    return (
      <ScreenContainer>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.brand} />
          <Text style={styles.loadingText}>Loading quest...</Text>
        </View>
      </ScreenContainer>
    );
  }

  const isAlreadyActive = assignment.status === 'active';
  const isCompleted = assignment.status === 'completed';

  const handleStartQuest = () => {
    if (isAlreadyActive) {
      // Already started — go directly to active screen
      router.push(`/quest/${assignmentId}-active`);
      return;
    }

    questStart.mutate(assignmentId!, {
      onSuccess: () => {
        router.push(`/quest/${assignmentId}-active`);
      },
    });
  };

  return (
    <ScreenContainer>
      <View style={styles.content}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <View style={styles.hero}>
          <Text style={styles.category}>{quest.category.toUpperCase()}</Text>
          <Text style={styles.title}>{quest.title}</Text>
          <Text style={styles.description}>{quest.description}</Text>
        </View>

        {quest.proofPrompt && (
          <View style={styles.proofHint}>
            <Text style={styles.proofHintLabel}>Proof Hint</Text>
            <Text style={styles.proofHintText}>{quest.proofPrompt}</Text>
          </View>
        )}

        <View style={styles.metaRow}>
          <MetaItem label="Difficulty" value={quest.difficulty} />
          <MetaItem label="XP Reward" value={`+${quest.xpReward}`} />
          <MetaItem label="Time" value={`~${quest.estimatedMinutes}m`} />
        </View>

        {questStart.error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>
              {questStart.error instanceof Error ? questStart.error.message : 'Failed to start quest'}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.footer}>
        {isCompleted ? (
          <Button title="Quest Completed" variant="secondary" onPress={() => router.back()} disabled />
        ) : (
          <>
            <Button
              title={isAlreadyActive ? 'Continue Quest' : 'Start Quest'}
              onPress={handleStartQuest}
              loading={questStart.isPending}
            />
            <Button title="Back" variant="ghost" onPress={() => router.back()} />
          </>
        )}
      </View>
    </ScreenContainer>
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
  label: { fontSize: FontSize.xs, color: Colors.textSecondary },
});

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: Colors.textSecondary, marginTop: Spacing.md },
  content: { flex: 1, paddingTop: Spacing.md },
  backButton: { paddingVertical: Spacing.md },
  backText: { color: Colors.brandLight, fontSize: FontSize.md },
  hero: { paddingVertical: Spacing.lg },
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
  description: { fontSize: FontSize.md, color: Colors.textSecondary, lineHeight: 24 },
  proofHint: {
    backgroundColor: Colors.bgElevated,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    borderLeftWidth: 3,
    borderLeftColor: Colors.brand,
  },
  proofHintLabel: { fontSize: FontSize.xs, color: Colors.brandLight, fontWeight: FontWeight.semibold, marginBottom: Spacing.xs },
  proofHintText: { fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 20 },
  metaRow: { flexDirection: 'row', gap: Spacing.md },
  errorBox: {
    marginTop: Spacing.lg,
    backgroundColor: Colors.error + '20',
    borderRadius: Radius.md,
    padding: Spacing.md,
  },
  errorText: { color: Colors.error, fontSize: FontSize.sm, textAlign: 'center' },
  footer: { gap: Spacing.sm, paddingVertical: Spacing.md },
});
