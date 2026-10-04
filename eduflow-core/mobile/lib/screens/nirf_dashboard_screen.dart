import 'package:flutter/material.dart';

class NirfDashboardScreen extends StatefulWidget {
  const NirfDashboardScreen({super.key});

  @override
  State<NirfDashboardScreen> createState() => _NirfDashboardScreenState();
}

class _NirfDashboardScreenState extends State<NirfDashboardScreen> {
  bool _isLoading = false;
  String _selectedCategory = 'Engineering';

  // State data with realistic defaults
  double _totalScore = 72.85;
  final int _predictedRank = 51;
  final double _confidence = 0.91;

  final Map<String, double> _parameters = {
    'TLR (Teaching & Resources)': 75.40,
    'RP (Research & Practice)': 64.20,
    'GO (Graduation Outcomes)': 79.10,
    'OI (Outreach & Inclusion)': 71.50,
    'PR (Perception)': 66.00,
  };

  final List<Map<String, String>> _topImprovements = [
    {
      'phase': 'Phase 1 (Quick Win)',
      'title': 'Publish 15 Pending Patents',
      'impact': '+1.8 RP pts',
      'action': 'Fast-track patent publication to boost IPR metric directly in NIRF portal.',
    },
    {
      'phase': 'Phase 2 (Medium Term)',
      'title': 'Recruit 8 Regular PhD Faculty',
      'impact': '+3.5 TLR pts',
      'action': 'Optimize Faculty-to-Student Ratio to 1:16 across core AI/CS disciplines.',
    },
    {
      'phase': 'Phase 3 (Strategic)',
      'title': 'Research Seed Grants for Q1 Journals',
      'impact': '+4.2 QP pts',
      'action': 'Establish ₹25 Lakhs institutional fund to support Scopus Q1 publications.',
    },
  ];

  final List<Map<String, dynamic>> _topPeers = [
    {'rank': 12, 'name': 'NIT Southern Region', 'score': 84.34, 'grade': 'A++'},
    {'rank': 26, 'name': 'NIT Northern Plains', 'score': 79.74, 'grade': 'A+'},
    {'rank': 37, 'name': 'Western State Tech Univ', 'score': 77.24, 'grade': 'A+'},
    {'rank': 51, 'name': 'Sri Sudha Institute (You)', 'score': 72.85, 'grade': 'A+', 'isSelf': true},
    {'rank': 58, 'name': 'Maharashtra State Inst', 'score': 72.03, 'grade': 'A'},
    {'rank': 74, 'name': 'Kerala State Tech Univ', 'score': 69.37, 'grade': 'A'},
  ];

  Future<void> _refreshData() async {
    setState(() => _isLoading = true);
    await Future.delayed(const Duration(milliseconds: 350));
    if (mounted) {
      setState(() {
        _totalScore = 73.10;
        _isLoading = false;
      });
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('NIRF rankings and peer benchmarks refreshed successfully'),
          backgroundColor: Colors.indigo,
          duration: Duration(seconds: 2),
        ),
      );
    }
  }

  void _openFullWebDashboard() {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Row(
          children: [
            Icon(Icons.open_in_browser, color: Colors.indigo),
            SizedBox(width: 8),
            Text('Open Web Dashboard'),
          ],
        ),
        content: const Text(
          'Launch the full desktop NIRF Analytics Suite at /admin-dashboard/nirf for full interactive parameter exploration and PDF export.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(),
            child: const Text('Dismiss'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.of(ctx).pop();
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Navigating to Web Command Center...')),
              );
            },
            child: const Text('Launch View'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('NIRF Ranking Intelligence', style: TextStyle(fontWeight: FontWeight.bold)),
        elevation: 0,
        backgroundColor: Colors.indigo.shade800,
        foregroundColor: Colors.white,
        actions: [
          IconButton(
            key: const Key('refresh_nirf_button'),
            icon: _isLoading
                ? const SizedBox(
                    width: 18,
                    height: 18,
                    child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                  )
                : const Icon(Icons.refresh),
            onPressed: _isLoading ? null : _refreshData,
            tooltip: 'Refresh Analytics',
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: _refreshData,
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Category Switcher
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('Ranking Category:', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
                  DropdownButton<String>(
                    value: _selectedCategory,
                    underline: const SizedBox(),
                    items: ['Engineering', 'University', 'College', 'Overall'].map((c) {
                      return DropdownMenuItem(value: c, child: Text(c, style: const TextStyle(fontWeight: FontWeight.bold)));
                    }).toList(),
                    onChanged: (val) {
                      if (val != null) setState(() => _selectedCategory = val);
                    },
                  ),
                ],
              ),
              const SizedBox(height: 12),

              // Total Score Card
              Card(
                elevation: 4,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                color: Colors.indigo.shade900,
                child: Padding(
                  padding: const EdgeInsets.all(20.0),
                  child: Column(
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                            decoration: BoxDecoration(
                              color: Colors.white.withValues(alpha: 0.15),
                              borderRadius: BorderRadius.circular(20),
                            ),
                            child: Text(
                              '$_selectedCategory 2024',
                              style: const TextStyle(color: Colors.white70, fontSize: 12, fontWeight: FontWeight.w500),
                            ),
                          ),
                          const Icon(Icons.emoji_events, color: Colors.amber, size: 28),
                        ],
                      ),
                      const SizedBox(height: 12),
                      const Text(
                        'Total NIRF Composite Score',
                        style: TextStyle(color: Colors.white70, fontSize: 13),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        '$_totalScore',
                        key: const Key('nirf_total_score_text'),
                        style: const TextStyle(
                          fontSize: 44,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                      const SizedBox(height: 12),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                        decoration: BoxDecoration(
                          color: Colors.amber.shade700,
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Text(
                          'Predicted Category Rank: #$_predictedRank',
                          key: const Key('nirf_predicted_rank_text'),
                          style: const TextStyle(
                            color: Colors.black87,
                            fontWeight: FontWeight.bold,
                            fontSize: 15,
                          ),
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'Model Confidence: ${(_confidence * 100).toInt()}%',
                        style: const TextStyle(color: Colors.white54, fontSize: 11),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 20),

              // Parameter Breakdown
              const Text('NIRF Parameters', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
              const SizedBox(height: 10),
              Card(
                elevation: 2,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    children: _parameters.entries.map((e) {
                      final pct = (e.value / 100).clamp(0.0, 1.0);
                      return Padding(
                        padding: const EdgeInsets.symmetric(vertical: 6.0),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text(e.key, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w500)),
                                Text('${e.value}', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                              ],
                            ),
                            const SizedBox(height: 4),
                            LinearProgressIndicator(
                              value: pct,
                              backgroundColor: Colors.grey.shade200,
                              color: Colors.indigo,
                              minHeight: 6,
                              borderRadius: BorderRadius.circular(4),
                            ),
                          ],
                        ),
                      );
                    }).toList(),
                  ),
                ),
              ),
              const SizedBox(height: 20),

              // Top 3 Improvement Actions
              const Text('Top Rank Improvement Actions', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
              const SizedBox(height: 10),
              ..._topImprovements.map((imp) {
                return Card(
                  elevation: 1,
                  margin: const EdgeInsets.only(bottom: 10),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  child: Padding(
                    padding: const EdgeInsets.all(14.0),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        CircleAvatar(
                          radius: 16,
                          backgroundColor: Colors.green.shade50,
                          child: Icon(Icons.arrow_upward, size: 16, color: Colors.green.shade700),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Text(imp['phase']!, style: TextStyle(fontSize: 11, color: Colors.grey.shade600, fontWeight: FontWeight.w600)),
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                    decoration: BoxDecoration(color: Colors.green.shade100, borderRadius: BorderRadius.circular(4)),
                                    child: Text(imp['impact']!, style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.green.shade800)),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 4),
                              Text(imp['title']!, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                              const SizedBox(height: 2),
                              Text(imp['action']!, style: TextStyle(fontSize: 12, color: Colors.grey.shade700)),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              }),
              const SizedBox(height: 20),

              // Peer Comparison Mini-List
              const Text('Peer Institutions Standing', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
              const SizedBox(height: 10),
              Card(
                elevation: 2,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                child: ListView.separated(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: _topPeers.length,
                  separatorBuilder: (_, index) => const Divider(height: 1),
                  itemBuilder: (ctx, i) {
                    final peer = _topPeers[i];
                    final isSelf = peer['isSelf'] == true;
                    return Container(
                      color: isSelf ? Colors.indigo.withValues(alpha: 0.08) : Colors.transparent,
                      child: ListTile(
                        leading: CircleAvatar(
                          radius: 14,
                          backgroundColor: isSelf ? Colors.indigo : Colors.grey.shade300,
                          foregroundColor: isSelf ? Colors.white : Colors.black87,
                          child: Text('${peer['rank']}', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                        ),
                        title: Text(
                          peer['name'],
                          style: TextStyle(
                            fontSize: 13,
                            fontWeight: isSelf ? FontWeight.bold : FontWeight.w500,
                            color: isSelf ? Colors.indigo.shade900 : Colors.black87,
                          ),
                        ),
                        trailing: Text(
                          '${peer['score']} pts',
                          style: TextStyle(
                            fontWeight: FontWeight.bold,
                            color: isSelf ? Colors.indigo : Colors.grey.shade700,
                          ),
                        ),
                      ),
                    );
                  },
                ),
              ),
              const SizedBox(height: 24),

              // Button to Open Full Web Dashboard
              ElevatedButton.icon(
                key: const Key('open_full_web_nirf_btn'),
                icon: const Icon(Icons.open_in_new),
                label: const Text('Open Full Desktop NIRF Suite', style: TextStyle(fontWeight: FontWeight.bold)),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.indigo.shade800,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                onPressed: _openFullWebDashboard,
              ),
              const SizedBox(height: 24),
            ],
          ),
        ),
      ),
    );
  }
}
