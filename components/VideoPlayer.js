import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions, Platform } from 'react-native';
import { Video } from 'expo-av';
import { ASSParser } from '../utils/assParser';
import { SubtitleRenderer } from './SubtitleRenderer';

/**
 * VideoPlayer Component
 * Main video player with .ass subtitle support
 */
export const VideoPlayer = ({ 
  videoSource, 
  subtitleSource, 
  style,
  onLoad,
  onError 
}) => {
  const [videoStatus, setVideoStatus] = useState({});
  const [subtitleData, setSubtitleData] = useState(null);
  const [activeSubtitles, setActiveSubtitles] = useState([]);
  const [videoDimensions, setVideoDimensions] = useState({ width: 0, height: 0 });
  const [containerDimensions, setContainerDimensions] = useState({ width: 0, height: 0 });
  
  const videoRef = useRef(null);
  const assParser = useRef(new ASSParser());
  const updateInterval = useRef(null);

  // Load and parse subtitle file
  useEffect(() => {
    if (subtitleSource) {
      loadSubtitles();
    }
  }, [subtitleSource]);

  // Update active subtitles based on video time
  useEffect(() => {
    if (videoStatus.isLoaded && subtitleData) {
      updateActiveSubtitles();
    }
  }, [videoStatus.positionMillis, subtitleData]);

  // Setup subtitle update interval
  useEffect(() => {
    if (videoStatus.isLoaded && videoStatus.isPlaying && subtitleData) {
      updateInterval.current = setInterval(() => {
        updateActiveSubtitles();
      }, 100); // Update every 100ms for smooth subtitle transitions
    } else {
      if (updateInterval.current) {
        clearInterval(updateInterval.current);
        updateInterval.current = null;
      }
    }

    return () => {
      if (updateInterval.current) {
        clearInterval(updateInterval.current);
      }
    };
  }, [videoStatus.isPlaying, subtitleData]);

  const loadSubtitles = async () => {
    try {
      let subtitleContent;
      
      if (typeof subtitleSource === 'string') {
        // URL or local file path
        const response = await fetch(subtitleSource);
        subtitleContent = await response.text();
      } else {
        // Direct content
        subtitleContent = subtitleSource;
      }
      
      const parsedData = assParser.current.parse(subtitleContent);
      setSubtitleData(parsedData);
      
      console.log('Subtitles loaded:', {
        styles: Object.keys(parsedData.styles).length,
        events: parsedData.events.length
      });
      
    } catch (error) {
      console.error('Error loading subtitles:', error);
      if (onError) {
        onError(error);
      }
    }
  };

  const updateActiveSubtitles = () => {
    if (!videoStatus.positionMillis || !subtitleData) return;
    
    const currentTime = videoStatus.positionMillis / 1000;
    const active = assParser.current.getActiveSubtitles(currentTime);
    setActiveSubtitles(active);
  };

  const handleVideoLoad = (status) => {
    setVideoStatus(status);
    
    if (status.naturalSize) {
      setVideoDimensions({
        width: status.naturalSize.width,
        height: status.naturalSize.height
      });
    }
    
    if (onLoad) {
      onLoad(status);
    }
  };

  const handleVideoStatusUpdate = (status) => {
    setVideoStatus(status);
  };

  const handleContainerLayout = (event) => {
    const { width, height } = event.nativeEvent.layout;
    setContainerDimensions({ width, height });
  };

  const getVideoStyle = () => {
    const screenData = Dimensions.get('window');
    const isWeb = Platform.OS === 'web';
    
    return {
      width: containerDimensions.width || screenData.width,
      height: containerDimensions.height || (screenData.width * 9 / 16), // 16:9 aspect ratio
      backgroundColor: '#000000',
    };
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
        useNativeControls={true}
        resizeMode="contain"
        isLooping={false}
        onLoad={handleVideoLoad}
        onPlaybackStatusUpdate={handleVideoStatusUpdate}
        onError={onError}
      />
      
      {/* Subtitle Overlay */}
      {subtitleData && activeSubtitles.length > 0 && (
        <SubtitleRenderer
          subtitles={activeSubtitles}
          styles={subtitleData.styles}
          videoWidth={videoDimensions.width}
          videoHeight={videoDimensions.height}
          containerWidth={containerDimensions.width}
          containerHeight={containerDimensions.height}
        />
      )}
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