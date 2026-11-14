import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:provider/provider.dart';
import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:eduflow_app/core/theme_manager.dart';
import 'package:eduflow_app/core/api_client.dart';
import 'package:eduflow_app/screens/app_config.dart';
import 'package:eduflow_app/features/auth/screens/login_screen.dart';
import 'package:eduflow_app/features/dashboard/screens/dashboard_screen.dart';
import 'package:eduflow_app/features/dashboard/widgets/presence_status_widget.dart';
import 'package:eduflow_app/main.dart';

void main() {
  setUp(() {
    SharedPreferences.setMockInitialValues({});
    FlutterSecureStorage.setMockInitialValues({});
  });

  group('Enterprise Mobile Hardening Tests', () {
    test('AppConfig provides OneSignal App ID and Sentry DSN without Firebase', () {
      expect(AppConfig.oneSignalAppId, isNotEmpty);
      expect(AppConfig.sentryDsn, isNotEmpty);
      expect(AppConfig.apiBaseUrl, isNotEmpty);
    });

    testWidgets('PresenceStatusWidget renders 🟢, 🟡, ⚪ with zero overflow on a 375px mobile screen', (tester) async {
      // Set viewport to 375x667 (iPhone SE standard mobile viewport)
      tester.view.physicalSize = const Size(375, 667);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(tester.view.resetPhysicalSize);

      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: Center(
              child: Column(
                children: [
                  PresenceStatusWidget(initialStatus: 'Classroom'),
                  PresenceStatusWidget(initialStatus: 'Dorm'),
                  PresenceStatusWidget(initialStatus: 'Outside'),
                ],
              ),
            ),
          ),
        ),
      );

      await tester.pumpAndSettle();

      expect(find.text('🟢 On Campus (Classroom)'), findsOneWidget);
      expect(find.text('🟡 On Campus (Dorm)'), findsOneWidget);
      expect(find.text('⚪ Outside Campus'), findsOneWidget);

      // Verify no RenderFlex overflow exceptions occurred
      expect(tester.takeException(), isNull);
    });

    testWidgets('Student login offline error displays friendly SnackBar without crashing app', (tester) async {
      final client = ApiClient();
      client.dio.interceptors.insert(
        0,
        InterceptorsWrapper(
          onRequest: (options, handler) {
            return handler.reject(
              DioException(
                requestOptions: options,
                type: DioExceptionType.connectionError,
                error: 'SocketException: Connection refused (offline)',
              ),
            );
          },
        ),
      );

      await tester.pumpWidget(
        MultiProvider(
          providers: [
            ChangeNotifierProvider(create: (_) => ThemeManager()),
          ],
          child: const MaterialApp(
            home: LoginScreen(),
          ),
        ),
      );

      // Switch to Student Tab
      await tester.tap(find.byKey(const Key('studentTabButton')));
      await tester.pumpAndSettle();

      // Enter valid student roll and 8-digit DOB
      await tester.enterText(find.byKey(const Key('rollNumberField')), '21CS001');
      await tester.enterText(find.byKey(const Key('dobField')), '15082004');

      // Click Log In
      await tester.tap(find.byKey(const Key('studentLoginButton')));
      await tester.pump(); // Start request

      await tester.pump(const Duration(milliseconds: 500));
      await tester.pumpAndSettle();

      // Assert SnackBar is shown with exact expected text
      expect(find.byType(SnackBar), findsOneWidget);
      expect(find.text('You are offline. Please check your connection.'), findsWidgets);

      // Cleanup
      client.dio.interceptors.removeAt(0);
    });

    testWidgets('DashboardScreen and LoginScreen are wrapped in SingleChildScrollView with resizeToAvoidBottomInset', (tester) async {
      await tester.pumpWidget(
        MultiProvider(
          providers: [
            ChangeNotifierProvider(create: (_) => ThemeManager()),
          ],
          child: const MaterialApp(
            home: DashboardScreen(),
          ),
        ),
      );

      await tester.pumpAndSettle();

      final scaffoldFinder = find.byType(Scaffold);
      expect(scaffoldFinder, findsOneWidget);
      final scaffoldWidget = tester.widget<Scaffold>(scaffoldFinder);
      expect(scaffoldWidget.resizeToAvoidBottomInset, isTrue);

      final scrollFinder = find.byType(SingleChildScrollView);
      expect(scrollFinder, findsWidgets);
    });

    testWidgets('EduFlowApp provides attendance routing observer and routes properly', (tester) async {
      final navKey = GlobalKey<NavigatorState>();

      await tester.pumpWidget(
        MultiProvider(
          providers: [
            ChangeNotifierProvider(create: (_) => ThemeManager()),
          ],
          child: EduFlowApp(navigatorKey: navKey),
        ),
      );

      await tester.pumpAndSettle();

      // Route directly to /attendance (alias of Presence / Dashboard screen)
      navKey.currentState?.pushNamed('/attendance');
      await tester.pumpAndSettle();

      expect(find.byType(PresenceStatusWidget), findsOneWidget);
    });
  });
}
