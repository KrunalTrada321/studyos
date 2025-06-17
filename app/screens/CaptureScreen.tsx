


import { MaterialIcons } from '@expo/vector-icons';
import { Camera, CameraView } from 'expo-camera';
import React, { useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { colors } from '../utils/colors';

const { width } = Dimensions.get('window');

const CaptureScreen = () => {
  const [mode, setMode] = useState('record'); // 'record' or 'scan'
  const [isRecording, setIsRecording] = useState(false);
  const [hasPermission, setHasPermission] = useState(null);
  const cameraRef = useRef(null);

  useEffect(() => {
    if (mode === 'scan') {
      (async () => {
        const { status } = await Camera.requestCameraPermissionsAsync();
        setHasPermission(status === 'granted');
      })();
    }
  }, [mode]);

  return (
    <View style={styles.container}>
      {/* Top Buttons */}
      <View style={styles.topButtons}>
        <TouchableOpacity
          style={[styles.topBtn, mode === 'record' && styles.activeBtn]}
          onPress={() => setMode('record')}
        >
          <Text style={mode === 'record' ? styles.activeBtnText : styles.disabledBtnText}>Record</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.topBtn, mode === 'scan' && styles.activeBtn]}
          onPress={() => setMode('scan')}
        >
          <Text style={mode === 'scan' ? styles.activeBtnText : styles.disabledBtnText}>Scan</Text>
        </TouchableOpacity>
      </View>

      {/* Dynamic Section */}
      <View style={styles.centerSection}>
        {mode === 'record' ? (
          <>

            <TouchableOpacity
              style={styles.micCircle}
              onPress={() => setIsRecording(!isRecording)}
            >
              <View style={{ borderRadius: 50, padding: 10, backgroundColor: '#BCC5FF' }}>
                <MaterialIcons name="mic" size={52} color="white" />
              </View>
            </TouchableOpacity>
            <Text style={{ marginTop: 15, fontSize: 16, fontWeight: '600' }}>
              {isRecording ? 'Recording...' : 'Start Recording'}
            </Text>


          </>
        ) : hasPermission === false ? (
          <Text>No access to camera</Text>
        ) : (
          <CameraView
            ref={cameraRef}
            style={styles.cameraPreview}
          // type={Camera.Constants.Type.back}
          />
        )}
      </View>


      {/* Bottom Buttons */}
      {mode === 'record' && (<View style={styles.bottomButtons}>
        <TouchableOpacity style={styles.bottomBtn}>
          <Text style={styles.disabledBtnText}>Previous</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.bottomBtn, styles.activeBtn]}>
          <Text style={styles.activeBtnText}>New</Text>
        </TouchableOpacity> 
      </View>)}



    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
    paddingTop: 20,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  topButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: width - 40,
  },
  topBtn: {
    flex: 1,
    marginHorizontal: 5,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: '#ccc',
    alignItems: 'center',
    elevation: 3,
  },
  activeBtn: {
    backgroundColor: colors.primary,
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
    justifyContent: 'center',
    width: '100%',
  },
  micCircle: {
    backgroundColor: colors.primary,
    borderRadius: 100,
    padding: 40,
    elevation: 5,
  },
  cameraPreview: {
    width: width - 40,
    height: 400,
    borderRadius: 10,
    overflow: 'hidden',
  },
  bottomButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: width - 40,
    marginBottom: 20,
  },
  bottomBtn: {
    flex: 1,
    marginHorizontal: 5,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: '#ccc',
    alignItems: 'center',
    elevation: 3,
  },
});

export default CaptureScreen;
