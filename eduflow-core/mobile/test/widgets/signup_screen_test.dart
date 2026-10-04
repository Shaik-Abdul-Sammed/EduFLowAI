import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:dio/dio.dart';
import 'package:eduflow_app/core/api_client.dart';
import 'package:eduflow_app/screens/signup_screen.dart';

void main() {
  Widget createSignupScreen() {
    return const MaterialApp(
      home: SignupScreen(),
    );
  }

  group('SignupScreen Widget Tests', () {
    testWidgets('Signup screen renders all 6 fields and the Terms checkbox', (tester) async {
      tester.view.physicalSize = const Size(1080, 2400);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(tester.view.resetPhysicalSize);

      await tester.pumpWidget(createSignupScreen());

      expect(find.byType(TextFormField), findsNWidgets(6));
      expect(find.text('Full Name'), findsOneWidget);
      expect(find.text('Institution Name'), findsOneWidget);
      expect(find.text('Email Address'), findsOneWidget);
      expect(find.text('Phone Number (10 digits)'), findsOneWidget);
      expect(find.text('Password (min. 8 characters)'), findsOneWidget);
      expect(find.text('Confirm Password'), findsOneWidget);
      expect(find.byType(Checkbox), findsOneWidget);
    });

    testWidgets('Create Account button is disabled until Terms is checked', (tester) async {
      tester.view.physicalSize = const Size(1080, 2400);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(tester.view.resetPhysicalSize);

      await tester.pumpWidget(createSignupScreen());

      final buttonFinder = find.widgetWithText(ElevatedButton, 'Create Account');
      ElevatedButton button = tester.widget(buttonFinder);
      expect(button.onPressed, isNull);

      // Check terms
      await tester.tap(find.byType(Checkbox));
      await tester.pump();

      button = tester.widget(buttonFinder);
      expect(button.onPressed, isNotNull);
    });

    testWidgets('Invalid email shows validation error', (tester) async {
      tester.view.physicalSize = const Size(1080, 2400);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(tester.view.resetPhysicalSize);

      await tester.pumpWidget(createSignupScreen());

      // Enter invalid email
      final emailFinder = find.widgetWithText(TextFormField, 'Email Address');
      await tester.enterText(emailFinder, 'invalid-email');
      await tester.tap(find.byType(Checkbox));
      await tester.pump();

      await tester.tap(find.widgetWithText(ElevatedButton, 'Create Account'));
      await tester.pump();

      expect(find.text('Please enter a valid email address'), findsOneWidget);
    });

    testWidgets('Short password shows validation error', (tester) async {
      tester.view.physicalSize = const Size(1080, 2400);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(tester.view.resetPhysicalSize);

      await tester.pumpWidget(createSignupScreen());

      final passFinder = find.widgetWithText(TextFormField, 'Password (min. 8 characters)');
      await tester.enterText(passFinder, '12345');
      await tester.tap(find.byType(Checkbox));
      await tester.pump();

      await tester.tap(find.widgetWithText(ElevatedButton, 'Create Account'));
      await tester.pump();

      expect(find.text('Password must be at least 8 characters'), findsOneWidget);
    });

    testWidgets('Mismatched passwords show validation error', (tester) async {
      tester.view.physicalSize = const Size(1080, 2400);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(tester.view.resetPhysicalSize);

      await tester.pumpWidget(createSignupScreen());

      final passFinder = find.widgetWithText(TextFormField, 'Password (min. 8 characters)');
      final confirmFinder = find.widgetWithText(TextFormField, 'Confirm Password');

      await tester.enterText(passFinder, 'Abcd@1234');
      await tester.enterText(confirmFinder, 'Mismatch@1234');
      await tester.tap(find.byType(Checkbox));
      await tester.pump();

      await tester.tap(find.widgetWithText(ElevatedButton, 'Create Account'));
      await tester.pump();

      expect(find.text('Passwords do not match'), findsOneWidget);
    });

    testWidgets('Invalid phone number shows validation error', (tester) async {
      tester.view.physicalSize = const Size(1080, 2400);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(tester.view.resetPhysicalSize);

      await tester.pumpWidget(createSignupScreen());

      final phoneFinder = find.widgetWithText(TextFormField, 'Phone Number (10 digits)');
      await tester.enterText(phoneFinder, '12345'); // invalid
      await tester.tap(find.byType(Checkbox));
      await tester.pump();

      await tester.tap(find.widgetWithText(ElevatedButton, 'Create Account'));
      await tester.pump();

      expect(find.text('Enter a valid 10-digit Indian phone number'), findsOneWidget);
    });

    testWidgets('Password strength meter updates as user types', (tester) async {
      tester.view.physicalSize = const Size(1080, 2400);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(tester.view.resetPhysicalSize);

      await tester.pumpWidget(createSignupScreen());

      final passFinder = find.widgetWithText(TextFormField, 'Password (min. 8 characters)');
      await tester.enterText(passFinder, 'abc');
      await tester.pump();
      expect(find.text('Weak'), findsOneWidget);

      await tester.enterText(passFinder, 'abcdefgh');
      await tester.pump();
      expect(find.text('Medium'), findsOneWidget);

      await tester.enterText(passFinder, 'Abcd@1234');
      await tester.pump();
      expect(find.text('Strong'), findsOneWidget);
    });

    testWidgets('Show/hide password toggle works on both fields', (tester) async {
      tester.view.physicalSize = const Size(1080, 2400);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(tester.view.resetPhysicalSize);

      await tester.pumpWidget(createSignupScreen());

      final visibilityIcons = find.byIcon(Icons.visibility_off);
      expect(visibilityIcons, findsNWidgets(2));

      await tester.tap(visibilityIcons.first);
      await tester.pump();
      expect(find.byIcon(Icons.visibility), findsOneWidget);

      await tester.tap(find.byIcon(Icons.visibility_off));
      await tester.pump();
      expect(find.byIcon(Icons.visibility), findsNWidgets(2));
    });

    testWidgets('Submitting the form with valid data calls the API', (tester) async {
      tester.view.physicalSize = const Size(1080, 2400);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(tester.view.resetPhysicalSize);

      bool apiCalled = false;
      final client = ApiClient();
      client.dio.interceptors.insert(
        0,
        InterceptorsWrapper(
          onRequest: (options, handler) {
            if (options.path.contains('/institutions/register')) {
              apiCalled = true;
            }
            return handler.resolve(
              Response(requestOptions: options, statusCode: 201, data: {'success': true}),
            );
          },
        ),
      );

      await tester.pumpWidget(createSignupScreen());

      await tester.enterText(find.widgetWithText(TextFormField, 'Full Name'), 'Dr. Rao');
      await tester.enterText(find.widgetWithText(TextFormField, 'Institution Name'), 'SSIT College');
      await tester.enterText(find.widgetWithText(TextFormField, 'Email Address'), 'rao@ssit.edu');
      await tester.enterText(find.widgetWithText(TextFormField, 'Phone Number (10 digits)'), '9010150809');
      await tester.enterText(find.widgetWithText(TextFormField, 'Password (min. 8 characters)'), 'Abcd@1234');
      await tester.enterText(find.widgetWithText(TextFormField, 'Confirm Password'), 'Abcd@1234');

      await tester.tap(find.byType(Checkbox));
      await tester.pump();

      await tester.tap(find.widgetWithText(ElevatedButton, 'Create Account'));
      await tester.pumpAndSettle();

      expect(apiCalled, isTrue);
      client.dio.interceptors.removeAt(0);
    });

    testWidgets('409 response shows "Already registered" error', (tester) async {
      tester.view.physicalSize = const Size(1080, 2400);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(tester.view.resetPhysicalSize);

      final client = ApiClient();
      client.dio.interceptors.insert(
        0,
        InterceptorsWrapper(
          onRequest: (options, handler) {
            return handler.reject(
              DioException(
                requestOptions: options,
                response: Response(requestOptions: options, statusCode: 409),
              ),
            );
          },
        ),
      );

      await tester.pumpWidget(createSignupScreen());

      await tester.enterText(find.widgetWithText(TextFormField, 'Full Name'), 'Dr. Rao');
      await tester.enterText(find.widgetWithText(TextFormField, 'Institution Name'), 'SSIT College');
      await tester.enterText(find.widgetWithText(TextFormField, 'Email Address'), 'rao@ssit.edu');
      await tester.enterText(find.widgetWithText(TextFormField, 'Phone Number (10 digits)'), '9010150809');
      await tester.enterText(find.widgetWithText(TextFormField, 'Password (min. 8 characters)'), 'Abcd@1234');
      await tester.enterText(find.widgetWithText(TextFormField, 'Confirm Password'), 'Abcd@1234');

      await tester.tap(find.byType(Checkbox));
      await tester.pump();

      await tester.tap(find.widgetWithText(ElevatedButton, 'Create Account'));
      await tester.pumpAndSettle();

      expect(find.text('This institution or email is already registered. Try logging in instead.'), findsOneWidget);
      client.dio.interceptors.removeAt(0);
    });

    testWidgets('Connection error shows "Cannot reach server" error', (tester) async {
      tester.view.physicalSize = const Size(1080, 2400);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(tester.view.resetPhysicalSize);

      final client = ApiClient();
      client.dio.interceptors.insert(
        0,
        InterceptorsWrapper(
          onRequest: (options, handler) {
            return handler.reject(
              DioException(
                requestOptions: options,
                type: DioExceptionType.connectionError,
              ),
            );
          },
        ),
      );

      await tester.pumpWidget(createSignupScreen());

      await tester.enterText(find.widgetWithText(TextFormField, 'Full Name'), 'Dr. Rao');
      await tester.enterText(find.widgetWithText(TextFormField, 'Institution Name'), 'SSIT College');
      await tester.enterText(find.widgetWithText(TextFormField, 'Email Address'), 'rao@ssit.edu');
      await tester.enterText(find.widgetWithText(TextFormField, 'Phone Number (10 digits)'), '9010150809');
      await tester.enterText(find.widgetWithText(TextFormField, 'Password (min. 8 characters)'), 'Abcd@1234');
      await tester.enterText(find.widgetWithText(TextFormField, 'Confirm Password'), 'Abcd@1234');

      await tester.tap(find.byType(Checkbox));
      await tester.pump();

      await tester.tap(find.widgetWithText(ElevatedButton, 'Create Account'));
      await tester.pumpAndSettle();

      expect(find.text('Cannot reach server. Check your internet connection.'), findsOneWidget);
      client.dio.interceptors.removeAt(0);
    });

    testWidgets('Successful signup shows a success dialog', (tester) async {
      tester.view.physicalSize = const Size(1080, 2400);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(tester.view.resetPhysicalSize);

      final client = ApiClient();
      client.dio.interceptors.insert(
        0,
        InterceptorsWrapper(
          onRequest: (options, handler) {
            return handler.resolve(
              Response(requestOptions: options, statusCode: 201, data: {'success': true}),
            );
          },
        ),
      );

      await tester.pumpWidget(createSignupScreen());

      await tester.enterText(find.widgetWithText(TextFormField, 'Full Name'), 'Dr. Rao');
      await tester.enterText(find.widgetWithText(TextFormField, 'Institution Name'), 'SSIT College');
      await tester.enterText(find.widgetWithText(TextFormField, 'Email Address'), 'rao@ssit.edu');
      await tester.enterText(find.widgetWithText(TextFormField, 'Phone Number (10 digits)'), '9010150809');
      await tester.enterText(find.widgetWithText(TextFormField, 'Password (min. 8 characters)'), 'Abcd@1234');
      await tester.enterText(find.widgetWithText(TextFormField, 'Confirm Password'), 'Abcd@1234');

      await tester.tap(find.byType(Checkbox));
      await tester.pump();

      await tester.tap(find.widgetWithText(ElevatedButton, 'Create Account'));
      await tester.pumpAndSettle();

      expect(find.byType(AlertDialog), findsOneWidget);
      expect(find.text('Account created! Please log in with your credentials.'), findsOneWidget);
      client.dio.interceptors.removeAt(0);
    });
  });
}
