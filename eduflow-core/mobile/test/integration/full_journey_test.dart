import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:provider/provider.dart';
import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:eduflow_app/core/theme_manager.dart';
import 'package:eduflow_app/core/api_client.dart';
import 'package:eduflow_app/screens/welcome_screen.dart';
import 'package:eduflow_app/screens/signup_screen.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:eduflow_app/features/auth/screens/login_screen.dart';
import 'package:eduflow_app/features/dashboard/screens/dashboard_screen.dart';

void main() {
  setUp(() {
    SharedPreferences.setMockInitialValues({});
    FlutterSecureStorage.setMockInitialValues({});
  });

  testWidgets('Full Journey Test: Welcome -> Signup -> Dialog -> Login -> Dashboard', (tester) async {
    tester.view.physicalSize = const Size(1080, 2400);
    tester.view.devicePixelRatio = 1.0;
    addTearDown(tester.view.resetPhysicalSize);

    final client = ApiClient();
    client.dio.interceptors.insert(
      0,
      InterceptorsWrapper(
        onRequest: (options, handler) {
          if (options.path.contains('/institutions/register')) {
            return handler.resolve(
              Response(
                requestOptions: options,
                statusCode: 201,
                data: {'success': true},
              ),
            );
          }
          if (options.path.contains('/auth/login')) {
            return handler.resolve(
              Response(
                requestOptions: options,
                statusCode: 200,
                data: {
                  'accessToken': 'full-journey-access-token',
                  'refreshToken': 'full-journey-refresh-token',
                  'user': {'id': '1', 'role': 'admin'},
                  'institution': {
                    'name': 'Sri Sudha Institute of Technology',
                    'primaryColor': '#0A2540',
                  },
                },
              ),
            );
          }
          return handler.next(options);
        },
      ),
    );

    await tester.pumpWidget(
      MultiProvider(
        providers: [
          ChangeNotifierProvider(create: (_) => ThemeManager()),
        ],
        child: MaterialApp(
          initialRoute: '/welcome',
          routes: {
            '/welcome': (ctx) => const WelcomeScreen(),
            '/signup': (ctx) => const SignupScreen(),
            '/login': (ctx) => const LoginScreen(),
            '/dashboard': (ctx) => const DashboardScreen(),
          },
        ),
      ),
    );

    // 1. Verify App launches to Welcome screen
    expect(find.byType(WelcomeScreen), findsOneWidget);

    // 2. Tap Create Account navigates to signup
    await tester.ensureVisible(find.text('Create an Account'));
    await tester.tap(find.text('Create an Account'));
    await tester.pumpAndSettle();
    expect(find.byType(SignupScreen), findsOneWidget);

    // 3. Fill in signup form with demo values
    await tester.enterText(find.widgetWithText(TextFormField, 'Full Name'), 'Dr. Ramanathan');
    await tester.enterText(find.widgetWithText(TextFormField, 'Institution Name'), 'Sri Sudha Institute');
    await tester.enterText(find.widgetWithText(TextFormField, 'Email Address'), 's9010150809@gmail.com');
    await tester.enterText(find.widgetWithText(TextFormField, 'Phone Number (10 digits)'), '9010150809');
    await tester.enterText(find.widgetWithText(TextFormField, 'Password (min. 8 characters)'), 'Demo@2026');
    await tester.enterText(find.widgetWithText(TextFormField, 'Confirm Password'), 'Demo@2026');

    // 4. Check Terms, tap Create Account
    await tester.ensureVisible(find.byType(Checkbox));
    await tester.tap(find.byType(Checkbox));
    await tester.pump();

    await tester.ensureVisible(find.widgetWithText(ElevatedButton, 'Create Account'));
    await tester.tap(find.widgetWithText(ElevatedButton, 'Create Account'));
    await tester.pumpAndSettle();

    // 5. Verify success dialog appears
    expect(find.byType(AlertDialog), findsOneWidget);
    expect(find.text('Account created! Please log in with your credentials.'), findsOneWidget);

    // 6. Navigate to login screen
    await tester.tap(find.text('OK'));
    await tester.pumpAndSettle();
    expect(find.byType(LoginScreen), findsOneWidget);

    // 7. Enter admin@demo.edu and Demo@2026
    await tester.enterText(find.widgetWithText(TextFormField, 'Email Address'), 'admin@demo.edu');
    await tester.enterText(find.widgetWithText(TextFormField, 'Password'), 'Demo@2026');

    // 8. Tap Login
    await tester.ensureVisible(find.text('Log In'));
    await tester.tap(find.text('Log In'));
    await tester.pumpAndSettle();

    // 9. Verify redirect to Dashboard
    expect(find.byType(DashboardScreen), findsOneWidget);

    client.dio.interceptors.removeAt(0);
  });
}
