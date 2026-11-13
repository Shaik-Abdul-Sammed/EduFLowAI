import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:eduflow_app/core/theme_manager.dart';

void main() {
  group('InstitutionTheme & ThemeManager White-box / Unit Tests', () {
    test('defaultTheme initializes with EduFlow defaults', () {
      final theme = InstitutionTheme.defaultTheme();
      expect(theme.name, equals('EduFlow AI OS'));
      expect(theme.shortCode, equals('eduflow'));
      expect(theme.primaryColor, equals(const Color(0xFF2563EB)));
      expect(theme.secondaryColor, equals(const Color(0xFF10B981)));
      expect(theme.subscriptionTier, equals('FREE'));
    });

    test('fromJson handles full payload correctly', () {
      final json = {
        'name': 'Sri Sudha Institute of Technology',
        'shortCode': 'ssit',
        'primaryColor': '#0A2540',
        'secondaryColor': '#FFC107',
        'logoUrl': 'https://example.com/logo.png',
        'subscriptionTier': 'ENTERPRISE',
      };
      final theme = InstitutionTheme.fromJson(json);
      expect(theme.name, equals('Sri Sudha Institute of Technology'));
      expect(theme.shortCode, equals('ssit'));
      expect(theme.primaryColor, equals(const Color(0xFF0A2540)));
      expect(theme.secondaryColor, equals(const Color(0xFFFFC107)));
      expect(theme.subscriptionTier, equals('ENTERPRISE'));
    });

    test('fromJson safely handles missing or null keys without TypeError', () {
      final theme = InstitutionTheme.fromJson({});
      expect(theme.name, equals('EduFlow'));
      expect(theme.shortCode, equals('eduflow'));
      expect(theme.primaryColor, equals(const Color(0xFF2563EB)));
      expect(theme.secondaryColor, equals(const Color(0xFF10B981)));
      expect(theme.subscriptionTier, equals('FREE'));
    });

    test('white-box: color conversion handles 3-digit, 6-digit, 8-digit, and invalid hexes', () {
      // 3-digit hex (#FFF -> #FFFFFF)
      final t1 = InstitutionTheme.fromJson({'primaryColor': '#FFF'});
      expect(t1.primaryColor, equals(const Color(0xFFFFFFFF)));

      // 6-digit hex without #
      final t2 = InstitutionTheme.fromJson({'primaryColor': '10B981'});
      expect(t2.primaryColor, equals(const Color(0xFF10B981)));

      // Invalid hex string uses fallback without throwing FormatException
      final t3 = InstitutionTheme.fromJson({'primaryColor': 'invalid-hex-code'});
      expect(t3.primaryColor, equals(const Color(0xFF2563EB)));

      // Null or non-string uses fallback
      final t4 = InstitutionTheme.fromJson({'primaryColor': null});
      expect(t4.primaryColor, equals(const Color(0xFF2563EB)));
    });

    test('ThemeManager updates theme and notifies listeners', () {
      final manager = ThemeManager();
      bool notified = false;
      manager.addListener(() => notified = true);

      final custom = InstitutionTheme(
        name: 'Custom University',
        shortCode: 'cu',
        primaryColor: const Color(0xFF990000),
        secondaryColor: const Color(0xFF009900),
        logoUrl: '',
        subscriptionTier: 'PRO',
      );

      manager.updateTheme(custom);
      expect(notified, isTrue);
      expect(manager.currentTheme.name, equals('Custom University'));
      expect(manager.themeData.primaryColor, equals(const Color(0xFF990000)));

      // Reset to default
      notified = false;
      manager.resetToDefault();
      expect(notified, isTrue);
      expect(manager.currentTheme.name, equals('EduFlow AI OS'));
    });
  });
}
