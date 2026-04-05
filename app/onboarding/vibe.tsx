import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { ScreenContainer, Button } from '../../src/components';
import { Colors, FontSize, FontWeight, Spacing, Radius } from '../../src/constants';
import type { VibeCategory } from '../../src/types';

// Temporary placeholder data — will be replaced by backend-driven categories
const VIBE_OPTIONS: VibeCategory[] = [
  { id: 'fitness', label: 'Fitness', emoji: '💪', description: 'Move your body daily' },
  { id: 'mindfulness', label: 'Mindfulness', emoji: '🧘', description: 'Calm your mind' },
  { id: 'social', label: 'Social', emoji: '🤝', description: 'Connect with people' },
  { id: 'creativity', label: 'Creativity', emoji: '🎨', description: 'Make something new' },
  { id: 'learning', label: 'Learning', emoji: '📚', description: 'Expand your knowledge' },
  { id: 'adventure', label: 'Adventure', emoji: '🗺️', description: 'Explore the unknown' },
];

export default function VibeSelection() {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggleVibe = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleNext = () => {
    // TODO: Persist selected vibes to user profile via Supabase
    router.push('/onboarding/duration');
  };

  return (
    <ScreenContainer>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Pick Your Vibes</Text>
        <Text style={styles.subtitle}>
          Choose the categories that excite you. We'll tailor your quests.
        </Text>

        <View style={styles.grid}>
          {VIBE_OPTIONS.map((vibe) => (
            <TouchableOpacity
              key={vibe.id}
              style={[
                styles.card,
                selected.has(vibe.id) && styles.cardSelected,
              ]}
              onPress={() => toggleVibe(vibe.id)}
              activeOpacity={0.7}
            >
              <Text style={styles.emoji}>{vibe.emoji}</Text>
              <Text style={styles.cardLabel}>{vibe.label}</Text>
              <Text style={styles.cardDesc}>{vibe.description}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Next"
          onPress={handleNext}
          disabled={selected.size === 0}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: Spacing.xxl,
    paddingBottom: Spacing.lg,
  },
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  card: {
    width: '47%',
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  cardSelected: {
    borderColor: Colors.brand,
    backgroundColor: Colors.bgElevated,
  },
  emoji: {
    fontSize: 32,
    marginBottom: Spacing.sm,
  },
  cardLabel: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  cardDesc: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  footer: {
    paddingVertical: Spacing.md,
  },
});
