import { MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

const CaptureScreen = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [timer] = useState(26.11); // Static for UI preview
  const [mode, setMode] = useState('Voice'); // Voice or Text

  return (
    <View style={styles.container}>
      {/* Top Buttons */}
      <View style={styles.topButtons}>
        <TouchableOpacity style={[styles.topBtn, styles.activeBtn]}>
          <Text style={styles.activeBtnText}>Record</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.topBtn}>
          <Text style={styles.disabledBtnText}>Scan</Text>
        </TouchableOpacity>
      </View>

      {/* Mic Section */}
      <View style={styles.centerSection}>
        <TouchableOpacity
          style={styles.micCircle}
          onPress={() => setIsRecording(!isRecording)}
        >
          <MaterialIcons name="mic" size={40} color="white" />
        </TouchableOpacity>

        <Text style={{marginTop: 15, fontSize: 16, fontWeight:'400' }}>Start Recording</Text>
      </View>

      {/* Bottom Buttons */}
      <View style={styles.bottomButtons}>
        <TouchableOpacity style={styles.bottomBtn}>
          <Text style={styles.disabledBtnText}>Previous</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.bottomBtn, styles.activeBtn]}>
          <Text style={styles.activeBtnText}>New</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
    paddingTop: 20,
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  topButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: width - 40,
  },
  topBtn: {
    flex: 1,
    marginHorizontal: 5,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#ccc',
    alignItems: 'center',
    elevation: 3
  },
  activeBtn: {
    backgroundColor: '#5A5ACF',
  },
  activeBtnText: {
    color: '#fff',
    fontWeight: '600',
  },
  disabledBtnText: {
    color: '#666',
    fontWeight: '600',
  },
  centerSection: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center'
  },
  micCircle: {
    backgroundColor: '#5A5ACF',
    borderRadius: 100,
    padding: 30,
    elevation: 5
  },
  startText: {
    marginTop: 20,
    fontWeight: '600'
  },
  timerText: {
    fontSize: 28,
    fontWeight: 'bold',
    marginVertical: 15
  },
  waveformContainer: {
    width: width - 60,
    height: 80,
    backgroundColor: '#eee',
    borderRadius: 10,
    justifyContent: 'center',
    position: 'relative',
    paddingHorizontal: 20
  },
  waveformBarGroup: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    position: 'relative'
  },
  bar: {
    width: 6,
    backgroundColor: '#5A5ACF',
    marginHorizontal: 3,
    borderRadius: 4
  },
  playbackPointer: {
    position: 'absolute',
    height: 80,
    width: 2,
    backgroundColor: '#000',
    top: 0,
    left: '50%'
  },
  statusText: {
    marginTop: 10,
    fontSize: 14,
    color: 'gray'
  },
  modeToggle: {
    flexDirection: 'row',
    marginTop: 20
  },
  toggleBtn: {
    paddingVertical: 10,
    paddingHorizontal: 25,
    backgroundColor: '#ccc',
    borderRadius: 10,
    marginHorizontal: 5
  },
  selectedToggle: {
    backgroundColor: '#5A5ACF'
  },
  toggleText: {
    color: '#444',
    fontWeight: '600'
  },
  toggleTextActive: {
    color: '#fff',
    fontWeight: '600'
  },
  bottomButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: width - 40,
    marginBottom: 20
  },
  bottomBtn: {
    flex: 1,
    marginHorizontal: 5,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#ccc',
    alignItems: 'center',
    elevation: 3
  }
});

export default CaptureScreen;
 