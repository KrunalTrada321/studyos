import axios from 'axios';
import { CameraView, useCameraPermissions } from 'expo-camera';
import React, { useRef, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../utils/colors'; // your color theme
import Constants from '../utils/constants';
import { getToken } from '../utils/token';

const ScanNotesScreen = () => {
  const cameraRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();

  if (!permission?.granted) {
    return (
      <View style={styles.center}>
        <Text>No camera access</Text>
        <TouchableOpacity onPress={requestPermission}>
          <Text style={{ color: colors.primary, marginTop: 10 }}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }
 
  const handleCapture = async () => {
    if (!cameraRef.current) return;

    setLoading(true);

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
        skipProcessing: true,
      });

      const formData = new FormData();
      formData.append('files', {
        uri: photo.uri,
        type: 'image/jpeg',
        name: 'scan.jpg',
      });

      const token = await getToken(); // replace with your token logic

      const response = await axios.post(
        `${Constants.api}/api/ai/scan-notes`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log(response.data);
      Alert.alert('Success', response.data.message);
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Something went wrong while scanning.');
    }

    setLoading(false);
  };

  return (
    <View style={styles.wrapper}>
      <CameraView
        ref={cameraRef}
        style={styles.cameraPreview}
        facing="back"
      />

      <TouchableOpacity
        onPress={handleCapture}
        style={styles.captureButton}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.captureText}>Capture</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}; 

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraPreview: {
    width: '90%',
    height: 400,
    borderRadius: 12,
    overflow: 'hidden',
  },
  captureButton: {
    backgroundColor: colors.primary,
    marginTop: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  captureText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 300,
  },
});

export default ScanNotesScreen;
