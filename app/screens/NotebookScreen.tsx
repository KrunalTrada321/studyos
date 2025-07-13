"use client";

import { FontAwesome, FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { colors } from "../utils/colors";
import Constants from "../utils/constants";
import { getToken } from "../utils/token";

const tabs = [
  { name: "Notes", icon: "book" },
  { name: "Mindmaps", icon: "account-tree" },
  { name: "Auto", icon: "auto-awesome" },
];

// API Configuration
const API_BASE_URL = `${Constants.api}/api`;

// API Functions
const fetchSubjects = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/subjects`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${await getToken()}`,
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      throw new Error("Failed to fetch subjects");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching subjects:", error);
    throw error;
  }
};

const fetchMindmaps = async (subject) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/mindmaps?subject=${encodeURIComponent(subject)}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${await getToken()}`,
          "Content-Type": "application/json",
        },
      }
    );
    if (!response.ok) {
      throw new Error("Failed to fetch mindmaps");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching mindmaps:", error);
    throw error;
  }
};

const fetchMindmapDetail = async (mindmapId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/mindmaps/${mindmapId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${await getToken()}`,
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      throw new Error("Failed to fetch mindmap detail");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching mindmap detail:", error);
    throw error;
  }
};

// Subject icon mapping
const getSubjectIcon = (subjectName) => {
  const iconMap = {
    English: { icon: "language", color: "#45B7D1", IconComponent: FontAwesome },
    Math: { icon: "calculator", color: "#4B4BFF", IconComponent: FontAwesome },
    Mathematics: {
      icon: "calculator",
      color: "#4B4BFF",
      IconComponent: FontAwesome,
    },
    Health: { icon: "heart", color: "#FF6B6B", IconComponent: FontAwesome },
    French: {
      icon: "balance-scale",
      color: "#4ECDC4",
      IconComponent: FontAwesome,
    },
    Theology: { icon: "flask", color: "#FF8E53", IconComponent: FontAwesome5 },
    Physics: { icon: "atom", color: "#007bff", IconComponent: FontAwesome5 },
    Chemistry: { icon: "flask", color: "#FF8E53", IconComponent: FontAwesome5 },
    Others: { icon: "book", color: "#9C27B0", IconComponent: FontAwesome },
  };
  return (
    iconMap[subjectName] || {
      icon: "book",
      color: "#666",
      IconComponent: FontAwesome,
    }
  );
};

const automationData = [
  {
    title: "Question about Assignment",
    date: "5/8/2024",
    status: "Draft",
    to: "professor@university.edu",
    subject: "Question about Physics Assignment",
    icon: "email",
    priority: "high",
  },
  {
    title: "Essay Outline: French Revolution",
    date: "5/8/2024",
    status: "Draft",
    subject: "French Revolution Essay Outline",
    icon: "note",
    priority: "medium",
  },
  {
    title: "Request for Extension",
    date: "5/8/2024",
    status: "Draft",
    to: "professor@university.edu",
    subject: "Request for Assignment Extension",
    icon: "email",
    priority: "high",
  },
];

// Helper function to flatten mindmap structure for display
const flattenMindmapNodes = (
  node,
  depth = 0,
  parentPath = "",
  isLastChild = true,
  parentConnectors = []
) => {
  // Ensure parentConnectors is always an array
  const safeParentConnectors = parentConnectors || [];
  const currentPath = parentPath ? `${parentPath} > ${node.title}` : node.title;
  const connectors = [...safeParentConnectors, isLastChild];

  const flattened = [
    {
      ...node,
      depth,
      path: currentPath,
      hasChildren: node.children && node.children.length > 0,
      nodeId: `${node.id || node.title}-${depth}`,
      isLastChild,
      connectors: connectors || [], // Ensure connectors is always an array
    },
  ];

  if (node.children && node.children.length > 0) {
    node.children.forEach((child, index) => {
      const isLast = index === node.children.length - 1;
      flattened.push(
        ...flattenMindmapNodes(
          child,
          depth + 1,
          currentPath,
          isLast,
          connectors
        )
      );
    });
  }

  return flattened;
};

const NotebookScreen = () => {
  const [activeTab, setActiveTab] = useState("Notes");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [mindmaps, setMindmaps] = useState([]);
  const [selectedMindmap, setSelectedMindmap] = useState(null);
  const [flattenedNodes, setFlattenedNodes] = useState([]);
  const [mindmapView, setMindmapView] = useState("subjects"); // 'subjects', 'mindmaps', 'detail'
  const navigation = useNavigation();

  // Load subjects on component mount
  useEffect(() => {
    if (activeTab === "Mindmaps") {
      loadSubjects();
    }
  }, [activeTab]);

  const loadSubjects = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    try {
      const subjectsData = await fetchSubjects();
      setSubjects(subjectsData);
    } catch (error) {
      Alert.alert("Error", "Failed to load subjects. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadMindmaps = async (subject, isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    try {
      const mindmapsData = await fetchMindmaps(subject.name);
      setMindmaps(mindmapsData);
      setSelectedSubject(subject);
      setMindmapView("mindmaps");
    } catch (error) {
      Alert.alert("Error", "Failed to load mindmaps. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadMindmapDetail = async (mindmap, isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    try {
      const mindmapDetail = await fetchMindmapDetail(mindmap.id);
      setSelectedMindmap(mindmapDetail);
      // Flatten the mindmap structure for display
      const flattened = flattenMindmapNodes(mindmapDetail);
      setFlattenedNodes(flattened);
      setMindmapView("detail");
    } catch (error) {
      Alert.alert("Error", "Failed to load mindmap detail. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleBackNavigation = () => {
    if (mindmapView === "detail") {
      setMindmapView("mindmaps");
      setSelectedMindmap(null);
      setFlattenedNodes([]);
    } else if (mindmapView === "mindmaps") {
      setMindmapView("subjects");
      setSelectedSubject(null);
      setMindmaps([]);
    }
  };

  const onRefresh = () => {
    if (mindmapView === "subjects") {
      loadSubjects(true);
    } else if (mindmapView === "mindmaps") {
      loadMindmaps(selectedSubject, true);
    } else if (mindmapView === "detail") {
      loadMindmapDetail(selectedMindmap, true);
    }
  };

  const renderTabButtons = () => {
    return (
      <View style={styles.tabContainer}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.name}
            style={[
              styles.tabButton,
              activeTab === tab.name && styles.activeTabButton,
            ]}
            onPress={() => {
              setActiveTab(tab.name);
              if (tab.name === "Mindmaps") {
                setMindmapView("subjects");
                setSelectedSubject(null);
                setSelectedMindmap(null);
                setFlattenedNodes([]);
              }
            }}
          >
            <MaterialIcons
              name={tab.icon}
              size={20}
              color={activeTab === tab.name ? "#fff" : "#666"}
              style={styles.tabIcon}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === tab.name && styles.activeTabText,
              ]}
            >
              {tab.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderNotesHeader = () => (
    <View style={styles.searchSection}>
      <View style={styles.searchContainer}>
        <MaterialIcons
          name="search"
          size={20}
          color="#666"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search your notes..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
      <TouchableOpacity style={styles.filterButton}>
        <MaterialIcons name="tune" size={20} color={colors.primary} />
      </TouchableOpacity>
    </View>
  );

  const renderNotesEmpty = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <MaterialIcons name="note-add" size={64} color="#E0E0E0" />
      </View>
      <Text style={styles.emptyTitle}>No notes yet</Text>
      <Text style={styles.emptySubtitle}>
        Start capturing your learning journey
      </Text>
      <View style={styles.actionButtons}>
        <TouchableOpacity onPress={() => navigation.navigate("Capture")} style={styles.primaryButton}>
          <MaterialIcons name="mic" size={20} color="#fff" />
          <Text style={styles.primaryButtonText}>Record Class</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("Capture")} style={styles.secondaryButton}>
          <MaterialIcons name="upload-file" size={20} color={colors.primary} />
          <Text style={styles.secondaryButtonText}>Upload File</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderNotesTab = () => {
    const data = [
      { key: "header", type: "header" },
      { key: "empty", type: "empty" },
    ];

    return (
      <FlatList
        data={data}
        keyExtractor={(item) => item.key}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
        renderItem={({ item }) => {
          if (item.type === "header") {
            return renderNotesHeader();
          } else if (item.type === "empty") {
            return renderNotesEmpty();
          }
          return null;
        }}
      />
    );
  };

  const renderSubjectsHeader = () => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>Select Subject</Text>
    </View>
  );

  const renderSubjectsList = () => {
    if (loading) {
      return (
        <FlatList
          data={[{ key: "loading", type: "loading" }]}
          keyExtractor={(item) => item.key}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.contentContainer}
          renderItem={() => (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.loadingText}>Loading subjects...</Text>
            </View>
          )}
        />
      );
    }

    const data = [
      { key: "header", type: "header" },
      ...subjects.map((subject) => ({
        ...subject,
        key: subject.id,
        type: "subject",
      })),
    ];

    return (
      <FlatList
        data={data}
        keyExtractor={(item) => item.key}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
          />
        }
        renderItem={({ item }) => {
          if (item.type === "header") {
            return renderSubjectsHeader();
          } else if (item.type === "subject") {
            const { icon, color, IconComponent } = getSubjectIcon(item.name);
            return (
              <TouchableOpacity
                style={styles.subjectCard}
                onPress={() => loadMindmaps(item)}
              >
                <View
                  style={[
                    styles.subjectIcon,
                    { backgroundColor: `${color}15` },
                  ]}
                >
                  <IconComponent name={icon} size={24} color={color} />
                </View>
                <View style={styles.subjectInfo}>
                  <Text style={styles.subjectName}>{item.name}</Text>
                  <Text style={styles.subjectStats}>
                    {item.mindmaps} concepts • {item.lessons} lessons
                  </Text>
                </View>
                <MaterialIcons
                  name="arrow-forward-ios"
                  size={20}
                  color="#666"
                />
              </TouchableOpacity>
            );
          }
          return null;
        }}
      />
    );
  };

  const renderMindmapsHeader = () => (
    <View style={styles.sectionHeader}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={handleBackNavigation}
      >
        <MaterialIcons name="arrow-back" size={20} color={colors.primary} />
        <Text style={styles.backButtonText}>{selectedSubject?.name}</Text>
      </TouchableOpacity>
    </View>
  );

  const renderMindmapsList = () => {
    if (loading) {
      return (
        <FlatList
          data={[{ key: "loading", type: "loading" }]}
          keyExtractor={(item) => item.key}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.contentContainer}
          renderItem={() => (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.loadingText}>Loading concepts...</Text>
            </View>
          )}
        />
      );
    }

    if (mindmaps.length === 0) {
      return (
        <FlatList
          data={[
            { key: "header", type: "header" },
            { key: "empty", type: "empty" },
          ]}
          keyExtractor={(item) => item.key}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.contentContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
            />
          }
          renderItem={({ item }) => {
            if (item.type === "header") {
              return renderMindmapsHeader();
            } else if (item.type === "empty") {
              return (
                <View style={styles.emptyContainer}>
                  <View style={styles.emptyIconContainer}>
                    <MaterialIcons
                      name="psychology"
                      size={64}
                      color="#E0E0E0"
                    />
                  </View>
                  <Text style={styles.emptyTitle}>No concepts yet</Text>
                  <Text style={styles.emptySubtitle}>
                    Start creating mind maps for {selectedSubject?.name}
                  </Text>
                </View>
              );
            }
            return null;
          }}
        />
      );
    }

    const data = [
      { key: "header", type: "header" },
      ...mindmaps.map((mindmap) => ({
        ...mindmap,
        key: mindmap.id,
        type: "mindmap",
      })),
    ];

    return (
      <FlatList
        data={data}
        keyExtractor={(item) => item.key}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
          />
        }
        renderItem={({ item }) => {
          if (item.type === "header") {
            return renderMindmapsHeader();
          } else if (item.type === "mindmap") {
            const { color } = getSubjectIcon(selectedSubject?.name);
            return (
              <TouchableOpacity
                style={styles.mindmapCard}
                onPress={() => loadMindmapDetail(item)}
              >
                <View
                  style={[
                    styles.mindmapIcon,
                    { backgroundColor: `${color}15` },
                  ]}
                >
                  <MaterialIcons name="psychology" size={24} color={color} />
                </View>
                <View style={styles.mindmapInfo}>
                  <Text style={styles.mindmapTitle}>{item.title}</Text>
                  <Text style={styles.mindmapDescription} numberOfLines={2}>
                    {item.description}
                  </Text>
                </View>
                <MaterialIcons
                  name="arrow-forward-ios"
                  size={20}
                  color="#666"
                />
              </TouchableOpacity>
            );
          }
          return null;
        }}
      />
    );
  };

  const renderMindmapDetailHeader = () => (
    <View style={styles.sectionHeader}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={handleBackNavigation}
      >
        <MaterialIcons name="arrow-back" size={20} color={colors.primary} />
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>
    </View>
  );

  const renderMindmapInfo = () => (
    <View style={styles.mindmapHeader}>
      <Text style={styles.mindmapDetailTitle}>{selectedMindmap.title}</Text>
      <Text style={styles.mindmapDescription}>
        {selectedMindmap.description}
      </Text>
      <View style={styles.mindmapMeta}>
        <Text style={styles.mindmapSubject}>{selectedMindmap.subject}</Text>
        <Text style={styles.mindmapConcepts}>
          {selectedMindmap.children?.length || 0} main concepts
        </Text>
      </View>
    </View>
  );

  const renderTreeConnectors = (connectors, depth) => {
    if (depth === 0 || !connectors || connectors.length === 0) return null;

    // Ensure connectors is an array and has the expected length
    const safeConnectors = Array.isArray(connectors) ? connectors : [];
    if (safeConnectors.length === 0) return null;

    return (
      <View style={styles.treeConnectors}>
        {safeConnectors.slice(0, -1).map((isLast, index) => (
          <View key={index} style={styles.connectorColumn}>
            {!isLast && <View style={styles.verticalLine} />}
          </View>
        ))}
        <View style={styles.connectorColumn}>
          <View style={styles.horizontalLine} />
          {!safeConnectors[safeConnectors.length - 1] && (
            <View style={styles.verticalLine} />
          )}
        </View>
      </View>
    );
  };

  const renderMindmapNode = ({ item }) => {
    const { color } = getSubjectIcon(selectedMindmap?.subject);
    const indentationColors = [
      "#4B4BFF",
      "#FF6B6B",
      "#4ECDC4",
      "#FFA726",
      "#9C27B0",
    ];
    const nodeColor = indentationColors[item.depth % indentationColors.length];

    return (
      <View style={styles.nodeContainer}>
        {/* Tree connectors - only render if connectors exist */}
        {item.connectors && renderTreeConnectors(item.connectors, item.depth)}

        {/* Node content */}
        <View
          style={[styles.conceptCard, { marginLeft: item.depth > 0 ? 0 : 0 }]}
        >
          <View style={styles.conceptHeader}>
            <View
              style={[styles.conceptIndicator, { backgroundColor: nodeColor }]}
            >
              <Text style={styles.conceptLevel}>{item.depth + 1}</Text>
            </View>
            <View style={styles.conceptContent}>
              <Text style={styles.conceptTitle}>{item.title}</Text>
              <Text style={styles.conceptDescription}>{item.description}</Text>
              {item.hasChildren && (
                <View style={styles.childrenInfo}>
                  <MaterialIcons
                    name="account-tree"
                    size={16}
                    color={nodeColor}
                  />
                  <Text
                    style={[styles.conceptChildrenCount, { color: nodeColor }]}
                  >
                    {item.children?.length || 0} sub-concepts
                  </Text>
                </View>
              )}
            </View>
          </View>
          {item.depth > 0 && (
            <View style={styles.conceptPath}>
              <MaterialIcons name="route" size={14} color="#999" />
              <Text style={styles.conceptPathText} numberOfLines={1}>
                {item.path}
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderMindmapDetail = () => {
    if (loading) {
      return (
        <FlatList
          data={[{ key: "loading", type: "loading" }]}
          keyExtractor={(item) => item.key}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.contentContainer}
          renderItem={() => (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.loadingText}>Loading mindmap...</Text>
            </View>
          )}
        />
      );
    }

    if (!selectedMindmap) {
      return null;
    }

    const data = [
      { key: "header", type: "header" },
      { key: "info", type: "info" },
      { key: "conceptsTitle", type: "conceptsTitle" },
      ...flattenedNodes.map((node, index) => ({
        ...node,
        key: `${node.nodeId}-${index}`,
        type: "concept",
      })),
    ];

    return (
      <FlatList
        data={data}
        keyExtractor={(item) => item.key}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
          />
        }
        renderItem={({ item }) => {
          if (item.type === "header") {
            return renderMindmapDetailHeader();
          } else if (item.type === "info") {
            return renderMindmapInfo();
          } else if (item.type === "conceptsTitle") {
            return (
              <View style={styles.conceptsTitleContainer}>
                <Text style={styles.conceptsTitle}>Mind Map Structure</Text>
                <Text style={styles.conceptsSubtitle}>
                  {flattenedNodes.length} total concepts
                </Text>
              </View>
            );
          } else if (item.type === "concept") {
            return renderMindmapNode({ item });
          }
          return null;
        }}
      />
    );
  };

  const renderMindmapsTab = () => {
    if (mindmapView === "subjects") {
      return renderSubjectsList();
    } else if (mindmapView === "mindmaps") {
      return renderMindmapsList();
    } else if (mindmapView === "detail") {
      return renderMindmapDetail();
    }
    return null;
  };

  const renderAutomationHeader = () => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>Automation Queue</Text>
      <View style={styles.headerActions}>
        <TouchableOpacity style={styles.filterChip}>
          <Text style={styles.filterChipText}>All</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.addButton}>
          <MaterialIcons name="add" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderAutomationTab = () => {
    const data = [
      { key: "header", type: "header" },
      ...automationData.map((item, index) => ({
        ...item,
        key: `automation-${index}`,
        type: "automation",
      })),
    ];

    return (
      <FlatList
        data={data}
        keyExtractor={(item) => item.key}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
        renderItem={({ item }) => {
          if (item.type === "header") {
            return renderAutomationHeader();
          } else if (item.type === "automation") {
            return (
              <TouchableOpacity
                style={styles.automationCard}
                onPress={() =>
                  navigation.navigate("AutomationDetail", { item })
                }
              >
                <View style={styles.automationHeader}>
                  <View
                    style={[
                      styles.automationIcon,
                      {
                        backgroundColor:
                          item.icon === "email" ? "#4B4BFF15" : "#4ECDC415",
                      },
                    ]}
                  >
                    {item.icon === "email" && (
                      <MaterialIcons name="email" size={20} color="#4B4BFF" />
                    )}
                    {item.icon === "note" && (
                      <MaterialIcons
                        name="description"
                        size={20}
                        color="#4ECDC4"
                      />
                    )}
                  </View>
                  <View style={styles.automationMeta}>
                    <View
                      style={[
                        styles.priorityBadge,
                        {
                          backgroundColor:
                            item.priority === "high" ? "#FF6B6B" : "#FFA726",
                        },
                      ]}
                    >
                      <Text style={styles.priorityText}>{item.priority}</Text>
                    </View>
                    <View style={styles.statusBadge}>
                      <Text style={styles.statusText}>{item.status}</Text>
                    </View>
                  </View>
                </View>
                <Text style={styles.automationTitle}>{item.title}</Text>
                <Text style={styles.automationSubject}>
                  Subject: {item.subject}
                </Text>
                {item.to && (
                  <Text style={styles.automationTo}>To: {item.to}</Text>
                )}
                <View style={styles.automationFooter}>
                  <Text style={styles.automationDate}>{item.date}</Text>
                  <MaterialIcons
                    name="arrow-forward-ios"
                    size={16}
                    color="#666"
                  />
                </View>
              </TouchableOpacity>
            );
          }
          return null;
        }}
      />
    );
  };

  return (
    <View style={styles.container}>
      {/* Tab Navigation */}
      {renderTabButtons()}

      {/* Content */}
      {activeTab === "Notes" && renderNotesTab()}
      {activeTab === "Mindmaps" && renderMindmapsTab()}
      {activeTab === "Auto" && renderAutomationTab()}
    </View>
  );
};

export default NotebookScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  tabContainer: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginVertical: 20,
    backgroundColor: "#E8E8E8",
    borderRadius: 12,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "center",
  },
  tabIcon: {
    marginRight: 6,
  },
  activeTabButton: {
    backgroundColor: colors.primary,
    elevation: 2,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  tabText: {
    fontWeight: "600",
    color: "#666",
  },
  activeTabText: {
    color: "#fff",
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  searchSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    gap: 12,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: "#333",
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 32,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 16,
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
    elevation: 3,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  primaryButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primary,
    gap: 8,
  },
  secondaryButtonText: {
    color: colors.primary,
    fontWeight: "600",
    fontSize: 14,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  filterChip: {
    backgroundColor: "#E8E8E8",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  filterChipText: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.primary,
  },
  loadingContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
    marginTop: 12,
  },
  subjectCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  subjectIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  subjectInfo: {
    flex: 1,
  },
  subjectName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 4,
  },
  subjectStats: {
    fontSize: 14,
    color: "#666",
  },
  mindmapCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  mindmapIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  mindmapInfo: {
    flex: 1,
  },
  mindmapTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 4,
  },
  mindmapDescription: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  mindmapHeader: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  mindmapDetailTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 8,
  },
  mindmapMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  mindmapSubject: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.primary,
  },
  mindmapConcepts: {
    fontSize: 14,
    color: "#666",
  },
  conceptsTitleContainer: {
    marginBottom: 20,
  },
  conceptsTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 4,
  },
  conceptsSubtitle: {
    fontSize: 14,
    color: "#666",
  },
  nodeContainer: {
    flexDirection: "row",
    marginBottom: 12,
  },
  treeConnectors: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  connectorColumn: {
    width: 20,
    height: "100%",
    position: "relative",
  },
  verticalLine: {
    position: "absolute",
    left: 9,
    top: -12,
    width: 2,
    height: "129%",
    backgroundColor: "#E0E0E0",
  },
  horizontalLine: {
    position: "absolute",
    left: 9,
    top: 20,
    width: 11,
    height: 2,
    backgroundColor: "#E0E0E0",
  },
  conceptCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  conceptHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  conceptIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  conceptLevel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
  conceptContent: {
    flex: 1,
  },
  conceptTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 4,
  },
  conceptDescription: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    marginBottom: 8,
  },
  childrenInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  conceptChildrenCount: {
    fontSize: 12,
    fontWeight: "600",
  },
  conceptPath: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  conceptPathText: {
    fontSize: 12,
    color: "#999",
    marginLeft: 8,
    flex: 1,
  },
  automationCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  automationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  automationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  automationMeta: {
    flexDirection: "row",
    gap: 8,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#fff",
    textTransform: "uppercase",
  },
  statusBadge: {
    backgroundColor: "#F0F0F0",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10, 
    fontWeight: "600",
    color: "#666",
    textTransform: "uppercase",
  },
  automationTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 8,
  },
  automationSubject: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  automationTo: {
    fontSize: 14,
    color: "#666",
    marginBottom: 12,
  },
  automationFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  automationDate: {
    fontSize: 12,
    color: "#999",
  },
});
