import 'package:flutter_test/flutter_test.dart';
import 'package:eduflow_app/utils/validators.dart';

void main() {
  group('Validators Unit Tests', () {
    test('isValidEmail accepts admin@demo.edu', () {
      expect(isValidEmail('admin@demo.edu'), isTrue);
    });

    test('isValidEmail rejects admin@', () {
      expect(isValidEmail('admin@'), isFalse);
    });

    test('isValidEmail rejects @demo.edu', () {
      expect(isValidEmail('@demo.edu'), isFalse);
    });

    test('isValidEmail rejects admin', () {
      expect(isValidEmail('admin'), isFalse);
    });

    test('isValidIndianPhone accepts 9010150809', () {
      expect(isValidIndianPhone('9010150809'), isTrue);
    });

    test('isValidIndianPhone rejects 1234567890 (does not start with 6-9)', () {
      expect(isValidIndianPhone('1234567890'), isFalse);
    });

    test('isValidIndianPhone rejects 90101508 (too short)', () {
      expect(isValidIndianPhone('90101508'), isFalse);
    });

    test('passwordStrength returns Weak for "abc"', () {
      expect(passwordStrength('abc'), equals('Weak'));
    });

    test('passwordStrength returns Medium for "abcdefgh"', () {
      expect(passwordStrength('abcdefgh'), equals('Medium'));
    });

    test('passwordStrength returns Strong for "Abcd@1234"', () {
      expect(passwordStrength('Abcd@1234'), equals('Strong'));
    });

    test('isValidInstitutionName returns false for "AB" (too short)', () {
      expect(isValidInstitutionName('AB'), isFalse);
    });

    test('isValidInstitutionName returns true for "Sri Sudha Institute"', () {
      expect(isValidInstitutionName('Sri Sudha Institute'), isTrue);
    });
  });
}
