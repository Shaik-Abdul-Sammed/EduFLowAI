import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:eduflow_app/screens/naac_insights_screen.dart';

void main() {
  Widget createInsightsScreen() {
    return const MaterialApp(
      home: NaacInsightsScreen(),
    );
  }

  group('NAAC AI Insights Mobile Tests', () {
    testWidgets('Insights screen renders grade card', (WidgetTester tester) async {
      tester.view.physicalSize = const Size(1080, 2400);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(tester.view.resetPhysicalSize);

      await tester.pumpWidget(createInsightsScreen());
      await tester.pumpAndSettle();

      expect(find.text('PREDICTED ACCREDITATION GRADE'), findsOneWidget);
      expect(find.text('A+'), findsOneWidget);
      expect(find.text('3.38 / 4.00'), findsOneWidget);
      expect(find.text('Predicted CGPA'), findsOneWidget);
    });

    testWidgets('Readiness score displays correctly', (WidgetTester tester) async {
      tester.view.physicalSize = const Size(1080, 2400);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(tester.view.resetPhysicalSize);

      await tester.pumpWidget(createInsightsScreen());
      await tester.pumpAndSettle();

      expect(find.text('Peer Team Visit Readiness'), findsOneWidget);
      expect(find.text('82%'), findsOneWidget);
      expect(find.byType(LinearProgressIndicator), findsOneWidget);
    });

    testWidgets('View Full Analysis button opens a WebView', (WidgetTester tester) async {
      tester.view.physicalSize = const Size(1080, 2400);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(tester.view.resetPhysicalSize);

      await tester.pumpWidget(createInsightsScreen());
      await tester.pumpAndSettle();

      final buttonFinder = find.widgetWithText(ElevatedButton, 'View Full Analysis');
      expect(buttonFinder, findsOneWidget);

      await tester.tap(buttonFinder);
      await tester.pumpAndSettle();

      // Verify that NaacWebViewScreen is rendered
      expect(find.byType(NaacWebViewScreen), findsOneWidget);
      expect(find.text('NAAC AI Analysis WebView'), findsOneWidget);
      expect(find.text('Web Dashboard View'), findsOneWidget);
    });
  });
}
