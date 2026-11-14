import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:onesignal_flutter/onesignal_flutter.dart';
import 'package:sentry_flutter/sentry_flutter.dart';
import 'screens/app_config.dart';
import 'core/theme_manager.dart';
import 'screens/welcome_screen.dart';
import 'screens/signup_screen.dart';
import 'features/auth/screens/login_screen.dart';
import 'features/dashboard/screens/dashboard_screen.dart';
import 'screens/officer_stream_screen.dart';
import 'screens/lor_screen.dart';
import 'screens/qr_passport.dart';
import 'screens/naac_insights_screen.dart';
import 'screens/naac_dashboard_screen.dart';
import 'screens/insights_dashboard_screen.dart';
import 'screens/nirf_dashboard_screen.dart';
import 'screens/forgot_password_screen.dart';
import 'screens/about_screen.dart';
import 'screens/placement_radar.dart';
import 'screens/auto_resume.dart';
import 'screens/mock_simulator.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  await SentryFlutter.init(
    (options) {
      options.dsn = AppConfig.sentryDsn;
      options.tracesSampleRate = 1.0;
    },
    appRunner: () => runApp(
      MultiProvider(
        providers: [
          ChangeNotifierProvider(create: (_) => ThemeManager()),
        ],
        child: const EduFlowApp(),
      ),
    ),
  );
}

class EduFlowApp extends StatefulWidget {
  final GlobalKey<NavigatorState>? navigatorKey;

  const EduFlowApp({super.key, this.navigatorKey});

  @override
  State<EduFlowApp> createState() => _EduFlowAppState();
}

class _EduFlowAppState extends State<EduFlowApp> {
  late final GlobalKey<NavigatorState> _navigatorKey;

  @override
  void initState() {
    super.initState();
    _navigatorKey = widget.navigatorKey ?? GlobalKey<NavigatorState>();
    _initOneSignal();
  }

  void _initOneSignal() {
    try {
      OneSignal.Debug.setLogLevel(OSLogLevel.none);
      OneSignal.initialize(AppConfig.oneSignalAppId);
      OneSignal.Notifications.requestPermission(true);

      OneSignal.Notifications.addClickListener((event) {
        final additionalData = event.notification.additionalData;
        if (additionalData != null && additionalData['type'] == 'attendance_alert') {
          _navigatorKey.currentState?.pushNamed('/dashboard');
        }
      });
    } catch (e) {
      debugPrint('[OneSignal] Initialization safely handled: $e');
    }
  }

  @override
  Widget build(BuildContext context) {
    final themeManager = Provider.of<ThemeManager>(context);

    return MaterialApp(
      navigatorKey: _navigatorKey,
      navigatorObservers: [
        SentryNavigatorObserver(),
      ],
      title: 'EduFlow AI OS',
      theme: themeManager.themeData,
      debugShowCheckedModeBanner: false,
      initialRoute: '/welcome',
      routes: {
        '/welcome': (context) => const WelcomeScreen(),
        '/signup': (context) => const SignupScreen(),
        '/login': (context) => const LoginScreen(),
        '/forgot-password': (context) => const ForgotPasswordScreen(),
        '/dashboard': (context) => const DashboardScreen(),
        '/attendance': (context) => const DashboardScreen(),
        '/officers': (context) => const OfficerStreamScreen(),
        '/lor': (context) => const LORScreen(),
        '/passport': (context) => QRPassportScreen(),
        '/insights': (context) => const InsightsDashboardScreen(),
        '/naac-insights': (context) => const NaacInsightsScreen(),
        '/naac-dashboard': (context) => const NaacDashboardScreen(),
        '/nirf': (context) => const NirfDashboardScreen(),
        '/about': (context) => const AboutScreen(),
        '/placement-radar': (context) => const PlacementRadarScreen(),
        '/auto-resume': (context) => const AutoResumeBuilderScreen(),
        '/mock-simulator': (context) => const MockSimulatorScreen(),
      },
    );
  }
}
