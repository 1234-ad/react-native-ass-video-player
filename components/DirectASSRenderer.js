import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import * as FileSystem from 'expo-file-system';

/**
 * DirectASSRenderer Component
 * Renders .ass subtitle files directly using WebView with JavaScript ASS renderer
 * This approach avoids manual parsing and provides more reliable rendering
 */
export const DirectASSRenderer = ({ 
  subtitleSource, 
  currentTime = 0,
  videoWidth = 1920,
  videoHeight = 1080,
  containerWidth = 400,
  containerHeight = 225,
  style 
}) => {
  const [assContent, setAssContent] = useState('');
  const [isReady, setIsReady] = useState(false);
  const webViewRef = useRef(null);

  // Load ASS file content
  useEffect(() => {
    if (subtitleSource) {
      loadASSFile();
    }
  }, [subtitleSource]);

  // Update current time in WebView
  useEffect(() => {
    if (isReady && webViewRef.current) {
      webViewRef.current.postMessage(JSON.stringify({
        type: 'updateTime',
        time: currentTime
      }));
    }
  }, [currentTime, isReady]);

  const loadASSFile = async () => {
    try {
      let content;
      
      if (typeof subtitleSource === 'string') {
        if (subtitleSource.startsWith('http')) {
          // Remote URL
          const response = await fetch(subtitleSource);
          content = await response.text();
        } else {
          // Local file
          content = await FileSystem.readAsStringAsync(subtitleSource);
        }
      } else {
        // Direct content
        content = subtitleSource;
      }
      
      setAssContent(content);
    } catch (error) {
      console.error('Error loading ASS file:', error);
    }
  };

  const handleWebViewMessage = (event) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);
      
      switch (message.type) {
        case 'ready':
          setIsReady(true);
          break;
        case 'error':
          console.error('ASS Renderer Error:', message.error);
          break;
        default:
          break;
      }
    } catch (error) {
      console.error('Error parsing WebView message:', error);
    }
  };

  // HTML content with JavaScript ASS renderer
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          margin: 0;
          padding: 0;
          background: transparent;
          overflow: hidden;
          font-family: Arial, sans-serif;
        }
        
        #subtitle-container {
          position: relative;
          width: 100vw;
          height: 100vh;
          pointer-events: none;
        }
        
        .subtitle-line {
          position: absolute;
          white-space: nowrap;
          text-align: center;
          pointer-events: none;
        }
        
        .subtitle-text {
          display: inline-block;
          text-shadow: 1px 1px 2px rgba(0,0,0,0.8);
        }
      </style>
    </head>
    <body>
      <div id="subtitle-container"></div>
      
      <script>
        class DirectASSRenderer {
          constructor() {
            this.assData = null;
            this.currentTime = 0;
            this.container = document.getElementById('subtitle-container');
            this.activeSubtitles = [];
            
            // Scale factors for responsive rendering
            this.scaleX = ${containerWidth} / ${videoWidth};
            this.scaleY = ${containerHeight} / ${videoHeight};
            
            this.init();
          }
          
          init() {
            // Parse ASS content
            this.parseASS(\`${assContent.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`);
            
            // Notify React Native that renderer is ready
            this.postMessage({ type: 'ready' });
          }
          
          parseASS(content) {
            try {
              this.assData = {
                styles: {},
                events: [],
                scriptInfo: {}
              };
              
              const lines = content.split('\\n');
              let currentSection = '';
              let styleFormat = [];
              let eventFormat = [];
              
              for (let line of lines) {
                line = line.trim();
                
                if (line.startsWith('[') && line.endsWith(']')) {
                  currentSection = line.slice(1, -1).toLowerCase();
                  continue;
                }
                
                if (!line || line.startsWith(';')) continue;
                
                switch (currentSection) {
                  case 'script info':
                    this.parseScriptInfo(line);
                    break;
                  case 'v4+ styles':
                    if (line.startsWith('Format:')) {
                      styleFormat = line.substring(7).split(',').map(s => s.trim());
                    } else if (line.startsWith('Style:')) {
                      this.parseStyle(line, styleFormat);
                    }
                    break;
                  case 'events':
                    if (line.startsWith('Format:')) {
                      eventFormat = line.substring(7).split(',').map(s => s.trim());
                    } else if (line.startsWith('Dialogue:')) {
                      this.parseEvent(line, eventFormat);
                    }
                    break;
                }
              }
            } catch (error) {
              this.postMessage({ type: 'error', error: error.message });
            }
          }
          
          parseScriptInfo(line) {
            const [key, ...valueParts] = line.split(':');
            if (key && valueParts.length > 0) {
              this.assData.scriptInfo[key.trim()] = valueParts.join(':').trim();
            }
          }
          
          parseStyle(line, format) {
            const values = line.substring(6).split(',');
            const style = {};
            
            format.forEach((key, index) => {
              style[key] = values[index] ? values[index].trim() : '';
            });
            
            this.assData.styles[style.Name] = this.processStyle(style);
          }
          
          processStyle(style) {
            return {
              name: style.Name,
              fontName: style.Fontname || 'Arial',
              fontSize: parseInt(style.Fontsize) || 16,
              primaryColor: this.parseColor(style.PrimaryColour),
              secondaryColor: this.parseColor(style.SecondaryColour),
              outlineColor: this.parseColor(style.OutlineColour),
              backColor: this.parseColor(style.BackColour),
              bold: style.Bold === '1' || style.Bold === '-1',
              italic: style.Italic === '1' || style.Italic === '-1',
              underline: style.Underline === '1',
              strikeOut: style.StrikeOut === '1',
              scaleX: parseFloat(style.ScaleX) || 100,
              scaleY: parseFloat(style.ScaleY) || 100,
              spacing: parseFloat(style.Spacing) || 0,
              angle: parseFloat(style.Angle) || 0,
              borderStyle: parseInt(style.BorderStyle) || 1,
              outline: parseFloat(style.Outline) || 0,
              shadow: parseFloat(style.Shadow) || 0,
              alignment: parseInt(style.Alignment) || 2,
              marginL: parseInt(style.MarginL) || 0,
              marginR: parseInt(style.MarginR) || 0,
              marginV: parseInt(style.MarginV) || 0
            };
          }
          
          parseEvent(line, format) {
            const values = line.substring(9).split(',');
            const event = {};
            
            format.forEach((key, index) => {
              if (key === 'Text') {
                event[key] = values.slice(index).join(',').trim();
              } else {
                event[key] = values[index] ? values[index].trim() : '';
              }
            });
            
            this.assData.events.push(this.processEvent(event));
          }
          
          processEvent(event) {
            return {
              layer: parseInt(event.Layer) || 0,
              start: this.parseTime(event.Start),
              end: this.parseTime(event.End),
              style: event.Style,
              name: event.Name,
              marginL: parseInt(event.MarginL) || 0,
              marginR: parseInt(event.MarginR) || 0,
              marginV: parseInt(event.MarginV) || 0,
              effect: event.Effect,
              text: event.Text
            };
          }
          
          parseTime(timeStr) {
            const parts = timeStr.split(':');
            const hours = parseInt(parts[0]) || 0;
            const minutes = parseInt(parts[1]) || 0;
            const secondsParts = parts[2].split('.');
            const seconds = parseInt(secondsParts[0]) || 0;
            const centiseconds = parseInt(secondsParts[1]) || 0;
            
            return hours * 3600 + minutes * 60 + seconds + centiseconds / 100;
          }
          
          parseColor(colorStr) {
            if (!colorStr) return '#FFFFFF';
            
            if (colorStr.startsWith('&H')) {
              const hex = colorStr.substring(2);
              if (hex.length >= 6) {
                const b = hex.substring(0, 2);
                const g = hex.substring(2, 4);
                const r = hex.substring(4, 6);
                return \`#\${r}\${g}\${b}\`;
              }
            }
            
            return '#FFFFFF';
          }
          
          updateTime(time) {
            this.currentTime = time;
            this.render();
          }
          
          render() {
            if (!this.assData) return;
            
            // Clear previous subtitles
            this.container.innerHTML = '';
            
            // Find active subtitles
            const activeEvents = this.assData.events.filter(event => 
              this.currentTime >= event.start && this.currentTime <= event.end
            );
            
            // Render each active subtitle
            activeEvents.forEach((event, index) => {
              this.renderSubtitle(event, index);
            });
          }
          
          renderSubtitle(event, index) {
            const style = this.assData.styles[event.style] || this.assData.styles['Default'] || {};
            
            const element = document.createElement('div');
            element.className = 'subtitle-line';
            element.style.cssText = this.getSubtitleCSS(style, event);
            
            // Process text with override codes
            const processedText = this.processText(event.text, style);
            element.innerHTML = processedText;
            
            this.container.appendChild(element);
          }
          
          getSubtitleCSS(style, event) {
            const fontSize = (style.fontSize || 16) * Math.min(this.scaleX, this.scaleY);
            const alignment = style.alignment || 2;
            
            // Calculate position
            const position = this.calculatePosition(style, event, alignment);
            
            return \`
              left: \${position.x}px;
              top: \${position.y}px;
              width: \${position.width}px;
              font-family: '\${style.fontName || 'Arial'}';
              font-size: \${fontSize}px;
              color: \${style.primaryColor || '#FFFFFF'};
              font-weight: \${style.bold ? 'bold' : 'normal'};
              font-style: \${style.italic ? 'italic' : 'normal'};
              text-decoration: \${this.getTextDecoration(style)};
              letter-spacing: \${(style.spacing || 0) * this.scaleX}px;
              text-shadow: 1px 1px 2px \${style.outlineColor || '#000000'};
              transform: scale(\${(style.scaleX || 100) / 100}, \${(style.scaleY || 100) / 100}) rotate(\${style.angle || 0}deg);
              text-align: \${this.getTextAlign(alignment)};
            \`;
          }
          
          calculatePosition(style, event, alignment) {
            const containerWidth = window.innerWidth;
            const containerHeight = window.innerHeight;
            
            const marginL = (style.marginL || event.marginL || 0) * this.scaleX;
            const marginR = (style.marginR || event.marginR || 0) * this.scaleX;
            const marginV = (style.marginV || event.marginV || 0) * this.scaleY;
            
            let x = 0;
            let y = 0;
            let width = containerWidth - marginL - marginR;
            
            // Vertical position (1-3: bottom, 4-6: middle, 7-9: top)
            if (alignment >= 7) {
              y = marginV;
            } else if (alignment >= 4) {
              y = containerHeight / 2 - 25;
            } else {
              y = containerHeight - marginV - 50;
            }
            
            // Horizontal position
            const horizontalAlign = ((alignment - 1) % 3) + 1;
            if (horizontalAlign === 1) {
              x = marginL;
              width = containerWidth - marginL - marginR;
            } else if (horizontalAlign === 2) {
              x = marginL;
              width = containerWidth - marginL - marginR;
            } else {
              x = marginL;
              width = containerWidth - marginL - marginR;
            }
            
            return { x, y, width };
          }
          
          getTextAlign(alignment) {
            const horizontalAlign = ((alignment - 1) % 3) + 1;
            switch (horizontalAlign) {
              case 1: return 'left';
              case 2: return 'center';
              case 3: return 'right';
              default: return 'center';
            }
          }
          
          getTextDecoration(style) {
            const decorations = [];
            if (style.underline) decorations.push('underline');
            if (style.strikeOut) decorations.push('line-through');
            return decorations.join(' ') || 'none';
          }
          
          processText(text, style) {
            // Basic processing - remove override codes for now
            // In a full implementation, you would parse and apply these
            return text.replace(/\\{[^}]*\\}/g, '');
          }
          
          postMessage(message) {
            if (window.ReactNativeWebView) {
              window.ReactNativeWebView.postMessage(JSON.stringify(message));
            }
          }
        }
        
        // Initialize renderer when content loads
        let renderer;
        
        // Listen for messages from React Native
        document.addEventListener('message', function(e) {
          handleMessage(e.data);
        });
        
        window.addEventListener('message', function(e) {
          handleMessage(e.data);
        });
        
        function handleMessage(data) {
          try {
            const message = JSON.parse(data);
            
            switch (message.type) {
              case 'updateTime':
                if (renderer) {
                  renderer.updateTime(message.time);
                }
                break;
            }
          } catch (error) {
            console.error('Error handling message:', error);
          }
        }
        
        // Initialize when DOM is ready
        document.addEventListener('DOMContentLoaded', function() {
          renderer = new DirectASSRenderer();
        });
        
        // Fallback initialization
        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', function() {
            if (!renderer) {
              renderer = new DirectASSRenderer();
            }
          });
        } else {
          renderer = new DirectASSRenderer();
        }
      </script>
    </body>
    </html>
  `;

  if (!assContent) {
    return null;
  }

  return (
    <View style={[styles.container, style]}>
      <WebView
        ref={webViewRef}
        source={{ html: htmlContent }}
        style={styles.webView}
        onMessage={handleWebViewMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={false}
        scalesPageToFit={false}
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        bounces={false}
        overScrollMode="never"
        backgroundColor="transparent"
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    pointerEvents: 'none',
  },
  webView: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});