import 'dart:convert';
import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'demo_mode.dart';

class ApiClient {
  static final ApiClient _instance = ApiClient._internal();
  late Dio dio;
  final storage = const FlutterSecureStorage();

  static const String baseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'https://eduflow-backend-jvn8.onrender.com/api/v1',
  );

  factory ApiClient() {
    return _instance;
  }

  ApiClient._internal() {
    dio = Dio(BaseOptions(
      baseUrl: baseUrl,
      connectTimeout: const Duration(seconds: 45),
      receiveTimeout: const Duration(seconds: 60),
      sendTimeout: const Duration(seconds: 45),
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      validateStatus: (status) => status != null && status < 500,
    ));

    if (DemoMode.isEnabled) {
      dio.interceptors.add(_MockInterceptor());
    }

    dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          final token = await storage.read(key: 'accessToken');
          if (token != null) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          // ignore: avoid_print
          print('API REQUEST: ${options.method} ${options.uri}');
          return handler.next(options);
        },
        onResponse: (response, handler) {
          // ignore: avoid_print
          print('API RESPONSE: ${response.statusCode} ${response.requestOptions.uri}');
          return handler.next(response);
        },
        onError: (DioException e, handler) async {
          // ignore: avoid_print
          print('API ERROR: ${e.type} - ${e.message} - ${e.requestOptions.uri}');
          return handler.next(e);
        },
      ),
    );
  }
}

class _MockInterceptor extends Interceptor {
  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) {
    final path = options.path;

    if (path.contains('/auth/login')) {
      return handler.resolve(
        Response(
          requestOptions: options,
          statusCode: 200,
          data: {
            'accessToken': 'demo-mode-access-token-jwt',
            'refreshToken': 'demo-mode-refresh-token-jwt',
            'user': {
              'id': 'demo-user-123',
              'role': 'admin',
              'email': 'admin@demo.edu',
              'firstName': 'Dr. K. V.',
              'lastName': 'Ramanathan',
            },
            'institution': {
              'id': 'demo-inst-123',
              'name': 'Sri Sudha Institute of Technology',
              'subscriptionTier': 'enterprise',
              'primaryColor': '#0A2540',
              'secondaryColor': '#FFC107',
            },
          },
        ),
      );
    }

    if (path.contains('/institutions/register')) {
      return handler.resolve(
        Response(
          requestOptions: options,
          statusCode: 201,
          data: {
            'accessToken': 'demo-mode-registered-access-token',
            'refreshToken': 'demo-mode-registered-refresh-token',
            'user': {
              'id': 'demo-new-user',
              'role': 'admin',
              'username': 'admin@demo.edu',
              'name': 'Demo Admin',
            },
            'institution': {
              'id': 'demo-new-inst',
              'name': 'Demo Institution',
              'subdomain': 'demoinst',
            },
          },
        ),
      );
    }

    if (path.contains('/stream')) {
      const sseData =
          'data: {"type": "thinking", "text": "Analyzing institutional criteria..."}\n\n'
          'data: {"type": "token", "text": "EduFlow AI OS comprehensive officer synthesis."}\n\n'
          'data: {"type": "done", "roi": {"hoursSaved": 40, "costSaved": 25000}}\n\n';
      final stream = Stream.value(utf8.encode(sseData));
      final responseBody = ResponseBody(stream, 200, headers: {
        Headers.contentTypeHeader: ['text/event-stream'],
      });
      return handler.resolve(
        Response(
          requestOptions: options,
          data: responseBody,
          statusCode: 200,
        ),
      );
    }

    return handler.next(options);
  }
}
