import { useState, useEffect, useRef, type RefObject } from 'react';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { colors } from '../theme/tokens';
import { useChatStore } from '../stores/chat.store';
import { useAppSettingsStore } from '../stores/appSettings.store';
import { wsManager } from '../services/ws';
import { transcribeAudio, textToSpeech } from '../services/api';
import { uid } from '../utils/uid';
import type { ChatTokenPayload, ChatDonePayload, ChatErrorPayload } from '../types/ws';
import type { Message } from '../types/models';
import type { CameraView } from 'expo-camera';

type CallPhase = 'listening' | 'thinking' | 'speaking' | 'muted';

interface CallBarProps {
  onEnd: () => void;
  videoOn: boolean;
  onToggleVideo: () => void;
  cameraRef: RefObject<CameraView | null>;
}

export default function CallBar({ onEnd, videoOn, onToggleVideo, cameraRef }: CallBarProps) {
  const [phase, setPhase] = useState<CallPhase>('listening');
  const [elapsed, setElapsed] = useState(0);

  const recordingRef = useRef<Audio.Recording | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const callStartRef = useRef(Date.now());
  const elapsedTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const aiResponseRef = useRef('');
  const mountedRef = useRef(true);
  const phaseRef = useRef<CallPhase>('listening');
  const speechDetectedRef = useRef(false);
  const recordingStartRef = useRef(0);
  const videoOnRef = useRef(videoOn);
  const latestFrameRef = useRef<string | null>(null);
  const frameCaptureTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  // Pulsing dot animation
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pulseLoopRef = useRef<Animated.CompositeAnimation | null>(null);

  // Keep refs in sync
  useEffect(() => { phaseRef.current = phase; }, [phase]);
  useEffect(() => { videoOnRef.current = videoOn; }, [videoOn]);

  // Elapsed timer
  useEffect(() => {
    callStartRef.current = Date.now();
    elapsedTimerRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - callStartRef.current) / 1000));
    }, 1000);
    return () => {
      if (elapsedTimerRef.current) clearInterval(elapsedTimerRef.current);
    };
  }, []);

  // Pulse animation
  useEffect(() => {
    pulseLoopRef.current?.stop();
    if (phase === 'muted') {
      pulseAnim.setValue(1);
      return;
    }
    pulseLoopRef.current = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 0.4, duration: 600, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      ]),
    );
    pulseLoopRef.current.start();
    return () => { pulseLoopRef.current?.stop(); };
  }, [phase, pulseAnim]);

  // Cleanup on unmount
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      stopRecording();
      stopPlayback();
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    };
  }, []);

  // Subscribe to WS events — only local tracking + TTS trigger
  useEffect(() => {
    const unsubs = [
      wsManager.on<ChatTokenPayload>('chat.token', (payload) => {
        if (phaseRef.current !== 'thinking') return;
        aiResponseRef.current += payload.token;
      }),
      wsManager.on<ChatDonePayload>('chat.done', (payload) => {
        if (phaseRef.current !== 'thinking') return;
        aiResponseRef.current = payload.content;
        if (mountedRef.current) speakResponse(payload.content);
      }),
      wsManager.on<ChatErrorPayload>('chat.error', () => {
        if (phaseRef.current !== 'thinking') return;
        if (mountedRef.current) {
          setTimeout(() => {
            if (mountedRef.current) startListening();
          }, 1500);
        }
      }),
    ];
    return () => unsubs.forEach((u) => u());
  }, []);

  // Start listening on mount
  useEffect(() => {
    startListening();
  }, []);

  // Periodically capture frames when video is on so a fresh one is always ready
  useEffect(() => {
    if (videoOn) {
      // Capture immediately, then every 2s
      captureFrameToRef();
      frameCaptureTimer.current = setInterval(captureFrameToRef, 2000);
    } else {
      latestFrameRef.current = null;
      if (frameCaptureTimer.current) {
        clearInterval(frameCaptureTimer.current);
        frameCaptureTimer.current = null;
      }
    }
    return () => {
      if (frameCaptureTimer.current) {
        clearInterval(frameCaptureTimer.current);
        frameCaptureTimer.current = null;
      }
    };
  }, [videoOn]);

  /** Capture a frame and cache it */
  async function captureFrameToRef() {
    if (!cameraRef.current) return;
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.7,
        base64: true,
        shutterSound: false,
        skipProcessing: true,
      });
      if (photo?.base64) latestFrameRef.current = photo.base64;
    } catch {
      // Camera not ready yet, ignore
    }
  }

  /** Get the latest cached frame */
  function getLatestFrame(): string | undefined {
    return latestFrameRef.current ?? undefined;
  }

  async function startListening() {
    if (!mountedRef.current) return;
    setPhase('listening');
    aiResponseRef.current = '';

    try {
      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) { onEnd(); return; }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync({
        ...Audio.RecordingOptionsPresets.HIGH_QUALITY,
        isMeteringEnabled: true,
      });
      await recording.startAsync();

      recordingRef.current = recording;
      speechDetectedRef.current = false;
      recordingStartRef.current = Date.now();

      recording.setOnRecordingStatusUpdate((status) => {
        if (!status.isRecording) return;
        const metering = status.metering ?? -160;
        const recordingAge = Date.now() - recordingStartRef.current;

        if (metering >= -40) {
          speechDetectedRef.current = true;
          if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
            silenceTimerRef.current = null;
          }
        } else if (speechDetectedRef.current && recordingAge > 1000) {
          if (!silenceTimerRef.current) {
            silenceTimerRef.current = setTimeout(() => {
              silenceTimerRef.current = null;
              if (mountedRef.current && phaseRef.current === 'listening') {
                handleSilenceDetected();
              }
            }, 1500);
          }
        }
      });
      recording.setProgressUpdateInterval(250);
    } catch (err) {
      console.warn('Failed to start recording for call:', err);
      if (mountedRef.current) onEnd();
    }
  }

  async function handleSilenceDetected() {
    if (!mountedRef.current || phaseRef.current !== 'listening') return;
    setPhase('thinking');

    const recording = recordingRef.current;
    if (!recording) { startListening(); return; }
    recordingRef.current = null;

    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      if (!uri) { if (mountedRef.current) startListening(); return; }

      const FileSystem = await import('expo-file-system/legacy');
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      if (!base64) { if (mountedRef.current) startListening(); return; }

      // Grab the latest cached camera frame (already captured, instant)
      const frame = getLatestFrame();

      const lang = useAppSettingsStore.getState().sttLanguage || undefined;
      const res = await transcribeAudio(base64, lang);
      if (!mountedRef.current) return;

      if (!res.ok || !res.data?.text || !res.data.text.trim()) {
        startListening();
        return;
      }

      const transcribed = res.data.text.trim();
      const wsImages = frame ? [frame] : undefined;
      // If camera is on, hint the AI so it knows to reference the visual
      const wsText = frame
        ? `[Camera is on — image attached is what I'm looking at right now]\n${transcribed}`
        : transcribed;

      // Add user message to chat store (no images — keep chat clean)
      const conversationId = useChatStore.getState().conversationId;
      const userMsg: Message = {
        id: uid(),
        conversation_id: conversationId ?? '',
        role: 'user',
        content: transcribed,
        model: null,
        tokens_used: null,
        created_at: new Date().toISOString(),
      };
      useChatStore.getState().addMessage(userMsg);
      useChatStore.getState().setStreaming(true);
      // Send frame + hinted text to AI, but chat only shows clean transcription
      wsManager.sendChat(wsText, conversationId ?? undefined, wsImages);
    } catch (err) {
      console.warn('Call transcription error:', err);
      if (mountedRef.current) startListening();
    }
  }

  async function speakResponse(text: string) {
    if (!mountedRef.current) return;
    setPhase('speaking');

    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
      });

      const res = await textToSpeech(text);
      if (!mountedRef.current) return;
      if (!res.ok || !res.data?.audio) { startListening(); return; }

      const FileSystem = await import('expo-file-system/legacy');
      const tmpFile = FileSystem.cacheDirectory + `tts_${Date.now()}.mp3`;
      await FileSystem.writeAsStringAsync(tmpFile, res.data.audio, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const { sound } = await Audio.Sound.createAsync({ uri: tmpFile });
      soundRef.current = sound;

      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync();
          soundRef.current = null;
          FileSystem.deleteAsync(tmpFile, { idempotent: true }).catch(() => {});
          if (mountedRef.current) {
            setTimeout(() => {
              if (mountedRef.current) startListening();
            }, 800);
          }
        }
      });

      await sound.playAsync();
    } catch (err) {
      console.warn('TTS playback error:', err);
      if (mountedRef.current) startListening();
    }
  }

  async function stopRecording() {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    const recording = recordingRef.current;
    if (recording) {
      recordingRef.current = null;
      try { await recording.stopAndUnloadAsync(); } catch {}
    }
  }

  async function stopPlayback() {
    const sound = soundRef.current;
    if (sound) {
      soundRef.current = null;
      try { await sound.stopAsync(); await sound.unloadAsync(); } catch {}
    }
  }

  function handleMuteToggle() {
    if (phase === 'muted') {
      startListening();
    } else if (phase === 'listening') {
      stopRecording();
      setPhase('muted');
    }
  }

  function handleEndCall() {
    stopRecording();
    stopPlayback();
    useChatStore.getState().clearStream();
    onEnd();
  }

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const statusLabel =
    phase === 'listening' ? 'Listening...' :
    phase === 'thinking' ? 'Thinking...' :
    phase === 'speaking' ? 'Speaking...' :
    'Muted';

  const dotColor =
    phase === 'listening' ? colors.accent :
    phase === 'thinking' ? colors.warning :
    phase === 'speaking' ? colors.success :
    colors.textMuted;

  const isMuted = phase === 'muted';
  const canToggleMute = phase === 'listening' || phase === 'muted';

  return (
    <View style={styles.bar}>
      {/* Pulsing status dot */}
      <Animated.View style={[styles.dot, { backgroundColor: dotColor, opacity: pulseAnim }]} />

      {/* Status + timer */}
      <Text style={styles.label}>{statusLabel}</Text>
      <Text style={styles.timer}>{formatTime(elapsed)}</Text>

      <View style={styles.spacer} />

      {/* Mute button */}
      <Pressable
        onPress={handleMuteToggle}
        style={[styles.iconBtn, canToggleMute && styles.iconBtnActive]}
        disabled={!canToggleMute}
      >
        <Feather
          name={isMuted ? 'mic-off' : 'mic'}
          size={18}
          color={isMuted ? colors.error : canToggleMute ? colors.text : colors.textMuted}
        />
      </Pressable>

      {/* Video toggle */}
      <Pressable
        onPress={onToggleVideo}
        style={[styles.iconBtn, videoOn && styles.videoBtnActive]}
      >
        <Feather
          name={videoOn ? 'video' : 'video-off'}
          size={18}
          color={videoOn ? colors.accent : colors.text}
        />
      </Pressable>

      {/* End call */}
      <Pressable onPress={handleEndCall} style={styles.endBtn}>
        <Feather name="phone-off" size={16} color="#fff" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: colors.bgSurface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  label: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '500',
  },
  timer: {
    color: colors.textMuted,
    fontSize: 13,
    fontVariant: ['tabular-nums'],
  },
  spacer: {
    flex: 1,
  },
  iconBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.bgElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBtnActive: {
    backgroundColor: colors.bgHover,
  },
  videoBtnActive: {
    backgroundColor: colors.accent + '33',
  },
  endBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
