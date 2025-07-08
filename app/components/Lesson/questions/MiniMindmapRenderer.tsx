"use client"

import { View, Text, StyleSheet } from "react-native"

interface MiniMindmapRendererProps {
  question: any
  showAnswer: boolean
  onAnswer: (isCorrect: boolean) => void
}

export function MiniMindmapRenderer({ question }: MiniMindmapRendererProps) {
  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.icon}>🧠</Text>
        <Text style={styles.title}>Mind Map</Text>
      </View>

      <View style={styles.centralContainer}>
        <View style={styles.centralConcept}>
          <Text style={styles.centralText}>{question.central_concept}</Text>
        </View>
      </View>

      <View style={styles.nodesContainer}>
        {question.nodes.map((node: any, index: number) => (
          <View key={index} style={styles.nodeItem}>
            <Text style={styles.nodeTitle}>{node.label}</Text>
            <View style={styles.childrenContainer}>
              {node.children?.map((child: any, childIndex: number) => (
                <View key={childIndex} style={styles.childItem}>
                  <View style={styles.bullet} />
                  <Text style={styles.childText}>{child.label}</Text>
                </View>
              ))}
            </View>
          </View>
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  icon: {
    fontSize: 32,
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1E293B",
  },
  centralContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  centralConcept: {
    backgroundColor: "#EFF6FF",
    borderWidth: 2,
    borderColor: "#3B82F6",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  centralText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1E40AF",
    textAlign: "center",
  },
  nodesContainer: {
    gap: 16,
  },
  nodeItem: {
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    borderRadius: 12,
    padding: 16,
  },
  nodeTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E40AF",
    marginBottom: 12,
  },
  childrenContainer: {
    gap: 8,
  },
  childItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  bullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#60A5FA",
  },
  childText: {
    fontSize: 14,
    color: "#1E40AF",
    flex: 1,
  },
})
