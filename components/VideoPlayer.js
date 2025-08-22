import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions, Platform } from 'react-native';
import { Video } from 'expo-av';
import { DirectASSRenderer } from './DirectASSRenderer';
import { NativeVideoPlayer } from './NativeVideoPlayer';
import { ASSParser } from '../utils/assParser';
import { SubtitleRenderer } from './SubtitleRenderer';

/**
 * Enhanced VideoPlayer Component
 * Supports multiple .ass rendering methods:
 * 1. Direct WebView rendering (recommended)
 * 2. Native video player with built-in subtitle support
 * 3. Fallback to manual parsing (legacy)
 */
export const VideoPlayer = ({ 
  videoSource, 
  subtitleSource, 
  style,
  onLoad,
  onError,
  renderingMethod = 'direct' // 'direct', 'native', 'parsed'
}) => {
  const [videoStatus, setVideoStatus] = useState({});
  const [subtitleData, setSubtitleData] = useState(null);
  const [activeSubtitles, setActiveSubtitles] = useState([]);
  const [videoDimensions, setVideoDimensions] = useState({ width: 0, height: 0 });
  const [containerDimensions, setContainerDimensions] = useState({ width: 0, height: 0 });
  
  const videoRef = useRef(null);
  const assParser = useRef(new ASSParser());
  const updateInterval = useRef(null);

  // Load and parse subtitle file (for parsed method)
  useEffect(() => {
    if (subtitleSource && renderingMethod === 'parsed') {
      loadSubtitles();
    }
  }, [subtitleSource, renderingMethod]);

  // Update active subtitles based on video time (for parsed method)
  useEffect(() => {
    if (videoStatus.isLoaded && subtitleData && renderingMethod === 'parsed') {
      updateActiveSubtitles();
    }
  }, [videoStatus.positionMillis, subtitleData, renderingMethod]);

  // Setup subtitle update interval (for parsed method)
  useEffect(() => {
    if (videoStatus.isLoaded && videoStatus.isPlaying && subtitleData && renderingMethod === 'parsed') {
      updateInterval.current = setInterval(() => {
        updateActiveSubtitles();
      }, 100);
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
  }, [videoStatus.isPlaying, subtitleData, renderingMethod]);

  const loadSubtitles = async () => {
    try {
      let subtitleContent;
      
      if (typeof subtitleSource === 'string') {
        const response = await fetch(subtitleSource);
        subtitleContent = await response.text();
      } else {
        subtitleContent = subtitleSource;
      }
      
      const parsedData = assParser.current.parse(subtitleContent);
      setSubtitleData(parsedData);
      
      console.log('Subtitles loaded (parsed method):', {
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
    
    return {
      width: containerDimensions.width || screenData.width,
      height: containerDimensions.height || (screenData.width * 9 / 16),
      backgroundColor: '#000000',
    };
  };

  // Render based on selected method
  const renderVideoPlayer = () => {
    switch (renderingMethod) {
      case 'native':
        return (
          <NativeVideoPlayer
            videoSource={videoSource}
            subtitleSource={subtitleSource}
            style={getVideoStyle()}
            onLoad={handleVideoLoad}
            onError={onError}
          />
        );
        
      case 'direct':
        return (
          <>
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
            
            {/* Direct ASS Renderer Overlay */}
            {subtitleSource && (
              <DirectASSRenderer
                subtitleSource={subtitleSource}
                currentTime={videoStatus.positionMillis ? videoStatus.positionMillis / 1000 : 0}
                videoWidth={videoDimensions.width}
                videoHeight={videoDimensions.height}
                containerWidth={containerDimensions.width}
                containerHeight={containerDimensions.height}
                style={StyleSheet.absoluteFillObject}
              />
            )}
          </>
        );
        
      case 'parsed':
      default:
        return (
          <>
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
            
            {/* Parsed Subtitle Overlay */}
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
          </>
        );
    }
  };

  return (
    <View 
      style={[styles.container, style]}
      onLayout={handleContainerLayout}
    >
      {renderVideoPlayer()}
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