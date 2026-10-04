import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:provider/provider.dart';
import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:eduflow_app/core/theme_manager.dart';
import 'package:eduflow_app/core/api_client.dart';
import 'package:eduflow_app/features/auth/screens/login_screen.dart';
import 'package:eduflow_app/screens/signup_screen.dart';

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
      child: const MaterialApp(
        home: LoginScreen(),
      ),
    );
  }

  Widget createSignupScreen() {
    return const MaterialApp(
      home: SignupScreen(),
    );
  }

  group('Network Resilience Tests', () {
    testWidgets('Timeout during login shows "Server is waking up" message', (tester) async {
      final client = ApiClient();
      client.dio.interceptors.insert(
        0,
        InterceptorsWrapper(
          onRequest: (options, handler) {
            return handler.reject(
              DioException(
                requestOptions: options,
                type: DioExceptionType.connectionTimeout,
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

      expect(find.text('Server is waking up. Please wait 30 seconds and try again.'), findsOneWidget);
      client.dio.interceptors.removeAt(0);
    });

    testWidgets('Connection refused during signup shows "Cannot reach server"', (tester) async {
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

    testWidgets('500 error shows a generic but friendly error', (tester) async {
      final client = ApiClient();
      client.dio.interceptors.insert(
        0,
        InterceptorsWrapper(
          onRequest: (options, handler) {
            return handler.reject(
              DioException(
                requestOptions: options,
                response: Response(
                  requestOptions: options,
                  statusCode: 500,
                  data: {'error': 'Internal server exception'},
                ),
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

      expect(find.text('Internal server exception'), findsOneWidget);
      client.dio.interceptors.removeAt(0);
    });

    testWidgets('429 rate limit shows "Too many attempts" message', (tester) async {
      final client = ApiClient();
      client.dio.interceptors.insert(
        0,
        InterceptorsWrapper(
          onRequest: (options, handler) {
            return handler.reject(
              DioException(
                requestOptions: options,
                response: Response(requestOptions: options, statusCode: 429),
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

      expect(find.text('Too many login attempts. Please wait 15 minutes.'), findsOneWidget);
      client.dio.interceptors.removeAt(0);
    });

    testWidgets('Retry after failure works correctly', (tester) async {
      bool shouldFail = true;
      final client = ApiClient();
      client.dio.interceptors.insert(
        0,
        InterceptorsWrapper(
          onRequest: (options, handler) {
            if (shouldFail) {
              return handler.reject(
                DioException(
                  requestOptions: options,
                  type: DioExceptionType.connectionError,
                ),
              );
            }
            return handler.resolve(
              Response(
                requestOptions: options,
                statusCode: 200,
                data: {
                  'accessToken': 'retry-token',
                  'refreshToken': 'retry-refresh',
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

      // Attempt 1: fails
      await tester.tap(find.text('Log In'));
      await tester.pumpAndSettle();
      expect(find.text('Cannot reach server. Check your internet connection.'), findsOneWidget);

      // Attempt 2: retry succeeds
      shouldFail = false;
      await tester.tap(find.text('Log In'));
      await tester.pumpAndSettle();

      // Error banner dismissed, login finished
      expect(find.text('Cannot reach server. Check your internet connection.'), findsNothing);
      client.dio.interceptors.removeAt(0);
    });
  });
}
