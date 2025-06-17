import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../utils/colors';

const AutomationDetailScreen = () => {
  
  const navigation = useNavigation();

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity
        style={{ position: 'absolute', top: 0, left: 0, backgroundColor: colors.primary, padding: 8, borderRadius: 20 }}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color="white" />
      </TouchableOpacity>

     <View style={{marginTop: 60}}> 
      <Text style={styles.title}>Question about Assignment</Text>
      <Text style={styles.date}>5/8/2025 - Draft</Text>

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.aiButton}>
          <Text style={styles.buttonTextDark}>AI Chat</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.saveButton}>
          <Text style={styles.buttonTextDark}>Save</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.sendButton}>
          <Text style={styles.buttonTextLight}>Send Email</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>To</Text>
      <View style={styles.inputBox}>
        <Text style={styles.inputText}>professor@university.edu</Text>
      </View>

      <Text style={styles.label}>Subject</Text>
      <View style={styles.inputBox}>
        <Text style={styles.inputText}>Question about Physics Assignment</Text>
      </View>

      <Text style={styles.label}>Message</Text>
      <View style={styles.messageBox}>
        <Text style={styles.messageText}>
          Dear Professor,{"\n\n"}
          I'm writing to ask for clarification on the recent physics assignment. Specifically, I’m having trouble understanding how to approach problem #3 regarding the conservation of angular momentum.{"\n\n"}
          Could you please provide some additional guidance or resources that might help me better understand this concept?{"\n"}
          Thank you for your time.{"\n\n"}
          Sincerely,{"\n"}
          Student
        </Text>
      </View>

     </View>
    </ScrollView>
  );
};

export default AutomationDetailScreen;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    marginTop: 0,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  date: {
    fontSize: 12,
    color: '#888',
    marginBottom: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  aiButton: {
    backgroundColor: '#e0e0e0',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
  },
  saveButton: {
    backgroundColor: '#c2c2c2',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
  },
  sendButton: {
    backgroundColor: '#4B4BFF',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
  },
  buttonTextDark: {
    color: '#333',
    fontWeight: '600',
  },
  buttonTextLight: {
    color: '#fff',
    fontWeight: '600',
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 4,
  },
  inputBox: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    backgroundColor: '#f9f9f9',
  },
  inputText: {
    fontSize: 16,
    color: '#333',
  },
  messageBox: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    marginBottom: 24,
    backgroundColor: '#f2f2f2',
  },
  messageText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
  },
});





