import React, { useState } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { ScreenContainer, Button } from '../../src/components';
import { Colors, FontSize, FontWeight, Spacing, Radius } from '../../src/constants';

export default function QuestActive() {
  const { assignmentId } = useLocalSearchParams<{ assignmentId: string }>();
  const router = useRouter();
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Extract base assignment ID (route param includes "-active" suffix via file naming)
  const baseId = assignmentId?.replace('-active', '') ?? assignmentId;

  const handleTakePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      return;
    }

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
    if (!permission.granted) {
      return;
    }

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

  const handleComplete = async () => {
    setSubmitting(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // TODO: Upload proof photo to Supabase Storage
    // TODO: Create quest completion record in Supabase
    // Simulate completion delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    setSubmitting(false);
    router.replace(`/quest/${baseId}-reward`);
  };

  return (
    <ScreenContainer>
      <View style={styles.content}>
        <Text style={styles.title}>Complete Your Quest</Text>
        <Text style={styles.subtitle}>
          Take a photo as proof that you completed the quest.
        </Text>

        {photoUri ? (
          <View style={styles.previewContainer}>
            <Image source={{ uri: photoUri }} style={styles.preview} />
            <Button
              title="Retake Photo"
              variant="secondary"
              onPress={handleTakePhoto}
            />
          </View>
        ) : (
          <View style={styles.photoActions}>
            <Button title="Take Photo" onPress={handleTakePhoto} />
            <Button
              title="Choose from Library"
              variant="secondary"
              onPress={handlePickPhoto}
            />
          </View>
        )}
      </View>

      <View style={styles.footer}>
        <Button
          title="Submit Proof"
          onPress={handleComplete}
          disabled={!photoUri}
          loading={submitting}
        />
        <Button
          title="Skip Proof (for now)"
          variant="ghost"
          onPress={handleComplete}
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
  photoActions: {
    gap: Spacing.md,
  },
  previewContainer: {
    gap: Spacing.md,
    alignItems: 'center',
  },
  preview: {
    width: 240,
    height: 240,
    borderRadius: Radius.lg,
    backgroundColor: Colors.bgCard,
  },
  footer: {
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
  },
});
