import React, { useState } from 'react';
import { StyleSheet, View, Text, Alert, Platform, Dimensions, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { VideoPlayer } from './components/VideoPlayer';

/**
 * Main App Component
 * Demonstrates different .ass subtitle rendering methods:
 * 1. Direct WebView rendering (recommended)
 * 2. Native video player with built-in subtitle support
 * 3. Manual parsing (legacy fallback)
 */
export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [renderingMethod, setRenderingMethod] = useState('direct');

  // Video and subtitle sources
  const videoSource = {
    uri: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
  };
  
  const subtitleSource = 'https://raw.githubusercontent.com/1234-ad/react-native-ass-video-player/main/assets/sample-subtitles.ass';

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
        height: Math.min(width * 0.9, 800) * 9 / 16,
      };
    }
    
    return {
      width: width,
      height: isLandscape ? height * 0.8 : width * 9 / 16,
    };
  };

  const renderingMethods = [
    { key: 'direct', label: 'Direct WebView', description: 'WebView with JS ASS renderer' },
    { key: 'native', label: 'Native Player', description: 'Built-in subtitle support' },
    { key: 'parsed', label: 'Manual Parsing', description: 'Legacy parsing method' }
  ];

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <View style={styles.header}>
        <Text style={styles.title}>React Native ASS Video Player</Text>
        <Text style={styles.subtitle}>
          Direct .ass file rendering without manual parsing
        </Text>
      </View>

      {/* Rendering Method Selector */}
      <View style={styles.methodSelector}>
        <Text style={styles.methodTitle}>Rendering Method:</Text>
        <View style={styles.methodButtons}>
          {renderingMethods.map((method) => (
            <TouchableOpacity
              key={method.key}
              style={[
                styles.methodButton,
                renderingMethod === method.key && styles.methodButtonActive
              ]}
              onPress={() => setRenderingMethod(method.key)}
            >
              <Text style={[
                styles.methodButtonText,
                renderingMethod === method.key && styles.methodButtonTextActive
              ]}>
                {method.label}
              </Text>
              <Text style={styles.methodButtonDesc}>
                {method.description}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.videoContainer}>
        <VideoPlayer
          videoSource={videoSource}
          subtitleSource={subtitleSource}
          renderingMethod={renderingMethod}
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
        <Text style={styles.featuresTitle}>Direct Rendering Benefits:</Text>
        <Text style={styles.featureItem}>✓ No manual .ass parsing required</Text>
        <Text style={styles.featureItem}>✓ Future-proof against format changes</Text>
        <Text style={styles.featureItem}>✓ Better performance and accuracy</Text>
        <Text style={styles.featureItem}>✓ Native subtitle engine support</Text>
        <Text style={styles.featureItem}>✓ Full .ass specification compliance</Text>
        <Text style={styles.featureItem}>✓ Advanced effects and animations</Text>
        <Text style={styles.featureItem}>✓ Reduced maintenance overhead</Text>
      </View>

      <View style={styles.methodInfo}>
        <Text style={styles.methodInfoTitle}>Current Method: {renderingMethods.find(m => m.key === renderingMethod)?.label}</Text>
        <Text style={styles.methodInfoDesc}>
          {renderingMethod === 'direct' && 
            'Uses WebView with JavaScript ASS renderer for accurate subtitle display without parsing.'
          }
          {renderingMethod === 'native' && 
            'Leverages native video player capabilities for built-in .ass subtitle support.'
          }
          {renderingMethod === 'parsed' && 
            'Legacy method that manually parses .ass files (may be unreliable with format changes).'
          }
        </Text>
      </View>

      <View style={styles.instructions}>
        <Text style={styles.instructionsTitle}>Implementation Notes:</Text>
        <Text style={styles.instructionItem}>• Direct rendering eliminates parsing complexity</Text>
        <Text style={styles.instructionItem}>• WebView method works across all platforms</Text>
        <Text style={styles.instructionItem}>• Native method provides best performance</Text>
        <Text style={styles.instructionItem}>• Fallback to parsing for compatibility</Text>
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
  methodSelector: {
    marginBottom: 20,
    paddingHorizontal: 20,
    width: '100%',
    maxWidth: 600,
  },
  methodTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 10,
    textAlign: 'center',
  },
  methodButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
  },
  methodButton: {
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    padding: 12,
    margin: 4,
    minWidth: 120,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  methodButtonActive: {
    backgroundColor: '#3a3a3a',
    borderColor: '#ffaa00',
  },
  methodButtonText: {
    color: '#cccccc',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  methodButtonTextActive: {
    color: '#ffaa00',
  },
  methodButtonDesc: {
    color: '#999999',
    fontSize: 10,
    textAlign: 'center',
    marginTop: 4,
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
    marginBottom: 15,
  },
  featuresTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  featureItem: {
    fontSize: 13,
    color: '#cccccc',
    marginBottom: 4,
    paddingLeft: 10,
  },
  methodInfo: {
    paddingHorizontal: 20,
    maxWidth: 400,
    marginBottom: 15,
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    padding: 15,
  },
  methodInfoTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffaa00',
    marginBottom: 8,
  },
  methodInfoDesc: {
    fontSize: 12,
    color: '#cccccc',
    lineHeight: 16,
  },
  instructions: {
    paddingHorizontal: 20,
    maxWidth: 400,
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    padding: 15,
  },
  instructionsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffaa00',
    marginBottom: 8,
  },
  instructionItem: {
    fontSize: 12,
    color: '#cccccc',
    marginBottom: 4,
    paddingLeft: 5,
  },
});