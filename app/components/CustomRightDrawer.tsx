// import React from 'react';
// import {
//   Dimensions,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   TouchableWithoutFeedback,
//   View,
// } from 'react-native';

// export default function CustomRightDrawer({ onClose }) {
//   return (
//     <View style={styles.overlay}>
//       {/* Background overlay on the left side to dismiss */}
//       <TouchableWithoutFeedback onPress={onClose}>
//         <View style={styles.backgroundOverlay} />
//       </TouchableWithoutFeedback>

//       {/* Drawer content on the right */}
//       <View style={styles.drawer}>
//         <Text style={styles.title}>Right Drawer</Text>
//         <TouchableOpacity onPress={onClose}>
//           <Text style={{ color: 'blue' }}>Close</Text>
//         </TouchableOpacity>
//       </View>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   overlay: {
//     flex: 1,
//     flexDirection: 'row', // <- normal left to right layout
//   },
//   backgroundOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0,0,0,0.3)', // Touchable dismiss area
//   },
//   drawer: {
//     width: Dimensions.get('window').width * 0.75,
//     backgroundColor: '#fff',
//     padding: 20,
//     justifyContent: 'flex-start',
//   },
//   title: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     marginBottom: 10,
//   },
// });



import { Ionicons } from '@expo/vector-icons'; // Make sure to install @expo/vector-icons if not already
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function CustomRightDrawer({ onClose }) {
  return (
    <View style={styles.fullScreen}>
    
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconWrapper} onPress={onClose}>
          <Ionicons name="close" size={20} color="#fff" />
        </TouchableOpacity>

        <View style={styles.titleWrapper}>
          <Text style={styles.title}>Settings Screen</Text>
        </View>

        {/* Empty view to balance layout (optional) */}
        <View style={styles.iconPlaceholder} />
      </View>

      {/* Add your drawer content below */}
    </View>
  );
}

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleWrapper: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  iconPlaceholder: {
    width: 32, // same width as iconWrapper to balance the layout
  },
});
