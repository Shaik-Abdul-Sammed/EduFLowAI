class DemoMode {
  static bool _runtimeEnabled = false;
  static const bool _envEnabled = bool.fromEnvironment('DEMO_MODE', defaultValue: false);

  static bool get isEnabled => _envEnabled || _runtimeEnabled;
  static set isEnabled(bool value) => _runtimeEnabled = value;

  static void reset() {
    _runtimeEnabled = false;
  }
}
