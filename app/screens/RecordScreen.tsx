import { FontAwesome } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { colors } from '../utils/colors';

const { width } = Dimensions.get('window');

const RecordScreen = () => {
  const [recordingTime, setRecordingTime] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setRecordingTime((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = String(Math.floor(seconds / 60)).padStart(2, '0');
    const secs = String(seconds % 60).padStart(2, '0');
    return `00:${mins}:${secs}`;
  };

  const renderWaveform = () => {
    const bars = new Array(30).fill(null);
    return bars.map((_, index) => {
      const height = Math.random() * 40 + 10;
      const color = index % 2 === 0 ? '#4B4BFF' : '#555';
      return (
        <View
          key={index}
          style={{
            width: 4,
            height,
            backgroundColor: color,
            marginHorizontal: 1,
            borderRadius: 2,
          }}
        />
      );
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>AI Tutor</Text>

      <View style={styles.micButton}>
       
        <View style={{padding: 10, backgroundColor: colors.lightPrimary, borderRadius: 50, height: 70, width: 70, alignItems: 'center', justifyContent: 'center'}}>
        <FontAwesome name="microphone" size={48} color="white" />
        </View>
      
      </View>

      <Text style={styles.timer}>{formatTime(recordingTime)}</Text>

      <View style={styles.waveformContainer}>
        <View style={styles.waveform}>
          {renderWaveform()}
          <View style={styles.waveformCursor} />
        </View>
      </View>

      <Text style={styles.statusText}>Speaking...</Text>

      <View style={styles.switchContainer}>
        <TouchableOpacity style={styles.activeSwitch}>
          <Text style={styles.activeText}>🎙️ Voice</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.inactiveSwitch}>
          <Text style={styles.inactiveText}>📝 Text</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default RecordScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 80,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 40,
  },
  micButton: {
    backgroundColor: colors.primary,
    width: 140,
    height: 140,
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  timer: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  waveformContainer: {
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#eee',
    width: width * 0.9,
    borderRadius: 10,
    marginBottom: 20,
    overflow: 'hidden',
  },
  waveform: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    position: 'relative',
  },
  waveformCursor: {
    position: 'absolute',
    width: 2,
    height: 60,
    backgroundColor: 'black',
    left: '50%',
    top: 10,
    borderRadius: 1,
  },
  statusText: {
    fontSize: 16,
    marginBottom: 30,
  },
  switchContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  activeSwitch: {
    backgroundColor:  colors.primary,
    paddingVertical: 15,
    paddingHorizontal: 50,
    borderRadius: 10,
  },
  activeText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  inactiveSwitch: {
    backgroundColor: '#ddd',
    paddingVertical: 15,
    paddingHorizontal: 50,
    borderRadius: 10,
  },
  inactiveText: {
    color: '#555',
    fontWeight: 'bold',
  },
});
