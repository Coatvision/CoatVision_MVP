# LYXvision Pro - Mobile App Deployment Guide


## Prerequisites

- Node.js 18+ installed
- Expo CLI: `npm install -g eas-cli`
- EAS account: `eas login`
- Apple Developer Account (iOS)
- Google Play Console Account (Android)


## Setup

### 1. Install Dependencies
```bash
cd coatvision-app
npm install
```

### 2. Configure EAS
```bash
eas init
# Follow prompts to create project
```


### 3. Update app.json

- Set `expo.extra.eas.projectId` to your project ID
- Configure bundle identifiers for iOS/Android



### 4. Environment Variables

Create `.env.production`:
```env
EXPO_PUBLIC_API_URL=https://api.coatvision.com
EXPO_PUBLIC_API_KEY=your-production-key
```


## Building

### Development Build
```bash
# iOS Simulator
eas build --profile development --platform ios

# Android APK
eas build --profile development --platform android
```

### Production Build
```bash
# iOS App Store
eas build --profile production --platform ios

# Android Play Store (AAB)
eas build --profile production --platform android
```

## Testing

### Internal Distribution
```bash
# Create preview builds for internal testing
eas build --profile preview --platform all
```

### Install on Device
```bash
# Download build from Expo dashboard
# Or use direct install URL
```

## Submission

### iOS App Store
```bash
# After successful production build
eas submit --platform ios
```


Requirements:

- App Store Connect account
- App created in App Store Connect
- Screenshots (6.7", 6.5", 5.5")
- App icon (1024x1024)
- Privacy policy URL
- Support URL


### Google Play Store
```bash
# After successful production build
eas submit --platform android
```


Requirements:

- Google Play Console account
- Service account JSON key
- Feature graphic (1024x500)
- Screenshots (phone, 7" tablet, 10" tablet)
- App icon (512x512)
- Privacy policy URL


## App Store Assets Needed


### iOS

- App icon: 1024x1024 PNG (no alpha)
- Screenshots:
  - iPhone 6.7" (1290x2796)
  - iPhone 6.5" (1284x2778)
  - iPhone 5.5" (1242x2208)
  - iPad Pro 12.9" (2048x2732)



### Android

- App icon: 512x512 PNG
- Feature graphic: 1024x500 PNG
- Screenshots:
  - Phone: 1080x1920 (min 2 screenshots)
  - 7" tablet: 1200x1920
  - 10" tablet: 1600x2560


## Metadata

### App Store Description
```
LYXvision Pro - Professional Coating Quality Measurement

Transform your detailing business with objective quality metrics:
- CVI Score: Measure coating quality × efficiency
- DC Tracking: Monitor damage before/after each step
- Real-time Analysis: AI-powered surface assessment
- Professional Reports: Impress customers with data-driven results

Features:
✓ Wash analysis with dirt assessment
✓ Defect detection (swirls, scratches, holograms)
✓ Coating coverage verification
✓ Automated time & price estimates
✓ Job & panel tracking
✓ Customer report generation

Perfect for:
- Professional detailers
- Coating installers
- Auto body shops
- Quality control

"Created to measure the future."
```


### Keywords

- automotive detailing
- coating quality
- paint correction
- car detailing
- professional detailing
- quality measurement
- coating inspection
- auto detailing



### Category

- Business
- Productivity


### Privacy Policy
Required. Must host at public URL.


### Support URL

- https://coatvision.com/support


## Checklist Before Submission


### Technical

- [ ] Production API URL configured
- [ ] API keys secured
- [ ] Camera permissions implemented
- [ ] Photo library permissions implemented
- [ ] Error handling complete
- [ ] Offline mode (if applicable)
- [ ] Analytics integrated
- [ ] Crash reporting (Sentry)



### Content

- [ ] App icons created (all sizes)
- [ ] Screenshots captured
- [ ] Feature graphic designed
- [ ] Marketing copy written
- [ ] Privacy policy published
- [ ] Support page live
- [ ] Demo video (optional but recommended)



### Legal

- [ ] Privacy policy approved
- [ ] Terms of service drafted
- [ ] Age rating determined
- [ ] Content rating completed



### Store Presence

- [ ] Apple Developer account verified
- [ ] Google Play Console setup
- [ ] App created in App Store Connect
- [ ] App created in Play Console
- [ ] Service account configured (Android)
- [ ] Beta testing group created


## Post-Launch


### Monitoring

- Track downloads
- Monitor crash reports
- Review user feedback
- Analyze usage metrics



### Updates

```bash
# Increment version in app.json
# Build new version
eas build --profile production --platform all

# Submit update
eas submit --platform all
```



### Over-the-Air Updates

```bash
# For non-native changes (JS/assets)
eas update --branch production --message "Bug fixes"
```


## CI/CD (Optional)


### GitHub Actions

Create `.github/workflows/eas-build.yml`:
```yaml
name: EAS Build
on:
  push:
    branches: [main]


  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npx eas-cli build --platform all --non-interactive
        env:
          EXPO_TOKEN: ${{ secrets.EXPO_TOKEN }}
```

## Costs


### Apple

- Developer Program: $99/year
- EAS Build: Free tier available



### Google

- One-time registration: $25
- EAS Build: Free tier available



### EAS (Expo Application Services)

- Free: 30 builds/month
- Production: $29/month (unlimited)
- Enterprise: Custom pricing


## Support


### Issues

- GitHub: github.com/Coatvision/CoatVision_MVP/issues
- Email: support@coatvision.com



### Documentation

- Expo: docs.expo.dev
- EAS: docs.expo.dev/eas
- Apple: developer.apple.com
- Google: developer.android.com


---
Ready to launch LYXvision Pro to the world! 🚀
