/**
 * Demo Script for React Native ASS Video Player
 * Provides sample data and testing utilities
 */

// Sample video URLs for testing
export const SAMPLE_VIDEOS = {
  bigBuckBunny: {
    uri: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    title: 'Big Buck Bunny',
    duration: 596
  },
  elephantsDream: {
    uri: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    title: 'Elephants Dream',
    duration: 653
  },
  sintel: {
    uri: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    title: 'Sintel',
    duration: 888
  }
};

// Sample ASS subtitle content for testing
export const SAMPLE_ASS_CONTENT = `[Script Info]
Title: Demo Subtitles
ScriptType: v4.00+
WrapStyle: 0
ScaledBorderAndShadow: yes
YCbCr Matrix: TV.601
PlayResX: 1920
PlayResY: 1080

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,Arial,24,&H00FFFFFF,&H000000FF,&H00000000,&H80000000,0,0,0,0,100,100,0,0,1,2,0,2,10,10,10,1
Style: Title,Arial,32,&H00FFD700,&H000000FF,&H00000000,&H80000000,1,0,0,0,100,100,0,0,1,3,0,8,10,10,10,1
Style: Narrator,Times New Roman,20,&H00ADD8E6,&H000000FF,&H00000000,&H80000000,0,1,0,0,100,100,0,0,1,2,0,2,10,10,10,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
Dialogue: 0,0:00:01.00,0:00:05.00,Title,,0,0,0,,ASS Video Player Demo
Dialogue: 0,0:00:06.00,0:00:10.00,Default,,0,0,0,,This demonstrates .ass subtitle support!
Dialogue: 0,0:00:11.00,0:00:15.00,Default,,0,0,0,,{\\b1}Bold{\\b0}, {\\i1}italic{\\i0}, and {\\c&H00FF00&}colored{\\c} text.
Dialogue: 0,0:00:16.00,0:00:20.00,Narrator,,0,0,0,,Different styles and positioning work perfectly.
Dialogue: 0,0:00:21.00,0:00:25.00,Default,,0,0,0,,Subtitles stay synchronized during seeking!`;

// Test cases for subtitle parsing
export const TEST_CASES = [
  {
    name: 'Basic Text',
    input: 'Simple subtitle text',
    expected: { text: 'Simple subtitle text', overrides: [] }
  },
  {
    name: 'Bold Text',
    input: '{\\b1}Bold text{\\b0}',
    expected: {
      text: 'Bold text',
      overrides: [
        { position: 0, codes: { bold: true } },
        { position: 9, codes: { bold: false } }
      ]
    }
  },
  {
    name: 'Colored Text',
    input: '{\\c&H00FF00&}Green text{\\c}',
    expected: {
      text: 'Green text',
      overrides: [
        { position: 0, codes: { primaryColor: '#00FF00' } },
        { position: 10, codes: {} }
      ]
    }
  },
  {
    name: 'Positioned Text',
    input: '{\\pos(100,200)}Positioned text',
    expected: {
      text: 'Positioned text',
      overrides: [
        { position: 0, codes: { position: { x: 100, y: 200 } } }
      ]
    }
  }
];

// Utility functions for testing
export const TestUtils = {
  /**
   * Generate test subtitle events
   */
  generateTestEvents: (count = 10, duration = 60) => {
    const events = [];
    const interval = duration / count;
    
    for (let i = 0; i < count; i++) {
      const start = i * interval;
      const end = start + interval - 1;
      
      events.push({
        layer: 0,
        start,
        end,
        style: 'Default',
        name: '',
        marginL: 0,
        marginR: 0,
        marginV: 0,
        effect: '',
        text: {
          text: `Test subtitle ${i + 1}`,
          overrides: []
        }
      });
    }
    
    return events;
  },

  /**
   * Validate ASS parsing results
   */
  validateParsing: (parsedData) => {
    const errors = [];
    
    if (!parsedData.styles || Object.keys(parsedData.styles).length === 0) {
      errors.push('No styles found');
    }
    
    if (!parsedData.events || parsedData.events.length === 0) {
      errors.push('No events found');
    }
    
    // Check for timing issues
    parsedData.events?.forEach((event, index) => {
      if (event.start >= event.end) {
        errors.push(`Event ${index}: start time >= end time`);
      }
      
      if (event.start < 0) {
        errors.push(`Event ${index}: negative start time`);
      }
    });
    
    return {
      isValid: errors.length === 0,
      errors
    };
  },

  /**
   * Performance testing utility
   */
  measurePerformance: (fn, iterations = 1000) => {
    const start = performance.now();
    
    for (let i = 0; i < iterations; i++) {
      fn();
    }
    
    const end = performance.now();
    const totalTime = end - start;
    const avgTime = totalTime / iterations;
    
    return {
      totalTime: totalTime.toFixed(2),
      averageTime: avgTime.toFixed(4),
      iterations
    };
  },

  /**
   * Memory usage monitoring
   */
  monitorMemory: () => {
    if (performance.memory) {
      return {
        used: Math.round(performance.memory.usedJSHeapSize / 1048576),
        total: Math.round(performance.memory.totalJSHeapSize / 1048576),
        limit: Math.round(performance.memory.jsHeapSizeLimit / 1048576)
      };
    }
    return null;
  }
};

// Demo configuration
export const DEMO_CONFIG = {
  defaultVideo: SAMPLE_VIDEOS.bigBuckBunny,
  defaultSubtitles: SAMPLE_ASS_CONTENT,
  updateInterval: 100, // ms
  seekTolerance: 0.1, // seconds
  maxSubtitleLength: 100, // characters
  supportedFormats: ['mp4', 'webm', 'mov'],
  platforms: {
    web: {
      supported: true,
      features: ['fullscreen', 'pip', 'keyboard']
    },
    ios: {
      supported: true,
      features: ['airplay', 'background']
    },
    android: {
      supported: true,
      features: ['cast', 'background']
    }
  }
};

// Export everything for easy importing
export default {
  SAMPLE_VIDEOS,
  SAMPLE_ASS_CONTENT,
  TEST_CASES,
  TestUtils,
  DEMO_CONFIG
};