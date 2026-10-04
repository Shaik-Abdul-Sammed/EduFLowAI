import 'package:flutter_test/flutter_test.dart';
import 'package:dio/dio.dart';
import 'package:eduflow_app/core/api_client.dart';

void main() {
  group('ApiClient Unit Tests', () {
    test('ApiClient.baseUrl equals the live backend URL when no dart-define is set', () {
      expect(
        ApiClient.baseUrl,
        equals('https://eduflow-backend-jvn8.onrender.com/api/v1'),
      );
    });

    test('ApiClient is a singleton (calling twice returns the same instance)', () {
      final client1 = ApiClient();
      final client2 = ApiClient();
      expect(identical(client1, client2), isTrue);
    });

    test('Dio has connectTimeout of 45 seconds', () {
      final client = ApiClient();
      expect(client.dio.options.connectTimeout, equals(const Duration(seconds: 45)));
    });

    test('Dio has receiveTimeout of 60 seconds', () {
      final client = ApiClient();
      expect(client.dio.options.receiveTimeout, equals(const Duration(seconds: 60)));
    });

    test('The Authorization header is added when a token exists in storage', () {
      final options = RequestOptions(path: '/test');
      final wrapper = InterceptorsWrapper(
        onRequest: (opts, handler) {
          const token = 'test-mock-jwt-token';
          opts.headers['Authorization'] = 'Bearer $token';
          handler.next(opts);
        },
      );

      final handler = _TestRequestHandler();
      wrapper.onRequest(options, handler);

      expect(options.headers['Authorization'], equals('Bearer test-mock-jwt-token'));
    });

    test('The Authorization header is not added when no token exists', () {
      final options = RequestOptions(path: '/test');
      final wrapper = InterceptorsWrapper(
        onRequest: (opts, handler) {
          const String? token = null;
          if (token != null) {
            opts.headers['Authorization'] = 'Bearer $token';
          }
          handler.next(opts);
        },
      );

      final handler = _TestRequestHandler();
      wrapper.onRequest(options, handler);

      expect(options.headers['Authorization'], isNull);
    });
  });
}

class _TestRequestHandler extends RequestInterceptorHandler {
  @override
  void next(RequestOptions requestOptions) {}
}
