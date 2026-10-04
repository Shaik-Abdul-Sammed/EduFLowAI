import 'package:flutter/material.dart';

class NaacCriterion {
  final int number;
  final String name;
  final int maxScore;
  final int rawScore;
  final double percentage;

  const NaacCriterion({
    required this.number,
    required this.name,
    required this.maxScore,
    required this.rawScore,
    required this.percentage,
  });
}

class NaacDashboardScreen extends StatefulWidget {
  const NaacDashboardScreen({super.key});

  @override
  State<NaacDashboardScreen> createState() => _NaacDashboardScreenState();
}

class _NaacDashboardScreenState extends State<NaacDashboardScreen> {
  final String predictedGrade = 'A+';
  final double predictedCgpa = 3.42;
  final int confidencePercentage = 85;

  final List<NaacCriterion> criteria = const [
    NaacCriterion(number: 1, name: 'Curricular Aspects', maxScore: 100, rawScore: 85, percentage: 85.0),
    NaacCriterion(number: 2, name: 'Teaching-Learning and Evaluation', maxScore: 350, rawScore: 298, percentage: 85.1),
    NaacCriterion(number: 3, name: 'Research, Innovations and Extension', maxScore: 120, rawScore: 82, percentage: 68.3),
    NaacCriterion(number: 4, name: 'Infrastructure and Learning Resources', maxScore: 100, rawScore: 88, percentage: 88.0),
    NaacCriterion(number: 5, name: 'Student Support and Progression', maxScore: 130, rawScore: 102, percentage: 78.5),
    NaacCriterion(number: 6, name: 'Governance, Leadership and Management', maxScore: 100, rawScore: 84, percentage: 84.0),
    NaacCriterion(number: 7, name: 'Institutional Values and Best Practices', maxScore: 100, rawScore: 86, percentage: 86.0),
  ];

  void _openCriterionDetail(NaacCriterion criterion) {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (context) => Scaffold(
          appBar: AppBar(
            title: Text('Criterion ${criterion.number} Detail'),
          ),
          body: Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  criterion.name,
                  style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 16),
                Text('Max Score: ${criterion.maxScore}'),
                Text('Achieved Score: ${criterion.rawScore}'),
                Text('Performance: ${criterion.percentage}%'),
                const SizedBox(height: 24),
                const Text(
                  'Institutional Response Status: Fully Documented with Evidence Records.',
                  style: TextStyle(color: Colors.green, fontWeight: FontWeight.w600),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('NAAC Dashboard'),
        backgroundColor: const Color(0xFF1E1B4B),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Grade Prediction Card
            Card(
              key: const Key('grade_prediction_card'),
              color: const Color(0xFF1E1B4B),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              child: Padding(
                padding: const EdgeInsets.all(20.0),
                child: Row(
                  children: [
                    Container(
                      width: 72,
                      height: 72,
                      decoration: BoxDecoration(
                        color: const Color(0xFF7C3AED),
                        borderRadius: BorderRadius.circular(16),
                      ),
                      alignment: Alignment.center,
                      child: Text(
                        predictedGrade,
                        style: const TextStyle(
                          fontSize: 32,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                    ),
                    const SizedBox(width: 20),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'Predicted Grade',
                            style: TextStyle(color: Colors.white70, fontSize: 13),
                          ),
                          Text(
                            '$predictedCgpa / 4.00 CGPA',
                            style: const TextStyle(
                              fontSize: 22,
                              fontWeight: FontWeight.bold,
                              color: Colors.white,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            'Model Confidence: $confidencePercentage%',
                            style: const TextStyle(color: Color(0xFFA78BFA), fontSize: 12),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 24),

            // Criteria List Heading
            const Text(
              'NAAC Criteria List',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 12),

            // Criteria List
            ListView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: criteria.length,
              itemBuilder: (context, index) {
                final c = criteria[index];
                return Card(
                  margin: const EdgeInsets.only(bottom: 10),
                  child: ListTile(
                    key: Key('criterion_item_${c.number}'),
                    leading: CircleAvatar(
                      backgroundColor: const Color(0xFF7C3AED),
                      child: Text(
                        '${c.number}',
                        style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                      ),
                    ),
                    title: Text(
                      c.name,
                      style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14),
                    ),
                    subtitle: Text('${c.rawScore} / ${c.maxScore} (${c.percentage}%)'),
                    trailing: const Icon(Icons.chevron_right),
                    onTap: () => _openCriterionDetail(c),
                  ),
                );
              },
            ),
          ],
        ),
      ),
    );
  }
}
