import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { ScreenContainer, Button } from '../../src/components';
import { Colors, FontSize, FontWeight, Spacing, Radius } from '../../src/constants';
import type { DurationPreference } from '../../src/types';

// Temporary placeholder data — will be replaced by backend config
const DURATION_OPTIONS: DurationPreference[] = [
  { id: 'chill', label: 'Chill (5 min/day)', minutesPerDay: 5 },
  { id: 'steady', label: 'Steady (15 min/day)', minutesPerDay: 15 },
  { id: 'intense', label: 'Intense (30 min/day)', minutesPerDay: 30 },
  { id: 'beast', label: 'Beast Mode (60+ min/day)', minutesPerDay: 60 },
];

export default function DurationSelection() {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);

  const handleSelect = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelected(id);
  };

  const handleNext = () => {
    // TODO: Persist duration preference to user profile via Supabase
    router.push('/onboarding/starter-pack');
  };

  return (
    <ScreenContainer>
      <View style={styles.content}>
        <Text style={styles.title}>How Much Time?</Text>
        <Text style={styles.subtitle}>
          How much time can you commit to quests each day?
        </Text>

        <View style={styles.options}>
          {DURATION_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.option,
                selected === option.id && styles.optionSelected,
              ]}
              onPress={() => handleSelect(option.id)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.optionLabel,
                  selected === option.id && styles.optionLabelSelected,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.footer}>
        <Button
          title="Next"
          onPress={handleNext}
          disabled={!selected}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingTop: Spacing.xxl,
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
  options: {
    gap: Spacing.md,
  },
  option: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.md,
    padding: Spacing.lg,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionSelected: {
    borderColor: Colors.brand,
    backgroundColor: Colors.bgElevated,
  },
  optionLabel: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.medium,
    color: Colors.textPrimary,
  },
  optionLabelSelected: {
    color: Colors.brandLight,
  },
  footer: {
    paddingVertical: Spacing.md,
  },
});
