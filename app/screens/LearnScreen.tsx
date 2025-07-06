import {
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { colors } from "../utils/colors";
import Constants from "../utils/constants";
import { getToken } from "../utils/token"; // Adjust path as needed

const subjects = [
  { id: "1", name: "Math", lessons: 4, image: require("../assets/math.png") },
  {
    id: "2",
    name: "Health",
    lessons: 2,
    image: require("../assets/health.png"),
  },
  {
    id: "3",
    name: "French",
    lessons: 10,
    image: require("../assets/french.png"),
  },
  {
    id: "4",
    name: "Science",
    lessons: 4,
    image: require("../assets/science.png"),
  },
  {
    id: "5",
    name: "Physics",
    lessons: 4,
    image: require("../assets/physics.png"),
  },
  {
    id: "6",
    name: "English",
    lessons: 8,
    image: require("../assets/english.png"),
  },
];

export default function LearnScreen() {
  const [tab, setTab] = useState("Plan");
  const [lessons, setLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLessons = async () => {
      setLoading(true);
      try {
        const token = await getToken();
        const res = await fetch(`${Constants.api}/api/lessons`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setLessons(data);
      } catch (e) {
        setLessons([]);
      }
      setLoading(false);
    };
    fetchLessons();
  }, []);

  return (
    <View style={styles.container}>
      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, tab === "Plan" && styles.activeTab]}
          onPress={() => setTab("Plan")}
        >
          <Text
            style={[styles.tabText, tab === "Plan" && styles.activeTabText]}
          >
            Plan
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tab === "Subjects" && styles.activeTab]}
          onPress={() => setTab("Subjects")}
        >
          <Text
            style={[styles.tabText, tab === "Subjects" && styles.activeTabText]}
          >
            All Subjects
          </Text>
        </TouchableOpacity>
      </View>

      {/* Header Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <MaterialIcons name="favorite" size={18} color="red" />
          <Text style={styles.statText}>5</Text>
        </View>

        <View
          style={{
            backgroundColor: colors.lightPrimary,
            justifyContent: "center",
            paddingHorizontal: 8,
            borderRadius: 6,
          }}
        >
          <Text style={styles.streakText}>Streak: 3 Days</Text>
        </View>
      </View>

      {tab === "Plan" ? (
        <ScrollView style={{ flex: 1 }}>
          <Text style={styles.sectionTitle}>Today</Text>
          {loading ? (
            <View style={{ alignItems: "center", marginTop: 20 }}>
              <MaterialCommunityIcons
                name="loading"
                size={32}
                color={colors.primary}
                style={{ marginBottom: 8 }}
              />
              <Text>Loading...</Text>
            </View>
          ) : lessons.length === 0 ? (
            <Text style={{ textAlign: "center", marginTop: 20 }}>
              No lessons found.
            </Text>
          ) : (
            lessons.map((lesson) => (
              <View key={lesson.id} style={styles.lessonCard}>
                <View style={{ flex: 1 }}>
                  <View style={styles.lessonHeader}>
                    {lesson.completed ? (
                      <Ionicons
                        name="checkmark-circle"
                        size={20}
                        color="green"
                      />
                    ) : (
                      <MaterialCommunityIcons
                        name="book-open-outline"
                        size={20}
                        color={colors.primary}
                      />
                    )}
                    <Text
                      style={styles.lessonTitle}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {lesson.title}
                    </Text>
                  </View>
                  <Text style={styles.metaText}>
                    📄 {lesson.questions} Questions 📝 {lesson.explanations}{" "}
                    Explanations
                  </Text>
                </View>
                {!lesson.completed && (
                  <TouchableOpacity style={styles.startButton}>
                    <Text style={styles.startButtonText}>Start</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))
          )}
        </ScrollView>
      ) : (
        <ScrollView style={styles.subjectsContainer}>
          <View style={styles.grid}>
            {subjects.map((subject) => (
              <View key={subject.id} style={styles.subjectCard}>
                <Image source={subject.image} style={styles.subjectImage} />
                <Text style={styles.subjectTitle}>{subject.name}</Text>
                <Text style={styles.subjectSubtitle}>
                  {subject.lessons} Lessons
                </Text>
              </View>
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 20,
    paddingHorizontal: 10,
  },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 15,
  },
  tab: {
    flex: 1,
    backgroundColor: "#D3D3D3",
    paddingVertical: 14,
    marginHorizontal: 5,
    borderRadius: 10,
    alignItems: "center",
    elevation: 2,
  },
  activeTab: {
    backgroundColor: colors.primary,
  },
  tabText: {
    color: "#666",
    fontWeight: "500",
  },
  activeTabText: {
    color: "#fff",
    fontWeight: "bold",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginHorizontal: 10,
    marginBottom: 10,
  },
  statBox: {
    flexDirection: "row",
    backgroundColor: colors.lightRed,
    paddingHorizontal: 8,
    borderRadius: 6,
    marginRight: 5,
    paddingVertical: 2,
    alignItems: "center",
    gap: 3,
  },
  statText: {
    fontWeight: "bold",
    color: "#444",
  },
  streakText: {
    color: "#4B55C1",
    fontWeight: "500",
  },
  sectionTitle: {
    fontSize: 16,
    marginTop: 4,
    fontWeight: "400",
    marginLeft: 10,
    textAlign: "center",
    marginBottom: 8,
  },
  lessonCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginHorizontal: 10,
    marginBottom: 10,
    elevation: 3,
    flexDirection: "row",
    alignItems: "center",
  },
  lessonHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  lessonTitle: {
    fontWeight: "bold",
    fontSize: 14,
    flexShrink: 1,
  },
  lessonDesc: {
    color: "#555",
    fontSize: 13,
  },
  metaText: {
    fontSize: 12,
    color: "#777",
    marginTop: 3,
  },
  subjectImage: {
    width: 50,
    height: 50,
    resizeMode: "contain",
    marginBottom: 8,
  },

  startButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 10,
    marginLeft: 10,
    elevation: 2,
  },
  startButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  subjectsContainer: {
    flex: 1,
    paddingHorizontal: 10,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  subjectCard: {
    width: "47%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    marginBottom: 15,
    alignItems: "center",
    elevation: 2,
  },
  subjectTitle: {
    marginTop: 8,
    fontWeight: "600",
  },
  subjectSubtitle: {
    fontSize: 13,
    color: "#666",
  },
});
