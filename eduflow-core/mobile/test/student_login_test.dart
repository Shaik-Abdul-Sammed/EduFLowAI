import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:eduflow_app/core/theme_manager.dart';
import 'package:eduflow_app/features/auth/screens/login_screen.dart';

void main() {
  setUp(() {
    SharedPreferences.setMockInitialValues({});
    FlutterSecureStorage.setMockInitialValues({});
  });

  Widget createLoginScreen() {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => ThemeManager()),
      ],
      child: MaterialApp(
        home: const LoginScreen(),
        routes: {
          '/dashboard': (_) => const Scaffold(body: Text('Dashboard')),
        },
      ),
    );
  }

  group('Student Login Widget & Validation Tests', () {
    testWidgets('Switching to Student tab renders Roll Number and DOB fields', (tester) async {
      await tester.pumpWidget(createLoginScreen());

      // Find and tap the Student Tab toggle
      final studentTabFinder = find.byKey(const Key('studentTabButton'));
      expect(studentTabFinder, findsOneWidget);
      await tester.tap(studentTabFinder);
      await tester.pumpAndSettle();

      // Verify Roll Number and DOB fields are displayed
      expect(find.byKey(const Key('rollNumberField')), findsOneWidget);
      expect(find.byKey(const Key('dobField')), findsOneWidget);
      expect(find.byKey(const Key('studentLoginButton')), findsOneWidget);
    });

    testWidgets('DOB input field is configured with number keyboard and maxLength 8', (tester) async {
      await tester.pumpWidget(createLoginScreen());

      // Switch to Student mode
      await tester.tap(find.byKey(const Key('studentTabButton')));
      await tester.pumpAndSettle();

      final dobFinder = find.byKey(const Key('dobField'));
      expect(dobFinder, findsOneWidget);

      final textField = tester.widget<TextField>(find.descendant(
        of: dobFinder,
        matching: find.byType(TextField),
      ));
      expect(textField.maxLength, 8);
      expect(textField.keyboardType, TextInputType.number);
      expect(textField.inputFormatters, isNotNull);
      expect(textField.inputFormatters!.any((f) => f is LengthLimitingTextInputFormatter), isTrue);
      expect(textField.inputFormatters!.any((f) => f is FilteringTextInputFormatter), isTrue);
    });

    test('DOB formatters strictly reject letters and truncate to 8 digits', () {
      final digitFilter = FilteringTextInputFormatter.digitsOnly;
      final lengthFilter = LengthLimitingTextInputFormatter(8);

      // Filtering non-digits
      final filtered = digitFilter.formatEditUpdate(
        const TextEditingValue(text: ''),
        const TextEditingValue(text: '15AB08CD2004'),
      );
      expect(filtered.text, '15082004');

      // Enforcing 8-character max length
      final truncated = lengthFilter.formatEditUpdate(
        const TextEditingValue(text: ''),
        const TextEditingValue(text: '999888777666'),
      );
      expect(truncated.text, '99988877');
      expect(truncated.text.length, 8);
    });

    testWidgets('Submitting incomplete Student credentials displays validation warnings', (tester) async {
      await tester.pumpWidget(createLoginScreen());

      await tester.tap(find.byKey(const Key('studentTabButton')));
      await tester.pumpAndSettle();

      // Tap Student Log In with empty fields
      await tester.tap(find.byKey(const Key('studentLoginButton')));
      await tester.pumpAndSettle();

      expect(find.text('Please enter your Roll Number'), findsOneWidget);
      expect(find.text('Date of Birth must be 8 digits (DDMMYYYY)'), findsOneWidget);
    });
  });
}
