import colors from "@/app/utils/colors"
import { View, StyleSheet } from "react-native"

interface ProgressBarProps {
  progress: number // 0-100
}

export function ProgressBar({ progress }: ProgressBarProps) {
  return (
    <View style={styles.container}>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${Math.min(100, Math.max(0, progress))}%` }]} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  track: {
    height: 4,
    backgroundColor: "#F0F0F0",
    borderRadius: 2,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
})
