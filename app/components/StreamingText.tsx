"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { View, Text, StyleSheet } from "react-native"
import { colors } from "../utils/colors"

interface StreamingTextProps {
  text: string
}

const StreamingText: React.FC<StreamingTextProps> = ({ text }) => {
  const [displayedText, setDisplayedText] = useState("")
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayedText((prev) => prev + text[currentIndex])
        setCurrentIndex((prev) => prev + 1)
      }, 20)

      return () => clearTimeout(timer)
    }
  }, [text, currentIndex])

  useEffect(() => {
    setDisplayedText("")
    setCurrentIndex(0)
  }, [text])

  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        {displayedText}
        <Text style={styles.cursor}>|</Text>
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignSelf: "flex-start",
    backgroundColor: colors.lightPrimary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 18,
    marginVertical: 4,
    maxWidth: "85%",
    borderWidth: 1,
    borderColor: colors.border,
  },
  text: {
    color: colors.textPrimary,
    fontSize: 16,
    lineHeight: 22,
  },
  cursor: {
    opacity: 0.7,
    fontWeight: "bold",
    color: colors.primary,
  },
})

export default StreamingText
