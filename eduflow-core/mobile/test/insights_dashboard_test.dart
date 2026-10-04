import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:eduflow_app/screens/insights_dashboard_screen.dart';

void main() {
  testWidgets('Insights screen renders 5 domain cards', (WidgetTester tester) async {
    tester.view.physicalSize = const Size(1080, 2400);
    tester.view.devicePixelRatio = 2.0;
    addTearDown(() {
      tester.view.resetPhysicalSize();
      tester.view.resetDevicePixelRatio();
    });

    await tester.pumpWidget(
      const MaterialApp(
        home: InsightsDashboardScreen(),
      ),
    );

    // Verify header title
    expect(find.text('Multi-Officer AI Insights'), findsOneWidget);
    expect(find.text('Institutional Health Score'), findsOneWidget);

    // Verify 5 domain cards exist
    expect(find.byKey(const Key('domain_card_accreditation')), findsOneWidget);
    expect(find.byKey(const Key('domain_card_student-success')), findsOneWidget);
    expect(find.byKey(const Key('domain_card_timetable')), findsOneWidget);
    expect(find.byKey(const Key('domain_card_admissions')), findsOneWidget);
    expect(find.byKey(const Key('domain_card_finance')), findsOneWidget);

    // Verify domain names are rendered
    expect(find.text('Accreditation'), findsWidgets);
    expect(find.text('Student Success'), findsWidgets); // appears in domain card and priority
    expect(find.text('Timetable'), findsOneWidget);
    expect(find.text('Admissions'), findsOneWidget);
    expect(find.text('Finance'), findsWidgets);

    // Verify top priorities section
    expect(find.text('Top Priorities'), findsOneWidget);
  });

  testWidgets('Refresh button triggers reload', (WidgetTester tester) async {
    await tester.pumpWidget(
      const MaterialApp(
        home: InsightsDashboardScreen(),
      ),
    );

    // Find refresh button
    final refreshBtn = find.byKey(const Key('refresh_insights_button'));
    expect(refreshBtn, findsOneWidget);

    // Tap refresh button
    await tester.tap(refreshBtn);
    await tester.pump(); // Start loading state

    // Advance timer past Future.delayed(300ms)
    await tester.pump(const Duration(milliseconds: 350));

    // Verify SnackBar message appears
    expect(find.textContaining('Insights refreshed successfully'), findsOneWidget);
  });

  testWidgets('Tapping a card opens domain detail', (WidgetTester tester) async {
    await tester.pumpWidget(
      const MaterialApp(
        home: InsightsDashboardScreen(),
      ),
    );

    // Find "View Details" on Student Success card
    final viewDetailsBtn = find.byKey(const Key('view_details_student-success'));
    expect(viewDetailsBtn, findsOneWidget);

    // Tap to open bottom sheet
    await tester.tap(viewDetailsBtn);
    await tester.pumpAndSettle();

    // Verify modal content
    expect(find.text('Student Success Officer'), findsOneWidget);
    expect(find.text('AI Cognitive Recommendations'), findsOneWidget);
    expect(find.text('Close'), findsOneWidget);

    // Tap Close
    await tester.tap(find.text('Close'));
    await tester.pumpAndSettle();

    // Modal dismissed
    expect(find.text('AI Cognitive Recommendations'), findsNothing);
  });
}
