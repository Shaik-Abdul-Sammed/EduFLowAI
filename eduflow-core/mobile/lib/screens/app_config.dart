class AppConfig {
  static const String supportNumber = '9010150809';
  static const String salesNumber = '9010150809';
  static const String subscriptionNumber = '9010150809';
  static const String whatsappNumber = '9010150809';

  static const String apiBaseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'https://eduflow-backend-jvn8.onrender.com/api/v1',
  );

  static const String oneSignalAppId = String.fromEnvironment(
    'ONESIGNAL_APP_ID',
    defaultValue: 'eduflow-onesignal-app-id-demo',
  );

  static const String sentryDsn = String.fromEnvironment(
    'SENTRY_DSN',
    defaultValue: 'https://mock-sentry-key@o0.ingest.sentry.io/0',
  );

  static String getWhatsAppLink(String message) {
    return 'https://wa.me/919010150809?text=${Uri.encodeComponent(message)}';
  }

  static String getSubscriptionMessage(String plan, String institution) {
    return 'Hello,\n\nI would like to subscribe to EduFlow AI OS.\n\nPlan: $plan\nInstitution: $institution\n\nPlease assist me.';
  }
}
