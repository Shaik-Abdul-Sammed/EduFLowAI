import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:eduflow_app/features/dashboard/widgets/presence_status_widget.dart';

void main() {
  group('PresenceStatusWidget Offline Cache & Resilience Tests', () {
    testWidgets('Simulates offline state: falls back to cached local storage "Dorm" without crashing', (tester) async {
      SharedPreferences.setMockInitialValues({
        'cached_presence_status': 'Dorm',
      });

      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: Center(
              child: PresenceStatusWidget(isOfflineMock: true),
            ),
          ),
        ),
      );

      await tester.pumpAndSettle();

      // Assert Presence Widget renders cached status gracefully
      expect(find.text('Offline: Last seen in Dorm'), findsOneWidget);
      expect(find.text('🟡'), findsOneWidget);
    });

    testWidgets('Simulates offline state: falls back to cached local storage "Classroom"', (tester) async {
      SharedPreferences.setMockInitialValues({
        'cached_presence_status': 'Classroom',
      });

      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: Center(
              child: PresenceStatusWidget(isOfflineMock: true),
            ),
          ),
        ),
      );

      await tester.pumpAndSettle();

      expect(find.text('Offline: Last seen in Classroom'), findsOneWidget);
    });

    testWidgets('Online presence rendering: verifies live classroom pill indicator', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: Center(
              child: PresenceStatusWidget(initialStatus: 'Classroom'),
            ),
          ),
        ),
      );

      await tester.pumpAndSettle();

      expect(find.text('🟢 On Campus (Classroom)'), findsOneWidget);
    });

    testWidgets('Online presence rendering: verifies live dorm pill indicator', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: Center(
              child: PresenceStatusWidget(initialStatus: 'Dorm'),
            ),
          ),
        ),
      );

      await tester.pumpAndSettle();

      expect(find.text('🟡 On Campus (Dorm)'), findsOneWidget);
    });
  });
}
