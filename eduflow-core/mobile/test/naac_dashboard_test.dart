import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:eduflow_app/screens/naac_dashboard_screen.dart';

void main() {
  testWidgets('NAAC dashboard screen renders on mobile', (WidgetTester tester) async {
    await tester.pumpWidget(
      const MaterialApp(
        home: NaacDashboardScreen(),
      ),
    );

    expect(find.text('NAAC Dashboard'), findsOneWidget);
    expect(find.byKey(const Key('grade_prediction_card')), findsOneWidget);
  });

  testWidgets('Shows predicted grade and CGPA', (WidgetTester tester) async {
    await tester.pumpWidget(
      const MaterialApp(
        home: NaacDashboardScreen(),
      ),
    );

    expect(find.text('A+'), findsOneWidget);
    expect(find.text('3.42 / 4.00 CGPA'), findsOneWidget);
    expect(find.textContaining('85%'), findsWidgets);
  });

  testWidgets('Shows criteria list', (WidgetTester tester) async {
    await tester.pumpWidget(
      const MaterialApp(
        home: NaacDashboardScreen(),
      ),
    );

    expect(find.text('NAAC Criteria List'), findsOneWidget);
    expect(find.text('Curricular Aspects'), findsOneWidget);
    expect(find.text('Teaching-Learning and Evaluation'), findsOneWidget);
    expect(find.text('Research, Innovations and Extension'), findsOneWidget);
    expect(find.text('Infrastructure and Learning Resources'), findsOneWidget);
  });

  testWidgets('Tapping a criterion navigates to detail', (WidgetTester tester) async {
    await tester.pumpWidget(
      const MaterialApp(
        home: NaacDashboardScreen(),
      ),
    );

    // Tap on Criterion 1
    final criterionItem = find.byKey(const Key('criterion_item_1'));
    expect(criterionItem, findsOneWidget);
    await tester.tap(criterionItem);
    await tester.pumpAndSettle();

    // Verify detail screen rendered
    expect(find.text('Criterion 1 Detail'), findsOneWidget);
    expect(find.textContaining('Max Score: 100'), findsOneWidget);
    expect(find.textContaining('Achieved Score: 85'), findsOneWidget);
  });
}
