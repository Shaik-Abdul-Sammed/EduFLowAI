import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:eduflow_app/services/biometric_auth_service.dart';
import 'package:eduflow_app/services/offline_cache_service.dart';
import 'package:eduflow_app/screens/qr_fallback_attendance_screen.dart';
import 'package:eduflow_app/core/theme_manager.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  group('Free Mobile Enhancements - Phase 3 Tests', () {
    setUp(() {
      SharedPreferences.setMockInitialValues({});
    });

    test('BiometricAuthService can be instantiated and handles unavailable hardware gracefully', () async {
      final bioService = BiometricAuthService();
      expect(bioService, isNotNull);
      final available = await bioService.isBiometricsAvailable();
      expect(available, isFalse);

      final biometrics = await bioService.getAvailableBiometrics();
      expect(biometrics, isEmpty);
    });

    test('OfflineCacheService correctly stores and retrieves timetable and attendance cache', () async {
      final cacheService = OfflineCacheService();

      // Timetable cache test
      final sampleTimetable = [
        {'day': 'Monday', 'subject': 'CS401 Distributed Systems', 'time': '09:00 - 10:30', 'room': 'Lab 4'},
        {'day': 'Monday', 'subject': 'CS402 Machine Learning', 'time': '11:00 - 12:30', 'room': 'Auditorium A'},
      ];

      await cacheService.cacheTimetable(sampleTimetable);
      final retrievedTimetable = await cacheService.getCachedTimetable();
      expect(retrievedTimetable, isNotNull);
      expect(retrievedTimetable.length, equals(2));
      expect(retrievedTimetable[0]['subject'], equals('CS401 Distributed Systems'));

      // Attendance cache test
      final sampleAttendance = {
        'overallPercentage': 88.5,
        'presentClasses': 42,
        'totalClasses': 48,
        'status': 'EXCELLENT'
      };

      await cacheService.cacheAttendance(sampleAttendance);
      final retrievedAttendance = await cacheService.getCachedAttendance();
      expect(retrievedAttendance, isNotNull);
      expect(retrievedAttendance['overallPercentage'], equals(88.5));
      expect(retrievedAttendance['status'], equals('EXCELLENT'));

      // Clear cache test
      await cacheService.clearCache();
      final defaultAttendance = await cacheService.getCachedAttendance();
      expect(defaultAttendance['isOfflineCached'], isTrue);
    });

    test('ThemeManager provides darkThemeData with true dark background and contrast', () {
      final themeManager = ThemeManager();
      final darkTheme = themeManager.darkThemeData;

      expect(darkTheme.brightness, equals(Brightness.dark));
      expect(darkTheme.scaffoldBackgroundColor, equals(const Color(0xFF0F172A)));
      expect(darkTheme.cardColor, equals(const Color(0xFF1E293B)));
    });

    testWidgets('QrFallbackAttendanceScreen renders rotating PIN, course title and verify button', (WidgetTester tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: QrFallbackAttendanceScreen(
            courseId: 'CS401',
            teacherId: 'FAC-042',
            isTeacher: true,
          ),
        ),
      );

      await tester.pump();

      expect(find.text('QR Fallback Attendance'), findsOneWidget);
      expect(find.textContaining('CS401'), findsWidgets);
      expect(find.textContaining('Verification PIN'), findsOneWidget);
      expect(find.text('Confirm Attendance'), findsOneWidget);
      expect(find.byType(TextField), findsOneWidget);
    });
  });
}
