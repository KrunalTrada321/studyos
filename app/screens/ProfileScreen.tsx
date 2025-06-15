import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

export default function ProfileScreen() {

  const navigation = useNavigation();
 
return (
    <SafeAreaView style={styles.container}>


<TouchableOpacity
  style={{ position: 'absolute', top: 20, left: 20 , backgroundColor: '#6C63FF', padding: 8, borderRadius: 20}}
  onPress={() => navigation.goBack()}
>
  <Ionicons name="arrow-back" size={24} color="white" />
</TouchableOpacity>



      {/* Profile Avatar */}
      <View style={styles.avatarContainer}>
        <View style={styles.avatar}>
          <Text style={styles.avatarIcon}>👤</Text>
        </View>
        <Text style={styles.name}>Student Name</Text>
        <Text style={styles.email}>student@example.com</Text>
      </View>

      {/* Streak Cards */}
      <View style={styles.card}>
        <Text style={styles.cardLabel}>Learning Streak</Text>
        <Text style={styles.cardValue}>5 <Text style={styles.cardUnit}>days</Text></Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>Learning Streak</Text>
        <Text style={styles.cardValue}>12</Text>
      </View>

      {/* Buttons */}
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>My Courses</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>My Documents</Text>
      </TouchableOpacity>

      {/* Sign Out */}
      <TouchableOpacity style={styles.signOutButton}>
        <Text style={styles.signOutText}>Sign out</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingTop: 40,
    paddingHorizontal: 20,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 60,
    marginTop: 20,
    backgroundColor: '#ECEBFD',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarIcon: {
    fontSize: 32,
    color: '#6C63FF',
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  email: {
    color: '#888',
    fontSize: 14,
  },
  card: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  cardLabel: {
    fontSize: 14,
    color: '#000000',
    fontWeight: '700',
    marginBottom: 6,
  },
  cardValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'grey',
  },
  cardUnit: {
    fontSize: 14,
    color: '#666',
  },
  button: {
    width: '100%',
    backgroundColor: '#BABABA',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  signOutButton: {
    width: '100%',
    backgroundColor: '#FF5C5C',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  signOutText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
