import { useNavigation } from 'expo-router';
import React from 'react';
import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';



export default function CustomLeftDrawer({ onClose, navigation }) {
  const navigations = useNavigation();

  const handleProfilePress = () => {
    onClose(); // Close drawer first
    navigations.navigate('Profile'); // Navigate to Profile screen
  }; 

  


  return (
    <View style={styles.overlay}>
      {/* Drawer content */}
      <View style={styles.drawer}>
        {/* Profile Header */}
        <View style={styles.profileContainer}>
        
          <Image
            source={{ uri: 'https://i.pravatar.cc/150?img=12' }} // You can replace with actual user photo
            style={styles.avatar}
          />
          <View style={styles.profileTextContainer}>
            <Text style={styles.name}>John Doe</Text>
            <Text style={styles.email}>johndoe@example.com</Text>
          </View>
        </View>

        {/* Profile Navigation Button */}
        <TouchableOpacity style={styles.profileButton} onPress={handleProfilePress}>
          <Text style={styles.profileButtonText}>View Profile</Text>
        </TouchableOpacity>

        {/* Other drawer items */}
        <View style={styles.divider} />
      </View>

      {/* Semi-transparent background */}
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backgroundOverlay} />
      </TouchableWithoutFeedback>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: 'row',
  },
  backgroundOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  drawer: {
    width: Dimensions.get('window').width * 0.75,
    backgroundColor: '#fff',
    padding: 20,
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
  },
  profileTextContainer: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
  },
  email: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  profileButton: {
    backgroundColor: '#6C63FF',
    paddingVertical: 8,
    paddingHorizontal: 12,
    width: '100%',
    borderRadius: 8,
    alignSelf: 'center',
  },
  profileButtonText: {
    color: '#fff',
    fontWeight: '600',
    textAlign: 'center'
  },
  divider: {
    height: 1,
    backgroundColor: '#ddd',
    marginVertical: 20,
  },
});
