import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/theme_manager.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class DashboardScreen extends StatelessWidget {
  const DashboardScreen({super.key});

  Future<void> _logout(BuildContext context) async {
    const storage = FlutterSecureStorage();
    await storage.deleteAll();
    
    if (context.mounted) {
      Provider.of<ThemeManager>(context, listen: false).resetToDefault();
      Navigator.of(context).pushNamedAndRemoveUntil(
        '/welcome',
        (route) => false,
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final themeManager = Provider.of<ThemeManager>(context);
    final theme = themeManager.currentTheme;

    return Scaffold(
      appBar: AppBar(
        title: Text(theme.name),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () => _logout(context),
          ),
        ],
      ),
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                decoration: BoxDecoration(
                  color: theme.secondaryColor.withValues(alpha: 0.2),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: theme.secondaryColor),
                ),
                child: Text(
                  'Plan: ${theme.subscriptionTier}',
                  style: TextStyle(
                    color: theme.secondaryColor,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
              const SizedBox(height: 24),
              Icon(
                Icons.dashboard,
                size: 80,
                color: theme.primaryColor,
              ),
              const SizedBox(height: 12),
              Text(
                'Welcome to ${theme.name}',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 22,
                  fontWeight: FontWeight.bold,
                  color: theme.primaryColor,
                ),
              ),
              const Padding(
                padding: EdgeInsets.symmetric(vertical: 16.0),
                child: Text(
                  'AI-powered administrative workforce for higher education institutions.',
                  textAlign: TextAlign.center,
                  style: TextStyle(fontSize: 14, color: Colors.grey),
                ),
              ),
              const SizedBox(height: 16),
              Card(
                elevation: 2,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                child: ListTile(
                  leading: CircleAvatar(
                    backgroundColor: theme.primaryColor.withValues(alpha: 0.15),
                    child: Icon(Icons.psychology, color: theme.primaryColor),
                  ),
                  title: const Text('AI Officers Streaming Console', style: TextStyle(fontWeight: FontWeight.bold)),
                  subtitle: const Text('5 Specialized Officers • Real-time SSE token stream'),
                  trailing: const Icon(Icons.arrow_forward_ios, size: 16),
                  onTap: () => Navigator.pushNamed(context, '/officers'),
                ),
              ),
              const SizedBox(height: 12),
              Card(
                elevation: 2,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                child: ListTile(
                  leading: CircleAvatar(
                    backgroundColor: Colors.indigo.withValues(alpha: 0.15),
                    child: const Icon(Icons.description, color: Colors.indigo),
                  ),
                  title: const Text('Letter of Recommendation (LOR)', style: TextStyle(fontWeight: FontWeight.bold)),
                  subtitle: const Text('AI LOR drafting with live typewriter streaming'),
                  trailing: const Icon(Icons.arrow_forward_ios, size: 16),
                  onTap: () => Navigator.pushNamed(context, '/lor'),
                ),
              ),
              const SizedBox(height: 12),
              Card(
                elevation: 2,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                child: ListTile(
                  leading: CircleAvatar(
                    backgroundColor: Colors.purple.withValues(alpha: 0.15),
                    child: const Icon(Icons.psychology, color: Colors.purple),
                  ),
                  title: const Text('Multi-Officer AI Insights', style: TextStyle(fontWeight: FontWeight.bold)),
                  subtitle: const Text('5 AI Officers • 82 Overall Health Score'),
                  trailing: const Icon(Icons.arrow_forward_ios, size: 16),
                  onTap: () => Navigator.pushNamed(context, '/insights'),
                ),
              ),
              const SizedBox(height: 12),
              Card(
                elevation: 2,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                child: ListTile(
                  leading: CircleAvatar(
                    backgroundColor: Colors.indigo.withValues(alpha: 0.15),
                    child: const Icon(Icons.emoji_events, color: Colors.indigo),
                  ),
                  title: const Text('NIRF Ranking Intelligence', style: TextStyle(fontWeight: FontWeight.bold)),
                  subtitle: const Text('Rank #51 • Peer Benchmarks & Advancement Blueprint'),
                  trailing: const Icon(Icons.arrow_forward_ios, size: 16),
                  onTap: () => Navigator.pushNamed(context, '/nirf'),
                ),
              ),
              const SizedBox(height: 12),
              Card(
                elevation: 2,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                child: ListTile(
                  leading: CircleAvatar(
                    backgroundColor: Colors.teal.withValues(alpha: 0.15),
                    child: const Icon(Icons.qr_code_2, color: Colors.teal),
                  ),
                  title: const Text('Verified QR Passport', style: TextStyle(fontWeight: FontWeight.bold)),
                  subtitle: const Text('Digital credentials & tamper-proof verification'),
                  trailing: const Icon(Icons.arrow_forward_ios, size: 16),
                  onTap: () => Navigator.pushNamed(context, '/passport'),
                ),
              ),
            ],
          ),
        ),
      ),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: 0,
        type: BottomNavigationBarType.fixed,
        onTap: (index) {
          if (index == 1) {
            Navigator.pushNamed(context, '/insights');
          } else if (index == 2) {
            Navigator.pushNamed(context, '/officers');
          } else if (index == 3) {
            Navigator.pushNamed(context, '/nirf');
          }
        },
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.home),
            label: 'Home',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.psychology),
            label: 'Insights',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.hub),
            label: 'Officers',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.emoji_events),
            label: 'NIRF',
          ),
        ],
      ),
    );
  }
}
