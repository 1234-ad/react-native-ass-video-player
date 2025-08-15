# Deployment Guide

## 🚀 Quick Deployment

### Web Deployment (Netlify/Vercel)

1. **Build for web**
   ```bash
   expo build:web
   ```

2. **Deploy to Netlify**
   ```bash
   # Install Netlify CLI
   npm install -g netlify-cli
   
   # Deploy
   netlify deploy --dir=web-build --prod
   ```

3. **Deploy to Vercel**
   ```bash
   # Install Vercel CLI
   npm install -g vercel
   
   # Deploy
   vercel --prod
   ```

### Expo Hosting

1. **Publish to Expo**
   ```bash
   expo publish
   ```

2. **Access via Expo Go app** or web browser

### GitHub Pages

1. **Install gh-pages**
   ```bash
   npm install --save-dev gh-pages
   ```

2. **Add to package.json scripts**
   ```json
   {
     "scripts": {
       "predeploy": "expo build:web",
       "deploy": "gh-pages -d web-build"
     }
   }
   ```

3. **Deploy**
   ```bash
   npm run deploy
   ```

## 📱 Mobile App Deployment

### iOS App Store

1. **Build for iOS**
   ```bash
   expo build:ios
   ```

2. **Submit to App Store Connect**
   - Download .ipa file
   - Upload via Xcode or Application Loader

### Google Play Store

1. **Build for Android**
   ```bash
   expo build:android
   ```

2. **Submit to Google Play Console**
   - Upload .apk or .aab file
   - Complete store listing

## 🔧 Environment Configuration

### Production Environment Variables

Create `.env.production`:
```env
EXPO_PUBLIC_VIDEO_URL=https://your-video-cdn.com/video.mp4
EXPO_PUBLIC_SUBTITLE_URL=https://your-cdn.com/subtitles.ass
EXPO_PUBLIC_API_BASE_URL=https://your-api.com
```

### Build Configuration

Update `app.json` for production:
```json
{
  "expo": {
    "name": "ASS Video Player",
    "slug": "ass-video-player",
    "version": "1.0.0",
    "privacy": "public",
    "platforms": ["ios", "android", "web"],
    "assetBundlePatterns": ["**/*"],
    "web": {
      "bundler": "metro",
      "build": {
        "babel": {
          "include": ["@expo/vector-icons"]
        }
      }
    }
  }
}
```

## 🌐 CDN Setup for Assets

### Video and Subtitle Hosting

1. **AWS S3 + CloudFront**
   - Upload video and .ass files to S3
   - Configure CloudFront distribution
   - Enable CORS for web access

2. **Google Cloud Storage**
   - Upload assets to GCS bucket
   - Configure public access
   - Set up CDN

3. **Azure Blob Storage**
   - Create storage account
   - Upload files to blob container
   - Configure CDN endpoint

### CORS Configuration

For S3 bucket:
```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "HEAD"],
    "AllowedOrigins": ["*"],
    "ExposeHeaders": []
  }
]
```

## 📊 Performance Optimization

### Web Optimization

1. **Bundle Analysis**
   ```bash
   npx expo export:web --analyze
   ```

2. **Code Splitting**
   - Implement lazy loading for components
   - Split subtitle parser into separate chunk

3. **Asset Optimization**
   - Compress video files
   - Optimize .ass file size
   - Use WebP images for icons

### Mobile Optimization

1. **Bundle Size**
   - Remove unused dependencies
   - Optimize images and assets
   - Use Hermes engine for Android

2. **Performance Monitoring**
   - Implement crash reporting
   - Monitor subtitle rendering performance
   - Track video loading times

## 🔍 Testing in Production

### Automated Testing

1. **E2E Testing**
   ```bash
   # Install Detox for React Native
   npm install --save-dev detox
   
   # Run tests
   detox test
   ```

2. **Web Testing**
   ```bash
   # Install Playwright
   npm install --save-dev @playwright/test
   
   # Run tests
   npx playwright test
   ```

### Manual Testing Checklist

#### Web Testing
- [ ] Video loads on Chrome, Firefox, Safari
- [ ] Subtitles render correctly
- [ ] Seeking maintains sync
- [ ] Responsive design works
- [ ] Performance is acceptable

#### Mobile Testing
- [ ] iOS Safari compatibility
- [ ] Android Chrome compatibility
- [ ] Touch controls work
- [ ] Subtitle scaling is correct
- [ ] Memory usage is reasonable

## 🚨 Troubleshooting

### Common Deployment Issues

**CORS Errors**
- Configure server CORS headers
- Use proxy for development
- Check CDN settings

**Video Loading Issues**
- Verify video format compatibility
- Check network connectivity
- Ensure HTTPS for production

**Subtitle Rendering Problems**
- Validate .ass file format
- Check font availability
- Verify color parsing

### Performance Issues

**Slow Subtitle Updates**
- Reduce update frequency
- Optimize parser performance
- Use React.memo for components

**Memory Leaks**
- Clear intervals on unmount
- Remove event listeners
- Optimize subtitle data structure

## 📈 Monitoring and Analytics

### Error Tracking

1. **Sentry Integration**
   ```bash
   npm install @sentry/react-native
   ```

2. **Crashlytics (Firebase)**
   ```bash
   expo install expo-firebase-crashlytics
   ```

### Performance Monitoring

1. **Web Vitals**
   - Monitor LCP, FID, CLS
   - Track video loading times
   - Measure subtitle rendering performance

2. **Mobile Performance**
   - Monitor app startup time
   - Track memory usage
   - Measure battery impact

## 🔐 Security Considerations

### Content Protection

1. **DRM Integration**
   - Implement Widevine/FairPlay
   - Secure video streaming
   - Token-based authentication

2. **Subtitle Security**
   - Validate .ass file content
   - Sanitize user inputs
   - Prevent XSS attacks

### API Security

1. **Authentication**
   - Implement JWT tokens
   - Secure API endpoints
   - Rate limiting

2. **HTTPS Only**
   - Force HTTPS in production
   - Secure cookie settings
   - HSTS headers

---

This deployment guide ensures your React Native ASS Video Player is production-ready across all platforms with optimal performance and security.