import 'package:flutter/material.dart';

class PlacementRadarScreen extends StatelessWidget {
  const PlacementRadarScreen({super.key});
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Placement Radar')),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.radar, size: 100, color: Colors.red),
            SizedBox(height: 20),
            Text('Discover Job Matches', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            Text('Finding the best roles based on your profile', style: TextStyle(color: Colors.grey)),
            SizedBox(height: 30),
            ElevatedButton(onPressed: () {}, child: Text('Scan for Jobs')),
          ],
        ),
      ),
    );
  }
}
