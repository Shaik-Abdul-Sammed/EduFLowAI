import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:eduflow_app/screens/nirf_dashboard_screen.dart';

void main() {
  testWidgets('NIRF screen renders', (WidgetTester tester) async {
    tester.view.physicalSize = const Size(1080, 2400);
    tester.view.devicePixelRatio = 2.0;
    addTearDown(() {
      tester.view.resetPhysicalSize();
      tester.view.resetDevicePixelRatio();
    });

    await tester.pumpWidget(
      const MaterialApp(
        home: NirfDashboardScreen(),
      ),
    );

    // Verify AppBar title
    expect(find.text('NIRF Ranking Intelligence'), findsOneWidget);

    // Verify sections exist
    expect(find.text('NIRF Parameters'), findsOneWidget);
    expect(find.text('Top Rank Improvement Actions'), findsOneWidget);
    expect(find.text('Peer Institutions Standing'), findsOneWidget);
  });

  testWidgets('Score card displays total score', (WidgetTester tester) async {
    await tester.pumpWidget(
      const MaterialApp(
        home: NirfDashboardScreen(),
      ),
    );

    // Verify composite score title and value
    expect(find.text('Total NIRF Composite Score'), findsOneWidget);
    expect(find.byKey(const Key('nirf_total_score_text')), findsOneWidget);
    expect(find.text('72.85'), findsOneWidget);
  });

  testWidgets('Predicted rank shows', (WidgetTester tester) async {
    await tester.pumpWidget(
      const MaterialApp(
        home: NirfDashboardScreen(),
      ),
    );

    // Verify predicted category rank badge
    expect(find.byKey(const Key('nirf_predicted_rank_text')), findsOneWidget);
    expect(find.textContaining('#51'), findsWidgets);
  });
}
