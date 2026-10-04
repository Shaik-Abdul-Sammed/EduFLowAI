# EduFlow AI OS - Mobile Application

Cross-platform mobile application for EduFlow AI OS built with Flutter.

## Build Commands

To build the release APK for Android:

```bash
cd ~/Github/EduFlowAI/eduflow-core/mobile
flutter clean
flutter pub get
flutter analyze
flutter test
flutter build apk --release --dart-define=API_BASE_URL=https://eduflow-backend-jvn8.onrender.com/api/v1
```

The APK will be generated at:
`build/app/outputs/flutter-apk/app-release.apk`
