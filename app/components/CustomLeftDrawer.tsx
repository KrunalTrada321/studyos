import React from 'react';
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

export default function CustomLeftDrawer({ onClose }) {
  return (
    <View style={styles.overlay}>
 
      {/* Drawer content */}
      <View style={styles.drawer}>
        <Text style={styles.title}>Left Drawer</Text>
        <TouchableOpacity onPress={onClose}>
          <Text style={{ color: 'blue' }}>Close</Text>
        </TouchableOpacity>
      </View>

      {/* TouchableWithoutFeedback only on the semi-transparent background */}
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
    justifyContent: 'flex-start',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
});
