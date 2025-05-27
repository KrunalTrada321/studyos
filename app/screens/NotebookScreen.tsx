import { FontAwesome, FontAwesome5, Ionicons, MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const tabs = ['Notes', 'Mindmaps', 'Automation'];

const mindmapData = [
  { title: 'Math Concepts', icon: 'calculator' },
  { title: 'Health Concepts', icon: 'heart' },
  { title: 'French Concepts', icon: 'balance-scale' },
  { title: 'Theology Concepts', icon: 'flask' },
  { title: 'Physics Concepts', icon: 'atom' },
  { title: 'English Concepts', icon: 'language' },
];

const automationData = [
  {
    title: 'Question about Assignment',
    date: '5/8/2024 - Draft',
    to: 'professor@university.edu',
    subject: 'Question about Physics Assignment',
    icon: 'email',
  },
  {
    title: 'Essay Outline: French Revolution',
    date: '5/8/2024 - Draft',
    subject: 'French Revolution Essay Outline',
    icon: 'note',
  },
  {
    title: 'Request for Extension',
    date: '5/8/2024 - Draft',
    to: 'professor@university.edu',
    subject: 'Request for Assignment Extension',
    icon: 'email',
  },
];

const NotebookScreen = () => {
  const [activeTab, setActiveTab] = useState('Notes');

  const renderTabButtons = () => {
    return (
      <View style={styles.tabContainer}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tabButton,
              activeTab === tab && styles.activeTabButton,
            ]}
            onPress={() => setActiveTab(tab)}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab && styles.activeTabText,
              ]}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderNotesTab = () => (
    <View style={styles.notesContainer}>
      <TextInput style={styles.searchInput} placeholder="Search Notes" />
      <View style={styles.searchActions}>
        <Ionicons name="filter" size={24} color="#333" style={styles.icon} />
        <Ionicons name="add" size={28} color="#333" style={styles.icon} />
      </View>
      <View style={styles.emptyBox}>
        <Text style={styles.emptyText}>No notes available yet</Text>
        <View style={styles.noteButtons}>
          <TouchableOpacity style={styles.recordBtn}>
            <Text style={styles.recordBtnText}>Record a class</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.uploadBtn}>
            <Text style={styles.uploadBtnText}>Upload file</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderMindmapsTab = () => (
    <FlatList
      data={mindmapData}
      keyExtractor={(item) => item.title}
      contentContainerStyle={styles.listContainer}
      renderItem={({ item }) => (
        <View style={styles.listItem}>
          <View style={styles.iconContainer}>
            {item.icon === 'calculator' && <FontAwesome name="calculator" size={20} color="#4B4BFF" />}
            {item.icon === 'heart' && <FontAwesome name="heart" size={20} color="red" />}
            {item.icon === 'balance-scale' && <FontAwesome name="balance-scale" size={20} color="#444" />}
            {item.icon === 'flask' && <FontAwesome5 name="flask" size={20} color="red" />}
            {item.icon === 'atom' && <FontAwesome5 name="atom" size={20} color="#007bff" />}
            {item.icon === 'language' && <FontAwesome name="language" size={20} color="green" />}
          </View>
          <View>
            <Text style={styles.listTitle}>{item.title}</Text>
            <Text style={styles.listSubtitle}>4 Concepts</Text>
          </View>
        </View>
      )}
    />
  );

  const renderAutomationTab = () => (
    <FlatList
      data={automationData}
      keyExtractor={(item) => item.title}
      contentContainerStyle={styles.listContainer}
      renderItem={({ item }) => (
        <View style={styles.automationItem}>
          <View style={styles.iconContainer}>
            {item.icon === 'email' && <MaterialIcons name="email" size={20} color="#4B4BFF" />}
            {item.icon === 'note' && <MaterialIcons name="note" size={20} color="green" />}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.listTitle}>{item.title}</Text>
            <Text style={styles.listSubtitle}>{item.date}</Text>
            {item.to && <Text style={styles.listSubtitle}>To: {item.to}</Text>}
            <Text style={styles.listSubtitle}>Subject: {item.subject}</Text>
          </View>
          <Ionicons name="checkmark-circle-outline" size={20} color="#555" />
        </View>
      )}
    />
  );

  return (
    <View style={styles.container}>
      {renderTabButtons()}
      {activeTab === 'Notes' && renderNotesTab()}
      {activeTab === 'Mindmaps' && renderMindmapsTab()}
      {activeTab === 'Automation' && renderAutomationTab()}
    </View>
  );
};

export default NotebookScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 12,
    backgroundColor: '#fff',
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginBottom: 12,
  },
  tabButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 100,
    paddingHorizontal: 0,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#ccc',
  },
  activeTabButton: {
    backgroundColor: '#4B4BFF',
  },
  tabText: {
    color: '#444',
    fontWeight: '600',
  },
  activeTabText: {
    color: '#fff',
  },
  notesContainer: {
    alignItems: 'center',
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
    width: '100%',
    marginBottom: 8,
  },
  searchActions: {
    flexDirection: 'row',
    marginBottom: 16,
    justifyContent: 'flex-end',
    width: '100%',
  },
  icon: {
    marginHorizontal: 8,
  },
  emptyBox: {
    width: '100%',
    backgroundColor: '#f2f2f2',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    marginBottom: 12,
    color: '#444',
  },
  noteButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  recordBtn: {
    backgroundColor: '#4B4BFF',
    padding: 10,
    borderRadius: 8,
  },
  recordBtnText: {
    color: '#fff',
  },
  uploadBtn: {
    backgroundColor: '#aaa',
    padding: 10,
    borderRadius: 8,
  },
  uploadBtnText: {
    color: '#fff',
  },
  listContainer: {
    paddingBottom: 16,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    marginBottom: 8,
    borderRadius: 10,
    backgroundColor: '#f9f9f9',
  },
  automationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 14,
    marginBottom: 8,
    borderRadius: 10,
    backgroundColor: '#f9f9f9',
  },
  iconContainer: {
    marginRight: 12,
    width: 30,
    alignItems: 'center',
  },
  listTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  listSubtitle: {
    fontSize: 13,
    color: '#666',
  },
});
