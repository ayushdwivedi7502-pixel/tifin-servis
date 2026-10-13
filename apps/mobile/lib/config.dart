/// Use 10.0.2.2 for Android emulator → host machine localhost.
/// Use your PC LAN IP for physical devices (not localhost).
const String apiBaseUrl = String.fromEnvironment(
  'API_BASE_URL',
  defaultValue: 'http://10.0.2.2:5000',
);
