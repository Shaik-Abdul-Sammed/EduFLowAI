import 'dart:async';
import 'dart:convert';
import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'api_client.dart';

/// Reusable Server-Sent Events (SSE) Streaming Client for EduFlow Mobile.
/// Connects to /api/v1/officers/{officerType}/stream and emits parsed SSE events.
class SSEClient {
  final Dio _dio;
  final FlutterSecureStorage _storage;

  SSEClient({Dio? dio, FlutterSecureStorage? storage})
      : _dio = dio ?? ApiClient().dio,
        _storage = storage ?? const FlutterSecureStorage();

  /// Streams token-by-token officer responses.
  /// Emits maps containing event types: 'thinking', 'token', 'done', 'error'.
  Stream<Map<String, dynamic>> streamOfficer({
    required String officerType,
    required Map<String, dynamic> payload,
    CancelToken? cancelToken,
  }) async* {
    final token = await _storage.read(key: 'accessToken');
    final String cleanType = officerType.trim().toLowerCase();
    final String path = '/officers/$cleanType/stream';

    try {
      final response = await _dio.post<ResponseBody>(
        path,
        data: payload,
        cancelToken: cancelToken,
        options: Options(
          responseType: ResponseType.stream,
          headers: {
            'Accept': 'text/event-stream',
            'Content-Type': 'application/json',
            if (token != null) 'Authorization': 'Bearer $token',
          },
        ),
      );

      final responseBody = response.data;
      if (responseBody == null) {
        yield {
          'type': 'error',
          'message': 'No response stream received from officer service',
        };
        return;
      }

      String lineBuffer = '';

      await for (final List<int> chunk in responseBody.stream) {
        final decodedChunk = utf8.decode(chunk, allowMalformed: true);
        lineBuffer += decodedChunk;

        final lines = lineBuffer.split('\n');
        // Keep the last segment (potentially incomplete) in the buffer
        lineBuffer = lines.removeLast();

        for (final rawLine in lines) {
          final line = rawLine.trim();
          if (line.isEmpty) continue;

          if (line.startsWith('data:')) {
            final jsonStr = line.substring(5).trim();
            if (jsonStr.isEmpty) continue;

            try {
              final parsed = jsonDecode(jsonStr);
              if (parsed is Map<String, dynamic>) {
                yield parsed;
              }
            } catch (_) {
              // Ignore partial/non-json lines
            }
          }
        }
      }

      // Flush any remaining content in lineBuffer
      if (lineBuffer.trim().startsWith('data:')) {
        final jsonStr = lineBuffer.trim().substring(5).trim();
        try {
          final parsed = jsonDecode(jsonStr);
          if (parsed is Map<String, dynamic>) {
            yield parsed;
          }
        } catch (_) {}
      }
    } on DioException catch (dioErr) {
      if (CancelToken.isCancel(dioErr)) {
        yield {
          'type': 'done',
          'cancelled': true,
          'message': 'Stream cancelled by user',
        };
        return;
      }
      yield {
        'type': 'error',
        'message': dioErr.message ?? 'Network connection error during stream',
      };
    } catch (e) {
      yield {
        'type': 'error',
        'message': e.toString(),
      };
    }
  }
}
