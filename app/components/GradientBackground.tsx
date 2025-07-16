import type React from "react"
import { StyleSheet, View } from "react-native"
import { colors } from "../utils/colors"

interface GradientBackgroundProps {
  children: React.ReactNode
}

const GradientBackground: React.FC<GradientBackgroundProps> = ({ children }) => {
    return children
  return (
    <View style={styles.background}>
      <View style={styles.topLayer} />
      <View style={styles.middleLayer} />
      <View style={styles.bottomLayer} />
      <View style={styles.content}>
        {children}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    position: 'relative',
  },
  topLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '40%',
    backgroundColor: colors.white,
  },
  middleLayer: {
    position: 'absolute',
    top: '40%',
    left: 0,
    right: 0,
    height: '40%',
    backgroundColor: colors.background,
  },
  bottomLayer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '20%',
    backgroundColor: colors.lightPrimary,
  },
  content: {
    flex: 1,
    zIndex: 1,
  },
})

export default GradientBackground
