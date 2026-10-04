import 'package:flutter_test/flutter_test.dart';
import 'package:provider/provider.dart';
import 'package:eduflow_app/main.dart';
import 'package:eduflow_app/core/theme_manager.dart';

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

    expect(find.text('EduFlow AI OS'), findsOneWidget);
  });
}
