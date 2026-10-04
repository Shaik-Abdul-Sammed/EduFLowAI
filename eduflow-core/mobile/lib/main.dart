import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'core/theme_manager.dart';
import 'features/auth/screens/login_screen.dart';
import 'features/dashboard/screens/dashboard_screen.dart';
import 'screens/officer_stream_screen.dart';
import 'screens/lor_screen.dart';
import 'screens/qr_passport.dart';

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
      home: const LoginScreen(),
      routes: {
        '/login': (context) => const LoginScreen(),
        '/dashboard': (context) => const DashboardScreen(),
        '/officers': (context) => const OfficerStreamScreen(),
        '/lor': (context) => const LORScreen(),
        '/passport': (context) => QRPassportScreen(),
      },
    );
  }
}
