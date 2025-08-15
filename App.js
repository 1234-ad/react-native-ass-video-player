import React, { useState } from 'react';
import { StyleSheet, View, Text, Alert, Platform, Dimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { VideoPlayer } from './components/VideoPlayer';

/**
 * Main App Component
 * Demonstrates the video player with .ass subtitle support
 */
export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // TODO: Replace with actual Google Drive video URL
  // Get direct download link from Google Drive sharing
  const videoSource = {
    uri: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
    // Replace with: 'https://drive.google.com/uc?export=download&id=YOUR_VIDEO_FILE_ID'
  };
  
  // TODO: Replace with actual .ass subtitle file URL
  // Get direct download link from Google Drive sharing
  const subtitleSource = 'https://raw.githubusercontent.com/1234-ad/react-native-ass-video-player/main/assets/sample-subtitles.ass';
  // Replace with: 'https://drive.google.com/uc?export=download&id=YOUR_SUBTITLE_FILE_ID'

  const handleVideoLoad = (status) => {
    console.log('Video loaded:', status);
    setIsLoading(false);
  };

  const handleVideoError = (error) => {
    console.error('Video error:', error);
    setError(error.message || 'Failed to load video');
    setIsLoading(false);
    
    Alert.alert(
      'Video Error',
      error.message || 'Failed to load video',
      [{ text: 'OK' }]
    );
  };

  const getResponsiveStyle = () => {
    const { width, height } = Dimensions.get('window');
    const isLandscape = width > height;
    const isWeb = Platform.OS === 'web';
    
    if (isWeb) {
      return {
        width: Math.min(width * 0.9, 800),
        height: Math.min(width * 0.9, 800) * 9 / 16, // 16:9 aspect ratio
      };
    }
    
    return {
      width: width,
      height: isLandscape ? height * 0.8 : width * 9 / 16,
    };
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <View style={styles.header}>
        <Text style={styles.title}>React Native ASS Video Player</Text>
        <Text style={styles.subtitle}>
          Supports .ass subtitles with full styling and positioning
        </Text>
      </View>

      <View style={styles.videoContainer}>
        <VideoPlayer
          videoSource={videoSource}
          subtitleSource={subtitleSource}
          style={[styles.videoPlayer, getResponsiveStyle()]}
          onLoad={handleVideoLoad}
          onError={handleVideoError}
        />
        
        {isLoading && (
          <View style={styles.loadingOverlay}>
            <Text style={styles.loadingText}>Loading video...</Text>
          </View>
        )}
        
        {error && (
          <View style={styles.errorOverlay}>
            <Text style={styles.errorText}>Error: {error}</Text>
          </View>
        )}
      </View>

      <View style={styles.features}>
        <Text style={styles.featuresTitle}>Features Demonstrated:</Text>
        <Text style={styles.featureItem}>✓ Full .ass subtitle format support</Text>
        <Text style={styles.featureItem}>✓ Styling preservation (colors, fonts, effects)</Text>
        <Text style={styles.featureItem}>✓ Precise timing and positioning</Text>
        <Text style={styles.featureItem}>✓ Seek synchronization</Text>
        <Text style={styles.featureItem}>✓ Cross-platform (Web, iOS, Android)</Text>
        <Text style={styles.featureItem}>✓ Responsive design</Text>
        <Text style={styles.featureItem}>✓ Override codes support</Text>
        <Text style={styles.featureItem}>✓ Multiple subtitle layers</Text>
      </View>

      <View style={styles.instructions}>
        <Text style={styles.instructionsTitle}>Setup Instructions:</Text>
        <Text style={styles.instructionItem}>1. Replace video URL with Google Drive link</Text>
        <Text style={styles.instructionItem}>2. Replace subtitle URL with .ass file link</Text>
        <Text style={styles.instructionItem}>3. Run: npm install && npm start</Text>
        <Text style={styles.instructionItem}>4. Test on Web, iOS, and Android</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: Platform.OS === 'web' ? 20 : 50,
    paddingHorizontal: 10,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#cccccc',
    textAlign: 'center',
  },
  videoContainer: {
    position: 'relative',
    marginBottom: 20,
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  videoPlayer: {
    borderRadius: 8,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#ffffff',
    fontSize: 16,
  },
  errorOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 14,
    textAlign: 'center',
  },
  features: {
    paddingHorizontal: 20,
    maxWidth: 400,
    marginBottom: 20,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 10,
  },
  featureItem: {
    fontSize: 14,
    color: '#cccccc',
    marginBottom: 5,
    paddingLeft: 10,
  },
  instructions: {
    paddingHorizontal: 20,
    maxWidth: 400,
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    padding: 15,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffaa00',
    marginBottom: 10,
  },
  instructionItem: {
    fontSize: 13,
    color: '#cccccc',
    marginBottom: 5,
    paddingLeft: 5,
  },
});