import type React from "react"
import { View, Text, StyleSheet } from "react-native"
import { colors } from "../utils/colors"

interface ChatMessage {
  role: "user" | "model"
  message: string
  timestamp: Date
  isStreaming?: boolean
}

interface MessageBubbleProps {
  message: ChatMessage
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === "user"

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <View style={[styles.container, isUser ? styles.userContainer : styles.modelContainer]}>
      <View style={[styles.bubble, isUser ? styles.userBubble : styles.modelBubble]}>
        <Text style={[styles.text, isUser ? styles.userText : styles.modelText]}>{message.message}</Text>
        <Text style={[styles.timestamp, isUser ? styles.userTimestamp : styles.modelTimestamp]}>
          {formatTime(message.timestamp)}
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 3,
    paddingHorizontal: 4,
  },
  userContainer: {
    alignItems: "flex-end",
  },
  modelContainer: {
    alignItems: "flex-start",
  },
  bubble: {
    maxWidth: "85%",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  userBubble: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 6,
  },
  modelBubble: {
    backgroundColor: colors.lightPrimary,
    borderBottomLeftRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  text: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 4,
  },
  userText: {
    color: colors.white,
    fontWeight: "400",
  },
  modelText: {
    color: colors.textPrimary,
    fontWeight: "400",
  },
  timestamp: {
    fontSize: 11,
    fontWeight: "500",
  },
  userTimestamp: {
    color: colors.white,
    opacity: 0.8,
    textAlign: "right",
  },
  modelTimestamp: {
    color: colors.textSecondary,
    textAlign: "left",
  },
})

export default MessageBubble
