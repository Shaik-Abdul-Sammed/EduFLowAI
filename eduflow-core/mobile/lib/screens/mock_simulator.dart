import 'package:flutter/material.dart';

class MockSimulatorScreen extends StatelessWidget {
  const MockSimulatorScreen({super.key});
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Company-Specific Mock Simulator')),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.computer, size: 100, color: Colors.orange),
            SizedBox(height: 20),
            Text('Practice Technical Interviews', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            Text('AI-driven mock sessions for top tech companies', style: TextStyle(color: Colors.grey)),
            SizedBox(height: 30),
            ElevatedButton(onPressed: () {}, child: Text('Start Mock Interview')),
          ],
        ),
      ),
    );
  }
}
