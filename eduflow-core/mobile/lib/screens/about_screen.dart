import 'package:flutter/material.dart';
import '../core/api_client.dart';

class AboutScreen extends StatefulWidget {
  const AboutScreen({super.key});

  @override
  State<AboutScreen> createState() => _AboutScreenState();
}

class _AboutScreenState extends State<AboutScreen> {

  List<dynamic> perksList = [];
  bool isLoadingPerks = true;

  @override
  void initState() {
    super.initState();
    _fetchPerks();
  }

  Future<void> _fetchPerks() async {
    try {
      final response = await ApiClient().dio.get('/user/dashboard-perks');
      if (response.statusCode == 200) {
        final data = response.data;
        setState(() {
          perksList = (data is Map && data['perks'] is List) ? data['perks'] : [];
          isLoadingPerks = false;
        });
      }
    } catch (e) {
      setState(() { isLoadingPerks = false; });
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: isDark ? const Color(0xFF0A0E27) : const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: const Text('About EduFlow AI OS', style: TextStyle(fontWeight: FontWeight.bold)),
        centerTitle: true,
        elevation: 0,
        backgroundColor: Colors.transparent,
        surfaceTintColor: Colors.transparent,
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 24.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              _buildHeader(context),
              const SizedBox(height: 32),
              
              _buildSectionTitle(context, 'AI Officers'),
              _buildOfficerGrid(context),
              const SizedBox(height: 32),
              
              _buildSectionTitle(context, 'Your Active Features'),
              _buildPerks(context),
              const SizedBox(height: 32),
              
              _buildSectionTitle(context, 'Platform Features'),
              _buildPlatformFeatures(context),
              const SizedBox(height: 32),
              
              _buildSectionTitle(context, 'CareerForge'),
              _buildCareerForge(context),
              const SizedBox(height: 32),
              
              _buildSectionTitle(context, 'GuardianWatch'),
              _buildGuardianWatch(context),
              const SizedBox(height: 32),
              
              _buildSectionTitle(context, 'Your Plan'),
              _buildPlanCards(context),
              const SizedBox(height: 32),
              
              _buildSectionTitle(context, 'Your Savings'),
              _buildROICards(context),
              const SizedBox(height: 32),
              
              _buildSectionTitle(context, 'About Platform'),
              _buildAboutPlatform(context),
              const SizedBox(height: 48),
              
              _buildFooter(context),
              const SizedBox(height: 24),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSectionTitle(BuildContext context, String title) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16.0, left: 4.0),
      child: Text(
        title.toUpperCase(),
        style: Theme.of(context).textTheme.titleSmall?.copyWith(
              fontWeight: FontWeight.w800,
              letterSpacing: 1.2,
              color: Theme.of(context).colorScheme.primary,
            ),
      ),
    );
  }

  int _getCrossAxisCount(BuildContext context) {
    double width = MediaQuery.of(context).size.width;
    if (width >= 1024) return 4;
    if (width >= 600) return 3;
    return 2;
  }

  Widget _buildResponsiveGrid({
    required BuildContext context,
    required List<Widget> children,
    double childAspectRatio = 1.0,
  }) {
    return GridView.count(
      crossAxisCount: _getCrossAxisCount(context),
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      mainAxisSpacing: 12,
      crossAxisSpacing: 12,
      childAspectRatio: childAspectRatio,
      children: children,
    );
  }

  Widget _buildIconCard(BuildContext context, String icon, String title, String subtitle) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final cardColor = isDark ? const Color(0xFF1E293B) : Colors.white;
    final shadowColor = isDark ? Colors.black26 : Colors.black.withOpacity(0.05);

    return Container(
      decoration: BoxDecoration(
        color: cardColor,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: shadowColor,
            blurRadius: 10,
            offset: const Offset(0, 4),
          )
        ],
      ),
      padding: const EdgeInsets.all(16.0),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(
            icon,
            style: const TextStyle(fontSize: 32),
          ),
          const SizedBox(height: 12),
          Text(
            title,
            textAlign: TextAlign.center,
            style: const TextStyle(
              fontWeight: FontWeight.bold,
              fontSize: 14,
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
          const SizedBox(height: 6),
          Text(
            subtitle,
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 11,
              color: isDark ? Colors.grey[400] : Colors.grey[600],
              height: 1.3,
            ),
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }

  Widget _buildHeader(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    
    return Container(
      padding: const EdgeInsets.all(24.0),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF1E293B) : Colors.white,
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: isDark ? Colors.black26 : Colors.black.withOpacity(0.05),
            blurRadius: 20,
            offset: const Offset(0, 8),
          )
        ],
      ),
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Theme.of(context).colorScheme.primary.withOpacity(0.1),
              shape: BoxShape.circle,
            ),
            child: const Text('🏫', style: TextStyle(fontSize: 48)),
          ),
          const SizedBox(height: 16),
          const Text(
            'EduFlow AI OS',
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.w900,
              letterSpacing: -0.5,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            'Version 2.1.0 (Build 402)',
            style: TextStyle(
              color: isDark ? Colors.grey[400] : Colors.grey[600],
              fontSize: 14,
            ),
          ),
          const SizedBox(height: 24),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              _buildBadge(context, 'Plan', 'Pro', Colors.amber),
              const SizedBox(width: 12),
              _buildBadge(context, 'Role', 'Administrator', Colors.blue),
            ],
          )
        ],
      ),
    );
  }

  Widget _buildBadge(BuildContext context, String label, String value, MaterialColor color) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      decoration: BoxDecoration(
        color: isDark ? color.shade900.withOpacity(0.3) : color.shade50,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: isDark ? color.shade700 : color.shade200,
        ),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            '$label: ',
            style: TextStyle(
              fontSize: 12,
              color: isDark ? color.shade200 : color.shade700,
            ),
          ),
          Text(
            value,
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.bold,
              color: isDark ? color.shade100 : color.shade900,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildOfficerGrid(BuildContext context) {
    return _buildResponsiveGrid(
      context: context,
      children: [
        _buildIconCard(context, '🏛️', 'Accreditation Officer', 'Generate reports automatically.'),
        _buildIconCard(context, '📅', 'Timetable Officer', 'Generate conflict-free timetables.'),
        _buildIconCard(context, '🎓', 'Admission Officer', 'Automate admissions end-to-end.'),
        _buildIconCard(context, '💰', 'Finance Officer', 'Automate fee management.'),
        _buildIconCard(context, '📊', 'Student Success Officer', 'Predict student success.'),
      ],
    );
  }

  Widget _buildPerks(BuildContext context) {
    if (isLoadingPerks) {
      return const Center(child: CircularProgressIndicator());
    }
    if (perksList.isEmpty) {
      return const Center(child: Text('No active perks found.'));
    }
    return _buildResponsiveGrid(
      context: context,
      childAspectRatio: 1.2,
      children: perksList.map((p) => _buildIconCard(
        context, 
        p['icon'] ?? '✨', 
        p['title'] ?? '', 
        p['subtitle'] ?? ''
      )).toList(),
    );
  }

  Widget _buildPlatformFeatures(BuildContext context) {
    return _buildResponsiveGrid(
      context: context,
      childAspectRatio: 1.2,
      children: [
        _buildIconCard(context, '📱', 'Offline First', 'Works without internet.'),
        _buildIconCard(context, '🌐', 'Multi Language', 'Instant translation.'),
        _buildIconCard(context, '💬', 'WhatsApp', 'Native integration.'),
        _buildIconCard(context, '🔐', 'Secure Login', 'Enterprise grade security.'),
        _buildIconCard(context, '🧠', 'Digital Twin', 'AI learns your institution.'),
        _buildIconCard(context, '🕸️', 'Knowledge Graph', 'Connected data relations.'),
        _buildIconCard(context, '☁️', 'Cloud Sync', 'Real-time synchronization.'),
        _buildIconCard(context, '📊', 'Analytics', 'Advanced predictive models.'),
        _buildIconCard(context, '🔄', 'Auto Backup', 'Secure daily snapshots.'),
        _buildIconCard(context, '⚡', 'Fast Performance', 'Optimized native engine.'),
        _buildIconCard(context, '📂', 'Document Scanner', 'OCR smart extraction.'),
        _buildIconCard(context, '🖨️', 'PDF Reports', 'One-click export.'),
      ],
    );
  }

  Widget _buildCareerForge(BuildContext context) {
    return _buildResponsiveGrid(
      context: context,
      childAspectRatio: 1.2,
      children: [
        _buildIconCard(context, '🎯', 'Placement Predictor', 'Success probability scoring.'),
        _buildIconCard(context, '📄', 'Resume Builder', 'ATS-friendly templates.'),
        _buildIconCard(context, '🎤', 'Mock Interviews', 'AI voice assessments.'),
        _buildIconCard(context, '🏅', 'Verified QR Passport', 'Tamper-proof credentials.'),
        _buildIconCard(context, '📝', 'AI LOR Generator', 'Custom recommendation letters.'),
        _buildIconCard(context, '💼', 'Company Match', 'Skill-based job routing.'),
      ],
    );
  }

  Widget _buildGuardianWatch(BuildContext context) {
    return _buildResponsiveGrid(
      context: context,
      childAspectRatio: 1.2,
      children: [
        _buildIconCard(context, '📍', 'Live User Tracking', 'Real-time campus location.'),
        _buildIconCard(context, '🚨', 'GPS Alerts', 'Geofence notifications.'),
        _buildIconCard(context, '📈', 'Monthly Reports', 'Automated progress cards.'),
        _buildIconCard(context, '📚', 'Attendance Alerts', 'Instant absent notices.'),
        _buildIconCard(context, '💬', 'Parent Chat', 'Direct institute comms.'),
        _buildIconCard(context, '🔔', 'Emergency Alerts', 'Priority push broadcasts.'),
      ],
    );
  }

  Widget _buildPlanCards(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    
    return Column(
      children: [
        Container(
          margin: const EdgeInsets.only(bottom: 16),
          padding: const EdgeInsets.all(24),
          decoration: BoxDecoration(
            gradient: LinearGradient(
              colors: [
                Colors.amber.shade700,
                Colors.amber.shade500,
              ],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            borderRadius: BorderRadius.circular(20),
            boxShadow: [
              BoxShadow(
                color: Colors.amber.withOpacity(isDark ? 0.2 : 0.4),
                blurRadius: 24,
                spreadRadius: 2,
                offset: const Offset(0, 8),
              )
            ],
            border: Border.all(color: Colors.amber.shade200, width: 1.5),
          ),
          child: Column(
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    '🟡 Pro Plan',
                    style: TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.w900,
                      color: Colors.white,
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Text(
                      'YOUR PLAN',
                      style: TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.w900,
                        letterSpacing: 1,
                        color: Colors.amber.shade800,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 24),
              _buildPlanFeatureRow('AI Credits', '50,000 / month'),
              _buildPlanFeatureRow('Reports', 'Unlimited'),
              _buildPlanFeatureRow('AI Officers', 'All 5 Unlocked'),
              _buildPlanFeatureRow('Resume Builder', 'Included'),
              _buildPlanFeatureRow('BYOC', 'Available'),
            ],
          ),
        ),
        
        // Other plans simplified
        Row(
          children: [
            Expanded(
              child: _buildMiniPlanCard(
                context, 
                '🟢 Free', 
                [
                  '1000 AI Credits',
                  'Basic Reports',
                  '1 AI Officer',
                ],
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: _buildMiniPlanCard(
                context, 
                '🔴 Ultra Pro', 
                [
                  'Unlimited Credits',
                  'White Label',
                  'Custom Models',
                ],
              ),
            ),
          ],
        )
      ],
    );
  }

  Widget _buildPlanFeatureRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: const TextStyle(
              color: Colors.white,
              fontWeight: FontWeight.w500,
            ),
          ),
          Text(
            value,
            style: const TextStyle(
              color: Colors.white,
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMiniPlanCard(BuildContext context, String title, List<String> features) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF1E293B) : Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: isDark ? Colors.grey.shade800 : Colors.grey.shade200),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
          ),
          const SizedBox(height: 12),
          ...features.map((f) => Padding(
            padding: const EdgeInsets.only(bottom: 6.0),
            child: Row(
              children: [
                Icon(Icons.check, size: 14, color: isDark ? Colors.grey.shade400 : Colors.grey.shade600),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    f,
                    style: TextStyle(
                      fontSize: 12,
                      color: isDark ? Colors.grey.shade400 : Colors.grey.shade600,
                    ),
                  ),
                ),
              ],
            ),
          )),
        ],
      ),
    );
  }

  Widget _buildROICards(BuildContext context) {
    return _buildResponsiveGrid(
      context: context,
      childAspectRatio: 1.5,
      children: [
        _buildStatCard(context, '⏰', 'Hours Saved', '284', Colors.blue),
        _buildStatCard(context, '₹', 'Est. Savings', '4.2L', Colors.green),
        _buildStatCard(context, '📊', 'Reports Gen', '1,402', Colors.purple),
        _buildStatCard(context, '🤖', 'AI Tasks', '8,932', Colors.orange),
        _buildStatCard(context, '🎯', 'Success Score', '94%', Colors.red),
      ],
    );
  }

  Widget _buildStatCard(BuildContext context, String icon, String label, String value, MaterialColor color) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Container(
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF1E293B) : Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: isDark ? color.shade900.withOpacity(0.5) : color.shade100),
      ),
      padding: const EdgeInsets.all(16.0),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(icon, style: const TextStyle(fontSize: 18)),
              const SizedBox(width: 8),
              Text(
                value,
                style: TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.w900,
                  color: isDark ? color.shade300 : color.shade700,
                ),
              ),
            ],
          ),
          const SizedBox(height: 4),
          Text(
            label,
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.bold,
              color: isDark ? Colors.grey.shade400 : Colors.grey.shade500,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAboutPlatform(BuildContext context) {
    return _buildResponsiveGrid(
      context: context,
      childAspectRatio: 1.2,
      children: [
        _buildIconCard(context, '🏫', 'Built for Education', 'Tailored for institutes.'),
        _buildIconCard(context, '🔒', 'Privacy First', 'Data never leaves scope.'),
        _buildIconCard(context, '☁️', 'BYOC Ready', 'Bring your own cloud.'),
        _buildIconCard(context, '🌍', 'Offline Support', 'Zero-network capable.'),
        _buildIconCard(context, '🤖', 'AI Workforce', 'Replaces manual ops.'),
        _buildIconCard(context, '📈', 'Enterprise Ready', 'Scales to millions.'),
      ],
    );
  }

  Widget _buildFooter(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final textColor = isDark ? Colors.grey.shade500 : Colors.grey.shade600;
    
    return Column(
      children: [
        Wrap(
          alignment: WrapAlignment.center,
          spacing: 24,
          runSpacing: 12,
          children: [
            _buildFooterLink('Website', textColor),
            _buildFooterLink('Support', textColor),
            _buildFooterLink('Documentation', textColor),
            _buildFooterLink('Terms', textColor),
            _buildFooterLink('Privacy', textColor),
          ],
        ),
        const SizedBox(height: 32),
        Text(
          'Version 2.1.0 (Build 402)',
          style: TextStyle(
            fontSize: 12,
            color: isDark ? Colors.grey.shade600 : Colors.grey.shade400,
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 8),
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(
              'Made with ',
              style: TextStyle(
                fontSize: 12,
                color: isDark ? Colors.grey.shade600 : Colors.grey.shade400,
              ),
            ),
            const Text('❤️', style: TextStyle(fontSize: 12)),
            Text(
              ' by EduFlow AI OS',
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.bold,
                color: isDark ? Colors.grey.shade500 : Colors.grey.shade600,
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildFooterLink(String text, Color color) {
    return Text(
      text,
      style: TextStyle(
        fontSize: 13,
        fontWeight: FontWeight.w600,
        color: color,
        decoration: TextDecoration.underline,
        decorationColor: color.withOpacity(0.3),
      ),
    );
  }
}
