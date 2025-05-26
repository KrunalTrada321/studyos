import { FontAwesome5, Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
 
const lessons = [
  { id: '1', title: 'Lesson 1: Note Taking', status: 'Completed' },
  { id: '2', title: 'Lesson 2: Time Management', status: 'Completed' },
  {
    id: '3',
    title: 'Lesson 3: Active Reading',
    status: 'Start',
    desc: 'Techniques for engaging with texts',
    questions: 10,
    explanations: 2,
  },
  {
    id: '4',
    title: 'Lesson 4: Memory Techniques',
    status: 'Start',
    desc: 'Improve retention with proven methods',
    questions: 15,
    explanations: 4,
  },
];

const subjects = [
  { id: '1', name: 'Math', lessons: 4, icon: <FontAwesome5 name="calculator" size={24} color="#555" /> },
  { id: '2', name: 'Health', lessons: 2, icon: <MaterialIcons name="favorite" size={24} color="#E53935" /> },
  { id: '3', name: 'French', lessons: 10, icon: <MaterialCommunityIcons name="alphabet-latin" size={24} color="#333" /> },
  { id: '4', name: 'Science', lessons: 4, icon: <MaterialIcons name="science" size={24} color="#E53935" /> },
  { id: '5', name: 'Physics', lessons: 4, icon: <MaterialCommunityIcons name="atom" size={24} color="#2196F3" /> },
  { id: '6', name: 'English', lessons: 8, icon: <MaterialIcons name="language" size={24} color="#4CAF50" /> },
];

export default function LearnScreen() {
  const [tab, setTab] = useState('Plan');

  return (
    <View style={styles.container}>
      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, tab === 'Plan' && styles.activeTab]}
          onPress={() => setTab('Plan')}>
          <Text style={[styles.tabText, tab === 'Plan' && styles.activeTabText]}>Plan</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tab === 'Subjects' && styles.activeTab]}
          onPress={() => setTab('Subjects')}>
          <Text style={[styles.tabText, tab === 'Subjects' && styles.activeTabText]}>All Subjects</Text>
        </TouchableOpacity>
      </View>

      {/* Header Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <MaterialIcons name="favorite" size={18} color="red" />
          <Text style={styles.statText}>5</Text>
        </View>
        <Text style={styles.streakText}>Streak: 3 Days</Text>
      </View>

      {tab === 'Plan' ? (
        <ScrollView style={{ flex: 1 }}>
          <Text style={styles.sectionTitle}>Today</Text>

          {lessons.map((lesson) => (
            <View key={lesson.id} style={styles.lessonCard}>
              <View style={{ flex: 1 }}>
                <View style={styles.lessonHeader}>
                  {lesson.status === 'Completed' ? (
                    <Ionicons name="checkmark-circle" size={20} color="green" />
                  ) : (
                    <MaterialCommunityIcons name="book-open-outline" size={20} color="#4B55C1" />
                  )}
                  <Text style={styles.lessonTitle}>{lesson.title}</Text>
                </View>
                {lesson.desc && (
                  <>
                    <Text style={styles.lessonDesc}>{lesson.desc}</Text>
                    <Text style={styles.metaText}>📄 {lesson.questions} Questions   📝 {lesson.explanations} Explanations</Text>
                  </>
                )}
              </View>
              {lesson.status === 'Start' && (
                <TouchableOpacity style={styles.startButton}>
                  <Text style={styles.startButtonText}>Start</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </ScrollView>
      ) : (
        <ScrollView style={styles.subjectsContainer}>
          <View style={styles.grid}>
            {subjects.map((subject) => (
              <View key={subject.id} style={styles.subjectCard}>
                {subject.icon}
                <Text style={styles.subjectTitle}>{subject.name}</Text>
                <Text style={styles.subjectSubtitle}>{subject.lessons} Lessons</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingTop: 40, paddingHorizontal: 10 },
  tabContainer: { flexDirection: 'row', justifyContent: 'center', marginBottom: 15 },
  tab: {
    flex: 1,
    backgroundColor: '#D3D3D3',
    paddingVertical: 10,
    marginHorizontal: 5,
    borderRadius: 10,
    alignItems: 'center',
    elevation: 2,
  },
  activeTab: {
    backgroundColor: '#4B55C1',
  },
  tabText: {
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 10,
    marginBottom: 10,
  },
  statBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  statText: {
    fontWeight: 'bold',
    color: '#444',
  },
  streakText: {
    color: '#4B55C1',
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
    marginBottom: 8,
  },
  lessonCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginHorizontal: 10,
    marginBottom: 10,
    elevation: 3,
    flexDirection: 'row',
    alignItems: 'center',
  },
  lessonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  lessonTitle: {
    fontWeight: 'bold',
    fontSize: 14,
    flexShrink: 1,
  },
  lessonDesc: {
    color: '#555',
    fontSize: 13,
  },
  metaText: {
    fontSize: 12,
    color: '#777',
    marginTop: 3,
  },
  startButton: {
    backgroundColor: '#4B55C1',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    marginLeft: 10,
    elevation: 2,
  },
  startButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  subjectsContainer: {
    flex: 1,
    paddingHorizontal: 10,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  subjectCard: {
    width: '47%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    marginBottom: 15,
    alignItems: 'center',
    elevation: 2,
  },
  subjectTitle: {
    marginTop: 8,
    fontWeight: '600',
  },
  subjectSubtitle: {
    fontSize: 13,
    color: '#666',
  },
});
