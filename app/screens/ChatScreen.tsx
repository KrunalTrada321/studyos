"use client";
import { FontAwesome, Ionicons, MaterialIcons } from "@expo/vector-icons";
import {
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioPlayer,
  useAudioPlayerStatus,
  useAudioRecorder,
  useAudioRecorderState,
} from "expo-audio";
import * as FileSystem from "expo-file-system";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import MessageBubble from "../components/MessageBubble";
import VoiceWaveform from "../components/VoiceWaveform";
import type { ChatMessage } from "../types/chat";
import { colors } from "../utils/colors";
import Constants from "../utils/constants";
import { getToken } from "../utils/token";

const { width, height } = Dimensions.get("window");

const handleAPIError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  return "Unknown error occurred";
};

const ChatScreen = () => {
  const [recordingTime, setRecordingTime] = useState(0);
  const [chatMode, setChatMode] = useState<"voice" | "text">("voice");
  const [inputMessage, setInputMessage] = useState("");
  const [textConversationHistory, setTextConversationHistory] = useState<
    ChatMessage[]
  >([]);
  const [voiceConversationHistory, setVoiceConversationHistory] = useState<
    ChatMessage[]
  >([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(audioRecorder);
  const audioPlayer = useAudioPlayer(null);
  const playerStatus = useAudioPlayerStatus(audioPlayer);

  const scrollViewRef = useRef<ScrollView>(null);
  const pulseAnimation = useRef(new Animated.Value(1)).current;
  const glowAnimation = useRef(new Animated.Value(0)).current;

  const currentHistory =
    chatMode === "voice" ? voiceConversationHistory : textConversationHistory;
  const setCurrentHistory =
    chatMode === "voice"
      ? setVoiceConversationHistory
      : setTextConversationHistory;

  useEffect(() => {
    setupAudio();
    return () => {
      cleanupAudio();
    };
  }, []);

  useEffect(() => {
    if (isProcessing && chatMode === "voice") {
      startPulseAnimation();
    } else {
      setRecordingTime(0);
      stopPulseAnimation();
    }
  }, [isProcessing, chatMode]);

  useEffect(() => {
    if (playerStatus) {
      setIsPlayingAudio(playerStatus.playing);
      if (playerStatus.didJustFinish && !playerStatus.playing) {
        console.log("Audio playback finished.");
        if (
          audioPlayer.source &&
          typeof audioPlayer.source === "object" &&
          "uri" in audioPlayer.source &&
          audioPlayer.source.uri?.startsWith(FileSystem.cacheDirectory || "")
        ) {
          FileSystem.deleteAsync(audioPlayer.source.uri, {
            idempotent: true,
          }).catch((e) =>
            console.error("Failed to delete temp file after playback:", e)
          );
        }
        audioPlayer.replace(null);
      }
    }
  }, [playerStatus, audioPlayer]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isProcessing && chatMode === "voice") {
      interval = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } else {
      setRecordingTime(0);
    }
    return () => clearInterval(interval);
  }, [isProcessing, chatMode]);

  useEffect(() => {
    if (scrollViewRef.current) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [currentHistory]);

  const setupAudio = async (): Promise<void> => {
    try {
      const { granted } = await AudioModule.requestRecordingPermissionsAsync();
      if (!granted) {
        Alert.alert(
          "Permission Denied",
          "Microphone access is required for voice chat."
        );
        return;
      }
      await setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
        shouldPlayInBackground: true,
      });
    } catch (error) {
      console.error("Failed to setup audio:", error);
    }
  };

  const cleanupAudio = async (): Promise<void> => {
    try {
      if (recorderState.isRecording) {
        await audioRecorder.stop();
      }
      if (audioPlayer.playing) {
        await audioPlayer.pause();
      }
      audioPlayer.release();
      audioRecorder.release();
    } catch (error) {
      console.error("Error cleaning up audio:", error);
    }
  };

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnimation, {
          toValue: 1.3,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnimation, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnimation, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: false,
        }),
        Animated.timing(glowAnimation, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: false,
        }),
      ])
    ).start();
  };

  const stopPulseAnimation = () => {
    pulseAnimation.stopAnimation();
    pulseAnimation.setValue(1);
    glowAnimation.stopAnimation();
    glowAnimation.setValue(0);
  };

  const formatRecordingTime = (seconds: number) => {
    const mins = String(Math.floor(seconds / 60)).padStart(2, "0");
    const secs = String(seconds % 60).padStart(2, "0");
    return `${mins}:${secs}`;
  };

  const handleVoiceButtonPress = async () => {
    if (isProcessing || isPlayingAudio) {
      console.log("Already processing or playing audio. Ignoring new press.");
      if (audioPlayer.playing) {
        await audioPlayer.pause();
        audioPlayer.seekTo(0);
      }
      setIsProcessing(false);
      setIsListening(false);
      return;
    }

    const dummyMessage = "Hello. How are you";
    const userMessage: ChatMessage = {
      role: "user",
      message: dummyMessage,
      timestamp: new Date(),
    };
    setVoiceConversationHistory((prev) => [...prev, userMessage]);
    setIsProcessing(true);
    setIsListening(true);

    await sendVoiceMessage(dummyMessage);

    setIsProcessing(false);
    setIsListening(false);
  };

  const sendVoiceMessage = async (message: string) => {
    try {
      const token = await getToken();
      console.log(
        "Attempting to fetch voice from:",
        `${Constants.api}/api/ai/chat/voice`
      );
      const response = await fetch(`${Constants.api}/api/ai/chat/voice`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message,
          history: voiceConversationHistory.map((msg) => ({
            role: msg.role,
            message: msg.message,
          })),
          voice: "Kore",
        }),
      });

      console.log(
        "Voice fetch response received. Status:",
        response.status,
        "OK:",
        response.ok
      );
      console.log("Voice response headers:", response.headers);
      console.log(
        "Voice response body (before any consumption):",
        response.body,
        "Type:",
        typeof response.body
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Non-OK voice response error text:", errorText);
        throw new Error(
          `Voice API request failed: ${response.status} - ${errorText}`
        );
      }

      console.log(
        "Handling voice response as audio with response.blob() and useAudioPlayer."
      );
      await handleStreamingAudio(response);
    } catch (error) {
      console.error("Voice message error:", error);
      addVoiceResponse(
        "❌ Failed to get voice response: " + handleAPIError(error)
      );
    }
  };

  const handleStreamingAudio = async (response: Response): Promise<void> => {
    console.log(
      "Inside handleStreamingAudio. Response object passed:",
      response
    );

    try {
      addVoiceResponse("🎵 Receiving audio response...");
      // Get the audio data as a blob
      const audioBlob = await response.blob();
      console.log("Received audio blob:", audioBlob);

      // Convert blob to base64 for file system operations
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);

      await new Promise<void>((resolve, reject) => {
        reader.onload = async () => {
          const base64Data = reader.result?.toString().split(",")[1]; // Remove data:audio/wav;base64, prefix
          if (!base64Data) {
            reject(new Error("Failed to convert audio blob to base64."));
            return;
          }

          const tempFilePath =
            FileSystem.cacheDirectory + `response_${Date.now()}.wav`;
          console.log("Saving audio to temporary file:", tempFilePath);
          await FileSystem.writeAsStringAsync(tempFilePath, base64Data, {
            encoding: FileSystem.EncodingType.Base64,
          });
          console.log(
            "Audio saved to temporary file. Playing with useAudioPlayer."
          );
          addVoiceResponse("🔊 Playing audio response...");
          audioPlayer.replace({ uri: tempFilePath });
          await audioPlayer.play();
          resolve();
        };
        reader.onerror = reject;
      });
    } catch (error) {
      console.error("Audio processing or playback error:", error);
      addVoiceResponse("❌ Failed to play audio response");
      setIsPlayingAudio(false);
    }
  };

  const addVoiceResponse = (message: string) => {
    setVoiceConversationHistory((prev) => [
      ...prev,
      { role: "model", message, timestamp: new Date() },
    ]);
  };

  const sendTextMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: ChatMessage = {
      role: "user",
      message: inputMessage.trim(),
      timestamp: new Date(),
    };
    setTextConversationHistory((prev) => [...prev, userMessage]);

    const messageToSend = inputMessage.trim();
    setInputMessage("");
    setIsProcessing(true);

    const modelMessage: ChatMessage = {
      role: "model",
      message: "...",
      timestamp: new Date(),
      isStreaming: false,
    };
    setTextConversationHistory((prev) => [...prev, modelMessage]);

    try {
      const token = await getToken();
      const url = `${Constants.api}/api/ai/chat`;
      console.log("Attempting to fetch text from:", url);
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: messageToSend,
          history: textConversationHistory.map((msg) => ({
            role: msg.role,
            message: msg.message,
          })),
        }),
      });

      console.log(
        "Text fetch response received. Status:",
        response.status,
        "OK:",
        response.ok
      );
      console.log("Text response headers:", response.headers);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Non-OK text response error text:", errorText);
        throw new Error(
          `Text API request failed: ${response.status} - ${errorText}`
        );
      }

      const data = await response.json();
      console.log("Received text response data:", data);

      if (data && data.message) {
        updateFinalMessage(data.message);
      } else {
        throw new Error("Invalid response format: message field missing.");
      }
    } catch (error) {
      console.error("Text message error:", error);
      updateFinalMessage("❌ Error getting response: " + handleAPIError(error));
    } finally {
      setIsProcessing(false);
    }
  };

  const updateFinalMessage = (text: string) => {
    setTextConversationHistory((prev) =>
      prev.map((msg, index) =>
        index === prev.length - 1
          ? { ...msg, message: text, isStreaming: false }
          : msg
      )
    );
  };

  const toggleChatMode = (mode: "voice" | "text") => {
    setChatMode(mode);
    if (audioPlayer.playing && mode === "text") {
      audioPlayer.pause();
      audioPlayer.seekTo(0);
    }
    setIsProcessing(false);
    setIsListening(false);
  };

  const clearCurrentSession = () => {
    Alert.alert(
      "Clear Session",
      `Are you sure you want to clear the ${chatMode} conversation?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: () => {
            if (chatMode === "voice") {
              setVoiceConversationHistory([]);
            } else {
              setTextConversationHistory([]);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      {/* Mode Selector at Top */}
      <View style={styles.topModeSelector}>
        <View style={styles.modeButtons}>
          <TouchableOpacity
            style={[
              styles.modeButton,
              chatMode === "voice"
                ? styles.activeModeButton
                : styles.inactiveModeButton,
            ]}
            onPress={() => toggleChatMode("voice")}
          >
            <FontAwesome
              name="microphone"
              size={18}
              color={chatMode === "voice" ? colors.white : "#6B7280"}
            />
            <Text
              style={[
                styles.modeButtonText,
                chatMode === "voice"
                  ? styles.activeModeText
                  : styles.inactiveModeText,
              ]}
            >
              Voice Chat
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.modeButton,
              chatMode === "text"
                ? styles.activeModeButton
                : styles.inactiveModeButton,
            ]}
            onPress={() => toggleChatMode("text")}
          >
            <Ionicons
              name="chatbubble-outline"
              size={18}
              color={chatMode === "text" ? colors.white : "#6B7280"}
            />
            <Text
              style={[
                styles.modeButtonText,
                chatMode === "text"
                  ? styles.activeModeText
                  : styles.inactiveModeText,
              ]}
            >
              Text Chat
            </Text>
          </TouchableOpacity>
        </View>
        {currentHistory.length > 0 && (
          <TouchableOpacity
            onPress={clearCurrentSession}
            style={styles.clearButton}
          >
            <MaterialIcons
              name="clear-all"
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Main Content */}
      {chatMode === "voice" ? (
        <View style={styles.voiceContainer}>
          {/* Voice Chat History */}
          {voiceConversationHistory.length > 0 && (
            <ScrollView
              ref={scrollViewRef}
              style={styles.voiceChatHistory}
              contentContainerStyle={styles.voiceChatContent}
              showsVerticalScrollIndicator={false}
            >
              {voiceConversationHistory.map((msg, index) => (
                <MessageBubble key={index} message={msg} />
              ))}
            </ScrollView>
          )}

          {/* Voice Controls */}
          <View style={styles.voiceControls}>
            <Animated.View
              style={[
                styles.microphoneButton,
                { transform: [{ scale: pulseAnimation }] },
              ]}
            >
              <TouchableOpacity
                style={[
                  styles.micButton,
                  (isProcessing || isPlayingAudio) && styles.recordingMicButton,
                ]}
                onPress={handleVoiceButtonPress}
                disabled={isProcessing || isPlayingAudio}
              >
                <FontAwesome
                  name="microphone"
                  size={32}
                  color={
                    isProcessing || isPlayingAudio ? colors.white : colors.white
                  }
                />
              </TouchableOpacity>
            </Animated.View>
            <Text style={styles.recordingTimer}>
              {formatRecordingTime(recordingTime)}
            </Text>
            <VoiceWaveform isActive={isProcessing || isPlayingAudio} />
            <Text style={styles.voiceStatus}>
              {isProcessing
                ? "🤔 Thinking..."
                : isPlayingAudio
                ? "🔊 Speaking..."
                : "Press to get voice response"}
            </Text>
          </View>
        </View>
      ) : (
        <KeyboardAvoidingView
          style={styles.textContainer}
          behavior={Platform.OS === "ios" ? "padding" : "padding"} //  'h' for Android  better
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 90}
        >
          <ScrollView
            ref={scrollViewRef}
            style={styles.chatHistory}
            contentContainerStyle={styles.chatContent}
            showsVerticalScrollIndicator={false}
          >
            {textConversationHistory.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="chatbubble-outline" size={64} color="#D1D5DB" />
                <Text style={styles.emptyTitle}>Start a conversation</Text>
                <Text style={styles.emptySubtitle}>
                  Type a message to begin chatting with AI
                </Text>
              </View>
            ) : (
              textConversationHistory.map((msg, index) => (
                <MessageBubble key={index} message={msg} />
              ))
            )}
            {isProcessing && (
              <View style={styles.typingIndicator}>
                <View style={styles.typingDots}>
                  <View style={[styles.dot, styles.dot1]} />
                  <View style={[styles.dot, styles.dot2]} />
                  <View style={[styles.dot, styles.dot3]} />
                </View>
                <Text style={styles.typingText}>AI is typing...</Text>
              </View>
            )}
          </ScrollView>
          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <TextInput
                value={inputMessage}
                onChangeText={setInputMessage}
                placeholder="Type your message..."
                placeholderTextColor={colors.textSecondary}
                style={styles.textInput}
                multiline
                maxHeight={100} // Limit height for multiline input
                onSubmitEditing={sendTextMessage}
              />
              <TouchableOpacity
                onPress={sendTextMessage}
                style={[
                  styles.sendButton,
                  { opacity: inputMessage.trim() ? 1 : 0.3 },
                ]}
                disabled={!inputMessage.trim() || isProcessing}
              >
                <Ionicons name="send" size={20} color={colors.white} />
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB", // From LearnScreen
  },
  topModeSelector: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 15, // Keep for StatusBar
    paddingBottom: 15,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB", // From LearnScreen
  },
  modeButtons: {
    flexDirection: "row",
    backgroundColor: "#E8E8E8", // From LearnScreen tabContainer
    borderRadius: 12, // From LearnScreen tabContainer
    padding: 4, // From LearnScreen tabContainer
  },
  modeButton: {
    flex: 1, // Ensure buttons take equal space
    flexDirection: "row",
    backgroundColor: "transparent",
    paddingVertical: 12, // From LearnScreen tab
    paddingHorizontal: 16, // From LearnScreen tab
    borderRadius: 8, // From LearnScreen tab
    alignItems: "center",
    justifyContent: "center",
    gap: 8, // For icon and text spacing
  },
  activeModeButton: {
    backgroundColor: colors.primary,
    shadowColor: colors.primary, // From LearnScreen activeTab
    shadowOffset: { width: 0, height: 2 }, // From LearnScreen activeTab
    shadowOpacity: 0.2, // From LearnScreen activeTab
    shadowRadius: 4, // From LearnScreen activeTab
    elevation: 3, // From LearnScreen activeTab
  },
  inactiveModeButton: {
    backgroundColor: "transparent",
  },
  modeButtonText: {
    color: "#6B7280", // From LearnScreen tabText
    fontWeight: "600", // From LearnScreen tabText
    fontSize: 14, // From LearnScreen tabText
    // marginLeft removed, gap handles spacing
  },
  activeModeText: {
    color: "#fff", // From LearnScreen activeTabText
  },
  inactiveModeText: {
    color: "#6B7280", // Ensure inactive text color is consistent
  },
  clearButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: colors.inputBackground, // Keep existing or change to #E8E8E8
  },
  voiceContainer: {
    flex: 1,
  },
  voiceChatHistory: {
    flex: 1,
    paddingHorizontal: 16,
  },
  voiceChatContent: {
    paddingVertical: 16,
  },
  voiceControls: {
    alignItems: "center",
    paddingVertical: 30,
    paddingHorizontal: 20,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB", // From LearnScreen
  },
  microphoneButton: {
    marginBottom: 20,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  micButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    // Add shadow for more prominence, similar to LearnScreen's startButton
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  recordingMicButton: {
    backgroundColor: colors.danger,
  },
  recordingTimer: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1F2937", // From LearnScreen screenTitle
    marginBottom: 15,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
  voiceStatus: {
    fontSize: 16,
    color: "#6B7280", // From LearnScreen metaText
    marginTop: 15,
    textAlign: "center",
    fontWeight: "500",
  },
  textContainer: {
    flex: 1,
    backgroundColor: "#F9FAFB", // Match main container background
  },
  chatHistory: {
    flex: 1,
    paddingHorizontal: 16,
  },
  chatContent: {
    paddingVertical: 16,
    paddingBottom: 100, // Add extra padding to ensure last message is visible above floating input
    flexGrow: 1,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18, // From LearnScreen emptyTitle
    fontWeight: "600", // From LearnScreen emptyTitle
    color: "#6B7280", // From LearnScreen emptyTitle
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14, // From LearnScreen emptySubtitle
    color: "#9CA3AF", // From LearnScreen emptySubtitle
    marginTop: 8,
    textAlign: "center",
  },
  inputContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "flex-end",
    backgroundColor: colors.white,
    borderRadius: 25,
    paddingVertical: 8,
    paddingRight: 8,
    paddingLeft: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  textInput: {
    flex: 1,
    minHeight: 36,
    maxHeight: 100,
    fontSize: 16,
    color: "#1F2937", // From LearnScreen lessonTitle
    paddingVertical: 8,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
    // Add shadow for consistency with primary buttons
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  typingIndicator: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: colors.lightPrimary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: colors.border,
    // Add subtle shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  typingDots: {
    flexDirection: "row",
    marginRight: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
    marginHorizontal: 2,
  },
  dot1: {
    animationDelay: "0s",
  },
  dot2: {
    animationDelay: "0.2s",
  },
  dot3: {
    animationDelay: "0.4s",
  },
  typingText: {
    color: "#1F2937", // From LearnScreen lessonTitle
    fontSize: 14,
    fontStyle: "italic",
  },
});

export default ChatScreen;
