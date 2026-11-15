import 'package:flutter/material.dart';

class InstitutionTheme {
  final String name;
  final String shortCode;
  final Color primaryColor;
  final Color secondaryColor;
  final String logoUrl;
  final String subscriptionTier;

  InstitutionTheme({
    required this.name,
    required this.shortCode,
    required this.primaryColor,
    required this.secondaryColor,
    required this.logoUrl,
    required this.subscriptionTier,
  });

  factory InstitutionTheme.defaultTheme() {
    return InstitutionTheme(
      name: 'EduFlow AI OS',
      shortCode: 'eduflow',
      primaryColor: const Color(0xFF2563EB), // Blue
      secondaryColor: const Color(0xFF10B981), // Green
      logoUrl: '',
      subscriptionTier: 'FREE',
    );
  }

  factory InstitutionTheme.fromJson(Map<String, dynamic> json) {
    return InstitutionTheme(
      name: json['name'] ?? 'EduFlow',
      shortCode: json['shortCode'] ?? 'eduflow',
      primaryColor: _colorFromHex(json['primaryColor'] ?? '#2563EB'),
      secondaryColor: _colorFromHex(json['secondaryColor'] ?? '#10B981'),
      logoUrl: json['logoUrl'] ?? '',
      subscriptionTier: json['subscriptionTier'] ?? 'FREE',
    );
  }

  static Color _colorFromHex(dynamic hexColor, {Color fallback = const Color(0xFF2563EB)}) {
    if (hexColor == null || hexColor is! String) return fallback;
    String cleanHex = hexColor.trim().toUpperCase().replaceAll("#", "");
    if (cleanHex.length == 3) {
      cleanHex = cleanHex.split('').map((c) => '$c$c').join('');
    }
    if (cleanHex.length == 6) {
      cleanHex = "FF$cleanHex";
    }
    if (cleanHex.length != 8) return fallback;
    try {
      final value = int.parse(cleanHex, radix: 16);
      return Color(value);
    } catch (_) {
      return fallback;
    }
  }
}

class ThemeManager extends ChangeNotifier {
  InstitutionTheme _currentTheme = InstitutionTheme.defaultTheme();

  InstitutionTheme get currentTheme => _currentTheme;

  ThemeData get themeData {
    return ThemeData(
      primaryColor: _currentTheme.primaryColor,
      colorScheme: ColorScheme.fromSeed(
        seedColor: _currentTheme.primaryColor,
        primary: _currentTheme.primaryColor,
        secondary: _currentTheme.secondaryColor,
      ),
      useMaterial3: true,
      appBarTheme: AppBarTheme(
        backgroundColor: _currentTheme.primaryColor,
        foregroundColor: Colors.white,
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: _currentTheme.primaryColor,
          foregroundColor: Colors.white,
        ),
      ),
    );
  }

  /// Feature 53: Native Dark Mode Support matching platform brightness
  ThemeData get darkThemeData {
    return ThemeData(
      brightness: Brightness.dark,
      scaffoldBackgroundColor: const Color(0xFF0F172A),
      primaryColor: _currentTheme.primaryColor,
      colorScheme: ColorScheme.fromSeed(
        brightness: Brightness.dark,
        seedColor: _currentTheme.primaryColor,
        primary: _currentTheme.primaryColor,
        secondary: _currentTheme.secondaryColor,
        surface: const Color(0xFF1E293B),
      ),
      useMaterial3: true,
      appBarTheme: const AppBarTheme(
        backgroundColor: Color(0xFF1E293B),
        foregroundColor: Colors.white,
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: _currentTheme.primaryColor,
          foregroundColor: Colors.white,
        ),
      ),
    );
  }

  void updateTheme(InstitutionTheme newTheme) {
    _currentTheme = newTheme;
    notifyListeners();
  }

  void resetToDefault() {
    _currentTheme = InstitutionTheme.defaultTheme();
    notifyListeners();
  }
}
