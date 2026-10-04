import 'package:flutter/material.dart';

class AutoResumeBuilderScreen extends StatelessWidget {
  const AutoResumeBuilderScreen({super.key});
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('AI Auto-Resume Builder')),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.description, size: 100, color: Colors.purple),
            SizedBox(height: 20),
            Text('Generate ATS-Friendly Resumes', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            Text('Automatically generated from your Digital Twin', style: TextStyle(color: Colors.grey)),
            SizedBox(height: 30),
            ElevatedButton(onPressed: () {}, child: Text('Generate Resume')),
          ],
        ),
      ),
    );
  }
}
