// Shared validation utilities for EduFlow AI OS.

bool isValidEmail(String? email) {
  if (email == null || email.trim().isEmpty) return false;
  final regex = RegExp(r'^[\w\.-]+@([\w-]+\.)+[a-zA-Z]{2,7}$');
  return regex.hasMatch(email.trim());
}

bool isValidIndianPhone(String? phone) {
  if (phone == null || phone.trim().isEmpty) return false;
  final digits = phone.trim().replaceAll(RegExp(r'\D'), '');
  final regex = RegExp(r'^[6-9]\d{9}$');
  return regex.hasMatch(digits);
}

String passwordStrength(String? password) {
  if (password == null || password.isEmpty) return 'Weak';
  if (password.length < 6) return 'Weak';

  final hasLetters = password.contains(RegExp(r'[a-zA-Z]'));
  final hasUpper = password.contains(RegExp(r'[A-Z]'));
  final hasLower = password.contains(RegExp(r'[a-z]'));
  final hasDigits = password.contains(RegExp(r'[0-9]'));
  final hasSpecial = password.contains(RegExp(r'[!@#$%^&*(),.?":{}|<>]'));

  if (password.length >= 8 && hasUpper && hasLower && hasDigits && hasSpecial) {
    return 'Strong';
  }

  if (password.length >= 6 && (hasLetters || hasDigits)) {
    return 'Medium';
  }

  return 'Weak';
}

bool isValidInstitutionName(String? name) {
  if (name == null) return false;
  return name.trim().length >= 3;
}
