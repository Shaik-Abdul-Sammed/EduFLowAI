import 'dart:convert';
import 'package:dio/dio.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:eduflow_app/core/sse_client.dart';

void main() {
  group('SSEClient White-box / Unit Tests', () {
    test('parses thinking, token, and done SSE events correctly', () async {
      const ssePayload =
          'data: {"type": "thinking", "text": "Evaluating criteria..."}\n\n'
          'data: {"type": "token", "text": "Verified report segment."}\n\n'
          'data: {"type": "done", "roi": {"hoursSaved": 24, "costSaved": 12000}}\n\n';

      final adapter = HttpClientAdapter();
      final dio = Dio()..httpClientAdapter = adapter;

      // Mock Dio response with ResponseBody stream
      dio.interceptors.add(
        InterceptorsWrapper(
          onRequest: (options, handler) {
            final stream = Stream.value(utf8.encode(ssePayload));
            return handler.resolve(
              Response(
                requestOptions: options,
                data: ResponseBody(stream, 200, headers: {
                  Headers.contentTypeHeader: ['text/event-stream'],
                }),
                statusCode: 200,
              ),
            );
          },
        ),
      );

      final sseClient = SSEClient(dio: dio);
      final events = await sseClient.streamOfficer(
        officerType: 'accreditation',
        payload: {'reportType': 'test'},
      ).toList();

      expect(events.length, equals(3));
      expect(events[0]['type'], equals('thinking'));
      expect(events[0]['text'], equals('Evaluating criteria...'));

      expect(events[1]['type'], equals('token'));
      expect(events[1]['text'], equals('Verified report segment.'));

      expect(events[2]['type'], equals('done'));
      expect(events[2]['roi'], isA<Map>());
      expect(events[2]['roi']['hoursSaved'], equals(24));
    });

    test('gracefully ignores malformed or non-data lines without throwing TypeError', () async {
      const ssePayload =
          ': comment line\n'
          'event: ping\n'
          'data: not-a-json-string\n\n'
          'data: {"type": "token", "text": "Valid Token"}\n\n';

      final dio = Dio();
      dio.interceptors.add(
        InterceptorsWrapper(
          onRequest: (options, handler) {
            final stream = Stream.value(utf8.encode(ssePayload));
            return handler.resolve(
              Response(
                requestOptions: options,
                data: ResponseBody(stream, 200, headers: {
                  Headers.contentTypeHeader: ['text/event-stream'],
                }),
                statusCode: 200,
              ),
            );
          },
        ),
      );

      final sseClient = SSEClient(dio: dio);
      final events = await sseClient.streamOfficer(
        officerType: 'timetable',
        payload: {'reportType': 'test'},
      ).toList();

      expect(events.length, equals(1));
      expect(events[0]['type'], equals('token'));
      expect(events[0]['text'], equals('Valid Token'));
    });
  });
}
