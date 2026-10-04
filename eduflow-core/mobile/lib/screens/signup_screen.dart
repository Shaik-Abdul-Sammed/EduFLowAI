import 'package:flutter/material.dart';
import 'package:dio/dio.dart';
import '../core/api_client.dart';
import '../utils/validators.dart';

class SignupScreen extends StatefulWidget {
  const SignupScreen({super.key});

  @override
  State<SignupScreen> createState() => _SignupScreenState();
}

class _SignupScreenState extends State<SignupScreen> {
  final _formKey = GlobalKey<FormState>();

  final _nameController = TextEditingController();
  final _institutionController = TextEditingController();
  final _emailController = TextEditingController(text: 's9010150809@gmail.com');
  final _phoneController = TextEditingController(text: '9010150809');
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();

  String _selectedRole = 'Administrator';
  final List<String> _roles = ['Administrator', 'Faculty', 'Student', 'Parent'];

  bool _obscurePassword = true;
  bool _obscureConfirmPassword = true;
  bool _termsAccepted = false;
  bool _isLoading = false;
  String _errorMessage = '';
  String _currentStrength = 'Weak';

  @override
  void initState() {
    super.initState();
    _passwordController.addListener(_updatePasswordStrength);
  }

  void _updatePasswordStrength() {
    final strength = passwordStrength(_passwordController.text);
    if (strength != _currentStrength) {
      setState(() => _currentStrength = strength);
    }
  }

  @override
  void dispose() {
    _passwordController.removeListener(_updatePasswordStrength);
    _nameController.dispose();
    _institutionController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }

  Color _getStrengthColor() {
    switch (_currentStrength) {
      case 'Strong':
        return Colors.green;
      case 'Medium':
        return Colors.orange;
      case 'Weak':
      default:
        return Colors.red;
    }
  }

  Future<void> _submitSignup() async {
    if (!_formKey.currentState!.validate()) return;
    if (!_termsAccepted) {
      setState(() => _errorMessage = 'Please accept the Terms of Service to proceed.');
      return;
    }

    setState(() {
      _isLoading = true;
      _errorMessage = '';
    });

    final institutionName = _institutionController.text.trim();
    final fullName = _nameController.text.trim();
    final email = _emailController.text.trim();
    final phone = _phoneController.text.trim();
    final password = _passwordController.text;

    // Generate safe subdomain slug
    String subdomain = institutionName
        .toLowerCase()
        .replaceAll(RegExp(r'[^a-z0-9]'), '');
    if (subdomain.isEmpty || subdomain.length < 3) {
      subdomain = 'inst${DateTime.now().millisecondsSinceEpoch % 100000}';
    }

    final roleMapping = {
      'Administrator': 'admin',
      'Faculty': 'faculty',
      'Student': 'student',
      'Parent': 'parent',
    };

    final payload = {
      'institutionName': institutionName,
      'name': institutionName,
      'subdomain': subdomain,
      'adminName': fullName,
      'email': email,
      'adminEmail': email,
      'phone': phone,
      'password': password,
      'role': roleMapping[_selectedRole] ?? 'admin',
    };

    try {
      final dio = ApiClient().dio;
      final response = await dio.post(
        '/institutions/register',
        data: payload,
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        if (!mounted) return;
        setState(() => _isLoading = false);
        
        await showDialog(
          context: context,
          barrierDismissible: false,
          builder: (ctx) => AlertDialog(
            title: const Row(
              children: [
                Icon(Icons.check_circle, color: Colors.green),
                SizedBox(width: 8),
                Text('Account Created!'),
              ],
            ),
            content: const Text('Account created! Please log in with your credentials.'),
            actions: [
              TextButton(
                onPressed: () {
                  Navigator.of(ctx).pop();
                  Navigator.of(context).pushReplacementNamed('/login');
                },
                child: const Text('OK', style: TextStyle(fontWeight: FontWeight.bold)),
              ),
            ],
          ),
        );
      } else {
        setState(() {
          _errorMessage = response.data?['error'] ?? 'Registration failed. Please try again.';
        });
      }
    } on DioException catch (e) {
      String message = 'Registration failed. Please try again.';
      if (e.type == DioExceptionType.connectionTimeout || e.type == DioExceptionType.receiveTimeout) {
        message = 'Registration is taking longer than usual. The server may be waking up. Please try again in 30 seconds.';
      } else if (e.type == DioExceptionType.connectionError) {
        message = 'Cannot reach server. Check your internet connection.';
      } else if (e.response?.statusCode == 409) {
        message = 'This institution or email is already registered. Try logging in instead.';
      } else if (e.response?.statusCode == 400) {
        final details = e.response?.data?['details'];
        if (details is List && details.isNotEmpty) {
          message = details.first.toString();
        } else {
          message = e.response?.data?['error'] ?? message;
        }
      } else if (e.response?.data is Map && e.response!.data['error'] != null) {
        message = e.response!.data['error'];
      }
      setState(() => _errorMessage = message);
    } catch (_) {
      setState(() {
        _errorMessage = 'An unexpected error occurred. Please try again.';
      });
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    const primaryBlue = Color(0xFF0A2540);

    return Scaffold(
      appBar: AppBar(
        leading: TextButton.icon(
          onPressed: () => Navigator.of(context).pop(),
          icon: const Icon(Icons.arrow_back, size: 18),
          label: const Text('Back'),
        ),
        leadingWidth: 90,
        backgroundColor: Colors.transparent,
        elevation: 0,
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          physics: const BouncingScrollPhysics(),
          padding: const EdgeInsets.fromLTRB(24, 8, 24, 40),
          child: Form(
            key: _formKey,
            autovalidateMode: AutovalidateMode.onUserInteraction,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // Top "Back to Welcome" text link
                Align(
                  alignment: Alignment.centerLeft,
                  child: InkWell(
                    onTap: () => Navigator.of(context).pushReplacementNamed('/welcome'),
                    child: const Padding(
                      padding: EdgeInsets.symmetric(vertical: 4),
                      child: Text(
                        '← Back to Welcome',
                        style: TextStyle(
                          color: primaryBlue,
                          fontWeight: FontWeight.w600,
                          fontSize: 14,
                        ),
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 16),

                Text(
                  'Create an Account',
                  style: theme.textTheme.headlineSmall?.copyWith(
                    fontWeight: FontWeight.bold,
                    color: isDark ? Colors.white : primaryBlue,
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  'Deploy 5 AI Officers for your institution today',
                  style: theme.textTheme.bodyMedium?.copyWith(
                    color: isDark ? Colors.grey.shade400 : Colors.grey.shade600,
                  ),
                ),
                const SizedBox(height: 24),

                // Full Name
                TextFormField(
                  controller: _nameController,
                  decoration: const InputDecoration(
                    labelText: 'Full Name',
                    prefixIcon: Icon(Icons.person_outline),
                    border: OutlineInputBorder(borderRadius: BorderRadius.all(Radius.circular(12))),
                  ),
                  validator: (v) => (v == null || v.trim().isEmpty) ? 'Please enter your full name' : null,
                ),
                const SizedBox(height: 16),

                // Institution Name
                TextFormField(
                  controller: _institutionController,
                  decoration: const InputDecoration(
                    labelText: 'Institution Name',
                    prefixIcon: Icon(Icons.account_balance_outlined),
                    border: OutlineInputBorder(borderRadius: BorderRadius.all(Radius.circular(12))),
                  ),
                  validator: (v) {
                    if (v == null || v.trim().isEmpty) {
                      return 'Please enter your institution name';
                    }
                    if (!isValidInstitutionName(v)) {
                      return 'Institution name must be at least 3 characters.';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 16),

                // Email Address
                TextFormField(
                  controller: _emailController,
                  keyboardType: TextInputType.emailAddress,
                  decoration: const InputDecoration(
                    labelText: 'Email Address',
                    prefixIcon: Icon(Icons.email_outlined),
                    border: OutlineInputBorder(borderRadius: BorderRadius.all(Radius.circular(12))),
                  ),
                  validator: (v) {
                    if (v == null || v.trim().isEmpty) return 'Please enter your email';
                    if (!isValidEmail(v)) return 'Please enter a valid email address';
                    return null;
                  },
                ),
                const Padding(
                  padding: EdgeInsets.only(top: 4, left: 4),
                  child: Text(
                    'This is a demo default. Replace with your real email.',
                    style: TextStyle(fontSize: 12, color: Colors.grey),
                  ),
                ),
                const SizedBox(height: 16),

                // Phone Number (10 digit Indian mobile)
                TextFormField(
                  controller: _phoneController,
                  keyboardType: TextInputType.phone,
                  decoration: const InputDecoration(
                    labelText: 'Phone Number (10 digits)',
                    prefixIcon: Icon(Icons.phone_android),
                    prefixText: '+91 ',
                    border: OutlineInputBorder(borderRadius: BorderRadius.all(Radius.circular(12))),
                  ),
                  validator: (v) {
                    if (v == null || v.trim().isEmpty) return 'Please enter your 10-digit mobile number';
                    if (!isValidIndianPhone(v)) {
                      return 'Enter a valid 10-digit Indian phone number';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 16),

                // Role dropdown
                DropdownButtonFormField<String>(
                  initialValue: _selectedRole,
                  decoration: const InputDecoration(
                    labelText: 'Role',
                    prefixIcon: Icon(Icons.badge_outlined),
                    border: OutlineInputBorder(borderRadius: BorderRadius.all(Radius.circular(12))),
                  ),
                  items: _roles.map((r) => DropdownMenuItem(value: r, child: Text(r))).toList(),
                  onChanged: (val) {
                    if (val != null) setState(() => _selectedRole = val);
                  },
                ),
                const SizedBox(height: 16),

                // Password
                TextFormField(
                  controller: _passwordController,
                  obscureText: _obscurePassword,
                  decoration: InputDecoration(
                    labelText: 'Password (min. 8 characters)',
                    prefixIcon: const Icon(Icons.lock_outline),
                    border: const OutlineInputBorder(borderRadius: BorderRadius.all(Radius.circular(12))),
                    suffixIcon: IconButton(
                      icon: Icon(_obscurePassword ? Icons.visibility_off : Icons.visibility),
                      onPressed: () => setState(() => _obscurePassword = !_obscurePassword),
                    ),
                  ),
                  validator: (v) {
                    if (v == null || v.length < 8) return 'Password must be at least 8 characters';
                    return null;
                  },
                ),
                const SizedBox(height: 6),

                // Password strength meter
                Row(
                  children: [
                    const Text('Strength: ', style: TextStyle(fontSize: 12, color: Colors.grey)),
                    Text(
                      _currentStrength,
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                        color: _getStrengthColor(),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(4),
                        child: LinearProgressIndicator(
                          value: _currentStrength == 'Strong'
                              ? 1.0
                              : (_currentStrength == 'Medium' ? 0.6 : 0.3),
                          color: _getStrengthColor(),
                          backgroundColor: Colors.grey.shade200,
                          minHeight: 5,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),

                // Confirm Password
                TextFormField(
                  controller: _confirmPasswordController,
                  obscureText: _obscureConfirmPassword,
                  decoration: InputDecoration(
                    labelText: 'Confirm Password',
                    prefixIcon: const Icon(Icons.lock_reset),
                    border: const OutlineInputBorder(borderRadius: BorderRadius.all(Radius.circular(12))),
                    suffixIcon: IconButton(
                      icon: Icon(_obscureConfirmPassword ? Icons.visibility_off : Icons.visibility),
                      onPressed: () => setState(() => _obscureConfirmPassword = !_obscureConfirmPassword),
                    ),
                  ),
                  validator: (v) {
                    if (v == null || v.isEmpty) return 'Please confirm your password';
                    if (v != _passwordController.text) return 'Passwords do not match';
                    return null;
                  },
                ),
                const SizedBox(height: 16),

                // Terms of Service checkbox
                Row(
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    Checkbox(
                      value: _termsAccepted,
                      activeColor: primaryBlue,
                      onChanged: (val) {
                        setState(() => _termsAccepted = val ?? false);
                      },
                    ),
                    const Expanded(
                      child: Text(
                        'I accept the Terms of Service & Privacy Policy',
                        style: TextStyle(fontSize: 13),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),

                // Submit Button
                SizedBox(
                  height: 52,
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: primaryBlue,
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                      elevation: 2,
                    ),
                    onPressed: (!_termsAccepted || _isLoading) ? null : _submitSignup,
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
                                'Creating your account...',
                                style: TextStyle(fontSize: 15, color: Colors.white),
                              ),
                            ],
                          )
                        : const Text(
                            'Create Account',
                            style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                          ),
                  ),
                ),

                // Error Message below button
                if (_errorMessage.isNotEmpty) ...[
                  const SizedBox(height: 16),
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: Colors.red.shade50,
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: Colors.red.shade200),
                    ),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Icon(Icons.error_outline, color: Colors.red.shade700, size: 20),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            _errorMessage,
                            style: TextStyle(color: Colors.red.shade800, fontSize: 13),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],

                const SizedBox(height: 20),
                Center(
                  child: TextButton(
                    onPressed: () => Navigator.of(context).pushReplacementNamed('/login'),
                    child: Text.rich(
                      TextSpan(
                        text: 'Already have an account? ',
                        style: TextStyle(color: isDark ? Colors.grey.shade400 : Colors.grey.shade700),
                        children: const [
                          TextSpan(
                            text: 'Log In',
                            style: TextStyle(color: primaryBlue, fontWeight: FontWeight.bold),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
