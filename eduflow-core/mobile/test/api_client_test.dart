import 'dart:convert';
import 'package:flutter_test/flutter_test.dart';
import 'package:eduflow_app/core/api_client.dart';
import 'package:eduflow_app/core/sse_client.dart';

void main() {
  group('ApiClient Tests', () {
    test('baseUrl constant defaults to live backend URL', () {
      expect(
        ApiClient.baseUrl,
        equals('https://eduflow-backend-jvn8.onrender.com/api/v1'),
      );
    });

    test('SSEClient can be instantiated', () {
      final client = SSEClient();
      expect(client, isNotNull);
    });

    test('mock SSE event is parsed correctly', () {
      const mockSSEChunk = 'data: {"type": "token", "text": "NAAC Criteria 3 SSR Analysis"}\n\n';
      final lines = mockSSEChunk.split('\n');

      Map<String, dynamic>? parsedEvent;
      for (final rawLine in lines) {
        final line = rawLine.trim();
        if (line.startsWith('data:')) {
          final jsonStr = line.substring(5).trim();
          if (jsonStr.isNotEmpty) {
            parsedEvent = jsonDecode(jsonStr) as Map<String, dynamic>;
          }
        }
      }

      expect(parsedEvent, isNotNull);
      expect(parsedEvent!['type'], equals('token'));
      expect(parsedEvent['text'], equals('NAAC Criteria 3 SSR Analysis'));
    });

    test('mock SSE done event with ROI is parsed correctly', () {
      const mockDoneChunk = 'data: {"type": "done", "roi": {"hoursSaved": 40, "costSaved": 25000}}\n\n';
      final lines = mockDoneChunk.split('\n');

      Map<String, dynamic>? parsedEvent;
      for (final rawLine in lines) {
        final line = rawLine.trim();
        if (line.startsWith('data:')) {
          final jsonStr = line.substring(5).trim();
          if (jsonStr.isNotEmpty) {
            parsedEvent = jsonDecode(jsonStr) as Map<String, dynamic>;
          }
        }
      }

      expect(parsedEvent, isNotNull);
      expect(parsedEvent!['type'], equals('done'));
      expect(parsedEvent['roi']['hoursSaved'], equals(40));
      expect(parsedEvent['roi']['costSaved'], equals(25000));
    });
  });
}
