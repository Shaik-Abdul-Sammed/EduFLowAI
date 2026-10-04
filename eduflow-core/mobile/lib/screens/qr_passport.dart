import 'package:flutter/material.dart';

class QRPassportScreen extends StatelessWidget {
  const QRPassportScreen({super.key});
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Verified QR Passport')),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.qr_code_2, size: 100, color: Colors.blue),
            SizedBox(height: 20),
            Text('Scan for Verified Credentials', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            Text('Digital transcripts, certificates & identity', style: TextStyle(color: Colors.grey)),
          ],
        ),
      ),
    );
  }
}
