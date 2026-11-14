import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:dio/dio.dart';
import '../../../../core/api_client.dart';

enum PresenceLocation { classroom, dorm, outside, offline }

class PresenceStatusWidget extends StatefulWidget {
  final String? initialStatus;
  final bool isOfflineMock;

  const PresenceStatusWidget({
    super.key,
    this.initialStatus,
    this.isOfflineMock = false,
  });

  @override
  State<PresenceStatusWidget> createState() => _PresenceStatusWidgetState();
}

class _PresenceStatusWidgetState extends State<PresenceStatusWidget> {
  String _statusText = 'Checking presence...';
  Color _statusColor = Colors.grey;
  String _emoji = '⚪';
  bool _isOffline = false;

  @override
  void initState() {
    super.initState();
    if (widget.initialStatus != null) {
      _applyStatus(widget.initialStatus!);
    } else {
      _loadPresenceStatus();
    }
  }

  Future<void> _loadPresenceStatus() async {
    final prefs = await SharedPreferences.getInstance();
    final cachedStatus = prefs.getString('cached_presence_status') ?? 'Dorm';

    if (widget.isOfflineMock) {
      if (mounted) {
        setState(() {
          _isOffline = true;
          _statusText = 'Offline: Last seen in $cachedStatus';
          _statusColor = Colors.amber.shade700;
          _emoji = '🟡';
        });
      }
      return;
    }

    try {
      final dio = ApiClient().dio;
      final response = await dio.get('/network/student-presence');
      if (response.statusCode == 200 && response.data != null) {
        final location = response.data['location'] ?? 'Classroom';
        await prefs.setString('cached_presence_status', location);
        if (mounted) {
          _applyStatus(location);
        }
      } else {
        _fallbackToCache(prefs, cachedStatus);
      }
    } catch (_) {
      _fallbackToCache(prefs, cachedStatus);
    }
  }

  void _fallbackToCache(SharedPreferences prefs, String cachedStatus) {
    if (mounted) {
      setState(() {
        _isOffline = true;
        _statusText = 'Offline: Last seen in $cachedStatus';
        _statusColor = Colors.amber.shade700;
        _emoji = '🟡';
      });
    }
  }

  void _applyStatus(String location) {
    final loc = location.toLowerCase();
    if (loc.contains('classroom') || loc.contains('class')) {
      _statusText = '🟢 On Campus (Classroom)';
      _statusColor = Colors.green.shade700;
      _emoji = '🟢';
    } else if (loc.contains('dorm') || loc.contains('hostel')) {
      _statusText = '🟡 On Campus (Dorm)';
      _statusColor = Colors.amber.shade700;
      _emoji = '🟡';
    } else {
      _statusText = '⚪ Outside Campus';
      _statusColor = Colors.grey.shade600;
      _emoji = '⚪';
    }
    setState(() {});
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: _statusColor.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: _statusColor.withValues(alpha: 0.35)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(_emoji, style: const TextStyle(fontSize: 14)),
          const SizedBox(width: 8),
          Text(
            _statusText,
            style: TextStyle(
              color: _statusColor,
              fontWeight: FontWeight.bold,
              fontSize: 13,
            ),
          ),
        ],
      ),
    );
  }
}
