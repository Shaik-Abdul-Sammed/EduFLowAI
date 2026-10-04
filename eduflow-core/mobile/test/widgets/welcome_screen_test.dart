import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:eduflow_app/screens/welcome_screen.dart';

void main() {
  Widget createWelcomeScreen() {
    return MaterialApp(
      routes: {
        '/signup': (ctx) => const Scaffold(body: Text('Mock Signup Screen')),
        '/login': (ctx) => const Scaffold(body: Text('Mock Login Screen')),
      },
      home: const WelcomeScreen(),
    );
  }

  group('WelcomeScreen Widget Tests', () {
    testWidgets('Welcome screen renders the hero with EduFlow AI OS title', (tester) async {
      tester.view.physicalSize = const Size(1080, 2400);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(tester.view.resetPhysicalSize);

      await tester.pumpWidget(createWelcomeScreen());

      expect(find.text('EduFlow AI OS'), findsAtLeastNWidgets(1));
      expect(find.text('The AI Administrative Workforce for Colleges'), findsOneWidget);
    });

    testWidgets('All 9 sections render in order', (tester) async {
      tester.view.physicalSize = const Size(1080, 2400);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(tester.view.resetPhysicalSize);

      await tester.pumpWidget(createWelcomeScreen());

      // Section A - Hero
      expect(find.text('The AI Administrative Workforce for Colleges'), findsOneWidget);
      // Section B - Problem
      expect(find.text('The Pain Every College Faces'), findsOneWidget);
      // Section C - Solution
      expect(find.text('Meet Your 5 AI Officers'), findsOneWidget);
      // Section D - How it works
      expect(find.text('How It Works in 3 Steps'), findsOneWidget);
      // Section E - ROI
      expect(find.text('The Money You Save'), findsOneWidget);
      // Section F - Comparison
      expect(find.text('How We Compare'), findsOneWidget);
      // Section G - Services
      expect(find.text('Our Automation Services'), findsOneWidget);
      // Section H - Trust
      expect(find.text('Trusted By'), findsOneWidget);
      // Section I - CTAs
      expect(find.text('Create an Account'), findsOneWidget);
      expect(find.text('I Already Have an Account'), findsOneWidget);
    });

    testWidgets('The 5 AI Officer cards render horizontally', (tester) async {
      tester.view.physicalSize = const Size(1080, 2400);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(tester.view.resetPhysicalSize);

      await tester.pumpWidget(createWelcomeScreen());

      expect(find.byType(ListView), findsOneWidget);
      expect(find.text('Accreditation Officer'), findsOneWidget);
      expect(find.text('Timetable Officer'), findsOneWidget);
    });

    testWidgets('The 8 service cards render with correct prices', (tester) async {
      tester.view.physicalSize = const Size(1080, 2400);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(tester.view.resetPhysicalSize);

      await tester.pumpWidget(createWelcomeScreen());

      expect(find.text('NAAC / NBA Report'), findsOneWidget);
      expect(find.text('₹50,000'), findsWidgets);
      expect(find.text('Timetable Generator'), findsOneWidget);
      expect(find.text('₹20,000'), findsOneWidget);
      expect(find.text('Fee Reconciliation'), findsOneWidget);
      expect(find.text('₹10,000'), findsOneWidget);
    });

    testWidgets('Create an Account button navigates to signup', (tester) async {
      tester.view.physicalSize = const Size(1080, 2400);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(tester.view.resetPhysicalSize);

      await tester.pumpWidget(createWelcomeScreen());

      await tester.ensureVisible(find.text('Create an Account'));
      await tester.tap(find.text('Create an Account'));
      await tester.pumpAndSettle();

      expect(find.text('Mock Signup Screen'), findsOneWidget);
    });

    testWidgets('I Already Have an Account button navigates to login', (tester) async {
      tester.view.physicalSize = const Size(1080, 2400);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(tester.view.resetPhysicalSize);

      await tester.pumpWidget(createWelcomeScreen());

      await tester.ensureVisible(find.text('I Already Have an Account'));
      await tester.tap(find.text('I Already Have an Account'));
      await tester.pumpAndSettle();

      expect(find.text('Mock Login Screen'), findsOneWidget);
    });
  });
}
