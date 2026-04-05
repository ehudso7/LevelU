import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TextInput } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { ScreenContainer, Button } from '../../src/components';
import { Colors, FontSize, FontWeight, Spacing, Radius } from '../../src/constants';
import { useHome } from '../../src/features/home';
import { useQuestComplete } from '../../src/features/quests';
import { useAuthStore } from '../../src/features/auth';

export default function QuestActive() {
  const { assignmentId: rawId } = useLocalSearchParams<{ assignmentId: string }>();
  const router = useRouter();
  const { session } = useAuthStore();
  const { data: homeData } = useHome();
  const questComplete = useQuestComplete();

  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Strip the "-active" suffix if present (Expo Router file naming)
  const assignmentId = rawId?.replace('-active', '') ?? rawId;

  const assignment = homeData?.assignments.find((a) => a.id === assignmentId);
  const quest = assignment?.quest;
  const userId = session?.user?.id ?? '';

  const handleTakePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) return;

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      allowsEditing: true,
      aspect: [1, 1],
    });

    if (!result.canceled && result.assets[0]) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setPhotoUri(result.assets[0].uri);
    }
  };

  const handlePickPhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      allowsEditing: true,
      aspect: [1, 1],
    });

    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const handleComplete = (skipProof: boolean) => {
    if (!assignmentId) return;
    setError(null);

    // Determine proof type based on what was provided
    let proofType: 'photo_plus_caption' | 'photo' | 'short_text' | 'tap_done' = 'tap_done';
    if (!skipProof && photoUri && caption.trim().length > 0) {
      proofType = 'photo_plus_caption';
    } else if (!skipProof && photoUri) {
      proofType = 'photo';
    } else if (!skipProof && caption.trim().length > 0) {
      proofType = 'short_text';
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    questComplete.mutate(
      {
        assignmentId,
        userId,
        proofType,
        photoUri: skipProof ? null : photoUri,
        caption: skipProof ? null : caption.trim() || null,
      },
      {
        onSuccess: (data) => {
          // Navigate to reward screen with data in params
          router.replace({
            pathname: `/quest/${assignmentId}-reward`,
            params: { reward: JSON.stringify(data) },
          });
        },
        onError: (err) => {
          setError(err instanceof Error ? err.message : 'Failed to complete quest. Try again.');
        },
      },
    );
  };

  return (
    <ScreenContainer>
      <View style={styles.content}>
        <Text style={styles.title}>Complete Your Quest</Text>
        {quest && <Text style={styles.questTitle}>{quest.title}</Text>}
        <Text style={styles.subtitle}>
          {quest?.proofPrompt ?? 'Add a photo or note as proof you completed the quest.'}
        </Text>

        {photoUri ? (
          <View style={styles.previewContainer}>
            <Image source={{ uri: photoUri }} style={styles.preview} />
            <Button title="Retake" variant="secondary" onPress={handleTakePhoto} />
          </View>
        ) : (
          <View style={styles.photoActions}>
            <Button title="Take Photo" onPress={handleTakePhoto} />
            <Button title="Choose from Library" variant="secondary" onPress={handlePickPhoto} />
          </View>
        )}

        <TextInput
          style={styles.captionInput}
          placeholder="Add a caption or note (optional)"
          placeholderTextColor={Colors.textMuted}
          value={caption}
          onChangeText={setCaption}
          multiline
          maxLength={500}
        />

        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
      </View>

      <View style={styles.footer}>
        <Button
          title="Submit Proof"
          onPress={() => handleComplete(false)}
          disabled={!photoUri && caption.trim().length === 0}
          loading={questComplete.isPending}
        />
        <Button
          title="Done (No Proof)"
          variant="ghost"
          onPress={() => handleComplete(true)}
          disabled={questComplete.isPending}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, paddingTop: Spacing.xxl },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  questTitle: {
    fontSize: FontSize.md,
    color: Colors.brand,
    fontWeight: FontWeight.semibold,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    marginBottom: Spacing.xl,
    lineHeight: 22,
  },
  photoActions: { gap: Spacing.md, marginBottom: Spacing.lg },
  previewContainer: { gap: Spacing.md, alignItems: 'center', marginBottom: Spacing.lg },
  preview: {
    width: 200,
    height: 200,
    borderRadius: Radius.lg,
    backgroundColor: Colors.bgCard,
  },
  captionInput: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.md,
    padding: Spacing.md,
    color: Colors.textPrimary,
    fontSize: FontSize.md,
    minHeight: 80,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  errorBox: {
    marginTop: Spacing.md,
    backgroundColor: Colors.error + '20',
    borderRadius: Radius.md,
    padding: Spacing.md,
  },
  errorText: { color: Colors.error, fontSize: FontSize.sm, textAlign: 'center' },
  footer: { gap: Spacing.sm, paddingVertical: Spacing.md },
});
