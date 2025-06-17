import { useState, useEffect } from 'react';
import { Platform } from 'react-native';
import { useAppStore } from '@/stores/appStore';

export function useVoice() {
  const { isRecording, setRecording, setProcessingVoice } = useAppStore();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [recording, setRecordingObj] = useState<any>(null);
  const [transcript, setTranscript] = useState('');

  // Check for permissions on mount
  useEffect(() => {
    (async () => {
      if (Platform.OS !== 'web') {
        try {
          const { Audio } = require('expo-av');
          const { status } = await Audio.requestPermissionsAsync();
          setHasPermission(status === 'granted');
        } catch (error) {
          console.log('Audio permissions not available on this platform');
          setHasPermission(false);
        }
      } else {
        setHasPermission(false);
      }
    })();
  }, []);

  const startRecording = async () => {
    if (Platform.OS === 'web') {
      console.log('Voice recording not supported on web');
      return;
    }
    
    try {
      const { Audio } = require('expo-av');
      
      // Set audio mode for recording
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      
      console.log('Starting recording...');
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      
      setRecordingObj(recording);
      setRecording(true);
      setTranscript('');
    } catch (error) {
      console.error('Failed to start recording', error);
    }
  };

  const stopRecording = async () => {
    if (!recording || Platform.OS === 'web') return;
    
    try {
      console.log('Stopping recording...');
      setRecording(false);
      setProcessingVoice(true);
      
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecordingObj(null);
      
      // In a real app, we would upload the audio file to a server for transcription
      // For this MVP, we'll simulate a transcription with a timeout
      setTimeout(() => {
        // Simulate transcription result
        const mockTranscript = "Clean up my inbox and show me important emails from today";
        setTranscript(mockTranscript);
        setProcessingVoice(false);
      }, 1500);
      
      // Reset audio mode
      const { Audio } = require('expo-av');
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });
    } catch (error) {
      console.error('Failed to stop recording', error);
      setRecording(false);
      setProcessingVoice(false);
    }
  };

  return {
    hasPermission,
    isRecording,
    transcript,
    startRecording,
    stopRecording,
  };
}