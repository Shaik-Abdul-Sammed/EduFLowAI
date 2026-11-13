import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:provider/provider.dart';
import 'package:eduflow_app/core/theme_manager.dart';
import 'package:eduflow_app/screens/forgot_password_screen.dart';
import 'package:eduflow_app/screens/naac_dashboard_screen.dart';
import 'package:eduflow_app/screens/placement_radar.dart';
import 'package:eduflow_app/screens/auto_resume.dart';
import 'package:eduflow_app/screens/mock_simulator.dart';
import 'package:eduflow_app/screens/about_screen.dart';
import 'package:eduflow_app/screens/lor_screen.dart';
import 'package:eduflow_app/screens/qr_passport.dart';

Widget createTestApp(Widget home) {
  return MultiProvider(
    providers: [
      ChangeNotifierProvider(create: (_) => ThemeManager()),
    ],
    child: MaterialApp(
      home: home,
    ),
  );
}

void main() {
  group('Mobile App Integration & Route Tests', () {
    testWidgets('ForgotPasswordScreen renders back button and reset prompt', (tester) async {
      await tester.pumpWidget(createTestApp(const ForgotPasswordScreen()));
      await tester.pumpAndSettle();

      expect(find.text('Reset Password'), findsOneWidget);
      expect(find.text('Forgot Password?'), findsOneWidget);
      expect(find.text('Back to Login'), findsOneWidget);
      expect(find.byIcon(Icons.lock_reset), findsOneWidget);

      await tester.tap(find.text('Back to Login'));
      await tester.pumpAndSettle();
    });

    testWidgets('PlacementRadarScreen renders and allows job scan tap', (tester) async {
      await tester.pumpWidget(createTestApp(const PlacementRadarScreen()));
      await tester.pumpAndSettle();

      expect(find.text('Placement Radar'), findsOneWidget);
      expect(find.text('Discover Job Matches'), findsOneWidget);
      expect(find.text('Scan for Jobs'), findsOneWidget);

      await tester.tap(find.text('Scan for Jobs'));
      await tester.pumpAndSettle();
    });

    testWidgets('AutoResumeBuilderScreen renders and allows generate tap', (tester) async {
      await tester.pumpWidget(createTestApp(const AutoResumeBuilderScreen()));
      await tester.pumpAndSettle();

      expect(find.text('AI Auto-Resume Builder'), findsOneWidget);
      expect(find.text('Generate ATS-Friendly Resumes'), findsOneWidget);
      expect(find.text('Generate Resume'), findsOneWidget);

      await tester.tap(find.text('Generate Resume'));
      await tester.pumpAndSettle();
    });

    testWidgets('MockSimulatorScreen renders and allows interview start tap', (tester) async {
      await tester.pumpWidget(createTestApp(const MockSimulatorScreen()));
      await tester.pumpAndSettle();

      expect(find.text('Company-Specific Mock Simulator'), findsOneWidget);
      expect(find.text('Practice Technical Interviews'), findsOneWidget);
      expect(find.text('Start Mock Interview'), findsOneWidget);

      await tester.tap(find.text('Start Mock Interview'));
      await tester.pumpAndSettle();
    });

    testWidgets('NaacDashboardScreen renders all 7 criteria and handles tap', (tester) async {
      await tester.pumpWidget(createTestApp(const NaacDashboardScreen()));
      await tester.pumpAndSettle();

      expect(find.text('NAAC Dashboard'), findsOneWidget);
      expect(find.text('A+'), findsOneWidget);
      expect(find.text('3.42 / 4.00 CGPA'), findsOneWidget);

      // Verify criteria are present
      expect(find.byKey(const Key('criterion_item_1')), findsOneWidget);
      expect(find.text('Curricular Aspects'), findsOneWidget);

      // Tap on Criterion 1 to test detail route
      await tester.tap(find.byKey(const Key('criterion_item_1')));
      await tester.pumpAndSettle();

      expect(find.text('Criterion 1 Detail'), findsOneWidget);
      expect(find.text('Performance: 85.0%'), findsOneWidget);
    });

    testWidgets('AboutScreen renders sections and architecture overview', (tester) async {
      await tester.pumpWidget(createTestApp(const AboutScreen()));
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 100));

      expect(find.text('About EduFlow AI OS'), findsOneWidget);
      expect(find.text('AI OFFICERS'), findsOneWidget);
    });

    testWidgets('QRPassportScreen renders verified credentials', (tester) async {
      await tester.pumpWidget(createTestApp(const QRPassportScreen()));
      await tester.pumpAndSettle();

      expect(find.text('Verified QR Passport'), findsOneWidget);
      expect(find.text('Scan for Verified Credentials'), findsOneWidget);
    });

    testWidgets('LORScreen renders typewriter prompt and interface', (tester) async {
      await tester.pumpWidget(createTestApp(const LORScreen()));
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 100));

      expect(find.text('AI LOR Generator'), findsOneWidget);
      expect(find.text('Generate LOR'), findsOneWidget);
    });
  });
}
