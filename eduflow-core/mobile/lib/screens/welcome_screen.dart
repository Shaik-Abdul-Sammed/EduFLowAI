import 'package:flutter/material.dart';
import '../data/welcome_content.dart';

class WelcomeScreen extends StatelessWidget {
  const WelcomeScreen({super.key});

  static const Color primaryBlue = Color(0xFF0A2540);
  static const Color accentGold = Color(0xFFFFC107);
  static const Color backgroundLight = Color(0xFFF8FAFC);

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: isDark ? const Color(0xFF071224) : backgroundLight,
      body: SafeArea(
        child: SingleChildScrollView(
          physics: const BouncingScrollPhysics(),
          padding: const EdgeInsets.fromLTRB(20, 24, 20, 40),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Section A - Hero
              _buildSectionHero(context, isDark),
              const SizedBox(height: 24),

              // Section B - The Problem
              _buildSectionProblem(context, isDark),
              const SizedBox(height: 24),

              // Section C - The Solution
              _buildSectionSolution(context, isDark),
              const SizedBox(height: 24),

              // Section D - How to Use It
              _buildSectionHowItWorks(context, isDark),
              const SizedBox(height: 24),

              // Section E - Profit / ROI Section
              _buildSectionROI(context, isDark),
              const SizedBox(height: 24),

              // Section F - Comparison with Existing Solutions
              _buildSectionComparison(context, isDark),
              const SizedBox(height: 24),

              // Section G - Services We Offer
              _buildSectionServices(context, isDark),
              const SizedBox(height: 24),

              // Section H - Trust / Institution
              _buildSectionTrust(context, isDark),
              const SizedBox(height: 24),

              // Section I - Call to Action (bottom)
              _buildSectionCTA(context),
            ],
          ),
        ),
      ),
    );
  }

  // Section A - Hero
  Widget _buildSectionHero(BuildContext context, bool isDark) {
    final textTheme = Theme.of(context).textTheme;

    return Column(
      children: [
        Container(
          width: 90,
          height: 90,
          decoration: BoxDecoration(
            gradient: const LinearGradient(
              colors: [primaryBlue, Color(0xFF1E3A8A)],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            borderRadius: BorderRadius.circular(24),
            boxShadow: [
              BoxShadow(
                color: primaryBlue.withValues(alpha: 0.3),
                blurRadius: 16,
                offset: const Offset(0, 8),
              ),
            ],
          ),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(24),
            child: Image.asset(
              'assets/icon/app_icon.png',
              width: 90,
              height: 90,
              fit: BoxFit.cover,
              errorBuilder: (_, __, ___) => const Center(
                child: Icon(
                  Icons.school,
                  size: 48,
                  color: accentGold,
                ),
              ),
            ),
          ),
        ),
        const SizedBox(height: 16),
        Text(
          'EduFlow AI OS',
          textAlign: TextAlign.center,
          style: textTheme.headlineSmall?.copyWith(
            fontWeight: FontWeight.bold,
            color: isDark ? Colors.white : primaryBlue,
            letterSpacing: -0.5,
          ),
        ),
        const SizedBox(height: 8),
        Text(
          'The AI Administrative Workforce for Colleges',
          textAlign: TextAlign.center,
          style: textTheme.titleMedium?.copyWith(
            fontWeight: FontWeight.w600,
            color: accentGold,
          ),
        ),
        const SizedBox(height: 8),
        Text(
          'Generate NAAC reports, timetables, and fee reconciliations in minutes, not months',
          textAlign: TextAlign.center,
          style: textTheme.bodyMedium?.copyWith(
            color: isDark ? Colors.grey.shade400 : Colors.grey.shade700,
            height: 1.4,
          ),
        ),
      ],
    );
  }

  // Section B - The Problem
  Widget _buildSectionProblem(BuildContext context, bool isDark) {
    final textTheme = Theme.of(context).textTheme;

    final problems = [
      {
        'icon': Icons.access_time_filled,
        'color': Colors.orange,
        'text': 'NAAC reports take 4 to 6 months and cost 5 lakhs in consultants',
      },
      {
        'icon': Icons.description,
        'color': Colors.blue,
        'text': 'Timetables take weeks of manual coordination',
      },
      {
        'icon': Icons.attach_money,
        'color': Colors.red,
        'text': 'Fee reconciliation is a full-time manual job',
      },
    ];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'The Pain Every College Faces',
          style: textTheme.headlineSmall?.copyWith(
            fontWeight: FontWeight.bold,
            color: isDark ? Colors.white : primaryBlue,
          ),
        ),
        const SizedBox(height: 12),
        ...problems.map((p) => Card(
          elevation: 2,
          margin: const EdgeInsets.only(bottom: 10),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                CircleAvatar(
                  backgroundColor: (p['color'] as Color).withValues(alpha: 0.15),
                  radius: 22,
                  child: Icon(p['icon'] as IconData, color: p['color'] as Color, size: 24),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Text(
                    p['text'] as String,
                    style: textTheme.bodyMedium?.copyWith(
                      fontWeight: FontWeight.w500,
                      height: 1.3,
                    ),
                  ),
                ),
              ],
            ),
          ),
        )),
      ],
    );
  }

  // Section C - The Solution
  Widget _buildSectionSolution(BuildContext context, bool isDark) {
    final textTheme = Theme.of(context).textTheme;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Meet Your 5 AI Officers',
          style: textTheme.headlineSmall?.copyWith(
            fontWeight: FontWeight.bold,
            color: isDark ? Colors.white : primaryBlue,
          ),
        ),
        const SizedBox(height: 12),
        SizedBox(
          height: 145,
          child: ListView.separated(
            scrollDirection: Axis.horizontal,
            physics: const BouncingScrollPhysics(),
            itemCount: mockOfficers.length,
            separatorBuilder: (_, _) => const SizedBox(width: 12),
            itemBuilder: (context, index) {
              final officer = mockOfficers[index];
              return Container(
                width: 220,
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: isDark ? const Color(0xFF132238) : Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(
                    color: isDark ? Colors.white12 : Colors.grey.shade200,
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.05),
                      blurRadius: 8,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    CircleAvatar(
                      backgroundColor: officer.color.withValues(alpha: 0.15),
                      radius: 20,
                      child: Icon(officer.icon, color: officer.color, size: 22),
                    ),
                    const SizedBox(height: 10),
                    Text(
                      officer.title,
                      style: textTheme.bodyMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 4),
                    Text(
                      officer.benefit,
                      style: textTheme.bodySmall?.copyWith(
                        color: isDark ? Colors.grey.shade400 : Colors.grey.shade600,
                        height: 1.2,
                      ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              );
            },
          ),
        ),
      ],
    );
  }

  // Section D - How to Use It
  Widget _buildSectionHowItWorks(BuildContext context, bool isDark) {
    final textTheme = Theme.of(context).textTheme;

    final steps = [
      'Submit your requirement through the app or web',
      'An AI Officer generates a deliverable in minutes',
      'Download the PDF or receive it by secure link',
    ];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'How It Works in 3 Steps',
          style: textTheme.headlineSmall?.copyWith(
            fontWeight: FontWeight.bold,
            color: isDark ? Colors.white : primaryBlue,
          ),
        ),
        const SizedBox(height: 12),
        ...steps.asMap().entries.map((entry) {
          final idx = entry.key + 1;
          final step = entry.value;
          return Card(
            elevation: 2,
            margin: const EdgeInsets.only(bottom: 10),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Row(
                children: [
                  CircleAvatar(
                    backgroundColor: primaryBlue,
                    radius: 18,
                    child: Text(
                      '$idx',
                      style: const TextStyle(
                        color: accentGold,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Text(
                      step,
                      style: textTheme.bodyMedium?.copyWith(
                        fontWeight: FontWeight.w500,
                        height: 1.3,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          );
        }),
      ],
    );
  }

  // Section E - Profit / ROI Section
  Widget _buildSectionROI(BuildContext context, bool isDark) {
    final textTheme = Theme.of(context).textTheme;

    final metrics = [
      {
        'title': '₹5 - 10 Lakhs',
        'desc': 'Saved per year in NAAC consultant fees',
        'icon': Icons.savings,
        'color': Colors.green,
      },
      {
        'title': '120 Hours',
        'desc': 'Saved in administrative work per semester',
        'icon': Icons.timer,
        'color': Colors.blue,
      },
      {
        'title': '₹50,000',
        'desc': 'Recovered per student retained via early alerts',
        'icon': Icons.person_search,
        'color': Colors.amber.shade800,
      },
      {
        'title': '+15%',
        'desc': 'Increase in campus placement readiness',
        'icon': Icons.trending_up,
        'color': Colors.purple,
      },
    ];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'The Money You Save',
          style: textTheme.headlineSmall?.copyWith(
            fontWeight: FontWeight.bold,
            color: isDark ? Colors.white : primaryBlue,
          ),
        ),
        const SizedBox(height: 12),
        GridView.count(
          crossAxisCount: 2,
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          mainAxisSpacing: 12,
          crossAxisSpacing: 12,
          childAspectRatio: 1.25,
          children: metrics.map((m) {
            return Card(
              elevation: 2,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              child: Padding(
                padding: const EdgeInsets.all(12),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(m['icon'] as IconData, color: m['color'] as Color, size: 24),
                    const SizedBox(height: 6),
                    Text(
                      m['title'] as String,
                      style: textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                        color: m['color'] as Color,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      m['desc'] as String,
                      style: textTheme.bodySmall?.copyWith(
                        color: isDark ? Colors.grey.shade400 : Colors.grey.shade700,
                        height: 1.15,
                      ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ),
            );
          }).toList(),
        ),
        const SizedBox(height: 8),
        Text(
          'Based on real usage across pilot colleges',
          style: textTheme.bodySmall?.copyWith(
            fontStyle: FontStyle.italic,
            color: Colors.grey,
          ),
        ),
      ],
    );
  }

  // Section F - Comparison with Existing Solutions
  Widget _buildSectionComparison(BuildContext context, bool isDark) {
    final textTheme = Theme.of(context).textTheme;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'How We Compare',
          style: textTheme.headlineSmall?.copyWith(
            fontWeight: FontWeight.bold,
            color: isDark ? Colors.white : primaryBlue,
          ),
        ),
        const SizedBox(height: 12),
        ...mockComparison.map((row) {
          final isEduFlow = row.category.contains('EduFlow');
          return Card(
            elevation: isEduFlow ? 4 : 2,
            margin: const EdgeInsets.only(bottom: 12),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(16),
              side: isEduFlow
                  ? const BorderSide(color: accentGold, width: 2)
                  : BorderSide.none,
            ),
            color: isEduFlow
                ? (isDark ? const Color(0xFF1E2D4A) : const Color(0xFFF0F7FF))
                : null,
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Icon(
                        isEduFlow ? Icons.stars : Icons.business,
                        color: isEduFlow ? accentGold : Colors.grey,
                        size: 20,
                      ),
                      const SizedBox(width: 8),
                      Text(
                        row.category,
                        style: textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.bold,
                          color: isEduFlow ? primaryBlue : null,
                        ),
                      ),
                    ],
                  ),
                  const Divider(height: 16),
                  Text('• Cost: ${row.traditional}', style: textTheme.bodyMedium),
                  const SizedBox(height: 4),
                  Text('• Turnaround: ${row.consultants}', style: textTheme.bodyMedium),
                  const SizedBox(height: 4),
                  Text('• Operations: ${row.eduflow}', style: textTheme.bodyMedium),
                ],
              ),
            ),
          );
        }),
      ],
    );
  }

  // Section G - Services We Offer
  Widget _buildSectionServices(BuildContext context, bool isDark) {
    final textTheme = Theme.of(context).textTheme;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Our Automation Services',
          style: textTheme.headlineSmall?.copyWith(
            fontWeight: FontWeight.bold,
            color: isDark ? Colors.white : primaryBlue,
          ),
        ),
        const SizedBox(height: 12),
        GridView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          gridDelegate: const DynamicDelegate(),
          itemCount: mockServices.length,
          itemBuilder: (context, index) {
            final s = mockServices[index];
            final isComingSoon = s.status == 'Coming Soon';

            return Card(
              elevation: 2,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              child: Padding(
                padding: const EdgeInsets.all(12),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        CircleAvatar(
                          radius: 16,
                          backgroundColor: primaryBlue.withValues(alpha: 0.1),
                          child: Icon(s.icon, color: primaryBlue, size: 18),
                        ),
                        if (isComingSoon)
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                            decoration: BoxDecoration(
                              color: Colors.amber.shade100,
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Text(
                              'Soon',
                              style: TextStyle(
                                fontSize: 10,
                                fontWeight: FontWeight.bold,
                                color: Colors.amber.shade900,
                              ),
                            ),
                          ),
                      ],
                    ),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          s.title,
                          style: textTheme.bodyMedium?.copyWith(
                            fontWeight: FontWeight.bold,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                        const SizedBox(height: 2),
                        Text(
                          s.description,
                          style: textTheme.bodySmall?.copyWith(
                            color: isDark ? Colors.grey.shade400 : Colors.grey.shade600,
                            fontSize: 11,
                          ),
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                    ),
                    Text(
                      '₹${s.price.toString().replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (Match m) => '${m[1]},')}',
                      style: textTheme.titleSmall?.copyWith(
                        color: isDark ? accentGold : primaryBlue,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
              ),
            );
          },
        ),
      ],
    );
  }

  // Section H - Trust / Institution
  Widget _buildSectionTrust(BuildContext context, bool isDark) {
    final textTheme = Theme.of(context).textTheme;

    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            Text(
              'Trusted By',
              style: textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.bold,
                color: isDark ? Colors.white70 : Colors.grey.shade600,
                letterSpacing: 1.1,
              ),
            ),
            const SizedBox(height: 12),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(Icons.verified, color: primaryBlue, size: 24),
                const SizedBox(width: 8),
                Flexible(
                  child: Text(
                    demoInstitutionName,
                    style: textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.bold,
                      color: isDark ? Colors.white : primaryBlue,
                    ),
                    textAlign: TextAlign.center,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              demoInstitutionTagline,
              textAlign: TextAlign.center,
              style: textTheme.bodySmall?.copyWith(
                color: isDark ? Colors.grey.shade400 : Colors.grey.shade600,
              ),
            ),
          ],
        ),
      ),
    );
  }

  // Section I - Call to Action (bottom)
  Widget _buildSectionCTA(BuildContext context) {
    return Column(
      children: [
        SizedBox(
          width: double.infinity,
          height: 52,
          child: ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: primaryBlue,
              foregroundColor: Colors.white,
              elevation: 2,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(14),
              ),
            ),
            onPressed: () => Navigator.pushNamed(context, '/signup'),
            child: const Text(
              'Create an Account',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
            ),
          ),
        ),
        const SizedBox(height: 12),
        SizedBox(
          width: double.infinity,
          height: 52,
          child: OutlinedButton(
            style: OutlinedButton.styleFrom(
              foregroundColor: primaryBlue,
              side: const BorderSide(color: primaryBlue, width: 1.5),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(14),
              ),
            ),
            onPressed: () => Navigator.pushNamed(context, '/login'),
            child: const Text(
              'I Already Have an Account',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
            ),
          ),
        ),
      ],
    );
  }
}

class DynamicDelegate extends SliverGridDelegateWithFixedCrossAxisCount {
  const DynamicDelegate()
      : super(
          crossAxisCount: 2,
          mainAxisSpacing: 12,
          crossAxisSpacing: 12,
          childAspectRatio: 0.95,
        );
}
