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

  // Sample video and subtitle URLs (replace with actual URLs from Google Drive)
  const videoSource = {
    uri: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
  };
  
  // Sample .ass subtitle content (replace with actual .ass file content)
  const sampleAssSubtitle = `[Script Info]
Title: Sample Subtitles
ScriptType: v4.00+

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,Arial,20,&H00FFFFFF,&H000000FF,&H00000000,&H80000000,0,0,0,0,100,100,0,0,1,2,0,2,10,10,10,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
Dialogue: 0,0:00:01.00,0:00:05.00,Default,,0,0,0,,Welcome to the video player demo!
Dialogue: 0,0:00:06.00,0:00:10.00,Default,,0,0,0,,This player supports .ass subtitles with full styling.
Dialogue: 0,0:00:11.00,0:00:15.00,Default,,0,0,0,,Subtitles remain in sync during seeking and playback.
Dialogue: 0,0:00:16.00,0:00:20.00,Default,,0,0,0,,{\\b1}Bold text{\\b0} and {\\i1}italic text{\\i0} are supported.
Dialogue: 0,0:00:21.00,0:00:25.00,Default,,0,0,0,,{\\c&H00FF00&}Colored text{\\c} and {\\fs30}different sizes{\\fs} work too!`;

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
          subtitleSource={sampleAssSubtitle}
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
        <Text style={styles.featuresTitle}>Features:</Text>
        <Text style={styles.featureItem}>✓ Full .ass subtitle format support</Text>
        <Text style={styles.featureItem}>✓ Styling preservation (colors, fonts, effects)</Text>
        <Text style={styles.featureItem}>✓ Precise timing and positioning</Text>
        <Text style={styles.featureItem}>✓ Seek synchronization</Text>
        <Text style={styles.featureItem}>✓ Cross-platform (Web, iOS, Android)</Text>
        <Text style={styles.featureItem}>✓ Responsive design</Text>
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
});