import { FontAwesome } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { colors } from '../utils/colors';
import Constants from '../utils/constants';
import { getToken } from '../utils/token';

const { width } = Dimensions.get('window');

const RecordScreen = () => {
  const [recordingTime, setRecordingTime] = useState(0);
  const [mode, setMode] = useState<'voice' | 'text'>('voice');
  const botMessageRef = useRef('');


  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<{ role: string; message: string }[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      if (mode === 'voice') {
        setRecordingTime((prev) => prev + 1);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [mode]);

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


  const sendMessage = async () => {
    if (!message.trim()) return;
  
    const newHistory = [...chatHistory, { role: 'user', message }];
    setChatHistory(newHistory);
    setMessage('');
    setLoading(true);
  
    botMessageRef.current = ''; // reset
  
    try {
      const token = await getToken();
  
      const response = await fetch(`${Constants.api}/api/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message,
          history: newHistory,
        }),
      });
  
      const textResponse = await response.text();
      console.log(textResponse)
  
      // Get last message from streamed lines
      const lines = textResponse
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.startsWith('data: ') && line !== 'data: [DONE]');
  
      // ✅ Get last valid JSON line only
      const lastLine = lines[lines.length - 1];
      if (lastLine) {
        const jsonString = lastLine.replace(/^data:\s*/, '');
        const parsed = JSON.parse(jsonString);
        botMessageRef.current = parsed?.message || '';
      }
  
      setChatHistory((prev) => [
        ...prev,
        { role: 'model', message: botMessageRef.current || '⚠️ No response.' },
      ]);
    } catch (err) {
      console.error('Streaming fallback error:', err);
      setChatHistory((prev) => [
        ...prev,
        { role: 'model', message: '❌ Error getting response.' },
      ]);
    } finally {
      setLoading(false);
    }
  };
  


  


  return (
    <KeyboardAvoidingView
    style={{ flex: 1, paddingBottom: 20 }}
    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0} // Adjust if needed
  >
    <View style={styles.container}>
      <Text style={styles.title}>AI Tutor</Text>

      {mode === 'voice' ? (
        <View style={{flex:1, alignItems: 'center'}}>
          <View style={styles.micButton}>
            <View
              style={{
                padding: 10,
                backgroundColor: colors.lightPrimary,
                borderRadius: 50,
                height: 70,
                width: 70,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <FontAwesome name="microphone" size={48} color="white" />
            </View>
          </View>
          <Text style={styles.timer}>{formatTime(recordingTime)}</Text>
          <View style={styles.waveformContainer}>
            <View style={styles.waveform}>{renderWaveform()}</View>
          </View>
          <Text style={styles.statusText}>Speaking...</Text>
        </View>
      ) : (
        <KeyboardAvoidingView
          style={{ flex: 1, width: '100%' }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            style={styles.chatBox}
            contentContainerStyle={{ paddingBottom: 20 }}
          >
            {chatHistory.map((msg, i) => (
              <View
                key={i}
                style={[
                  styles.messageBubble,
                  msg.role === 'user' ? styles.userBubble : styles.modelBubble,
                ]}
              >
                <Text style={msg.role === 'user' ? styles.userText : styles.modelText}>
                  {msg.message}
                </Text>
              </View>
            ))}
            {loading && (
              <Text style={{ textAlign: 'center', marginTop: 10 }}>Typing...</Text>
            )}
          </ScrollView>

          <View style={styles.inputBar}>
            <TextInput
              value={message}
              onChangeText={setMessage}
              placeholder="Type your message..."
              style={styles.input}
            />
            <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
              <Text style={{ color: '#fff' }}>Send</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      )}

      <View style={styles.switchContainer}>
        <TouchableOpacity
          style={mode === 'voice' ? styles.activeSwitch : styles.inactiveSwitch}
          onPress={() => setMode('voice')}
        >
          <Text style={mode === 'voice' ? styles.activeText : styles.inactiveText}>🎙️ Voice</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={mode === 'text' ? styles.activeSwitch : styles.inactiveSwitch}
          onPress={() => setMode('text')}
        >
          <Text style={mode === 'text' ? styles.activeText : styles.inactiveText}>📝 Text</Text>
        </TouchableOpacity>
      </View>
    </View>
    </KeyboardAvoidingView>
  );
};

export default RecordScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
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
  statusText: {
    fontSize: 16,
    marginBottom: 30,
  },
  switchContainer: {
    
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
    marginBottom: 20
  },
  activeSwitch: {
    backgroundColor: colors.primary,
    paddingVertical: 15,
    paddingHorizontal: 50,
    borderRadius: 10,
  },
  inactiveSwitch: {
    backgroundColor: '#ddd',
    paddingVertical: 15,
    paddingHorizontal: 50,
    borderRadius: 10,
  },
  activeText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  inactiveText: {
    color: '#555',
    fontWeight: 'bold',
  },
  chatBox: {
    flex: 1,
    paddingHorizontal: 20,
    width: '100%',
  },
  messageBubble: {
    padding: 10,
    marginVertical: 5,
    borderRadius: 8,
    maxWidth: '80%',
  },
  userBubble: {
    backgroundColor: '#DCF8C6',
    alignSelf: 'flex-end',
  },
  modelBubble: {
    backgroundColor: '#EEE',
    alignSelf: 'flex-start',
  },
  userText: {
    color: '#000',
  },
  modelText: {
    color: '#000',
  },
  inputBar: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderColor: '#ccc',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 15,
    marginRight: 10,
    borderColor: '#ccc',
  },
  sendButton: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
});
