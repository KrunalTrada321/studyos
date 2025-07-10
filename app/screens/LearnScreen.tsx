import {
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { colors } from "../utils/colors";
import Constants from "../utils/constants";
import { getToken } from "../utils/token";

export default function LearnScreen() {
  const [tab, setTab] = useState("Quiz");
  const [lessons, setLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [subjectsLoading, setSubjectsLoading] = useState(true);
  const [subjectsRefreshing, setSubjectsRefreshing] = useState(false);
  const navigation = useNavigation();

  const ITEMS_PER_PAGE = 10;

  const fetchSubjects = async () => {
    try {
      const authToken = await getToken();
      const response = await fetch(`${Constants.api}/api/subjects`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      
      if (response.ok) {
        setSubjects(data);
      } else {
        throw new Error(data.message || "Failed to fetch subjects");
      }
    } catch (error) {
      console.error("Error fetching subjects:", error);
      Alert.alert("Error", "Failed to load subjects. Please try again.");
      setSubjects([]);
    }
  };

  const formatDate = (dateString: string | null): string | null => {
    if (!dateString) return null;

    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Reset time to compare just dates
    const dateOnly = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );
    const todayOnly = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    const yesterdayOnly = new Date(
      yesterday.getFullYear(),
      yesterday.getMonth(),
      yesterday.getDate()
    );

    if (dateOnly.getTime() === todayOnly.getTime()) {
      return "Today";
    } else if (dateOnly.getTime() === yesterdayOnly.getTime()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year:
          date.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
      });
    }
  };

  // Group lessons by date
  const groupLessonsByDate = (lessons: any[]) => {
    const grouped = {};

    lessons.forEach((lesson) => {
      const dateKey = formatDate(lesson.created_at) || "No Date";
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(lesson);
    });

    // Sort groups by date (most recent first)
    const sortedGroups = Object.keys(grouped).sort((a, b) => {
      if (a === "Today") return -1;
      if (b === "Today") return 1;
      if (a === "Yesterday") return -1;
      if (b === "Yesterday") return 1;
      if (a === "No Date") return 1;
      if (b === "No Date") return -1;
      return new Date(b) - new Date(a);
    });

    return sortedGroups.map((date) => ({
      date,
      lessons: grouped[date],
    }));
  };

  const fetchLessons = async (pageNum = 1, append = false) => {
    try {
      const token = await getToken();
      const res = await fetch(
        `${Constants.api}/api/lessons?page=${pageNum}&limit=${ITEMS_PER_PAGE}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();

      if (res.ok) {
        const newLessons = Array.isArray(data) ? data : data.lessons || [];

        if (append) {
          setLessons((prev) => [...prev, ...newLessons]);
        } else {
          setLessons(newLessons);
        }

        // Check if there are more items
        setHasMore(newLessons.length === ITEMS_PER_PAGE);
      } else {
        throw new Error(data.message || "Failed to fetch lessons");
      }
    } catch (error) {
      console.error("Error fetching lessons:", error);
      if (!append) {
        setLessons([]);
      }
      Alert.alert("Error", "Failed to load lessons. Please try again.");
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setPage(1);
    setHasMore(true);
    await fetchLessons(1, false);
    setRefreshing(false);
  }, []);

  const onSubjectsRefresh = useCallback(async () => {
    setSubjectsRefreshing(true);
    await fetchSubjects();
    setSubjectsRefreshing(false);
  }, []);

  const loadMoreLessons = async () => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);
    const nextPage = page + 1;
    setPage(nextPage);
    await fetchLessons(nextPage, true);
    setLoadingMore(false);
  };

  const handleScroll = ({ nativeEvent }: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
    const paddingToBottom = 20;

    if (
      layoutMeasurement.height + contentOffset.y >=
      contentSize.height - paddingToBottom
    ) {
      loadMoreLessons();
    }
  };

  // Initial load
  useEffect(() => {
    const initialLoad = async () => {
      setLoading(true);
      await fetchLessons(1, false);
      setLoading(false);
    };
    initialLoad();
  }, []);

  // Initial subjects load
  useEffect(() => {
    const initialSubjectsLoad = async () => {
      setSubjectsLoading(true);
      await fetchSubjects();
      setSubjectsLoading(false);
    };
    initialSubjectsLoad();
  }, []);

  // Refresh when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      onRefresh();
      onSubjectsRefresh();
    }, [onRefresh, onSubjectsRefresh])
  );

  const renderLessonCard = (lesson: any) => (
    <View key={lesson.id} style={styles.lessonCard}>
      <View style={styles.lessonContent}>
        <View style={styles.lessonHeader}>
          {lesson.completed ? (
            <View style={styles.completedBadge}>
              <Ionicons name="checkmark-circle" size={20} color="#10B981" />
            </View>
          ) : (
            <View style={styles.incompleteBadge}>
              <MaterialCommunityIcons
                name="book-open-outline"
                size={20}
                color={colors.primary}
              />
            </View>
          )}
          <Text style={styles.lessonTitle} numberOfLines={2}>
            {lesson.title}
          </Text>
        </View>

        <View style={styles.lessonMeta}>
          <View style={styles.metaItem}>
            <MaterialIcons name="quiz" size={16} color="#6B7280" />
            <Text style={styles.metaText}>
              {lesson.questions || 0} Questions
            </Text>
          </View>
          {lesson.explanations && (
            <View style={styles.metaItem}>
              <MaterialIcons name="description" size={16} color="#6B7280" />
              <Text style={styles.metaText}>
                {lesson.explanations} Explanations
              </Text>
            </View>
          )}
        </View>
      </View>

      {!lesson.completed && (
        <TouchableOpacity
          style={styles.startButton}
          onPress={() =>
            navigation.navigate("LessonStart", {
              lessonId: lesson.id,
              totalQuestions: lesson.questions,
            })
          }
        >
          <Text style={styles.startButtonText}>Start</Text>
          <Ionicons name="play" size={16} color="#fff" />
        </TouchableOpacity>
      )}

      {lesson.completed && (
        <View style={styles.completedLabel}>
          <Text style={styles.completedText}>Completed</Text>
        </View>
      )}
    </View>
  );

  const renderDateGroup = (group: any) => (
    <View key={group.date} style={styles.dateGroup}>
      <View style={styles.dateHeader}>
        <Text style={styles.dateTitle}>{group.date}</Text>
        <View style={styles.dateLine} />
      </View>
      {group.lessons.map(renderLessonCard)}
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <MaterialCommunityIcons
        name="book-open-page-variant"
        size={64}
        color="#D1D5DB"
      />
      <Text style={styles.emptyTitle}>No lessons available</Text>
      <Text style={styles.emptySubtitle}>
        Check back later for new learning content
      </Text>
    </View>
  );

  const renderSubjectsEmptyState = () => (
    <View style={styles.emptyState}>
      <MaterialIcons name="school" size={64} color="#D1D5DB" />
      <Text style={styles.emptyTitle}>No subjects available</Text>
      <Text style={styles.emptySubtitle}>
        Check back later for new subjects
      </Text>
    </View>
  );

  const renderLoadingState = () => (
    <View style={styles.loadingState}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={styles.loadingText}>Loading lessons...</Text>
    </View>
  );

  const renderSubjectsLoadingState = () => (
    <View style={styles.loadingState}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={styles.loadingText}>Loading subjects...</Text>
    </View>
  );

  const groupedLessons = groupLessonsByDate(lessons);

  return (
    <View style={styles.container}>
      {/* Enhanced Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, tab === "Quiz" && styles.activeTab]}
          onPress={() => setTab("Quiz")}
        >
          <MaterialIcons
            name="quiz"
            size={20}
            color={tab === "Quiz" ? "#fff" : "#6B7280"}
          />
          <Text
            style={[styles.tabText, tab === "Quiz" && styles.activeTabText]}
          >
            Quiz
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tab === "Subjects" && styles.activeTab]}
          onPress={() => setTab("Subjects")}
        >
          <MaterialIcons
            name="school"
            size={20}
            color={tab === "Subjects" ? "#fff" : "#6B7280"}
          />
          <Text
            style={[styles.tabText, tab === "Subjects" && styles.activeTabText]}
          >
            All Subjects
          </Text>
        </TouchableOpacity>
      </View>

      {tab === "Quiz" ? (
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          {loading ? (
            renderLoadingState()
          ) : lessons.length === 0 ? (
            renderEmptyState()
          ) : (
            <>
              {groupedLessons.map(renderDateGroup)}
              {loadingMore && (
                <View style={styles.loadMoreContainer}>
                  <ActivityIndicator size="small" color={colors.primary} />
                  <Text style={styles.loadMoreText}>Loading more...</Text>
                </View>
              )}
            </>
          )}
        </ScrollView>
      ) : (
        <ScrollView
          style={styles.subjectsContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={subjectsRefreshing}
              onRefresh={onSubjectsRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
        >
          {subjectsLoading ? (
            renderSubjectsLoadingState()
          ) : subjects.length === 0 ? (
            renderSubjectsEmptyState()
          ) : (
            <View style={styles.grid}>
              {subjects.map((subject) => (
                <TouchableOpacity key={subject.id} style={styles.subjectCard}>
                  <Image source={require("../assets/subject.png")} style={styles.subjectImage} />
                  <Text style={styles.subjectTitle}>{subject.name}</Text>
                  <Text style={styles.subjectSubtitle}>
                    {subject.lessons} Lessons
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1F2937",
  },
  headerStats: {
    flexDirection: "row",
    gap: 8,
  },
  statBox: {
    flexDirection: "row",
    backgroundColor: "#FEF2F2",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignItems: "center",
    gap: 4,
  },
  statText: {
    fontWeight: "600",
    color: "#DC2626",
    fontSize: 14,
  },
  streakBox: {
    flexDirection: "row",
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignItems: "center",
    gap: 4,
  },
  streakText: {
    color: "#D97706",
    fontWeight: "600",
    fontSize: 14,
  },
  tabContainer: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: "#E8E8E8",
    borderRadius: 12,
    padding: 4,
    marginTop: 20,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "transparent",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  activeTab: {
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  tabText: {
    color: "#6B7280",
    fontWeight: "600",
    fontSize: 14,
  },
  activeTabText: {
    color: "#fff",
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  dateGroup: {
    marginBottom: 24,
  },
  dateHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    marginTop: 8,
  },
  dateTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginRight: 12,
  },
  dateLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E5E7EB",
  },
  lessonCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  lessonContent: {
    flex: 1,
  },
  lessonHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  completedBadge: {
    marginRight: 8,
    marginTop: 2,
  },
  incompleteBadge: {
    marginRight: 8,
    marginTop: 2,
  },
  lessonTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    flex: 1,
    lineHeight: 22,
  },
  lessonMeta: {
    flexDirection: "row",
    gap: 16,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
  },
  startButton: {
    backgroundColor: colors.primary,
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    gap: 6,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  startButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  completedLabel: {
    backgroundColor: "#ECFDF5",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#10B981",
  },
  completedText: {
    color: "#10B981",
    fontWeight: "600",
    fontSize: 12,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#6B7280",
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#9CA3AF",
    marginTop: 8,
    textAlign: "center",
  },
  loadingState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: "#6B7280",
    marginTop: 12,
  },
  loadMoreContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
    gap: 8,
  },
  loadMoreText: {
    fontSize: 14,
    color: "#6B7280",
  },
  subjectsContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingTop: 8,
  },
  subjectCard: {
    width: "47%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  subjectImage: {
    width: 50,
    height: 50,
    resizeMode: "contain",
  },
  subjectTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginTop: 12,
  },
  subjectSubtitle: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
  },
});