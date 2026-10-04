import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:eduflow_app/data/welcome_content.dart';
import 'package:eduflow_app/screens/welcome_screen.dart';
import 'package:eduflow_app/screens/signup_screen.dart';

void main() {
  group('Welcome & Offline Content Tests', () {
    test('mockServices contains all 8 automation services with correct pricing', () {
      expect(mockServices.length, equals(8));
      final accreditation = mockServices.firstWhere((s) => s.id == 'accreditation');
      expect(accreditation.price, equals(50000));
      final timetable = mockServices.firstWhere((s) => s.id == 'timetable');
      expect(timetable.price, equals(20000));
      final studentSuccess = mockServices.firstWhere((s) => s.id == 'student-success');
      expect(studentSuccess.price, equals(15000));
      final admissions = mockServices.firstWhere((s) => s.id == 'admissions');
      expect(admissions.price, equals(15000));
      final finance = mockServices.firstWhere((s) => s.id == 'finance');
      expect(finance.price, equals(10000));
      final feeReconciliation = mockServices.firstWhere((s) => s.id == 'fee-reconciliation');
      expect(feeReconciliation.price, equals(12000));
      final hostel = mockServices.firstWhere((s) => s.id == 'hostel');
      expect(hostel.price, equals(25000));
      expect(hostel.status, equals('Coming Soon'));
      final placement = mockServices.firstWhere((s) => s.id == 'placement');
      expect(placement.price, equals(30000));
      expect(placement.status, equals('Coming Soon'));
    });

    test('mockOfficers contains all 5 AI Officers', () {
      expect(mockOfficers.length, equals(5));
      final ids = mockOfficers.map((o) => o.id).toList();
      expect(ids, containsAll(['accreditation', 'timetable', 'admissions', 'finance', 'student-success']));
    });

    test('mockComparison contains 3 comparison rows', () {
      expect(mockComparison.length, equals(3));
      expect(mockComparison[0].category, equals('Traditional ERP'));
      expect(mockComparison[1].category, equals('Consultants'));
      expect(mockComparison[2].category, equals('EduFlow AI OS'));
    });
  });

  group('WelcomeScreen Widget Tests', () {
    testWidgets('renders Hero, Problems, and Officers', (WidgetTester tester) async {
      tester.view.physicalSize = const Size(1080, 2400);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(tester.view.resetPhysicalSize);

      await tester.pumpWidget(
        const MaterialApp(
          home: WelcomeScreen(),
        ),
      );

      // Verify Hero
      expect(find.text('The AI Administrative Workforce for Colleges'), findsOneWidget);
      expect(find.text('The Pain Every College Faces'), findsOneWidget);
      expect(find.text('Meet Your 5 AI Officers'), findsOneWidget);
      expect(find.text('How It Works in 3 Steps'), findsOneWidget);
      expect(find.text('The Money You Save'), findsOneWidget);
      expect(find.text('How We Compare'), findsOneWidget);
      expect(find.text('Our Automation Services'), findsOneWidget);
      expect(find.text('Trusted By'), findsOneWidget);

      // Verify CTAs
      expect(find.text('Create an Account'), findsOneWidget);
      expect(find.text('I Already Have an Account'), findsOneWidget);
    });
  });

  group('SignupScreen Widget Tests', () {
    testWidgets('renders all required input fields and validates on empty submit', (WidgetTester tester) async {
      tester.view.physicalSize = const Size(1080, 2400);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(tester.view.resetPhysicalSize);

      await tester.pumpWidget(
        const MaterialApp(
          home: SignupScreen(),
        ),
      );

      expect(find.text('Create an Account'), findsOneWidget);
      expect(find.byType(TextFormField), findsNWidgets(6));
      expect(find.text('Create Account'), findsOneWidget);

      // Accept terms so submit button is enabled
      await tester.ensureVisible(find.byType(Checkbox));
      await tester.tap(find.byType(Checkbox));
      await tester.pump();

      // Tap submit with empty form
      await tester.ensureVisible(find.text('Create Account'));
      await tester.tap(find.text('Create Account'));
      await tester.pump();

      // Form validation error should appear
      expect(find.text('Please enter your full name'), findsOneWidget);
    });
  });
}
