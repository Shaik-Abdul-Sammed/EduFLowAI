import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../../core/theme_manager.dart';
import '../../../core/api_client.dart';
import '../../../screens/forgot_password_screen.dart';
import '../../dashboard/screens/dashboard_screen.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _rollNumberController = TextEditingController();
  final _dobController = TextEditingController();

  int _selectedTabIndex = 0; // 0 = Staff / Faculty, 1 = Student
  bool _obscurePassword = true;
  bool _rememberMe = false;
  bool _isLoading = false;
  String _errorMessage = '';

  @override
  void initState() {
    super.initState();
    _loadRememberedEmail();
  }

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    _rollNumberController.dispose();
    _dobController.dispose();
    super.dispose();
  }

  Future<void> _loadRememberedEmail() async {
    final prefs = await SharedPreferences.getInstance();
    final remember = prefs.getBool('remember_me') ?? false;
    if (remember) {
      final email = prefs.getString('remembered_email');
      if (email != null && mounted) {
        _emailController.text = email;
        setState(() => _rememberMe = true);
      }
    }
  }

  Future<void> _saveEmailIfRemembered() async {
    final prefs = await SharedPreferences.getInstance();
    if (_rememberMe) {
      await prefs.setString('remembered_email', _emailController.text.trim());
      await prefs.setBool('remember_me', true);
    } else {
      await prefs.remove('remembered_email');
      await prefs.setBool('remember_me', false);
    }
  }

  Future<void> _login() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() {
      _isLoading = true;
      _errorMessage = '';
    });

    try {
      final dio = ApiClient().dio;
      final response = await dio.post('/auth/login', data: {
        'email': _emailController.text.trim(),
        'password': _passwordController.text,
      });

      if (response.statusCode == 200) {
        final data = response.data;
        
        // Save Tokens
        const storage = FlutterSecureStorage();
        await storage.write(key: 'accessToken', value: data['accessToken']);
        await storage.write(key: 'refreshToken', value: data['refreshToken']);

        // Persist Remember Me preference
        await _saveEmailIfRemembered();

        // Parse Institution Branding if available
        if (data['institution'] != null && data['institution'] is Map<String, dynamic>) {
          final theme = InstitutionTheme.fromJson(data['institution'] as Map<String, dynamic>);
          if (mounted) {
            Provider.of<ThemeManager>(context, listen: false).updateTheme(theme);
          }
        }

        if (mounted) {
          setState(() => _isLoading = false);
          Navigator.of(context).pushReplacementNamed('/dashboard');
        }
      } else {
        setState(() {
          _errorMessage = response.data?['error'] ?? 'Login failed. Please check your credentials.';
        });
      }
    } on DioException catch (e) {
      String message = 'Something went wrong. Please try again.';
      if (e.type == DioExceptionType.connectionTimeout ||
          e.type == DioExceptionType.receiveTimeout ||
          e.type == DioExceptionType.sendTimeout) {
        message = 'Server is waking up. Please wait 30 seconds and try again.';
      } else if (e.type == DioExceptionType.connectionError) {
        message = 'Cannot reach server. Check your internet connection.';
      } else if (e.response?.statusCode == 401) {
        message = 'Wrong password. Please try again.';
      } else if (e.response?.statusCode == 404) {
        message = 'Email not found. Please check your email or sign up.';
      } else if (e.response?.statusCode == 429) {
        message = 'Too many login attempts. Please wait 15 minutes.';
      } else if (e.response?.data is Map && e.response!.data['error'] != null) {
        message = e.response!.data['error'];
      }
      setState(() => _errorMessage = message);
    } catch (_) {
      setState(() {
        _errorMessage = 'An unexpected error occurred.';
      });
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  Future<void> _studentLogin() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() {
      _isLoading = true;
      _errorMessage = '';
    });

    try {
      final dio = ApiClient().dio;
      final response = await dio.post('/auth/student-login', data: {
        'rollNumber': _rollNumberController.text.trim(),
        'dob': _dobController.text.trim(),
      });

      if (response.statusCode == 200) {
        final data = response.data;
        const storage = FlutterSecureStorage();
        await storage.write(key: 'accessToken', value: data['token'] ?? data['accessToken']);
        await storage.write(key: 'rollNumber', value: _rollNumberController.text.trim());
        await storage.write(key: 'role', value: 'student');

        if (mounted) {
          setState(() => _isLoading = false);
          Navigator.of(context).pushReplacementNamed('/dashboard');
        }
      } else {
        setState(() {
          _errorMessage = response.data?['error'] ?? 'Student authentication failed';
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        String msg = 'Invalid Roll Number or Date of Birth';
        if (e is DioException && e.response?.data != null && e.response?.data['error'] != null) {
          msg = e.response?.data['error'].toString() ?? msg;
        }
        setState(() {
          _errorMessage = msg;
          _isLoading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    const primaryBlue = Color(0xFF0A2540);

    return Scaffold(
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          color: primaryBlue,
          onPressed: () {
            if (Navigator.of(context).canPop()) {
              Navigator.of(context).pop();
            } else {
              Navigator.of(context).pushReplacementNamed('/welcome');
            }
          },
        ),
      ),
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24.0),
          child: Form(
            key: _formKey,
            child: AutofillGroup(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  const Icon(
                    Icons.school,
                    size: 80,
                    color: primaryBlue,
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'EduFlow AI OS',
                    textAlign: TextAlign.center,
                    style: theme.textTheme.headlineMedium?.copyWith(
                      fontWeight: FontWeight.bold,
                      color: primaryBlue,
                    ),
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    'AI Administrative Workforce',
                    textAlign: TextAlign.center,
                    style: TextStyle(color: Colors.grey),
                  ),
                  const SizedBox(height: 32),

                  if (_errorMessage.isNotEmpty)
                    Container(
                      padding: const EdgeInsets.all(12),
                      margin: const EdgeInsets.only(bottom: 16),
                      decoration: BoxDecoration(
                        color: Colors.red.shade50,
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: Colors.red.shade200),
                      ),
                      child: Row(
                        children: [
                          Icon(Icons.error_outline, color: Colors.red.shade700, size: 20),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              _errorMessage,
                              style: TextStyle(color: Colors.red.shade700, fontSize: 13),
                            ),
                          ),
                        ],
                      ),
                    ),

                  // Role Selector Tabs (Staff / Student)
                  Container(
                    margin: const EdgeInsets.only(bottom: 20),
                    decoration: BoxDecoration(
                      color: Colors.grey.shade100,
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: Colors.grey.shade300),
                    ),
                    child: Row(
                      children: [
                        Expanded(
                          child: InkWell(
                            key: const Key('staffTabButton'),
                            onTap: () => setState(() {
                              _selectedTabIndex = 0;
                              _errorMessage = '';
                            }),
                            borderRadius: const BorderRadius.horizontal(left: Radius.circular(9)),
                            child: Container(
                              padding: const EdgeInsets.symmetric(vertical: 10),
                              decoration: BoxDecoration(
                                color: _selectedTabIndex == 0 ? primaryBlue : Colors.transparent,
                                borderRadius: const BorderRadius.horizontal(left: Radius.circular(9)),
                              ),
                              child: Text(
                                'Staff / Faculty',
                                textAlign: TextAlign.center,
                                style: TextStyle(
                                  fontWeight: FontWeight.bold,
                                  fontSize: 13,
                                  color: _selectedTabIndex == 0 ? Colors.white : Colors.grey.shade700,
                                ),
                              ),
                            ),
                          ),
                        ),
                        Expanded(
                          child: InkWell(
                            key: const Key('studentTabButton'),
                            onTap: () => setState(() {
                              _selectedTabIndex = 1;
                              _errorMessage = '';
                            }),
                            borderRadius: const BorderRadius.horizontal(right: Radius.circular(9)),
                            child: Container(
                              padding: const EdgeInsets.symmetric(vertical: 10),
                              decoration: BoxDecoration(
                                color: _selectedTabIndex == 1 ? primaryBlue : Colors.transparent,
                                borderRadius: const BorderRadius.horizontal(right: Radius.circular(9)),
                              ),
                              child: Text(
                                'Student',
                                textAlign: TextAlign.center,
                                style: TextStyle(
                                  fontWeight: FontWeight.bold,
                                  fontSize: 13,
                                  color: _selectedTabIndex == 1 ? Colors.white : Colors.grey.shade700,
                                ),
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),

                  if (_selectedTabIndex == 0) ...[
                    // Email field
                    TextFormField(
                      controller: _emailController,
                      keyboardType: TextInputType.emailAddress,
                      autofillHints: const [AutofillHints.email],
                      decoration: const InputDecoration(
                        labelText: 'Email Address',
                        border: OutlineInputBorder(),
                        prefixIcon: Icon(Icons.email),
                      ),
                      validator: (val) {
                        if (val == null || val.trim().isEmpty) {
                          return 'Please enter your email';
                        }
                        final emailRegex = RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$');
                        if (!emailRegex.hasMatch(val.trim())) {
                          return 'Please enter a valid email address';
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: 16),

                    // Password field
                    TextFormField(
                      controller: _passwordController,
                      obscureText: _obscurePassword,
                      autofillHints: const [AutofillHints.password],
                      decoration: InputDecoration(
                        labelText: 'Password',
                        border: const OutlineInputBorder(),
                        prefixIcon: const Icon(Icons.lock),
                        suffixIcon: IconButton(
                          icon: Icon(_obscurePassword ? Icons.visibility_off : Icons.visibility),
                          onPressed: () => setState(() => _obscurePassword = !_obscurePassword),
                        ),
                      ),
                      validator: (val) {
                        if (val == null || val.isEmpty) {
                          return 'Please enter your password';
                        }
                        if (val.length < 6) {
                          return 'Password must be at least 6 characters';
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: 10),

                    // Remember Me & Forgot Password row
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Checkbox(
                              value: _rememberMe,
                              activeColor: primaryBlue,
                              onChanged: (val) {
                                setState(() => _rememberMe = val ?? false);
                              },
                            ),
                            const Text('Remember Me', style: TextStyle(fontSize: 14)),
                          ],
                        ),
                        TextButton(
                          onPressed: () {
                            Navigator.of(context).push(
                              MaterialPageRoute(builder: (_) => const ForgotPasswordScreen()),
                            );
                          },
                          child: const Text(
                            'Forgot Password?',
                            style: TextStyle(color: primaryBlue, fontSize: 13),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),

                    // Log In button
                    SizedBox(
                      height: 52,
                      child: ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: primaryBlue,
                          foregroundColor: Colors.white,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(10),
                          ),
                        ),
                        onPressed: _isLoading ? null : _login,
                        child: _isLoading
                            ? const Row(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  SizedBox(
                                    width: 20,
                                    height: 20,
                                    child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                                  ),
                                  SizedBox(width: 12),
                                  Text(
                                    'Connecting to server...',
                                    style: TextStyle(fontSize: 15, color: Colors.white),
                                  ),
                                ],
                              )
                            : const Text(
                                'Log In',
                                style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                              ),
                      ),
                    ),
                  ] else ...[
                    // Student Roll Number field
                    TextFormField(
                      key: const Key('rollNumberField'),
                      controller: _rollNumberController,
                      decoration: const InputDecoration(
                        labelText: 'Roll Number',
                        hintText: 'e.g. 2024-CSE-042',
                        border: OutlineInputBorder(),
                        prefixIcon: Icon(Icons.badge),
                      ),
                      validator: (val) {
                        if (val == null || val.trim().isEmpty) {
                          return 'Please enter your Roll Number';
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: 16),

                    // Student Date of Birth field
                    TextFormField(
                      key: const Key('dobField'),
                      controller: _dobController,
                      keyboardType: TextInputType.number,
                      maxLength: 8,
                      inputFormatters: [
                        FilteringTextInputFormatter.digitsOnly,
                        LengthLimitingTextInputFormatter(8),
                      ],
                      decoration: const InputDecoration(
                        labelText: 'Date of Birth (DDMMYYYY)',
                        hintText: 'e.g. 15082004',
                        border: OutlineInputBorder(),
                        prefixIcon: Icon(Icons.cake),
                        counterText: '',
                      ),
                      validator: (val) {
                        if (val == null || val.trim().length != 8) {
                          return 'Date of Birth must be 8 digits (DDMMYYYY)';
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: 24),

                    // Student Log In button
                    SizedBox(
                      height: 52,
                      child: ElevatedButton(
                        key: const Key('studentLoginButton'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: primaryBlue,
                          foregroundColor: Colors.white,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(10),
                          ),
                        ),
                        onPressed: _isLoading ? null : _studentLogin,
                        child: _isLoading
                            ? const Row(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  SizedBox(
                                    width: 20,
                                    height: 20,
                                    child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                                  ),
                                  SizedBox(width: 12),
                                  Text(
                                    'Authenticating...',
                                    style: TextStyle(fontSize: 15, color: Colors.white),
                                  ),
                                ],
                              )
                            : const Text(
                                'Log In (Student)',
                                style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                              ),
                      ),
                    ),
                  ],
                  const SizedBox(height: 16),

                  // Quick Demo Persona Switcher (Sector 1 & 6)
                  Wrap(
                    spacing: 8,
                    runSpacing: 6,
                    alignment: WrapAlignment.center,
                    children: [
                      ActionChip(
                        avatar: const Text('⚙️', style: TextStyle(fontSize: 12)),
                        label: const Text('Admin Demo', style: TextStyle(fontSize: 11)),
                        onPressed: () {
                          _emailController.text = 'admin@demo.edu';
                          _passwordController.text = 'Demo@2026';
                        },
                      ),
                      ActionChip(
                        avatar: const Text('🏛️', style: TextStyle(fontSize: 12)),
                        label: const Text('Dean Demo', style: TextStyle(fontSize: 11)),
                        onPressed: () {
                          _emailController.text = 's9010150809@gmail.com';
                          _passwordController.text = 'Demo@2026';
                        },
                      ),
                      ActionChip(
                        avatar: const Text('👨‍🏫', style: TextStyle(fontSize: 12)),
                        label: const Text('Faculty Demo', style: TextStyle(fontSize: 11)),
                        onPressed: () {
                          _emailController.text = 'faculty@eduflow.edu';
                          _passwordController.text = 'Demo@2026';
                        },
                      ),
                      ActionChip(
                        avatar: const Text('👨‍🎓', style: TextStyle(fontSize: 12)),
                        label: const Text('Student Demo', style: TextStyle(fontSize: 11)),
                        onPressed: () {
                          _emailController.text = 'student@eduflow.edu';
                          _passwordController.text = 'Demo@2026';
                        },
                      ),
                    ],
                  ),

                  const SizedBox(height: 20),

                  // Create account navigation
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Text("Don't have an account? ", style: TextStyle(fontSize: 14)),
                      TextButton(
                        onPressed: () => Navigator.of(context).pushReplacementNamed('/signup'),
                        child: const Text(
                          'Create one',
                          style: TextStyle(color: primaryBlue, fontWeight: FontWeight.bold, fontSize: 14),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
