import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
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

void main() {
  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => ThemeManager()),
      ],
      child: const EduFlowApp(),
    ),
  );
}

class EduFlowApp extends StatelessWidget {
  const EduFlowApp({super.key});

  @override
  Widget build(BuildContext context) {
    final themeManager = Provider.of<ThemeManager>(context);

    return MaterialApp(
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
