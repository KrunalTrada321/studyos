"use client"
import { Ionicons, MaterialIcons } from "@expo/vector-icons"
import { useFocusEffect, useNavigation } from "expo-router"
import { useCallback, useEffect, useState } from "react"
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native"
import { Calendar } from "react-native-calendars"
import { colors } from "../utils/colors"
import Constants from "../utils/constants"
import { getToken } from "../utils/token"

// Type definitions
interface DueDateObject {
  year: number
  month: number
  day: number
}

interface Todo {
  id: string
  title: string
  description?: string
  dueDate?: DueDateObject | number | null // Updated to accept number (timestamp)
  completed: boolean
  workType: "ASSIGNMENT" | "SHORT_ANSWER_QUESTION" | string
  subject: string
  maxPoints?: number
}

interface GroupedTodos {
  completed: Todo[]
  overdue: Todo[]
  today: Todo[]
  upcoming: Todo[]
  noDueDate: Todo[]
}

type TabType = "todo" | "calendar" | "plans"

export default function ToDoScreen() {
  const [tab, setTab] = useState<TabType>("todo")
  const [todos, setTodos] = useState<Todo[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [refreshing, setRefreshing] = useState<boolean>(false)
  const [markingComplete, setMarkingComplete] = useState<Record<string, boolean>>({})
  const [selectedDate, setSelectedDate] = useState<string>("")
  const navigation = useNavigation()

  // Fetch todos from API
  const fetchTodos = async (): Promise<void> => {
    try {
      const authToken = await getToken()
      const response = await fetch(`${Constants.api}/api/todo`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      })
      const data = await response.json()
      if (response.ok) {
        setTodos(data)
      } else {
        throw new Error(data.message || "Failed to fetch todos")
      }
    } catch (error) {
      console.error("Error fetching todos:", error)
      Alert.alert("Error", "Failed to load todos. Please try again.")
      setTodos([])
    }
  }

  // Mark todo as complete
  const markTodoComplete = async (todoId: string): Promise<void> => {
    setMarkingComplete((prev) => ({ ...prev, [todoId]: true }))
    try {
      const authToken = await getToken()
      const response = await fetch(`${Constants.api}/api/todo/mark?id=${todoId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      })
      if (response.ok) {
        // Update local state
        setTodos((prev) => prev.map((todo) => (todo.id === todoId ? { ...todo, completed: true } : todo)))
      } else {
        throw new Error("Failed to mark todo as complete")
      }
    } catch (error) {
      console.error("Error marking todo complete:", error)
      Alert.alert("Error", "Failed to mark todo as complete. Please try again.")
    } finally {
      setMarkingComplete((prev) => ({ ...prev, [todoId]: false }))
    }
  }

  // Helper function to get a Date object from DueDateObject or number
  const getDateFromDueDate = (dueDate?: DueDateObject | number | null): Date | null => {
    if (!dueDate) return null
    if (typeof dueDate === "number") {
      // Assuming the number is a Unix timestamp in seconds, convert to milliseconds
      return new Date(dueDate * 1000)
    } else {
      return new Date(dueDate.year, dueDate.month - 1, dueDate.day)
    }
  }

  // Format date for display
  const formatDate = (dueDate?: DueDateObject | number | null): string => {
    const date = getDateFromDueDate(dueDate)
    if (!date) return "No due date"

    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate())
    const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const tomorrowOnly = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate())

    if (dateOnly.getTime() === todayOnly.getTime()) {
      return "Today"
    } else if (dateOnly.getTime() === tomorrowOnly.getTime()) {
      return "Tomorrow"
    } else if (dateOnly < todayOnly) {
      return "Overdue"
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: date.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
      })
    }
  }

  // Check if todo is overdue
  const isOverdue = (dueDate?: DueDateObject | number | null): boolean => {
    const date = getDateFromDueDate(dueDate)
    if (!date) return false

    const today = new Date()
    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate())
    const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate())

    return dateOnly < todayOnly
  }

  // Get work type icon
  const getWorkTypeIcon = (workType: string): string => {
    switch (workType) {
      case "ASSIGNMENT":
        return "assignment"
      case "SHORT_ANSWER_QUESTION":
        return "quiz"
      default:
        return "work"
    }
  }

  // Get work type color
  const getWorkTypeColor = (workType: string): string => {
    switch (workType) {
      case "ASSIGNMENT":
        return "#3B82F6"
      case "SHORT_ANSWER_QUESTION":
        return "#10B981"
      default:
        return "#6B7280"
    }
  }

  // Get subject color
  const getSubjectColor = (subject: string): string => {
    const subjectColors: Record<string, string> = {
      English: "#EF4444",
      Math: "#3B82F6",
      Science: "#10B981",
      Physics: "#8B5CF6",
      Chemistry: "#F59E0B",
      Biology: "#06B6D4",
      History: "#EC4899",
      Geography: "#84CC16",
    }
    return subjectColors[subject] || "#6B7280"
  }

  // Group todos by status
  const groupTodos = (): GroupedTodos => {
    const completed = todos.filter((todo) => todo.completed)
    const overdue = todos.filter((todo) => !todo.completed && isOverdue(todo.dueDate))
    const noDueDate = todos.filter((todo) => !todo.completed && !todo.dueDate)

    const today = todos.filter((todo) => {
      if (todo.completed || !todo.dueDate) return false
      const date = getDateFromDueDate(todo.dueDate)
      if (!date) return false

      const todayDate = new Date()
      const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate())
      const todayOnly = new Date(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate())
      return dateOnly.getTime() === todayOnly.getTime()
    })

    const upcoming = todos.filter((todo) => {
      if (todo.completed || !todo.dueDate) return false
      const date = getDateFromDueDate(todo.dueDate)
      if (!date) return false

      const todayDate = new Date()
      const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate())
      const todayOnly = new Date(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate())
      return dateOnly.getTime() > todayOnly.getTime()
    })

    return { completed, overdue, today, upcoming, noDueDate }
  }

  // Refresh handler
  const onRefresh = useCallback(async (): Promise<void> => {
    setRefreshing(true)
    await fetchTodos()
    setRefreshing(false)
  }, [])

  // Initial load
  useEffect(() => {
    const initialLoad = async (): Promise<void> => {
      setLoading(true)
      await fetchTodos()
      setLoading(false)
    }
    initialLoad()
  }, [])

  // Refresh when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      onRefresh()
    }, [onRefresh]),
  )

  // Render todo card
  const renderTodoCard = (todo: Todo) => (
    <View key={todo.id} style={styles.todoCard}>
      <View style={styles.todoContent}>
        <View style={styles.todoHeader}>
          <View style={styles.todoIconContainer}>
            <MaterialIcons
              name={getWorkTypeIcon(todo.workType) as any}
              size={20}
              color={getWorkTypeColor(todo.workType)}
            />
          </View>
          <View style={styles.todoInfo}>
            <Text style={styles.todoTitle} numberOfLines={2}>
              {todo.title}
            </Text>
            {todo.description && (
              <Text style={styles.todoDescription} numberOfLines={2}>
                {todo.description}
              </Text>
            )}
            <View style={styles.todoMeta}>
              <View style={[styles.subjectBadge, { backgroundColor: getSubjectColor(todo.subject) }]}>
                <Text style={styles.subjectText}>{todo.subject}</Text>
              </View>
              <View style={styles.dueDateContainer}>
                <MaterialIcons name="schedule" size={14} color="#6B7280" />
                <Text style={[styles.dueDate, isOverdue(todo.dueDate) && !todo.completed && styles.overdueDueDate]}>
                  {formatDate(todo.dueDate)}
                </Text>
              </View>
              {todo.maxPoints && (
                <View style={styles.pointsContainer}>
                  <MaterialIcons name="star" size={14} color="#F59E0B" />
                  <Text style={styles.pointsText}>{todo.maxPoints}pt</Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </View>
      {!todo.completed && (
        <TouchableOpacity
          style={styles.completeButton}
          onPress={() => markTodoComplete(todo.id)}
          disabled={markingComplete[todo.id]}
        >
          {markingComplete[todo.id] ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ionicons name="checkmark" size={20} color="#fff" />
          )}
        </TouchableOpacity>
      )}
      {todo.completed && (
        <View style={styles.completedBadge}>
          <Ionicons name="checkmark-circle" size={24} color="#10B981" />
        </View>
      )}
    </View>
  )

  // Render section
  const renderSection = (title: string, todos: Todo[], icon: string, emptyMessage: string) => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <MaterialIcons name={icon as any} size={20} color="#374151" />
        <Text style={styles.sectionTitle}>{title}</Text>
        <View style={styles.sectionCount}>
          <Text style={styles.sectionCountText}>{todos.length}</Text>
        </View>
      </View>
      {todos.length === 0 ? (
        <View style={styles.emptySection}>
          <Text style={styles.emptySectionText}>{emptyMessage}</Text>
        </View>
      ) : (
        todos.map(renderTodoCard)
      )}
    </View>
  )

  // ToDo Tab Component
  const ToDoTab = () => {
    const { completed, overdue, today, upcoming, noDueDate } = groupTodos()
    return (
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
      >
        {loading ? (
          <View style={styles.loadingState}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Loading todos...</Text>
          </View>
        ) : (
          <>
            {renderSection("Today", today, "today", "No tasks for today")}
            {renderSection("Overdue", overdue, "warning", "No overdue tasks")}
            {renderSection("Upcoming", upcoming, "schedule", "No upcoming tasks")}
            {renderSection("No Due Date", noDueDate, "event-note", "No tasks without due dates")}
            {renderSection("Completed", completed, "check-circle", "No completed tasks")}
          </>
        )}
      </ScrollView>
    )
  }

  // Calendar Tab Component
  const CalendarTab = () => {
    const getMarkedDates = () => {
      const marked: Record<string, any> = {}
      // Mark selected date
      if (selectedDate) {
        marked[selectedDate] = {
          selected: true,
          selectedColor: colors.primary,
        }
      }
      // Mark dates with todos (only for todos that have due dates)
      todos.forEach((todo) => {
        if (todo.dueDate) {
          const date = getDateFromDueDate(todo.dueDate)
          if (date) {
            const dateString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
              date.getDate(),
            ).padStart(2, "0")}`
            if (marked[dateString]) {
              marked[dateString] = {
                ...marked[dateString],
                marked: true,
                dotColor: todo.completed ? "#10B981" : "#EF4444",
              }
            } else {
              marked[dateString] = {
                marked: true,
                dotColor: todo.completed ? "#10B981" : "#EF4444",
              }
            }
          }
        }
      })
      return marked
    }

    const getSelectedDateTodos = (): Todo[] => {
      if (!selectedDate) return []
      const [year, month, day] = selectedDate.split("-").map(Number)
      return todos.filter((todo) => {
        const todoDate = getDateFromDueDate(todo.dueDate)
        if (!todoDate) return false
        return (
          todoDate.getFullYear() === year &&
          todoDate.getMonth() + 1 === month && // Month is 0-indexed for Date object
          todoDate.getDate() === day
        )
      })
    }

    const selectedDateTodos = getSelectedDateTodos()

    return (
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
      >
        <View style={styles.calendarContainer}>
          <Calendar
            current={new Date().toISOString().split("T")[0]}
            onDayPress={(day) => setSelectedDate(day.dateString)}
            markedDates={getMarkedDates()}
            theme={{
              todayTextColor: colors.primary,
              arrowColor: colors.primary,
              selectedDayBackgroundColor: colors.primary,
              selectedDayTextColor: "#fff",
              monthTextColor: "#1F2937",
              textDayFontWeight: "500",
              textMonthFontWeight: "600",
              textDayHeaderFontWeight: "500",
              textDayFontSize: 16,
              textMonthFontSize: 18,
              textDayHeaderFontSize: 14,
            }}
          />
          {selectedDate && (
            <View style={styles.selectedDateContainer}>
              <Text style={styles.selectedDateTitle}>
                {"Tasks for "}
                {new Date(selectedDate).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </Text>
              {selectedDateTodos.length === 0 ? (
                <View style={styles.emptySection}>
                  <Text style={styles.emptySectionText}>No tasks for this date</Text>
                </View>
              ) : (
                selectedDateTodos.map(renderTodoCard)
              )}
            </View>
          )}
        </View>
      </ScrollView>
    )
  }

  // Plans Tab Component (Study Plans - using existing structure)
  const PlansTab = () => (
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
    >
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <MaterialIcons name="book" size={20} color="#374151" />
          <Text style={styles.sectionTitle}>Study Plans</Text>
        </View>
        <View style={styles.planCard}>
          <View style={styles.priorityBadge}>
            <Text style={styles.priorityText}>High</Text>
          </View>
          <Text style={styles.planTitle}>Final Exam Preparation</Text>
          <Text style={styles.planDescription}>
            {"Comprehensive review of mechanics, thermodynamics, and electromagnetism"}
          </Text>
          <View style={styles.planMeta}>
            <View style={[styles.subjectBadge, { backgroundColor: "#8B5CF6" }]}>
              <Text style={styles.subjectText}>Physics</Text>
            </View>
            <View style={styles.dueDateContainer}>
              <MaterialIcons name="schedule" size={14} color="#6B7280" />
              <Text style={styles.dueDate}>May 29, 2025</Text>
            </View>
          </View>
          <View style={styles.progressContainer}>
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBar, { width: "25%" }]} />
            </View>
            <Text style={styles.progressText}>Progress: 25%</Text>
          </View>
          <TouchableOpacity style={styles.planButton}>
            <Text style={styles.planButtonText}>Continue</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.planCard}>
          <View style={[styles.priorityBadge, { backgroundColor: "#FF9B28" }]}>
            <Text style={styles.priorityText}>Medium</Text>
          </View>
          <Text style={styles.planTitle}>Midterm Review</Text>
          <Text style={styles.planDescription}>Review of derivatives, integrals, and applications</Text>
          <View style={styles.planMeta}>
            <View style={[styles.subjectBadge, { backgroundColor: "#3B82F6" }]}>
              <Text style={styles.subjectText}>Calculus</Text>
            </View>
            <View style={styles.dueDateContainer}>
              <MaterialIcons name="schedule" size={14} color="#6B7280" />
              <Text style={styles.dueDate}>May 20, 2025</Text>
            </View>
          </View>
          <View style={styles.progressContainer}>
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBar, { width: "25%" }]} />
            </View>
            <Text style={styles.progressText}>Progress: 25%</Text>
          </View>
          <TouchableOpacity style={styles.planButton}>
            <Text style={styles.planButtonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  )

  const renderTab = () => {
    switch (tab) {
      case "todo":
        return <ToDoTab />
      case "calendar":
        return <CalendarTab />
      case "plans":
        return <PlansTab />
      default:
        return null
    }
  }

  return (
    <View style={styles.container}>
      {/* Enhanced Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity style={[styles.tab, tab === "todo" && styles.activeTab]} onPress={() => setTab("todo")}>
          <MaterialIcons name="checklist" size={20} color={tab === "todo" ? "#fff" : "#6B7280"} />
          <Text style={[styles.tabText, tab === "todo" && styles.activeTabText]}>To-Do</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tab === "calendar" && styles.activeTab]}
          onPress={() => setTab("calendar")}
        >
          <MaterialIcons name="calendar-today" size={20} color={tab === "calendar" ? "#fff" : "#6B7280"} />
          <Text style={[styles.tabText, tab === "calendar" && styles.activeTabText]}>Calendar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, tab === "plans" && styles.activeTab]} onPress={() => setTab("plans")}>
          <MaterialIcons name="book" size={20} color={tab === "plans" ? "#fff" : "#6B7280"} />
          <Text style={[styles.tabText, tab === "plans" && styles.activeTabText]}>Plans</Text>
        </TouchableOpacity>
      </View>
      {renderTab()}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
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
  loadingState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 16,
    color: "#6B7280",
    marginTop: 12,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
    flex: 1,
  },
  sectionCount: {
    backgroundColor: "#E5E7EB",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  sectionCountText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6B7280",
  },
  emptySection: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 32,
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 8,
  },
  emptySectionText: {
    fontSize: 16,
    color: "#9CA3AF",
    textAlign: "center",
  },
  todoCard: {
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
  todoContent: {
    flex: 1,
  },
  todoHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  todoIconContainer: {
    marginRight: 12,
    marginTop: 2,
  },
  todoInfo: {
    flex: 1,
  },
  todoTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
    lineHeight: 22,
  },
  todoDescription: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 8,
    lineHeight: 20,
  },
  todoMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flexWrap: "wrap",
  },
  subjectBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  subjectText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#fff",
  },
  dueDateContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  dueDate: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
  },
  overdueDueDate: {
    color: "#EF4444",
    fontWeight: "600",
  },
  pointsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  pointsText: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
  },
  completeButton: {
    backgroundColor: colors.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  completedBadge: {
    alignItems: "center",
    justifyContent: "center",
  },
  calendarContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  selectedDateContainer: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  selectedDateTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 16,
  },
  planCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  priorityBadge: {
    position: "absolute",
    top: 16,
    right: 16,
    backgroundColor: "#FF5C5C",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  priorityText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  planTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 8,
    paddingRight: 60,
  },
  planDescription: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 16,
    lineHeight: 20,
  },
  planMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: "#E5E7EB",
    borderRadius: 4,
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
  },
  planButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  planButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
})
