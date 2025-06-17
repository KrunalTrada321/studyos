// screens/ToDoScreen.js
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { colors } from '../utils/colors';

// Sub-tabs
const ToDoTab = () => (
  <ScrollView contentContainerStyle={styles.scrollContainer}>
    <View style={styles.card}><Text style={{textAlign: 'center', fontWeight: '700'}}>Today</Text><Text style={{textAlign: 'center', marginTop: 5}}>No Task for today</Text></View>
    <Text style={styles.subHeader}> Overdue</Text>
    <View style={styles.taskCard}>
      <View>
        <Text style={styles.taskTitle}>English Essay</Text>
        <Text style={styles.taskDue}>📅 Due Apr 19, 2025</Text>
      </View>
      <View style={styles.taskMeta}>
        <Text style={styles.badgeGreen}>English</Text>
        <Text style={styles.badgeRed}>⏰ 2h</Text>
      </View>
    </View>
    <View style={styles.taskCard}>
      <View>
        <Text style={styles.taskTitle}>Science Lab Report</Text>
        <Text style={styles.taskDue}>📅 Due Apr 19, 2025</Text>
      </View>
      <View style={styles.taskMeta}>
        <Text style={styles.badgeGreen}>Math</Text>
        <Text style={styles.badgeRed}>⏰ 2h</Text>
      </View>
    </View>
    <Text style={styles.subHeader}>📅 Upcomings</Text>
    <View style={styles.card}><Text>No Upcomings</Text></View>
    <Text style={styles.subHeader}>✅ Completed</Text>
    <View style={styles.taskCard}>
      <Text style={styles.taskTitle}>✔ Physics Test</Text>
      <Text>Completed</Text>
    </View>
  </ScrollView>
);

const CalendarTab = () => {
  const [selectedDate, setSelectedDate] = useState('');

  return (
    <View style={styles.calendarContainer}>
      <Calendar
        current={'2025-04-15'}
        onDayPress={(day) => setSelectedDate(day.dateString)}
        markedDates={{
          [selectedDate]: {
            selected: true,
            selectedColor: '#4F46E5',
          },
          '2025-04-18': { marked: true, dotColor: '#4F46E5' },
          '2025-04-19': { marked: true, dotColor: '#4F46E5' },
        }}
        theme={{
          todayTextColor: '#4F46E5',
          arrowColor: '#4F46E5',
          selectedDayBackgroundColor: '#4F46E5',
          selectedDayTextColor: '#fff',
        }}
      />
      {selectedDate ? (
        <Text style={styles.selectedDate}>Selected: {selectedDate}</Text>
      ) : null}
    </View>
  );
};

const PlansTab = () => (
  <ScrollView contentContainerStyle={styles.scrollContainer}>
    <Text style={styles.subHeader}>📚 Study Plans</Text>
    <View style={styles.planCard}>
    
    <View style={{backgroundColor: '#FF5C5C', padding: 6, position: 'absolute', right: 8, top: 8, borderRadius: 6}}>
      <Text style={{color: colors.white, fontWeight: '500'}}>High</Text>
    </View>

      <Text style={styles.planTitle}>Final Exam Preparation</Text>
      <Text>Comprehensive review of mechanics, thermodynamics, and electromagnetism</Text>
      <View style={styles.taskMeta}>
        <Text style={styles.badgeBlue}>Physics</Text>
        <Text style={styles.badgeGrey}>📅 May 29, 2025</Text>
      </View>
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { width: '25%' }]} />
      </View>
      <Text>Progress: 25%</Text>
      <TouchableOpacity style={styles.disabledBtn}><Text style={styles.disabledText}>Continue</Text></TouchableOpacity>
    </View>

    <View style={styles.planCard}>

    <View style={{backgroundColor: '#FF9B28', padding: 6, position: 'absolute', right: 8, top: 8, borderRadius: 6}}>
      <Text style={{color: colors.white, fontWeight: '500'}}>Medium</Text>
    </View>


      <Text style={styles.planTitle}>Midterm Review</Text>
      <Text>Review of derivatives, integrals, and applications</Text>
      <View style={styles.taskMeta}>
        <Text style={styles.badgeBlue}>Calculus</Text>
        <Text style={styles.badgeGrey}>📅 May 20, 2025</Text>
      </View>
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { width: '25%' }]} />
      </View>
      <Text>Progress: 25%</Text>
      <TouchableOpacity style={styles.disabledBtn}><Text style={styles.disabledText}>Continue</Text></TouchableOpacity>
    </View>
  </ScrollView>
);

export default function ToDoScreen() {
  const [tab, setTab] = useState('todo');

  const renderTab = () => {
    switch (tab) {
      case 'todo': return <ToDoTab />;
      case 'calendar': return <CalendarTab />;
      case 'plans': return <PlansTab />;
      default: return null;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabContainer}>
        {['todo', 'calendar', 'plans'].map((t) => (
          <TouchableOpacity
            key={t}
            onPress={() => setTab(t)}
            style={[styles.tab, tab === t && styles.tabActive]}
          >
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
              {t === 'todo' ? 'To-Do' : t.charAt(0).toUpperCase() + t.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {renderTab()}
    </View>
  );
}
 

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  tabContainer: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 14 , marginHorizontal: 12},
  tab: { paddingVertical: 14, paddingHorizontal: 32, backgroundColor: '#ddd', borderRadius: 8 },
  tabActive: { backgroundColor: colors.primary },
  tabText: { color: '#333' },
  tabTextActive: { color: '#fff', fontWeight: 'bold' },

  scrollContainer: { padding: 16 },
  card: { padding: 16, backgroundColor: '#f9f9f9', borderRadius: 10, marginBottom: 12 },
  subHeader: { fontWeight: 'bold', fontSize: 16, marginVertical: 8 , textAlign: 'center'},
  taskCard: { backgroundColor: '#f1f1f1', borderRadius: 10, padding: 12, marginVertical: 6, flexDirection: 'row', justifyContent: 'space-between' },
  taskTitle: { fontWeight: 'bold', fontSize: 16 },
  taskDue: { color: '#666', marginTop: 4 },
  taskMeta: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8, alignItems: 'center' },
  badgeGreen: { backgroundColor: '#4CAF50', padding: 4, borderRadius: 6, color: '#fff', justifyContent: 'center', },
  badgeRed: { marginLeft: 5, backgroundColor: '#F44336', padding: 4, borderRadius: 6, color: '#fff' },

  calendarContainer: { padding: 16 },
  selectedDate: { textAlign: 'center', marginTop: 12, fontSize: 16 },

  planCard: { backgroundColor: '#f6f6f6', padding: 16, borderRadius: 10, marginBottom: 14 },
  planTitle: { fontWeight: 'bold', fontSize: 16, marginBottom: 4 },
  badgeBlue: { backgroundColor: '#4F46E5', padding: 4, color: 'white', borderRadius: 6 },
  badgeGrey: { backgroundColor: '#ccc', padding: 4, borderRadius: 6 },
  progressBarContainer: { height: 6, backgroundColor: '#ddd', borderRadius: 5, marginVertical: 8 },
  progressBar: { height: 6, backgroundColor: '#4F46E5', borderRadius: 5 },
  disabledBtn: {
    backgroundColor: '#ccc',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10
  },
  disabledText: { color: '#FFFFFF', fontWeight: '700' },
});
