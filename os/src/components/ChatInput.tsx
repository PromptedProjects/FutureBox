import { useState, useRef, useEffect, useCallback } from 'react';
import { View, TextInput, StyleSheet, Pressable, Alert, Animated } from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { Audio } from 'expo-av';
import { colors } from '../theme/tokens';

interface ChatInputProps {
  onSend: (text: string) => void;
  onCancel: () => void;
  onImage?: (base64: string) => void;
  onTranscribe?: (uri: string) => Promise<string | null>;
  isStreaming: boolean;
}

export default function ChatInput({ onSend, onCancel, onImage, onTranscribe, isStreaming }: ChatInputProps) {
  const [text, setText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const recordingRef = useRef<Audio.Recording | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const animTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Pulse animation when recording
  useEffect(() => {
    if (isRecording) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 0.4, duration: 600, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        ]),
      );
      loop.start();
      return () => loop.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isRecording, pulseAnim]);

  useEffect(() => {
    return () => {
      if (animTimerRef.current) clearInterval(animTimerRef.current);
    };
  }, []);

  const animateText = useCallback((fullText: string) => {
    let i = 0;
    setText('');
    if (animTimerRef.current) clearInterval(animTimerRef.current);
    animTimerRef.current = setInterval(() => {
      i++;
      setText(fullText.slice(0, i));
      if (i >= fullText.length) {
        if (animTimerRef.current) clearInterval(animTimerRef.current);
        animTimerRef.current = null;
      }
    }, 20);
  }, []);

  function handleSend() {
    const trimmed = text.trim();
    if (!trimmed) return;
    if (animTimerRef.current) {
      clearInterval(animTimerRef.current);
      animTimerRef.current = null;
    }
    onSend(trimmed);
    setText('');
  }

  async function handleAttach() {
    Alert.alert('Attach', 'Choose source', [
      {
        text: 'Camera',
        onPress: async () => {
          const perm = await ImagePicker.requestCameraPermissionsAsync();
          if (!perm.granted) return;
          const result = await ImagePicker.launchCameraAsync({
            quality: 0.7,
            base64: true,
          });
          if (!result.canceled && result.assets[0]?.base64) {
            onImage?.(result.assets[0].base64);
          }
        },
      },
      {
        text: 'Photo Library',
        onPress: async () => {
          const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (!perm.granted) return;
          const result = await ImagePicker.launchImageLibraryAsync({
            quality: 0.7,
            base64: true,
          });
          if (!result.canceled && result.assets[0]?.base64) {
            onImage?.(result.assets[0].base64);
          }
        },
      },
      {
        text: 'File',
        onPress: async () => {
          const result = await DocumentPicker.getDocumentAsync({ type: '*/*' });
          if (!result.canceled && result.assets[0]) {
            onImage?.(result.assets[0].uri);
          }
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  }

  async function handleVoicePress() {
    if (isRecording) {
      // Stop recording
      setIsRecording(false);
      try {
        const recording = recordingRef.current;
        if (!recording) return;
        recordingRef.current = null;

        await recording.stopAndUnloadAsync();
        const uri = recording.getURI();

        if (!uri) {
          Alert.alert('Recording error', 'No audio was captured. Please try again.');
          return;
        }

        if (onTranscribe) {
          setIsTranscribing(true);
          try {
            const transcribed = await onTranscribe(uri);
            if (transcribed) {
              animateText(transcribed);
              inputRef.current?.focus();
            }
          } catch (err: any) {
            Alert.alert('Transcription error', err?.message ?? 'Failed to transcribe.');
          } finally {
            setIsTranscribing(false);
          }
        }
      } catch (err: any) {
        Alert.alert('Recording error', err?.message ?? 'Failed to stop recording.');
      }
      return;
    }

    // Start recording
    try {
      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) {
        Alert.alert('Permission needed', 'Microphone access is required for voice input.');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      await recording.startAsync();
      recordingRef.current = recording;
      setIsRecording(true);
    } catch (err: any) {
      Alert.alert('Recording error', err?.message ?? 'Could not start recording.');
    }
  }

  const showSendButton = !!text.trim() && !isStreaming;

  return (
    <View style={styles.container}>
      <Pressable onPress={handleAttach} style={styles.btn}>
        <Feather name="paperclip" size={20} color={colors.textMuted} />
      </Pressable>

      <View style={styles.inputWrapper}>
        <TextInput
          ref={inputRef}
          style={styles.input}
          value={text}
          onChangeText={(t) => {
            if (animTimerRef.current) {
              clearInterval(animTimerRef.current);
              animTimerRef.current = null;
            }
            setText(t);
          }}
          placeholder={
            isRecording ? 'Recording... tap to stop' :
            isTranscribing ? 'Transcribing...' :
            'Message Future Buddy...'
          }
          placeholderTextColor={isRecording ? colors.error : isTranscribing ? colors.accent : colors.textMuted}
          multiline
          maxLength={10000}
          editable={!isStreaming && !isRecording}
          onSubmitEditing={handleSend}
          blurOnSubmit={false}
        />
      </View>

      {isStreaming ? (
        <Pressable onPress={onCancel} style={styles.btn}>
          <Feather name="square" size={20} color={colors.error} />
        </Pressable>
      ) : showSendButton ? (
        <Pressable onPress={handleSend} style={styles.btn}>
          <Feather name="send" size={20} color={colors.accent} />
        </Pressable>
      ) : (
        <Pressable onPress={handleVoicePress} style={styles.voiceBtn} disabled={isTranscribing}>
          {isRecording ? (
            <Animated.View style={[styles.recordingCircle, { opacity: pulseAnim }]}>
              <View style={styles.recordingDot} />
            </Animated.View>
          ) : isTranscribing ? (
            <View style={[styles.voiceCircle, { backgroundColor: colors.textMuted }]}>
              <Feather name="loader" size={18} color="white" />
            </View>
          ) : (
            <View style={styles.voiceCircle}>
              <Feather name="mic" size={18} color="white" />
            </View>
          )}
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.bgSurface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: 8,
    paddingVertical: 8,
    alignItems: 'flex-end',
    gap: 4,
  },
  inputWrapper: {
    flex: 1,
  },
  input: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 20,
    maxHeight: 120,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: colors.bgElevated,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  btn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  voiceBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  voiceCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordingCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordingDot: {
    width: 12,
    height: 12,
    borderRadius: 3,
    backgroundColor: 'white',
  },
});
