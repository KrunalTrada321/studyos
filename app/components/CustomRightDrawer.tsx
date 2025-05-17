import React from 'react';
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

export default function CustomRightDrawer({ onClose }) {
  return (
    <View style={styles.overlay}>
      {/* Background overlay on the left side to dismiss */}
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backgroundOverlay} />
      </TouchableWithoutFeedback>

      {/* Drawer content on the right */}
      <View style={styles.drawer}>
        <Text style={styles.title}>Right Drawer</Text>
        <TouchableOpacity onPress={onClose}>
          <Text style={{ color: 'blue' }}>Close</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: 'row', // <- normal left to right layout
  },
  backgroundOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)', // Touchable dismiss area
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
