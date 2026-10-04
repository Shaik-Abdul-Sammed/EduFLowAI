import 'package:flutter_test/flutter_test.dart';
import 'package:provider/provider.dart';
import 'package:eduflow_app/main.dart';
import 'package:eduflow_app/core/theme_manager.dart';
import 'package:eduflow_app/screens/welcome_screen.dart';

void main() {
  testWidgets('App smoke test', (WidgetTester tester) async {
    await tester.pumpWidget(
      MultiProvider(
        providers: [
          ChangeNotifierProvider(create: (_) => ThemeManager()),
        ],
        child: const EduFlowApp(),
      ),
    );

    expect(find.byType(WelcomeScreen), findsOneWidget);
    expect(find.text('The AI Administrative Workforce for Colleges'), findsOneWidget);
  });
}
