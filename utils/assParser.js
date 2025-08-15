/**
 * ASS Subtitle Parser
 * Parses .ass subtitle files and extracts styling, timing, and positioning information
 */

export class ASSParser {
  constructor() {
    this.styles = {};
    this.events = [];
    this.scriptInfo = {};
  }

  /**
   * Parse ASS file content
   * @param {string} content - Raw .ass file content
   * @returns {Object} Parsed subtitle data
   */
  parse(content) {
    const lines = content.split('\n');
    let currentSection = '';
    
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
          this.parseStyle(line);
          break;
        case 'events':
          this.parseEvent(line);
          break;
      }
    }
    
    return {
      styles: this.styles,
      events: this.events,
      scriptInfo: this.scriptInfo
    };
  }

  parseScriptInfo(line) {
    const [key, ...valueParts] = line.split(':');
    if (key && valueParts.length > 0) {
      this.scriptInfo[key.trim()] = valueParts.join(':').trim();
    }
  }

  parseStyle(line) {
    if (line.startsWith('Format:')) {
      this.styleFormat = line.substring(7).split(',').map(s => s.trim());
      return;
    }
    
    if (line.startsWith('Style:')) {
      const values = line.substring(6).split(',');
      const style = {};
      
      this.styleFormat.forEach((key, index) => {
        style[key] = values[index] ? values[index].trim() : '';
      });
      
      this.styles[style.Name] = this.processStyle(style);
    }
  }

  processStyle(style) {
    return {
      name: style.Name,
      fontName: style.Fontname,
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
      marginV: parseInt(style.MarginV) || 0,
      encoding: parseInt(style.Encoding) || 1
    };
  }

  parseEvent(line) {
    if (line.startsWith('Format:')) {
      this.eventFormat = line.substring(7).split(',').map(s => s.trim());
      return;
    }
    
    if (line.startsWith('Dialogue:')) {
      const values = line.substring(9).split(',');
      const event = {};
      
      this.eventFormat.forEach((key, index) => {
        if (key === 'Text') {
          // Text field can contain commas, so join remaining parts
          event[key] = values.slice(index).join(',').trim();
        } else {
          event[key] = values[index] ? values[index].trim() : '';
        }
      });
      
      this.events.push(this.processEvent(event));
    }
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
      text: this.parseText(event.Text)
    };
  }

  parseTime(timeStr) {
    // Parse time format: H:MM:SS.CC
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
    
    // ASS colors are in BGR format with &H prefix
    if (colorStr.startsWith('&H')) {
      const hex = colorStr.substring(2);
      if (hex.length >= 6) {
        const b = hex.substring(0, 2);
        const g = hex.substring(2, 4);
        const r = hex.substring(4, 6);
        return `#${r}${g}${b}`;
      }
    }
    
    return '#FFFFFF';
  }

  parseText(text) {
    // Parse ASS text with override codes
    const parsed = {
      text: '',
      overrides: []
    };
    
    let currentPos = 0;
    const overrideRegex = /\{[^}]*\}/g;
    let match;
    
    while ((match = overrideRegex.exec(text)) !== null) {
      // Add text before override
      if (match.index > currentPos) {
        parsed.text += text.substring(currentPos, match.index);
      }
      
      // Parse override codes
      const override = match[0].slice(1, -1); // Remove { }
      parsed.overrides.push({
        position: parsed.text.length,
        codes: this.parseOverrideCodes(override)
      });
      
      currentPos = match.index + match[0].length;
    }
    
    // Add remaining text
    if (currentPos < text.length) {
      parsed.text += text.substring(currentPos);
    }
    
    return parsed;
  }

  parseOverrideCodes(override) {
    const codes = {};
    const codeRegex = /\\([a-zA-Z]+)([^\\]*)/g;
    let match;
    
    while ((match = codeRegex.exec(override)) !== null) {
      const tag = match[1];
      const value = match[2];
      
      switch (tag) {
        case 'c':
        case '1c':
          codes.primaryColor = this.parseColor('&H' + value);
          break;
        case '2c':
          codes.secondaryColor = this.parseColor('&H' + value);
          break;
        case '3c':
          codes.outlineColor = this.parseColor('&H' + value);
          break;
        case '4c':
          codes.backColor = this.parseColor('&H' + value);
          break;
        case 'fs':
          codes.fontSize = parseInt(value);
          break;
        case 'b':
          codes.bold = value === '1';
          break;
        case 'i':
          codes.italic = value === '1';
          break;
        case 'u':
          codes.underline = value === '1';
          break;
        case 's':
          codes.strikeOut = value === '1';
          break;
        case 'pos':
          const pos = value.split(',');
          codes.position = {
            x: parseFloat(pos[0]),
            y: parseFloat(pos[1])
          };
          break;
        case 'an':
          codes.alignment = parseInt(value);
          break;
        case 'fscx':
          codes.scaleX = parseFloat(value);
          break;
        case 'fscy':
          codes.scaleY = parseFloat(value);
          break;
        case 'frz':
          codes.rotation = parseFloat(value);
          break;
        case 'fsp':
          codes.spacing = parseFloat(value);
          break;
        case 'alpha':
          codes.alpha = parseInt(value, 16) / 255;
          break;
        case '1a':
          codes.primaryAlpha = parseInt(value, 16) / 255;
          break;
        case '2a':
          codes.secondaryAlpha = parseInt(value, 16) / 255;
          break;
        case '3a':
          codes.outlineAlpha = parseInt(value, 16) / 255;
          break;
        case '4a':
          codes.backAlpha = parseInt(value, 16) / 255;
          break;
      }
    }
    
    return codes;
  }

  /**
   * Get active subtitles for a given time
   * @param {number} currentTime - Current video time in seconds
   * @returns {Array} Array of active subtitle events
   */
  getActiveSubtitles(currentTime) {
    return this.events.filter(event => 
      currentTime >= event.start && currentTime <= event.end
    );
  }
}