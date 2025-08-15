import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';

/**
 * SubtitleRenderer Component
 * Renders .ass subtitles with proper styling, positioning, and timing
 */
export const SubtitleRenderer = ({ 
  subtitles, 
  styles, 
  videoWidth, 
  videoHeight,
  containerWidth,
  containerHeight 
}) => {
  if (!subtitles || subtitles.length === 0) {
    return null;
  }

  // Calculate scale factors for responsive positioning
  const scaleX = containerWidth / (videoWidth || containerWidth);
  const scaleY = containerHeight / (videoHeight || containerHeight);

  const renderSubtitle = (subtitle, index) => {
    const style = styles[subtitle.style] || styles['Default'] || {};
    const textData = subtitle.text;
    
    // Apply base style
    const baseStyle = {
      position: 'absolute',
      fontFamily: style.fontName || 'System',
      fontSize: (style.fontSize || 16) * Math.min(scaleX, scaleY),
      color: style.primaryColor || '#FFFFFF',
      fontWeight: style.bold ? 'bold' : 'normal',
      fontStyle: style.italic ? 'italic' : 'normal',
      textDecorationLine: getTextDecoration(style),
      textShadowColor: style.outlineColor || '#000000',
      textShadowOffset: { width: 1, height: 1 },
      textShadowRadius: style.outline || 1,
      letterSpacing: style.spacing || 0,
      transform: [
        { scaleX: (style.scaleX || 100) / 100 },
        { scaleY: (style.scaleY || 100) / 100 },
        { rotate: `${style.angle || 0}deg` }
      ]
    };

    // Calculate position based on alignment
    const position = calculatePosition(
      style, 
      subtitle, 
      containerWidth, 
      containerHeight,
      scaleX,
      scaleY
    );

    return (
      <View
        key={`subtitle-${index}`}
        style={[
          styles.subtitleContainer,
          {
            left: position.x,
            top: position.y,
            width: position.width,
            height: position.height,
          }
        ]}
      >
        {renderStyledText(textData, baseStyle, style)}
      </View>
    );
  };

  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
      {subtitles.map(renderSubtitle)}
    </View>
  );
};

/**
 * Render text with inline styling overrides
 */
const renderStyledText = (textData, baseStyle, defaultStyle) => {
  if (typeof textData === 'string') {
    return <Text style={baseStyle}>{textData}</Text>;
  }

  const { text, overrides } = textData;
  
  if (!overrides || overrides.length === 0) {
    return <Text style={baseStyle}>{text}</Text>;
  }

  // Split text into segments based on override positions
  const segments = [];
  let lastPos = 0;
  
  overrides.forEach((override, index) => {
    // Add text before override
    if (override.position > lastPos) {
      segments.push({
        text: text.substring(lastPos, override.position),
        style: baseStyle
      });
    }
    
    // Find next override position or end of text
    const nextPos = index < overrides.length - 1 
      ? overrides[index + 1].position 
      : text.length;
    
    // Add styled text segment
    if (nextPos > override.position) {
      const segmentStyle = {
        ...baseStyle,
        ...applyOverrideCodes(override.codes, baseStyle, defaultStyle)
      };
      
      segments.push({
        text: text.substring(override.position, nextPos),
        style: segmentStyle
      });
    }
    
    lastPos = nextPos;
  });
  
  // Add remaining text
  if (lastPos < text.length) {
    segments.push({
      text: text.substring(lastPos),
      style: baseStyle
    });
  }

  return (
    <Text>
      {segments.map((segment, index) => (
        <Text key={index} style={segment.style}>
          {segment.text}
        </Text>
      ))}
    </Text>
  );
};

/**
 * Apply override codes to style
 */
const applyOverrideCodes = (codes, baseStyle, defaultStyle) => {
  const overrideStyle = {};
  
  if (codes.primaryColor) {
    overrideStyle.color = codes.primaryColor;
  }
  
  if (codes.fontSize) {
    overrideStyle.fontSize = codes.fontSize;
  }
  
  if (codes.bold !== undefined) {
    overrideStyle.fontWeight = codes.bold ? 'bold' : 'normal';
  }
  
  if (codes.italic !== undefined) {
    overrideStyle.fontStyle = codes.italic ? 'italic' : 'normal';
  }
  
  if (codes.underline !== undefined || codes.strikeOut !== undefined) {
    const decorations = [];
    if (codes.underline) decorations.push('underline');
    if (codes.strikeOut) decorations.push('line-through');
    overrideStyle.textDecorationLine = decorations.join(' ') || 'none';
  }
  
  if (codes.outlineColor) {
    overrideStyle.textShadowColor = codes.outlineColor;
  }
  
  if (codes.spacing !== undefined) {
    overrideStyle.letterSpacing = codes.spacing;
  }
  
  // Handle transforms
  const transforms = [...(baseStyle.transform || [])];
  
  if (codes.scaleX !== undefined) {
    const scaleXIndex = transforms.findIndex(t => t.scaleX !== undefined);
    if (scaleXIndex >= 0) {
      transforms[scaleXIndex] = { scaleX: codes.scaleX / 100 };
    } else {
      transforms.push({ scaleX: codes.scaleX / 100 });
    }
  }
  
  if (codes.scaleY !== undefined) {
    const scaleYIndex = transforms.findIndex(t => t.scaleY !== undefined);
    if (scaleYIndex >= 0) {
      transforms[scaleYIndex] = { scaleY: codes.scaleY / 100 };
    } else {
      transforms.push({ scaleY: codes.scaleY / 100 });
    }
  }
  
  if (codes.rotation !== undefined) {
    const rotateIndex = transforms.findIndex(t => t.rotate !== undefined);
    if (rotateIndex >= 0) {
      transforms[rotateIndex] = { rotate: `${codes.rotation}deg` };
    } else {
      transforms.push({ rotate: `${codes.rotation}deg` });
    }
  }
  
  if (transforms.length > 0) {
    overrideStyle.transform = transforms;
  }
  
  return overrideStyle;
};

/**
 * Calculate subtitle position based on alignment and margins
 */
const calculatePosition = (style, subtitle, containerWidth, containerHeight, scaleX, scaleY) => {
  const alignment = style.alignment || 2;
  const marginL = (style.marginL || subtitle.marginL || 0) * scaleX;
  const marginR = (style.marginR || subtitle.marginR || 0) * scaleX;
  const marginV = (style.marginV || subtitle.marginV || 0) * scaleY;
  
  let x = 0;
  let y = 0;
  let width = containerWidth - marginL - marginR;
  let height = 'auto';
  
  // Handle horizontal alignment (1-3: bottom, 4-6: middle, 7-9: top)
  // Handle vertical alignment (1,4,7: left, 2,5,8: center, 3,6,9: right)
  
  // Vertical position
  if (alignment >= 7) {
    // Top
    y = marginV;
  } else if (alignment >= 4) {
    // Middle
    y = containerHeight / 2;
  } else {
    // Bottom
    y = containerHeight - marginV - 50; // Approximate text height
  }
  
  // Horizontal position
  const horizontalAlign = ((alignment - 1) % 3) + 1;
  if (horizontalAlign === 1) {
    // Left
    x = marginL;
  } else if (horizontalAlign === 2) {
    // Center
    x = marginL;
    width = containerWidth - marginL - marginR;
  } else {
    // Right
    x = marginL;
    width = containerWidth - marginL - marginR;
  }
  
  return { x, y, width, height };
};

/**
 * Get text decoration based on style
 */
const getTextDecoration = (style) => {
  const decorations = [];
  if (style.underline) decorations.push('underline');
  if (style.strikeOut) decorations.push('line-through');
  return decorations.join(' ') || 'none';
};

const styles = StyleSheet.create({
  subtitleContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
});