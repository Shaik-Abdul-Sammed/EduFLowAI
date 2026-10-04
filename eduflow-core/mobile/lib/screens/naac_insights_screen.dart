import 'package:flutter/material.dart';

class NaacWebViewScreen extends StatelessWidget {
  final String url;
  const NaacWebViewScreen({
    super.key,
    this.url = 'https://eduflow-web.onrender.com/admin-dashboard/naac-ai-analysis',
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('NAAC AI Analysis WebView'),
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.language, size: 64, color: Colors.blue),
            const SizedBox(height: 16),
            const Text(
              'Web Dashboard View',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            Text(url, style: const TextStyle(color: Colors.grey)),
            const SizedBox(height: 16),
            const Text('Connecting to EduFlow Web Portal...'),
          ],
        ),
      ),
    );
  }
}

class NaacInsightsScreen extends StatefulWidget {
  const NaacInsightsScreen({super.key});

  @override
  State<NaacInsightsScreen> createState() => _NaacInsightsScreenState();
}

class _NaacInsightsScreenState extends State<NaacInsightsScreen> {
  final String predictedGrade = 'A+';
  final double predictedCgpa = 3.38;
  final int readinessScore = 82;

  final List<String> topImprovementActions = const [
    'Publish all Course Outcomes (COs) and Program Outcomes (POs) on the college portal',
    'Upload GeoTagged photos of ICT classrooms, laboratories, and central library',
    'Constitute an active Alumni Association chapter with registered alumni feedback logs',
  ];

  void _openFullAnalysisWebView() {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (context) => const NaacWebViewScreen(),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('NAAC AI Insights'),
        backgroundColor: const Color(0xFF0A2540),
        foregroundColor: Colors.white,
      ),
      backgroundColor: const Color(0xFFF8FAFC),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // 1. Predicted Grade Card
            Card(
              elevation: 3,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              color: Colors.white,
              child: Padding(
                padding: const EdgeInsets.all(20.0),
                child: Column(
                  children: [
                    const Text(
                      'PREDICTED ACCREDITATION GRADE',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                        color: Colors.grey,
                        letterSpacing: 0.5,
                      ),
                    ),
                    const SizedBox(height: 12),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                          decoration: BoxDecoration(
                            color: const Color(0xFF2563EB),
                            borderRadius: BorderRadius.circular(16),
                            boxShadow: [
                              BoxShadow(
                                color: const Color(0xFF2563EB).withValues(alpha: 0.3),
                                blurRadius: 10,
                                offset: const Offset(0, 4),
                              ),
                            ],
                          ),
                          child: Text(
                            predictedGrade,
                            style: const TextStyle(
                              fontSize: 36,
                              fontWeight: FontWeight.w900,
                              color: Colors.white,
                            ),
                          ),
                        ),
                        const SizedBox(width: 20),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              '$predictedCgpa / 4.00',
                              style: const TextStyle(
                                fontSize: 22,
                                fontWeight: FontWeight.bold,
                                color: Color(0xFF1E293B),
                              ),
                            ),
                            const Text(
                              'Predicted CGPA',
                              style: TextStyle(fontSize: 13, color: Colors.grey),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),

            // 2. Readiness Score Card
            Card(
              elevation: 2,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              color: Colors.white,
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text(
                          'Peer Team Visit Readiness',
                          style: TextStyle(
                            fontSize: 15,
                            fontWeight: FontWeight.bold,
                            color: Color(0xFF1E293B),
                          ),
                        ),
                        Text(
                          '$readinessScore%',
                          style: const TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            color: Color(0xFF059669),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 10),
                    ClipRRect(
                      borderRadius: BorderRadius.circular(8),
                      child: LinearProgressIndicator(
                        value: readinessScore / 100.0,
                        minHeight: 10,
                        backgroundColor: Colors.grey.shade200,
                        valueColor: const AlwaysStoppedAnimation<Color>(Color(0xFF059669)),
                      ),
                    ),
                    const SizedBox(height: 8),
                    const Text(
                      'Ready for peer team scrutiny across 7 criteria benchmarks.',
                      style: TextStyle(fontSize: 12, color: Colors.grey),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 20),

            // 3. Top 3 Improvement Actions
            const Text(
              'Top 3 Improvement Actions',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: Color(0xFF1E293B),
              ),
            ),
            const SizedBox(height: 10),
            ...topImprovementActions.asMap().entries.map((entry) {
              final idx = entry.key + 1;
              final action = entry.value;
              return Card(
                elevation: 1,
                margin: const EdgeInsets.only(bottom: 8),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                child: ListTile(
                  leading: CircleAvatar(
                    backgroundColor: const Color(0xFF2563EB).withValues(alpha: 0.1),
                    child: Text(
                      '$idx',
                      style: const TextStyle(
                        color: Color(0xFF2563EB),
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                  title: Text(
                    action,
                    style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
                  ),
                ),
              );
            }),
            const SizedBox(height: 24),

            // 4. View Full Analysis Button (Opens WebView)
            ElevatedButton.icon(
              onPressed: _openFullAnalysisWebView,
              icon: const Icon(Icons.open_in_browser, color: Colors.white),
              label: const Text(
                'View Full Analysis',
                style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: Colors.white),
              ),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF0A2540),
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
