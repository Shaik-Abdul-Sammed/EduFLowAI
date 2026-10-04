import 'package:flutter/material.dart';

class InsightsDashboardScreen extends StatefulWidget {
  const InsightsDashboardScreen({super.key});

  @override
  State<InsightsDashboardScreen> createState() => _InsightsDashboardScreenState();
}

class _InsightsDashboardScreenState extends State<InsightsDashboardScreen> {
  bool _isLoading = false;
  int _refreshCount = 0;

  final List<Map<String, dynamic>> _domains = [
    {
      'key': 'accreditation',
      'name': 'Accreditation',
      'displayName': 'Accreditation Officer',
      'status': 'Grade A+ • 82% Readiness',
      'score': '3.42 CGPA',
      'icon': Icons.military_tech,
      'color': Colors.amber,
      'trend': '+0.12',
    },
    {
      'key': 'student-success',
      'name': 'Student Success',
      'displayName': 'Student Success Officer',
      'status': '82% Health • 48 At-Risk',
      'score': '6.4% Risk',
      'icon': Icons.school,
      'color': Colors.blue,
      'trend': '-1.5%',
    },
    {
      'key': 'timetable',
      'name': 'Timetable',
      'displayName': 'Timetable Officer',
      'status': 'Zero Conflicts • 86% Utilization',
      'score': '94% Opt',
      'icon': Icons.calendar_month,
      'color': Colors.indigo,
      'trend': 'Stable',
    },
    {
      'key': 'admissions',
      'name': 'Admissions',
      'displayName': 'Admissions Officer',
      'status': '74.5% Yield • 2,850 Leads',
      'score': '74.5%',
      'icon': Icons.trending_up,
      'color': Colors.green,
      'trend': '+4.2%',
    },
    {
      'key': 'finance',
      'name': 'Finance',
      'displayName': 'Finance Officer',
      'status': '88% Collection • 1 GST Flag',
      'score': '88% Rec',
      'icon': Icons.account_balance_wallet,
      'color': Colors.purple,
      'trend': '-2 Defaulters',
    },
  ];

  final List<Map<String, String>> _topPriorities = [
    {
      'domain': 'Student Success',
      'issue': '48 students with chronic attendance shortfall below 75%',
      'action': 'Assign peer tutor pods and mentor advisories within 48h',
      'urgency': 'HIGH',
    },
    {
      'domain': 'Accreditation',
      'issue': 'Criterion 3 Scopus publication count below benchmark A++ tier',
      'action': 'Release institutional seed funding to active PhD faculty',
      'urgency': 'HIGH',
    },
    {
      'domain': 'Finance',
      'issue': 'Auxiliary campus cafeteria lease missing GSTR-1 classification',
      'action': 'File GST rectification return before 20th of the month',
      'urgency': 'MEDIUM',
    },
  ];

  Future<void> _refreshInsights() async {
    setState(() {
      _isLoading = true;
    });

    await Future.delayed(const Duration(milliseconds: 300));

    if (mounted) {
      setState(() {
        _isLoading = false;
        _refreshCount++;
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Insights refreshed successfully (v${_refreshCount + 1})'),
          duration: const Duration(seconds: 1),
        ),
      );
    }
  }

  void _openDomainDetail(Map<String, dynamic> domain) {
    if (domain['key'] == 'accreditation') {
      Navigator.pushNamed(context, '/naac-insights');
      return;
    }

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) => Padding(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                CircleAvatar(
                  backgroundColor: (domain['color'] as Color).withValues(alpha: 0.15),
                  child: Icon(domain['icon'] as IconData, color: domain['color'] as Color),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        domain['displayName'] as String,
                        style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                      ),
                      Text(
                        'Status: ${domain['status']}',
                        style: TextStyle(fontSize: 13, color: Colors.grey.shade700),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const Divider(height: 24),
            const Text(
              'AI Cognitive Recommendations',
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
            ),
            const SizedBox(height: 8),
            Text('• Target milestone optimization projected to reach higher percentile.'),
            Text('• Departmental metrics synchronized with institutional benchmarks.'),
            Text('• Regular weekly telemetry logged to central AI Officer registry.'),
            const SizedBox(height: 20),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () => Navigator.pop(ctx),
                child: const Text('Close'),
              ),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Multi-Officer AI Insights'),
        backgroundColor: Colors.indigo.shade800,
        foregroundColor: Colors.white,
        actions: [
          IconButton(
            key: const Key('refresh_insights_icon_button'),
            icon: const Icon(Icons.refresh),
            onPressed: _isLoading ? null : _refreshInsights,
            tooltip: 'Refresh Insights',
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: _refreshInsights,
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
            // Overall Health Card
            Card(
              elevation: 3,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              color: Colors.indigo.shade900,
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Row(
                  children: [
                    Stack(
                      alignment: Alignment.center,
                      children: [
                        SizedBox(
                          width: 64,
                          height: 64,
                          child: CircularProgressIndicator(
                            value: 0.82,
                            strokeWidth: 6,
                            backgroundColor: Colors.white24,
                            valueColor: const AlwaysStoppedAnimation<Color>(Colors.greenAccent),
                          ),
                        ),
                        const Text(
                          '82',
                          style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 20),
                        ),
                      ],
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: const [
                          Text(
                            'Institutional Health Score',
                            style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16),
                          ),
                          SizedBox(height: 4),
                          Text(
                            '82 / 100 • 5 AI Officers Active',
                            style: TextStyle(color: Colors.white70, fontSize: 13),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),

            // Refresh Button Row
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Expanded(
                  child: Text(
                    'Domain Officers',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                ElevatedButton.icon(
                  key: const Key('refresh_insights_button'),
                  onPressed: _isLoading ? null : _refreshInsights,
                  icon: const Icon(Icons.sync, size: 16),
                  label: Text(_isLoading ? 'Refreshing...' : 'Refresh Insights'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.indigo.shade50,
                    foregroundColor: Colors.indigo.shade900,
                    elevation: 0,
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),

            // 5 Domain Cards Vertical List
            ..._domains.map((domain) {
              return Card(
                key: Key('domain_card_${domain['key']}'),
                margin: const EdgeInsets.only(bottom: 12),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                elevation: 1.5,
                child: Padding(
                  padding: const EdgeInsets.all(14.0),
                  child: Row(
                    children: [
                      CircleAvatar(
                        backgroundColor: (domain['color'] as Color).withValues(alpha: 0.15),
                        child: Icon(domain['icon'] as IconData, color: domain['color'] as Color),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Expanded(
                                  child: Text(
                                    domain['name'] as String,
                                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                  decoration: BoxDecoration(
                                    color: Colors.grey.shade100,
                                    borderRadius: BorderRadius.circular(6),
                                  ),
                                  child: Text(
                                    domain['score'] as String,
                                    style: TextStyle(
                                      fontWeight: FontWeight.bold,
                                      fontSize: 12,
                                      color: domain['color'] as Color,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 4),
                            Text(
                              domain['status'] as String,
                              style: TextStyle(color: Colors.grey.shade600, fontSize: 12),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(width: 8),
                      TextButton(
                        key: Key('view_details_${domain['key']}'),
                        style: TextButton.styleFrom(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 4),
                          minimumSize: Size.zero,
                          tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                        ),
                        onPressed: () => _openDomainDetail(domain),
                        child: const Text('View Details'),
                      ),
                    ],
                  ),
                ),
              );
            }),

            const SizedBox(height: 16),
            const Text(
              'Top Priorities',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),

            // 3 Highest-Impact Actions
            ..._topPriorities.map((item) {
              final isHigh = item['urgency'] == 'HIGH';
              return Card(
                margin: const EdgeInsets.only(bottom: 10),
                color: isHigh ? Colors.orange.shade50 : Colors.blue.shade50,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                  side: BorderSide(color: isHigh ? Colors.orange.shade200 : Colors.blue.shade200),
                ),
                child: Padding(
                  padding: const EdgeInsets.all(12.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Expanded(
                            child: Text(
                              item['domain']!,
                              style: TextStyle(
                                fontWeight: FontWeight.bold,
                                fontSize: 14,
                                color: isHigh ? Colors.deepOrange.shade800 : Colors.blue.shade800,
                              ),
                            ),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                            decoration: BoxDecoration(
                              color: isHigh ? Colors.deepOrange : Colors.blue,
                              borderRadius: BorderRadius.circular(4),
                            ),
                            child: Text(
                              item['urgency']!,
                              style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 4),
                      Text(item['issue']!, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
                      const SizedBox(height: 4),
                      Text(
                        'Suggested Action: ${item['action']!}',
                        style: TextStyle(fontSize: 12, color: Colors.grey.shade800),
                      ),
                    ],
                  ),
                ),
              );
            }),
            ],
          ),
        ),
      ),
    );
  }
}
