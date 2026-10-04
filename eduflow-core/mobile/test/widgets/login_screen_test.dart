import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:dio/dio.dart';
import 'package:eduflow_app/core/theme_manager.dart';
import 'package:eduflow_app/core/api_client.dart';
import 'package:eduflow_app/features/auth/screens/login_screen.dart';
import 'package:eduflow_app/screens/forgot_password_screen.dart';

import 'package:flutter_secure_storage/flutter_secure_storage.dart';

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
          '/welcome': (_) => const Scaffold(body: Text('Welcome Screen')),
          '/dashboard': (_) => const Scaffold(body: Text('Dashboard Screen')),
          '/signup': (_) => const Scaffold(body: Text('Signup Screen')),
        },
      ),
    );
  }

  group('LoginScreen Widget Tests', () {
    testWidgets('Login screen renders email field, password field, Remember Me checkbox, and Login button', (tester) async {
      await tester.pumpWidget(createLoginScreen());

      expect(find.byType(TextFormField), findsNWidgets(2));
      expect(find.text('Email Address'), findsOneWidget);
      expect(find.text('Password'), findsOneWidget);
      expect(find.text('Remember Me'), findsOneWidget);
      expect(find.text('Log In'), findsOneWidget);
    });

    testWidgets('Tapping the eye icon toggles password visibility', (tester) async {
      await tester.pumpWidget(createLoginScreen());

      final eyeIconFinder = find.byIcon(Icons.visibility_off);
      expect(eyeIconFinder, findsOneWidget);

      await tester.tap(eyeIconFinder);
      await tester.pump();

      expect(find.byIcon(Icons.visibility), findsOneWidget);
    });

    testWidgets('Empty email shows validation error', (tester) async {
      await tester.pumpWidget(createLoginScreen());

      await tester.tap(find.text('Log In'));
      await tester.pump();

      expect(find.text('Please enter your email'), findsOneWidget);
    });

    testWidgets('Invalid email shows validation error', (tester) async {
      await tester.pumpWidget(createLoginScreen());

      await tester.enterText(find.byType(TextFormField).first, 'invalid-email');
      await tester.enterText(find.byType(TextFormField).last, 'Password123');
      await tester.tap(find.text('Log In'));
      await tester.pump();

      expect(find.text('Please enter a valid email address'), findsOneWidget);
    });

    testWidgets('Short password shows validation error', (tester) async {
      await tester.pumpWidget(createLoginScreen());

      await tester.enterText(find.byType(TextFormField).first, 'admin@demo.edu');
      await tester.enterText(find.byType(TextFormField).last, '123');
      await tester.tap(find.text('Log In'));
      await tester.pump();

      expect(find.text('Password must be at least 6 characters'), findsOneWidget);
    });

    testWidgets('Tapping Login calls the API and shows a loading spinner', (tester) async {
      final client = ApiClient();
      client.dio.interceptors.insert(
        0,
        InterceptorsWrapper(
          onRequest: (options, handler) async {
            // Delay to inspect loading state
            await Future.delayed(const Duration(milliseconds: 200));
            return handler.resolve(
              Response(
                requestOptions: options,
                statusCode: 200,
                data: {
                  'accessToken': 'test-token',
                  'refreshToken': 'test-refresh',
                  'user': {'id': '1'},
                },
              ),
            );
          },
        ),
      );

      await tester.pumpWidget(createLoginScreen());
      await tester.enterText(find.byType(TextFormField).first, 'admin@demo.edu');
      await tester.enterText(find.byType(TextFormField).last, 'Demo@2026');

      await tester.tap(find.text('Log In'));
      await tester.pump(); // Start request

      expect(find.byType(CircularProgressIndicator), findsOneWidget);
      expect(find.text('Connecting to server...'), findsOneWidget);

      await tester.pump(const Duration(milliseconds: 300));
      client.dio.interceptors.removeAt(0);
    });

    testWidgets('Wrong password shows "Wrong password" error', (tester) async {
      final client = ApiClient();
      client.dio.interceptors.insert(
        0,
        InterceptorsWrapper(
          onRequest: (options, handler) {
            return handler.reject(
              DioException(
                requestOptions: options,
                response: Response(requestOptions: options, statusCode: 401),
              ),
            );
          },
        ),
      );

      await tester.pumpWidget(createLoginScreen());
      await tester.enterText(find.byType(TextFormField).first, 'admin@demo.edu');
      await tester.enterText(find.byType(TextFormField).last, 'WrongPass123');

      await tester.tap(find.text('Log In'));
      await tester.pumpAndSettle();

      expect(find.text('Wrong password. Please try again.'), findsOneWidget);
      client.dio.interceptors.removeAt(0);
    });

    testWidgets('404 response shows "Email not found" error', (tester) async {
      final client = ApiClient();
      client.dio.interceptors.insert(
        0,
        InterceptorsWrapper(
          onRequest: (options, handler) {
            return handler.reject(
              DioException(
                requestOptions: options,
                response: Response(requestOptions: options, statusCode: 404),
              ),
            );
          },
        ),
      );

      await tester.pumpWidget(createLoginScreen());
      await tester.enterText(find.byType(TextFormField).first, 'nonexistent@demo.edu');
      await tester.enterText(find.byType(TextFormField).last, 'Demo@2026');

      await tester.tap(find.text('Log In'));
      await tester.pumpAndSettle();

      expect(find.text('Email not found. Please check your email or sign up.'), findsOneWidget);
      client.dio.interceptors.removeAt(0);
    });

    testWidgets('Connection error shows "Cannot reach server" error', (tester) async {
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

      await tester.pumpWidget(createLoginScreen());
      await tester.enterText(find.byType(TextFormField).first, 'admin@demo.edu');
      await tester.enterText(find.byType(TextFormField).last, 'Demo@2026');

      await tester.tap(find.text('Log In'));
      await tester.pumpAndSettle();

      expect(find.text('Cannot reach server. Check your internet connection.'), findsOneWidget);
      client.dio.interceptors.removeAt(0);
    });

    testWidgets('Remember Me checkbox stores the email in SharedPreferences', (tester) async {
      final client = ApiClient();
      client.dio.interceptors.insert(
        0,
        InterceptorsWrapper(
          onRequest: (options, handler) {
            return handler.resolve(
              Response(
                requestOptions: options,
                statusCode: 200,
                data: {
                  'accessToken': 'test-token',
                  'refreshToken': 'test-refresh',
                  'user': {'id': '1'},
                },
              ),
            );
          },
        ),
      );

      await tester.pumpWidget(createLoginScreen());
      await tester.enterText(find.byType(TextFormField).first, 'admin@demo.edu');
      await tester.enterText(find.byType(TextFormField).last, 'Demo@2026');

      // Check Remember Me
      await tester.ensureVisible(find.byType(Checkbox));
      await tester.tap(find.byType(Checkbox));
      await tester.pumpAndSettle();

      final checkbox = tester.widget<Checkbox>(find.byType(Checkbox));
      expect(checkbox.value, isTrue);

      final formFinder = find.byType(Form);
      expect(formFinder, findsOneWidget);
      final formState = tester.state<FormState>(formFinder);
      expect(formState.validate(), isTrue);

      await tester.ensureVisible(find.text('Log In'));
      await tester.tap(find.text('Log In'));
      await tester.pumpAndSettle();

      final prefs = await SharedPreferences.getInstance();
      expect(prefs.getBool('remember_me'), isTrue);
      expect(prefs.getString('remembered_email'), equals('admin@demo.edu'));
      client.dio.interceptors.removeAt(0);
    });

    testWidgets('Forgot Password link navigates to the placeholder screen', (tester) async {
      await tester.pumpWidget(createLoginScreen());

      await tester.tap(find.text('Forgot Password?'));
      await tester.pumpAndSettle();

      expect(find.byType(ForgotPasswordScreen), findsOneWidget);
      expect(find.text('Forgot Password?'), findsOneWidget);
    });
  });
}
