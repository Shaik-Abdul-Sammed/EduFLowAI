class AppConfig {
  static const String supportNumber = '9010150809';
  static const String salesNumber = '9010150809';
  static const String subscriptionNumber = '9010150809';
  static const String whatsappNumber = '9010150809';

  static const String apiBaseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'https://eduflow-backend-jvn8.onrender.com/api/v1',
  );

  static String getWhatsAppLink(String message) {
    return 'https://wa.me/919010150809?text=${Uri.encodeComponent(message)}';
  }

  static String getSubscriptionMessage(String plan, String institution) {
    return 'Hello,\n\nI would like to subscribe to EduFlow AI OS.\n\nPlan: $plan\nInstitution: $institution\n\nPlease assist me.';
  }
}
