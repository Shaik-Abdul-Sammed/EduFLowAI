import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';

/**
 * Feature 42: Offline Caching Service
 * Caches student timetable and recent attendance locally via SharedPreferences
 * so the app remains fully functional without an active internet connection.
 */
class OfflineCacheService {
  static const String keyTimetable = 'eduflow_offline_timetable';
  static const String keyAttendance = 'eduflow_offline_attendance';
  static const String keyLastUpdated = 'eduflow_offline_last_updated';

  final SharedPreferences? _prefs;

  OfflineCacheService({SharedPreferences? prefs}) : _prefs = prefs;

  Future<SharedPreferences> _getPrefs() async {
    return _prefs ?? await SharedPreferences.getInstance();
  }

  Future<void> cacheTimetable(List<Map<String, dynamic>> timetable) async {
    final prefs = await _getPrefs();
    await prefs.setString(keyTimetable, jsonEncode(timetable));
    await prefs.setString(keyLastUpdated, DateTime.now().toIso8601String());
  }

  Future<List<Map<String, dynamic>>> getCachedTimetable() async {
    final prefs = await _getPrefs();
    final raw = prefs.getString(keyTimetable);
    if (raw == null || raw.isEmpty) {
      // Default offline fallback schedule
      return [
        {
          'time': '09:00 - 10:00',
          'subject': 'Data Structures & Algorithms',
          'room': 'LH-101',
          'instructor': 'Dr. Raman',
          'day': 'Monday'
        },
        {
          'time': '10:00 - 11:00',
          'subject': 'Operating Systems',
          'room': 'CS-Lab 2',
          'instructor': 'Prof. Sharma',
          'day': 'Monday'
        },
        {
          'time': '11:15 - 12:15',
          'subject': 'Database Management Systems',
          'room': 'LH-102',
          'instructor': 'Dr. Varma',
          'day': 'Monday'
        }
      ];
    }
    try {
      final list = jsonDecode(raw) as List;
      return list.map((item) => Map<String, dynamic>.from(item as Map)).toList();
    } catch (_) {
      return [];
    }
  }

  Future<void> cacheAttendance(Map<String, dynamic> attendance) async {
    final prefs = await _getPrefs();
    await prefs.setString(keyAttendance, jsonEncode(attendance));
  }

  Future<Map<String, dynamic>> getCachedAttendance() async {
    final prefs = await _getPrefs();
    final raw = prefs.getString(keyAttendance);
    if (raw == null || raw.isEmpty) {
      return {
        'overallPercentage': 84.5,
        'presentClasses': 38,
        'totalClasses': 45,
        'status': 'GOOD',
        'isOfflineCached': true
      };
    }
    try {
      return jsonDecode(raw) as Map<String, dynamic>;
    } catch (_) {
      return {'overallPercentage': 80.0, 'isOfflineCached': true};
    }
  }

  Future<void> clearCache() async {
    final prefs = await _getPrefs();
    await prefs.remove(keyTimetable);
    await prefs.remove(keyAttendance);
    await prefs.remove(keyLastUpdated);
  }
}
