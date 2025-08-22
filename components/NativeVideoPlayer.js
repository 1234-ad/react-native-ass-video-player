import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Dimensions, Platform } from 'react-native';
import Video from 'react-native-video';

/**
 * NativeVideoPlayer Component
 * Uses react-native-video with built-in subtitle support for direct .ass rendering
 * This approach leverages native video player capabilities for subtitle rendering
 */
export const NativeVideoPlayer = ({ 
  videoSource, 
  subtitleSource, 
  style,
  onLoad,
  onError 
}) => {
  const [videoStatus, setVideoStatus] = useState({});
  const [videoDimensions, setVideoDimensions] = useState({ width: 0, height: 0 });
  const [containerDimensions, setContainerDimensions] = useState({ width: 0, height: 0 });
  
  const videoRef = useRef(null);

  const handleVideoLoad = (data) => {
    const status = {
      isLoaded: true,
      naturalSize: {
        width: data.naturalSize?.width || 1920,
        height: data.naturalSize?.height || 1080
      },
      duration: data.duration * 1000, // Convert to milliseconds
      positionMillis: 0,
      isPlaying: false
    };
    
    setVideoStatus(status);
    setVideoDimensions({
      width: status.naturalSize.width,
      height: status.naturalSize.height
    });
    
    if (onLoad) {
      onLoad(status);
    }
  };

  const handleVideoProgress = (data) => {
    const updatedStatus = {
      ...videoStatus,
      positionMillis: data.currentTime * 1000, // Convert to milliseconds
      isPlaying: !data.paused
    };
    
    setVideoStatus(updatedStatus);
  };

  const handleVideoError = (error) => {
    console.error('Native video error:', error);
    if (onError) {
      onError(error);
    }
  };

  const handleContainerLayout = (event) => {
    const { width, height } = event.nativeEvent.layout;
    setContainerDimensions({ width, height });
  };

  const getVideoStyle = () => {
    const screenData = Dimensions.get('window');
    
    return {
      width: containerDimensions.width || screenData.width,
      height: containerDimensions.height || (screenData.width * 9 / 16),
      backgroundColor: '#000000',
    };
  };

  // Prepare subtitle tracks for native video player
  const getSubtitleTracks = () => {
    if (!subtitleSource) return [];
    
    // For react-native-video, we need to provide subtitle tracks
    // The native player will handle .ass rendering directly
    return [
      {
        title: 'ASS Subtitles',
        language: 'en',
        type: 'text/ass', // Specify ASS format
        uri: typeof subtitleSource === 'string' ? subtitleSource : null,
      }
    ];
  };

  return (
    <View 
      style={[styles.container, style]}
      onLayout={handleContainerLayout}
    >
      <Video
        ref={videoRef}
        source={videoSource}
        style={getVideoStyle()}
        controls={true}
        resizeMode="contain"
        onLoad={handleVideoLoad}
        onProgress={handleVideoProgress}
        onError={handleVideoError}
        textTracks={getSubtitleTracks()}
        selectedTextTrack={{
          type: 'title',
          value: 'ASS Subtitles'
        }}
        // Enable subtitle rendering
        subtitleStyle={{
          fontSize: 16,
          paddingTop: 2,
          paddingBottom: 2,
          paddingLeft: 16,
          paddingRight: 16,
        }}
        // Additional props for better subtitle support
        allowsExternalPlayback={false}
        playWhenInactive={false}
        playInBackground={false}
        ignoreSilentSwitch="ignore"
        mixWithOthers="inherit"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
});